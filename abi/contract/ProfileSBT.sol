// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title ProfileSBT
/// @notice Soulbound (non-transferable) profile NFT.
/// @dev
///  - One profile per wallet (by default)
///  - Minting is gated by an EIP-712 MintVoucher signed by a backend voucherSigner
///  - Optionally linked to SocialScoreAttestator to read on-chain SSA Index.
///  - Delegates metadata rendering to ProfileSBTRenderer for upgradeable design.

import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {ERC721Upgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import {EIP712Upgradeable} from "@openzeppelin/contracts-upgradeable/utils/cryptography/EIP712Upgradeable.sol";
import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import {IProfileSBTRenderer} from "./IProfileSBTRenderer.sol";

interface ISocialScoreAttestator {
    function ssaIndexScores(address user) external view returns (uint256);
}

contract ProfileSBT is
    Initializable,
    UUPSUpgradeable,
    OwnableUpgradeable,
    ERC721Upgradeable,
    EIP712Upgradeable
{
    // ------------------------------------------------------------------------
    // Types
    // ------------------------------------------------------------------------

    struct MintVoucher {
        address user;       // wallet allowed to mint
        uint256 expiresAt;  // unix timestamp (must be > 0)
        uint256 nonce;      // unique per voucher
    }

    // ------------------------------------------------------------------------
    // Storage
    // ------------------------------------------------------------------------

    /// @notice EIP-712 typehash for MintVoucher
    bytes32 public constant MINT_VOUCHER_TYPEHASH =
        keccak256("MintVoucher(address user,uint256 expiresAt,uint256 nonce)");

    /// @notice backend signer that authorizes profile mints
    address public voucherSigner;

    /// @notice address of SocialScoreAttestator (optional)
    address public scoreAttestator;

    /// @notice incremental token id counter
    uint256 private _tokenIdCounter;

    /// @notice mapping of wallet -> has minted profile already
    mapping(address => bool) public hasMinted;

    /// @notice mapping of (user, nonce) -> consumed
    mapping(bytes32 => bool) public usedVouchers;

    /// @notice mapping of wallet -> profile tokenId
    mapping(address => uint256) public profileTokenId;

    /// @notice Address of the metadata renderer contract
    address public renderer;

    /// @notice Collection external link for contractURI (e.g., "https://ssa.xyz")
    string private _collectionExternalLink;

    /// @notice Maximum voucher lifetime in seconds (default: 30 days)
    /// @dev If 0, no maximum lifetime is enforced
    uint256 public maxVoucherLifetime;

    // ------------------------------------------------------------------------
    // Events
    // ------------------------------------------------------------------------

    event VoucherSignerUpdated(address indexed oldSigner, address indexed newSigner);
    event ScoreAttestatorUpdated(address indexed oldAddr, address indexed newAddr);
    event RendererUpdated(address indexed oldRenderer, address indexed newRenderer);
    event CollectionExternalLinkUpdated(string oldUrl, string newUrl);
    event MaxVoucherLifetimeUpdated(uint256 oldValue, uint256 newValue);
    event ProfileMinted(address indexed user, uint256 indexed tokenId, uint256 nonce);
    event ProfileBurned(address indexed user, uint256 indexed tokenId);
    event ProfileRevoked(address indexed user, uint256 indexed tokenId, address indexed revoker);

    // EIP-5192: Soulbound Token Events
    /// @notice Emitted when a token is locked (soulbound)
    event Locked(uint256 indexed tokenId);
    /// @notice Emitted when a token is unlocked
    event Unlocked(uint256 indexed tokenId);

    // ------------------------------------------------------------------------
    // Errors
    // ------------------------------------------------------------------------

    error ZeroAddress();
    error CallerNotUser();
    error VoucherExpired();
    error InvalidSignature();
    error VoucherAlreadyUsed();
    error AlreadyMinted();
    error ApprovalsDisabled();
    error NonTransferable();
    error NoProfileToBurn();
    error NoProfileToRevoke();

    // ------------------------------------------------------------------------
    // Init / Upgrade
    // ------------------------------------------------------------------------

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    /// @notice Initializer (UUPS). Must be called via proxy.
    /// @param _voucherSigner backend address that signs MintVouchers
    /// @param _scoreAttestator SocialScoreAttestator address (optional, can be zero)
    /// @param _name ERC721 name
    /// @param _symbol ERC721 symbol
    function initialize(
        address _voucherSigner,
        address _scoreAttestator,
        string memory _name,
        string memory _symbol
    ) public initializer {
        if (_voucherSigner == address(0)) revert ZeroAddress();

        __Ownable_init(msg.sender);
        __ERC721_init(_name, _symbol);
        __EIP712_init("ProfileSBT", "1");

        voucherSigner = _voucherSigner;
        scoreAttestator = _scoreAttestator;
        maxVoucherLifetime = 30 days; // Default: 30 days maximum voucher validity
    }

    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}

    // ------------------------------------------------------------------------
    // Admin
    // ------------------------------------------------------------------------

    function setVoucherSigner(address _voucherSigner) external onlyOwner {
        if (_voucherSigner == address(0)) revert ZeroAddress();
        emit VoucherSignerUpdated(voucherSigner, _voucherSigner);
        voucherSigner = _voucherSigner;
    }

    function setScoreAttestator(address _scoreAttestator) external onlyOwner {
        emit ScoreAttestatorUpdated(scoreAttestator, _scoreAttestator);
        scoreAttestator = _scoreAttestator;
    }

    /// @notice Set the metadata renderer contract
    function setRenderer(address _renderer) external onlyOwner {
        if (_renderer == address(0)) revert ZeroAddress();
        emit RendererUpdated(renderer, _renderer);
        renderer = _renderer;
    }

    /// @notice Set the collection external link for contractURI
    function setCollectionExternalLink(string calldata url) external onlyOwner {
        emit CollectionExternalLinkUpdated(_collectionExternalLink, url);
        _collectionExternalLink = url;
    }

    /// @notice Set maximum voucher lifetime (0 = no limit)
    function setMaxVoucherLifetime(uint256 lifetime) external onlyOwner {
        emit MaxVoucherLifetimeUpdated(maxVoucherLifetime, lifetime);
        maxVoucherLifetime = lifetime;
    }

    /// @notice Admin revoke a user's profile. Allows user to re-mint with new voucher.
    function revoke(address user) external onlyOwner {
        uint256 tokenId = profileTokenId[user];
        if (tokenId == 0) revert NoProfileToRevoke();

        delete profileTokenId[user];
        hasMinted[user] = false;

        _burn(tokenId);
        emit ProfileRevoked(user, tokenId, msg.sender);
    }

    // ------------------------------------------------------------------------
    // Minting (EIP-712 Voucher)
    // ------------------------------------------------------------------------

    /// @notice Mint a soulbound profile NFT using a backend-signed MintVoucher.
    /// @dev Enforces:
    ///  - caller must be voucher.user
    ///  - voucher not expired
    ///  - voucher not reused
    ///  - caller has not minted before
    function mintProfile(MintVoucher calldata voucher, bytes calldata signature)
        external
        returns (uint256 tokenId)
    {
        if (voucher.user != msg.sender) revert CallerNotUser();

        // Enforce voucher expiry
        if (voucher.expiresAt == 0) revert VoucherExpired(); // Must have expiry
        if (block.timestamp > voucher.expiresAt) revert VoucherExpired();
        
        // Enforce maximum voucher lifetime if configured
        if (maxVoucherLifetime != 0 && voucher.expiresAt > block.timestamp + maxVoucherLifetime) {
            revert VoucherExpired();
        }

        bytes32 structHash = keccak256(
            abi.encode(
                MINT_VOUCHER_TYPEHASH,
                voucher.user,
                voucher.expiresAt,
                voucher.nonce
            )
        );

        bytes32 digest = _hashTypedDataV4(structHash);
        address signer = ECDSA.recover(digest, signature);
        if (signer != voucherSigner) revert InvalidSignature();

        bytes32 key = keccak256(abi.encodePacked(voucher.user, voucher.nonce));
        if (usedVouchers[key]) revert VoucherAlreadyUsed();
        usedVouchers[key] = true;

        if (hasMinted[msg.sender]) revert AlreadyMinted();
        hasMinted[msg.sender] = true;

        tokenId = ++_tokenIdCounter;
        _safeMint(msg.sender, tokenId);
        profileTokenId[msg.sender] = tokenId;

        emit ProfileMinted(msg.sender, tokenId, voucher.nonce);
        emit Locked(tokenId); // EIP-5192: Token is permanently locked
    }

    /// @notice Burn your own profile. Allows re-minting with new voucher.
    function burn() external {
        uint256 tokenId = profileTokenId[msg.sender];
        if (tokenId == 0) revert NoProfileToBurn();

        delete profileTokenId[msg.sender];
        hasMinted[msg.sender] = false;

        _burn(tokenId);
        emit ProfileBurned(msg.sender, tokenId);
    }

    // ------------------------------------------------------------------------
    // Soulbound Logic (non-transferable)
    // ------------------------------------------------------------------------

    /// @dev Disable approvals completely.
    function approve(address, uint256) public pure override {
        revert ApprovalsDisabled();
    }

    function setApprovalForAll(address, bool) public pure override {
        revert ApprovalsDisabled();
    }

    /// @dev Block transfers (only allow minting and burning).
    function _update(address to, uint256 tokenId, address auth)
        internal
        override
        returns (address)
    {
        // If from != 0 and to != 0, it's a transfer -> block it.
        address from = _ownerOf(tokenId);
        if (from != address(0) && to != address(0)) {
            revert NonTransferable();
        }
        return super._update(to, tokenId, auth);
    }

    // ------------------------------------------------------------------------
    // EIP-5192: Soulbound Token Interface
    // ------------------------------------------------------------------------

    /// @notice Returns the locking status of a Soulbound Token
    /// @dev All tokens are permanently locked (soulbound)
    /// @param tokenId The identifier for a token
    /// @return true if the token is locked (always true for this implementation)
    function locked(uint256 tokenId) external view returns (bool) {
        address owner = _ownerOf(tokenId);
        require(owner != address(0), "Token does not exist");
        return true; // All tokens are permanently soulbound
    }

    /// @notice ERC-165 interface detection
    /// @dev Supports ERC-721, ERC-165, and EIP-5192 interfaces
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override
        returns (bool)
    {
        return
            interfaceId == 0xb45a3c0e || // EIP-5192
            super.supportsInterface(interfaceId);
    }

    // ------------------------------------------------------------------------
    // Views / Helpers
    // ------------------------------------------------------------------------

    /// @notice Convenience view to get a user's SSA Index from the attestator.
    function getUserSSAIndex(address user) external view returns (uint256) {
        if (scoreAttestator == address(0)) return 0;
        return ISocialScoreAttestator(scoreAttestator).ssaIndexScores(user);
    }

    /// @notice Returns the tokenId for a given owner, or 0 if none.
    function getProfileTokenId(address user) external view returns (uint256) {
        return profileTokenId[user];
    }

    /// @notice Get total minted profiles count.
    function totalSupply() external view returns (uint256) {
        return _tokenIdCounter;
    }

    // ------------------------------------------------------------------------
    // Metadata (Delegated to Renderer)
    // ------------------------------------------------------------------------

    /// @notice Returns fully on-chain metadata with dynamic SVG
    /// @dev Delegates to ProfileSBTRenderer for rendering
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        address owner = _ownerOf(tokenId);
        require(owner != address(0), "Token does not exist");
        require(renderer != address(0), "Renderer not set");

        return IProfileSBTRenderer(renderer).generateTokenURI(tokenId, owner, scoreAttestator);
    }

    /// @notice Returns collection-level metadata for marketplaces
    /// @dev Delegates to ProfileSBTRenderer for rendering
    function contractURI() external view returns (string memory) {
        require(renderer != address(0), "Renderer not set");

        return IProfileSBTRenderer(renderer).generateContractURI(name(), _collectionExternalLink);
    }
}
