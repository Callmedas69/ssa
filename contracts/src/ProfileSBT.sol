// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title ProfileSBT
/// @notice Soulbound (non-transferable) profile NFT.
/// @dev
///  - One profile per wallet (by default)
///  - Minting is gated by an EIP-712 MintVoucher signed by a backend voucherSigner
///  - Optionally linked to SocialScoreAttestator to read on-chain SSA Index.

import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {ERC721Upgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import {EIP712Upgradeable} from "@openzeppelin/contracts-upgradeable/utils/cryptography/EIP712Upgradeable.sol";
import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

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
        uint256 expiresAt;  // unix timestamp (0 = no expiry)
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

    /// @notice base URI for metadata
    string private _baseTokenURI;

    // ------------------------------------------------------------------------
    // Events
    // ------------------------------------------------------------------------

    event VoucherSignerUpdated(address indexed oldSigner, address indexed newSigner);
    event ScoreAttestatorUpdated(address indexed oldAddr, address indexed newAddr);
    event BaseURIUpdated(string oldURI, string newURI);
    event ProfileMinted(address indexed user, uint256 indexed tokenId, uint256 nonce);

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
    /// @param baseURI base token URI
    function initialize(
        address _voucherSigner,
        address _scoreAttestator,
        string memory _name,
        string memory _symbol,
        string memory baseURI
    ) public initializer {
        if (_voucherSigner == address(0)) revert ZeroAddress();

        __Ownable_init(msg.sender);
        __UUPSUpgradeable_init();
        __ERC721_init(_name, _symbol);
        __EIP712_init("ProfileSBT", "1");

        voucherSigner = _voucherSigner;
        scoreAttestator = _scoreAttestator;
        _baseTokenURI = baseURI;
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

    function setBaseURI(string calldata newBaseURI) external onlyOwner {
        emit BaseURIUpdated(_baseTokenURI, newBaseURI);
        _baseTokenURI = newBaseURI;
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

        if (voucher.expiresAt != 0 && block.timestamp > voucher.expiresAt) {
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
    // Views / Helpers
    // ------------------------------------------------------------------------

    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }

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
}
