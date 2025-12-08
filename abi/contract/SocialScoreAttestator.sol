// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title SocialScoreAttestator
/// @notice Upgradeable contract that verifies backend-signed EIP-712 payloads
/// and stores normalized provider scores + SSA Index on-chain.
/// @dev Uses UUPS proxy pattern for upgradeability.
/// @custom:oz-upgrades

import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {PausableUpgradeable} from "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";
import {EIP712Upgradeable} from "@openzeppelin/contracts-upgradeable/utils/cryptography/EIP712Upgradeable.sol";
import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

contract SocialScoreAttestator is
    Initializable,
    UUPSUpgradeable,
    OwnableUpgradeable,
    PausableUpgradeable,
    EIP712Upgradeable
{
    // ------------------------------------------------------------------------
    // Types
    // ------------------------------------------------------------------------

    struct ProviderScore {
        uint256 score;      // normalized score: 0-100
        uint256 updatedAt;  // unix timestamp (seconds)
    }

    struct ScorePayload {
        address user;
        uint256 ssaIndex;
        bytes32[] providers;
        uint256[] scores;
        uint256 timestamp;
    }

    // ------------------------------------------------------------------------
    // Constants
    // ------------------------------------------------------------------------

    /// @notice Contract version for upgrade tracking
    uint256 public constant VERSION = 1;

    /// @notice Minimum time between submissions per user (24 hours)
    uint256 public constant MIN_SUBMISSION_INTERVAL = 1 days;

    /// @notice EIP-712 typehash for ScorePayload
    bytes32 public constant SCORE_PAYLOAD_TYPEHASH =
        keccak256("ScorePayload(address user,uint256 ssaIndex,bytes32[] providers,uint256[] scores,uint256 timestamp)");

    /// @notice Provider ID constants (official list)
    bytes32 public constant PROVIDER_ETHOS = keccak256("ETHOS");
    bytes32 public constant PROVIDER_NEYNAR = keccak256("NEYNAR");
    bytes32 public constant PROVIDER_TALENT_BUILDER = keccak256("TALENT_BUILDER");
    bytes32 public constant PROVIDER_TALENT_CREATOR = keccak256("TALENT_CREATOR");
    bytes32 public constant PROVIDER_PASSPORT = keccak256("PASSPORT");
    bytes32 public constant PROVIDER_QUOTIENT = keccak256("QUOTIENT");

    // ------------------------------------------------------------------------
    // Storage (follow storage layout carefully for upgrades)
    // ------------------------------------------------------------------------

    /// @notice Authorized backend signer address
    address public backendSigner;

    /// @notice Max age (in seconds) allowed for payload.timestamp.
    /// If zero, freshness checks are disabled.
    uint256 public maxTimestampSkew;

    /// @notice User -> SSA Index (0-100)
    mapping(address => uint256) public ssaIndexScores;

    /// @notice User -> providerId -> score struct
    mapping(address => mapping(bytes32 => ProviderScore)) public providerScores;

    /// @notice Set of allowed provider identifiers
    mapping(bytes32 => bool) public allowedProviders;

    /// @notice User -> last update timestamp (for tracking)
    mapping(address => uint256) public lastUpdated;

    /// @notice Track used signatures to prevent replay attacks
    mapping(bytes32 => bool) public usedSignatures;

    /// @notice Storage gap for future upgrades
    /// @dev Reserve 49 slots for future storage variables (reduced by 1 for usedSignatures)
    /// UPGRADE TRACKING: Original gap was 50. Reduced to 49 when usedSignatures was added.
    /// When adding new storage variables, reduce this gap accordingly to maintain storage layout.
    uint256[49] private __gap;

    // ------------------------------------------------------------------------
    // Events
    // ------------------------------------------------------------------------

    event BackendSignerUpdated(address indexed oldSigner, address indexed newSigner);
    event AllowedProviderUpdated(bytes32 indexed providerId, bool allowed);
    event MaxTimestampSkewUpdated(uint256 oldValue, uint256 newValue);
    event ScoreUpdated(address indexed user, bytes32 indexed providerId, uint256 score, uint256 timestamp);
    event SSAIndexUpdated(address indexed user, uint256 ssaIndex, uint256 timestamp);

    // ------------------------------------------------------------------------
    // Errors
    // ------------------------------------------------------------------------

    error ZeroAddress();
    error EmptyProviders();
    error LengthMismatch();
    error SSAIndexTooHigh();
    error CallerNotUser();
    error FutureTimestamp();
    error PayloadTooOld();
    error InvalidSignature();
    error ProviderNotAllowed(bytes32 providerId);
    error ScoreTooHigh(uint256 score);
    error SignatureAlreadyUsed();
    error SubmissionTooFrequent(uint256 nextAllowedTime);

    // ------------------------------------------------------------------------
    // Initialization / Upgrade
    // ------------------------------------------------------------------------

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    /// @notice Initializer (UUPS). Must be called via proxy.
    /// @param _backendSigner backend address that signs ScorePayloads
    /// @param _allowedProviders initial list of allowed provider ids
    function initialize(address _backendSigner, bytes32[] memory _allowedProviders) public initializer {
        if (_backendSigner == address(0)) revert ZeroAddress();

        __Ownable_init(msg.sender);
        __Pausable_init();
        __EIP712_init("SocialScoreHub", "1");

        backendSigner = _backendSigner;
        maxTimestampSkew = 1 days;

        for (uint256 i = 0; i < _allowedProviders.length; i++) {
            allowedProviders[_allowedProviders[i]] = true;
            emit AllowedProviderUpdated(_allowedProviders[i], true);
        }
    }

    /// @notice Reinitializer for V2 upgrades (example pattern)
    /// @dev Increment the version number for each upgrade
    // function initializeV2() public reinitializer(2) {
    //     // V2 initialization logic here
    // }

    /// @inheritdoc UUPSUpgradeable
    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}

    // ------------------------------------------------------------------------
    // Admin
    // ------------------------------------------------------------------------

    /// @notice Pause the contract (emergency stop)
    function pause() external onlyOwner {
        _pause();
    }

    /// @notice Unpause the contract
    function unpause() external onlyOwner {
        _unpause();
    }

    /// @notice Update backend signer.
    function setBackendSigner(address _backendSigner) external onlyOwner {
        if (_backendSigner == address(0)) revert ZeroAddress();
        emit BackendSignerUpdated(backendSigner, _backendSigner);
        backendSigner = _backendSigner;
    }

    /// @notice Set or unset an allowed provider id.
    function setAllowedProvider(bytes32 providerId, bool allowed) external onlyOwner {
        allowedProviders[providerId] = allowed;
        emit AllowedProviderUpdated(providerId, allowed);
    }

    /// @notice Batch set allowed providers.
    function setAllowedProviders(bytes32[] calldata providerIds, bool allowed) external onlyOwner {
        for (uint256 i = 0; i < providerIds.length; i++) {
            allowedProviders[providerIds[i]] = allowed;
            emit AllowedProviderUpdated(providerIds[i], allowed);
        }
    }

    /// @notice Update maximum timestamp skew (seconds) for payload freshness.
    /// If set to 0, disables timestamp check.
    function setMaxTimestampSkew(uint256 newValue) external onlyOwner {
        emit MaxTimestampSkewUpdated(maxTimestampSkew, newValue);
        maxTimestampSkew = newValue;
    }

    // ------------------------------------------------------------------------
    // Public API
    // ------------------------------------------------------------------------

    /// @notice Submit a backend-signed score payload.
    /// @dev
    ///  - Verifies EIP-712 signature from backendSigner
    ///  - Checks timestamp freshness (if enabled)
    ///  - Updates per-provider scores and SSA Index mappings
    ///
    /// @param payload ScorePayload struct (see EIP712 docs)
    /// @param signature EIP-712 signature from backendSigner
    function submitScores(ScorePayload calldata payload, bytes calldata signature) external whenNotPaused {
        if (payload.providers.length == 0) revert EmptyProviders();
        if (payload.providers.length != payload.scores.length) revert LengthMismatch();
        if (payload.ssaIndex > 100) revert SSAIndexTooHigh();

        // Require caller is the user (prevents griefing / spam updates)
        if (payload.user != msg.sender) revert CallerNotUser();

        // Rate limiting: 24 hour cooldown per user
        uint256 nextAllowedTime = lastUpdated[msg.sender] + MIN_SUBMISSION_INTERVAL;
        if (block.timestamp < nextAllowedTime) {
            revert SubmissionTooFrequent(nextAllowedTime);
        }

        // Timestamp freshness check
        if (maxTimestampSkew != 0) {
            if (payload.timestamp > block.timestamp) revert FutureTimestamp();
            if (block.timestamp - payload.timestamp > maxTimestampSkew) revert PayloadTooOld();
        }

        // Signature replay protection
        bytes32 sigHash = keccak256(signature);
        if (usedSignatures[sigHash]) revert SignatureAlreadyUsed();
        usedSignatures[sigHash] = true;

        // Verify signature
        bytes32 structHash = keccak256(
            abi.encode(
                SCORE_PAYLOAD_TYPEHASH,
                payload.user,
                payload.ssaIndex,
                keccak256(abi.encodePacked(payload.providers)),
                keccak256(abi.encodePacked(payload.scores)),
                payload.timestamp
            )
        );

        bytes32 digest = _hashTypedDataV4(structHash);
        address signer = ECDSA.recover(digest, signature);
        if (signer != backendSigner) revert InvalidSignature();

        // Update SSA Index
        ssaIndexScores[payload.user] = payload.ssaIndex;
        lastUpdated[payload.user] = block.timestamp; // Use block.timestamp for rate limiting
        emit SSAIndexUpdated(payload.user, payload.ssaIndex, payload.timestamp);

        // Update provider scores
        for (uint256 i = 0; i < payload.providers.length; i++) {
            bytes32 providerId = payload.providers[i];
            if (!allowedProviders[providerId]) revert ProviderNotAllowed(providerId);

            uint256 score = payload.scores[i];
            if (score > 100) revert ScoreTooHigh(score);

            providerScores[payload.user][providerId] = ProviderScore({
                score: score,
                updatedAt: payload.timestamp
            });

            emit ScoreUpdated(payload.user, providerId, score, payload.timestamp);
        }
    }

    // ------------------------------------------------------------------------
    // View Helpers
    // ------------------------------------------------------------------------

    /// @notice Fetch a user's score for a given provider.
    function getProviderScore(address user, bytes32 providerId) external view returns (ProviderScore memory) {
        return providerScores[user][providerId];
    }

    /// @notice Convenience helper to check if a provider is allowed.
    function isProviderAllowed(bytes32 providerId) external view returns (bool) {
        return allowedProviders[providerId];
    }

    /// @notice Get a user's SSA Index and last update time.
    function getUserSSAIndex(address user) external view returns (uint256 ssaIndex, uint256 updatedAt) {
        return (ssaIndexScores[user], lastUpdated[user]);
    }

    /// @notice Get all provider scores for a user.
    /// @param user The user address
    /// @param providerIds Array of provider IDs to query
    /// @return scores Array of ProviderScore structs
    function getBatchProviderScores(
        address user,
        bytes32[] calldata providerIds
    ) external view returns (ProviderScore[] memory scores) {
        scores = new ProviderScore[](providerIds.length);
        for (uint256 i = 0; i < providerIds.length; i++) {
            scores[i] = providerScores[user][providerIds[i]];
        }
    }

    /// @notice Get the implementation version
    function version() external pure returns (uint256) {
        return VERSION;
    }
}
