// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title ProfileSBTRenderer
/// @notice Upgradeable renderer for ProfileSBT metadata and SVG generation
/// @dev Separated from ProfileSBT to allow independent design updates

import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {Base64} from "@openzeppelin/contracts/utils/Base64.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";
import {IProfileSBTRenderer} from "./IProfileSBTRenderer.sol";

interface ISocialScoreAttestator {
    function ssaIndexScores(address user) external view returns (uint256);
    function providerScores(address user, bytes32 providerId) external view returns (uint256 score, uint256 updatedAt);
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

    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}

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
        (uint256 ssaIndex, uint256[6] memory scores) = _fetchScores(owner, scoreAttestator);

        // Generate SVG
        string memory svg = _generateSVG(owner, tokenId, ssaIndex, scores);

        // Build JSON metadata
        string memory json = string(abi.encodePacked(
            '{"name":"SSA Profile #', tokenId.toString(), '",',
            '"description":"Social Score Attestation Profile - Soulbound Token",',
            '"image":"data:image/svg+xml;base64,', Base64.encode(bytes(svg)), '"'
        ));

        // Add external_url only if base URL is set
        if (bytes(externalBaseUrl).length > 0) {
            json = string(abi.encodePacked(
                json,
                ',"external_url":"', externalBaseUrl, Strings.toHexString(uint160(owner), 20), '"'
            ));
        }

        // Add attributes and close JSON
        json = string(abi.encodePacked(
            json,
            ',"attributes":', _buildAttributes(ssaIndex, scores),
            '}'
        ));

        return string(abi.encodePacked(
            'data:application/json;base64,',
            Base64.encode(bytes(json))
        ));
    }

    /// @inheritdoc IProfileSBTRenderer
    function generateContractURI(
        string calldata collectionName,
        string calldata externalLink
    ) external pure override returns (string memory) {
        string memory collectionSvg = _generateCollectionSVG();

        string memory json = string(abi.encodePacked(
            '{"name":"', collectionName, '",',
            '"description":"Social Score Attestation Profile - Soulbound Tokens reputation scores.",',
            '"image":"data:image/svg+xml;base64,', Base64.encode(bytes(collectionSvg)), '"'
        ));

        // Add external_link only if set
        if (bytes(externalLink).length > 0) {
            json = string(abi.encodePacked(
                json,
                ',"external_link":"', externalLink, '"'
            ));
        }

        // No royalties for SBT (non-transferable)
        json = string(abi.encodePacked(
            json,
            ',"seller_fee_basis_points":0',
            ',"fee_recipient":"0x0000000000000000000000000000000000000000"}'
        ));

        return string(abi.encodePacked(
            'data:application/json;base64,',
            Base64.encode(bytes(json))
        ));
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

        ISocialScoreAttestator attestator = ISocialScoreAttestator(scoreAttestator);
        
        // Fetch SSA Index with try-catch to prevent DoS
        try attestator.ssaIndexScores(user) returns (uint256 index) {
            ssaIndex = index;
        } catch {
            ssaIndex = 0;
        }

        // Fetch provider scores with try-catch for each provider
        try attestator.providerScores(user, attestator.PROVIDER_ETHOS()) returns (uint256 score, uint256) {
            scores[0] = score;
        } catch {
            scores[0] = 0;
        }

        try attestator.providerScores(user, attestator.PROVIDER_NEYNAR()) returns (uint256 score, uint256) {
            scores[1] = score;
        } catch {
            scores[1] = 0;
        }

        try attestator.providerScores(user, attestator.PROVIDER_TALENT_BUILDER()) returns (uint256 score, uint256) {
            scores[2] = score;
        } catch {
            scores[2] = 0;
        }

        try attestator.providerScores(user, attestator.PROVIDER_TALENT_CREATOR()) returns (uint256 score, uint256) {
            scores[3] = score;
        } catch {
            scores[3] = 0;
        }

        try attestator.providerScores(user, attestator.PROVIDER_PASSPORT()) returns (uint256 score, uint256) {
            scores[4] = score;
        } catch {
            scores[4] = 0;
        }

        try attestator.providerScores(user, attestator.PROVIDER_QUOTIENT()) returns (uint256 score, uint256) {
            scores[5] = score;
        } catch {
            scores[5] = 0;
        }
    }

    // ------------------------------------------------------------------------
    // Internal: JSON Building
    // ------------------------------------------------------------------------

    /// @dev Build JSON attributes array
    function _buildAttributes(uint256 ssaIndex, uint256[6] memory scores) internal pure returns (string memory) {
        return string(abi.encodePacked(
            '[{"trait_type":"SSA Index","value":', ssaIndex.toString(), '},',
            '{"trait_type":"Ethos","value":', scores[0].toString(), '},',
            '{"trait_type":"Neynar","value":', scores[1].toString(), '},',
            '{"trait_type":"Talent Builder","value":', scores[2].toString(), '},',
            '{"trait_type":"Talent Creator","value":', scores[3].toString(), '},',
            '{"trait_type":"Passport","value":', scores[4].toString(), '},',
            '{"trait_type":"Quotient","value":', scores[5].toString(), '}]'
        ));
    }

    // ------------------------------------------------------------------------
    // Internal: SVG Generation
    // ------------------------------------------------------------------------

    /// @dev Generate SVG image for token
    function _generateSVG(
        address owner,
        uint256 tokenId,
        uint256 ssaIndex,
        uint256[6] memory scores
    ) internal pure returns (string memory) {
        return string(abi.encodePacked(
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">',
            '<defs>',
            '<linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">',
            '<stop offset="0%" style="stop-color:#1a1a2e"/>',
            '<stop offset="100%" style="stop-color:#16213e"/>',
            '</linearGradient>',
            '</defs>',
            '<rect width="512" height="512" fill="url(#bg)"/>',
            _renderHeader(tokenId, ssaIndex),
            _renderAddress(owner),
            _renderScoreBars(scores),
            '</svg>'
        ));
    }

    /// @dev Render header with title and SSA score
    function _renderHeader(uint256 tokenId, uint256 ssaIndex) internal pure returns (string memory) {
        return string(abi.encodePacked(
            '<text x="256" y="40" font-family="Arial,sans-serif" font-size="20" fill="#fff" text-anchor="middle" font-weight="bold">SSA PROFILE</text>',
            '<rect x="196" y="60" width="120" height="60" rx="10" fill="#0f3460"/>',
            '<text x="256" y="85" font-family="Arial,sans-serif" font-size="12" fill="#94a3b8" text-anchor="middle">SSA INDEX</text>',
            '<text x="256" y="110" font-family="Arial,sans-serif" font-size="28" fill="#00d9ff" text-anchor="middle" font-weight="bold">', ssaIndex.toString(), '</text>',
            '<text x="256" y="145" font-family="Arial,sans-serif" font-size="11" fill="#64748b" text-anchor="middle">#', tokenId.toString(), '</text>'
        ));
    }

    /// @dev Render truncated address
    function _renderAddress(address owner) internal pure returns (string memory) {
        return string(abi.encodePacked(
            '<text x="256" y="170" font-family="monospace" font-size="11" fill="#94a3b8" text-anchor="middle">',
            _truncateAddress(owner),
            '</text>',
            '<line x1="56" y1="190" x2="456" y2="190" stroke="#2d3748" stroke-width="1"/>'
        ));
    }

    /// @dev Render all 6 score bars
    function _renderScoreBars(uint256[6] memory scores) internal pure returns (string memory) {
        string[6] memory labels = ["Ethos", "Neynar", "Talent Builder", "Talent Creator", "Passport", "Quotient"];
        string memory bars = "";

        for (uint256 i = 0; i < 6; i++) {
            uint256 y = 220 + (i * 45);
            bars = string(abi.encodePacked(bars, _renderScoreBar(labels[i], scores[i], y)));
        }

        return bars;
    }

    /// @dev Render single score bar
    function _renderScoreBar(string memory label, uint256 score, uint256 y) internal pure returns (string memory) {
        uint256 barWidth = (score * 200) / 100; // Max width 200px for score 100

        return string(abi.encodePacked(
            '<text x="56" y="', y.toString(), '" font-family="Arial,sans-serif" font-size="12" fill="#94a3b8">', label, '</text>',
            '<rect x="200" y="', (y - 12).toString(), '" width="200" height="16" rx="4" fill="#1e293b"/>',
            '<rect x="200" y="', (y - 12).toString(), '" width="', barWidth.toString(), '" height="16" rx="4" fill="#00d9ff"/>',
            '<text x="410" y="', y.toString(), '" font-family="Arial,sans-serif" font-size="12" fill="#fff" text-anchor="end">', score.toString(), '</text>'
        ));
    }

    /// @dev Truncate address to 0x1234...5678 format
    function _truncateAddress(address addr) internal pure returns (string memory) {
        bytes memory addrBytes = bytes(Strings.toHexString(uint160(addr), 20));
        bytes memory result = new bytes(13);

        // Copy first 6 chars (0x1234)
        for (uint256 i = 0; i < 6; i++) {
            result[i] = addrBytes[i];
        }

        // Add ellipsis
        result[6] = '.';
        result[7] = '.';
        result[8] = '.';

        // Copy last 4 chars
        for (uint256 i = 0; i < 4; i++) {
            result[9 + i] = addrBytes[addrBytes.length - 4 + i];
        }

        return string(result);
    }

    /// @dev Generate collection logo SVG
    function _generateCollectionSVG() internal pure returns (string memory) {
        return string(abi.encodePacked(
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">',
            '<defs>',
            '<linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">',
            '<stop offset="0%" style="stop-color:#1a1a2e"/>',
            '<stop offset="100%" style="stop-color:#16213e"/>',
            '</linearGradient>',
            '</defs>',
            '<rect width="512" height="512" fill="url(#bg)"/>',
            '<text x="256" y="230" font-family="Arial,sans-serif" font-size="48" fill="#fff" text-anchor="middle" font-weight="bold">SSA</text>',
            '<text x="256" y="280" font-family="Arial,sans-serif" font-size="18" fill="#94a3b8" text-anchor="middle">PROFILE</text>',
            '<rect x="156" y="310" width="200" height="4" rx="2" fill="#00d9ff"/>',
            '<text x="256" y="360" font-family="Arial,sans-serif" font-size="12" fill="#64748b" text-anchor="middle">Soulbound Token</text>',
            '</svg>'
        ));
    }
}
