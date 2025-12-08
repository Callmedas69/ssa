// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title IProfileSBTRenderer
/// @notice Interface for ProfileSBT metadata and SVG rendering
interface IProfileSBTRenderer {
    /// @notice Generate full tokenURI JSON with on-chain SVG
    /// @param tokenId The token ID
    /// @param owner The token owner address
    /// @param scoreAttestator Address of SocialScoreAttestator contract
    /// @return Base64-encoded JSON metadata with embedded SVG
    function generateTokenURI(
        uint256 tokenId,
        address owner,
        address scoreAttestator
    ) external view returns (string memory);

    /// @notice Generate contractURI JSON for collection metadata
    /// @param collectionName The collection name
    /// @param externalLink External website link (can be empty)
    /// @return Base64-encoded JSON collection metadata
    function generateContractURI(
        string calldata collectionName,
        string calldata externalLink
    ) external view returns (string memory);
}
