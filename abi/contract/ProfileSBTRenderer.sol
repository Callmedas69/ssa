// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title ProfileSBTRenderer
/// @notice Upgradeable renderer for ProfileSBT metadata and SVG generation
/// @dev Separated from ProfileSBT to allow independent design updates

import {
    Initializable
} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {
    UUPSUpgradeable
} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {
    OwnableUpgradeable
} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {Base64} from "@openzeppelin/contracts/utils/Base64.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";
import {IProfileSBTRenderer} from "./IProfileSBTRenderer.sol";

interface ISocialScoreAttestator {
    function ssaIndexScores(address user) external view returns (uint256);
    function providerScores(
        address user,
        bytes32 providerId
    ) external view returns (uint256 score, uint256 updatedAt);
    function PROVIDER_ETHOS() external view returns (bytes32);
    function PROVIDER_NEYNAR() external view returns (bytes32);
    function PROVIDER_TALENT_BUILDER() external view returns (bytes32);
    function PROVIDER_TALENT_CREATOR() external view returns (bytes32);
    function PROVIDER_PASSPORT() external view returns (bytes32);
    function PROVIDER_QUOTIENT() external view returns (bytes32);
}

contract ProfileSBTRenderer is
    IProfileSBTRenderer,
    Initializable,
    UUPSUpgradeable,
    OwnableUpgradeable
{
    using Strings for uint256;
    using Strings for address;

    // ------------------------------------------------------------------------
    // Storage
    // ------------------------------------------------------------------------

    /// @notice Base URL for external profile links (e.g., "https://ssa.xyz/profile/")
    string public externalBaseUrl;

    /// @notice Storage gap for future upgrades
    uint256[49] private __gap;

    // ------------------------------------------------------------------------
    // Events
    // ------------------------------------------------------------------------

    event ExternalBaseUrlUpdated(string oldUrl, string newUrl);

    // ------------------------------------------------------------------------
    // Constants: Braille Colors
    // ------------------------------------------------------------------------

    /// @dev 8 Braille dot colors - Neon/Web3 palette
    string internal constant COLOR_0 = "#00f5d4"; // Cyan
    string internal constant COLOR_1 = "#fee440"; // Electric Yellow
    string internal constant COLOR_2 = "#f15bb5"; // Hot Pink
    string internal constant COLOR_3 = "#9b5de5"; // Purple
    string internal constant COLOR_4 = "#00bbf9"; // Sky Blue
    string internal constant COLOR_5 = "#fb5607"; // Orange
    string internal constant COLOR_6 = "#8ac926"; // Lime
    string internal constant COLOR_7 = "#ff006e"; // Magenta

    // ------------------------------------------------------------------------
    // Init / Upgrade
    // ------------------------------------------------------------------------

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    /// @notice Initializer (UUPS). Must be called via proxy.
    function initialize() public initializer {
        __Ownable_init(msg.sender);
    }

    function _authorizeUpgrade(
        address newImplementation
    ) internal override onlyOwner {}

    // ------------------------------------------------------------------------
    // Admin
    // ------------------------------------------------------------------------

    /// @notice Set the base URL for external profile links
    function setExternalBaseUrl(string calldata url) external onlyOwner {
        emit ExternalBaseUrlUpdated(externalBaseUrl, url);
        externalBaseUrl = url;
    }

    // ------------------------------------------------------------------------
    // IProfileSBTRenderer Implementation
    // ------------------------------------------------------------------------

    /// @inheritdoc IProfileSBTRenderer
    function generateTokenURI(
        uint256 tokenId,
        address owner,
        address scoreAttestator
    ) external view override returns (string memory) {
        // Fetch scores
        (uint256 ssaIndex, uint256[6] memory scores) = _fetchScores(
            owner,
            scoreAttestator
        );

        // Generate SVG
        string memory svg = _generateSVG(owner, tokenId, ssaIndex, scores);

        // Build JSON metadata
        string memory json = string(
            abi.encodePacked(
                '{"name":"SSA Profile #',
                tokenId.toString(),
                '",',
                '"description":"Social Score Attestation Profile - Soulbound Token",',
                '"image":"data:image/svg+xml;base64,',
                Base64.encode(bytes(svg)),
                '"'
            )
        );

        // Add external_url only if base URL is set
        if (bytes(externalBaseUrl).length > 0) {
            json = string(
                abi.encodePacked(
                    json,
                    ',"external_url":"',
                    externalBaseUrl,
                    Strings.toHexString(uint160(owner), 20),
                    '"'
                )
            );
        }

        // Add attributes and close JSON
        json = string(
            abi.encodePacked(
                json,
                ',"attributes":',
                _buildAttributes(ssaIndex, scores),
                "}"
            )
        );

        return
            string(
                abi.encodePacked(
                    "data:application/json;base64,",
                    Base64.encode(bytes(json))
                )
            );
    }

    /// @inheritdoc IProfileSBTRenderer
    function generateContractURI(
        string calldata collectionName,
        string calldata externalLink
    ) external pure override returns (string memory) {
        string memory collectionSvg = _generateCollectionSVG();

        string memory json = string(
            abi.encodePacked(
                '{"name":"',
                collectionName,
                '",',
                '"description":"Social Score Attestation Profile - Soulbound Tokens reputation scores.",',
                '"image":"data:image/svg+xml;base64,',
                Base64.encode(bytes(collectionSvg)),
                '"'
            )
        );

        // Add external_link only if set
        if (bytes(externalLink).length > 0) {
            json = string(
                abi.encodePacked(json, ',"external_link":"', externalLink, '"')
            );
        }

        // No royalties for SBT (non-transferable)
        json = string(
            abi.encodePacked(
                json,
                ',"seller_fee_basis_points":0',
                ',"fee_recipient":"0x0000000000000000000000000000000000000000"}'
            )
        );

        return
            string(
                abi.encodePacked(
                    "data:application/json;base64,",
                    Base64.encode(bytes(json))
                )
            );
    }

    // ------------------------------------------------------------------------
    // Internal: Score Fetching
    // ------------------------------------------------------------------------

    /// @dev Fetch all scores from SocialScoreAttestator
    function _fetchScores(
        address user,
        address scoreAttestator
    ) internal view returns (uint256 ssaIndex, uint256[6] memory scores) {
        if (scoreAttestator == address(0)) {
            return (0, scores);
        }

        ISocialScoreAttestator attestator = ISocialScoreAttestator(
            scoreAttestator
        );

        // Fetch SSA Index with try-catch to prevent DoS
        try attestator.ssaIndexScores(user) returns (uint256 index) {
            ssaIndex = index;
        } catch {
            ssaIndex = 0;
        }
        // Fetch provider scores with try-catch for each provider
        try
            attestator.providerScores(user, attestator.PROVIDER_ETHOS())
        returns (uint256 score, uint256) {
            scores[0] = score;
        } catch {
            scores[0] = 0;
        }
        try
            attestator.providerScores(user, attestator.PROVIDER_NEYNAR())
        returns (uint256 score, uint256) {
            scores[1] = score;
        } catch {
            scores[1] = 0;
        }
        try
            attestator.providerScores(
                user,
                attestator.PROVIDER_TALENT_BUILDER()
            )
        returns (uint256 score, uint256) {
            scores[2] = score;
        } catch {
            scores[2] = 0;
        }
        try
            attestator.providerScores(
                user,
                attestator.PROVIDER_TALENT_CREATOR()
            )
        returns (uint256 score, uint256) {
            scores[3] = score;
        } catch {
            scores[3] = 0;
        }
        try
            attestator.providerScores(user, attestator.PROVIDER_PASSPORT())
        returns (uint256 score, uint256) {
            scores[4] = score;
        } catch {
            scores[4] = 0;
        }
        try
            attestator.providerScores(user, attestator.PROVIDER_QUOTIENT())
        returns (uint256 score, uint256) {
            scores[5] = score;
        } catch {
            scores[5] = 0;
        }
    }

    // ------------------------------------------------------------------------
    // Internal: JSON Building
    // ------------------------------------------------------------------------

    /// @dev Build JSON attributes array
    function _buildAttributes(
        uint256 ssaIndex,
        uint256[6] memory scores
    ) internal pure returns (string memory) {
        return
            string(
                abi.encodePacked(
                    '[{"trait_type":"SSA Index","value":',
                    ssaIndex.toString(),
                    "},",
                    '{"trait_type":"Ethos","value":',
                    scores[0].toString(),
                    "},",
                    '{"trait_type":"Neynar","value":',
                    scores[1].toString(),
                    "},",
                    '{"trait_type":"Talent Builder","value":',
                    scores[2].toString(),
                    "},",
                    '{"trait_type":"Talent Creator","value":',
                    scores[3].toString(),
                    "},",
                    '{"trait_type":"Passport","value":',
                    scores[4].toString(),
                    "},",
                    '{"trait_type":"Quotient","value":',
                    scores[5].toString(),
                    "}]"
                )
            );
    }

    // ------------------------------------------------------------------------
    // Internal: SVG Generation (Braille)
    // ------------------------------------------------------------------------

    /// @dev Generate SVG image for token - Braille representation of SSA Index
    /// @param owner Not used in SVG (kept for signature compatibility)
    /// @param tokenId Used for color rotation per token
    /// @param ssaIndex Primary visual data (0-99, clamped)
    /// @param scores Not used in SVG (kept in metadata only)
    function _generateSVG(
        address owner,
        uint256 tokenId,
        uint256 ssaIndex,
        uint256[6] memory scores
    ) internal pure returns (string memory) {
        // Silence unused variable warnings
        owner;
        scores;

        // Clamp ssaIndex to max 99
        if (ssaIndex > 99) {
            ssaIndex = 99;
        }

        // Split into two digits
        uint256 leftDigit = ssaIndex / 10;
        uint256 rightDigit = ssaIndex % 10;

        // Get patterns for both digits
        bool[6] memory leftPattern = _getBraillePattern(leftDigit);
        bool[6] memory rightPattern = _getBraillePattern(rightDigit);

        return
            string(
                abi.encodePacked(
                    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">',
                    '<style>.d{animation:c 8s linear infinite}@keyframes c{to{filter:hue-rotate(360deg)}}</style>',
                    '<rect width="512" height="512" fill="#2e293a"/>',
                    _renderBrailleDigit(leftPattern, 64, tokenId, 0),
                    _renderBrailleDigit(rightPattern, 266, tokenId, 1),
                    "</svg>"
                )
            );
    }

    /// @dev Get Braille pattern for a single digit (0-9)
    /// @param digit The digit to get the pattern for
    /// @return pattern Array of 6 booleans (true = filled, false = outline)
    function _getBraillePattern(
        uint256 digit
    ) internal pure returns (bool[6] memory pattern) {
        if (digit == 0) return [false, true, false, true, true, false];
        if (digit == 1) return [true, false, false, false, false, false];
        if (digit == 2) return [true, true, false, false, false, false];
        if (digit == 3) return [true, false, false, true, false, false];
        if (digit == 4) return [true, false, false, true, true, false];
        if (digit == 5) return [true, false, false, false, true, false];
        if (digit == 6) return [true, true, false, true, false, false];
        if (digit == 7) return [true, true, false, true, true, false];
        if (digit == 8) return [true, true, false, false, true, false];
        if (digit == 9) return [false, true, false, true, false, false];
        // Fallback (should never reach)
        return [false, false, false, false, false, false];
    }

    /// @dev Get color for a specific position based on tokenId rotation
    /// @param position Position index (0-11)
    /// @param tokenId Token ID for color rotation
    /// @return Color hex string
    function _getColor(
        uint256 position,
        uint256 tokenId
    ) internal pure returns (string memory) {
        uint256 colorIndex = (position + tokenId) % 8;
        if (colorIndex == 0) return COLOR_0;
        if (colorIndex == 1) return COLOR_1;
        if (colorIndex == 2) return COLOR_2;
        if (colorIndex == 3) return COLOR_3;
        if (colorIndex == 4) return COLOR_4;
        if (colorIndex == 5) return COLOR_5;
        if (colorIndex == 6) return COLOR_6;
        return COLOR_7;
    }

    /// @dev Render a single Braille digit (6 rectangles in 3x2 matrix)
    /// @param pattern The 6-position pattern for the digit
    /// @param xOffset Base X position (64 for left set, 266 for right set)
    /// @param tokenId Token ID for color rotation
    /// @param digitIndex 0 for left digit, 1 for right digit
    /// @return SVG string for the 6 rectangles
    function _renderBrailleDigit(
        bool[6] memory pattern,
        uint256 xOffset,
        uint256 tokenId,
        uint256 digitIndex
    ) internal pure returns (string memory) {
        // X positions: col1 = xOffset, col2 = xOffset + 101
        // Y positions: row1 = 114, row2 = 216, row3 = 317
        uint256[6] memory xPos = [
            xOffset,
            xOffset,
            xOffset,
            xOffset + 101,
            xOffset + 101,
            xOffset + 101
        ];
        uint256[6] memory yPos = [
            uint256(114),
            uint256(216),
            uint256(317),
            uint256(114),
            uint256(216),
            uint256(317)
        ];

        string memory rects = "";
        for (uint256 i = 0; i < 6; i++) {
            // Only render filled dots
            if (pattern[i]) {
                uint256 globalPosition = digitIndex * 6 + i;
                string memory color = _getColor(globalPosition, tokenId);
                rects = string(
                    abi.encodePacked(
                        rects,
                        '<rect class="d" x="',
                        xPos[i].toString(),
                        '" y="',
                        yPos[i].toString(),
                        '" width="80" height="80" rx="16" fill="',
                        color,
                        '"/>'
                    )
                );
            }
        }

        return rects;
    }

    /// @dev Generate collection logo SVG
    function _generateCollectionSVG() internal pure returns (string memory) {
        return
            string(
                abi.encodePacked(
                    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">',
                    '<rect width="100%" height="100%" fill="#fff"/>',
                    // LEFT SET
                    '<circle cx="104" cy="154" r="40" fill="none" />',
                    '<circle cx="104" cy="256" r="40" fill="none" />',
                    '<circle cx="104" cy="357" r="40" fill="#000" />',
                    '<circle cx="205" cy="154" r="40" fill="#000" />',
                    '<circle cx="205" cy="256" r="40" fill="#000" />',
                    '<circle cx="205" cy="357" r="40" fill="#000" />',
                    // RIGHT SET
                    '<circle cx="307" cy="154" r="40" fill="#fc401f" />',
                    '<circle cx="307" cy="256" r="40" fill="#0000ff" />',
                    '<circle cx="307" cy="357" r="40" fill="none" />',
                    '<circle cx="408" cy="154" r="40" fill="none" />',
                    '<circle cx="408" cy="256" r="40" fill="#ffd12f" />',
                    '<circle cx="408" cy="357" r="40" fill="none" />',
                    "</svg>"
                )
            );
    }
}
