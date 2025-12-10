Here we go, C — EIP-712 docs + a full `SocialScoreAttestator` contract.

---

## `EIP712_SCORE_PAYLOAD_SCHEMA.md`

````md
# EIP-712 Score Payload Schema

This document defines the **typed data** used to attest normalized provider
scores and a unified MetaScore for a given user.

The payload is:

- computed + normalized off-chain (backend)
- signed using **EIP-712 typed data**
- submitted on-chain to `SocialScoreAttestator.submitScores`

---

## 1. EIP-712 Domain

```ts
const domain = {
  name: "SocialScoreHub",
  version: "1",
  chainId: <CHAIN_ID>,                 // e.g. 8453 for Base, 10 for OP
  verifyingContract: <ATTESTATOR_ADDR> // SocialScoreAttestator proxy address
}
````

* `name` and `version` MUST match the contract.
* `chainId` MUST be the current network chain ID.
* `verifyingContract` MUST be the deployed proxy address.

---

## 2. Types

```ts
const types = {
  ScorePayload: [
    { name: "user",       type: "address" },
    { name: "metaScore",  type: "uint256" },
    { name: "providers",  type: "bytes32[]" },
    { name: "scores",     type: "uint256[]" },
    { name: "timestamp",  type: "uint256" }
  ]
}
```

**Notes**

* `providers` is an array of `bytes32` identifiers (e.g. `keccak256("NEYNAR")`).
* `scores` is an array of normalized scores (`uint256`, 0–100).
* `providers.length` MUST equal `scores.length`.
* `timestamp` is a unix timestamp (seconds) used for freshness checks.

---

## 3. Message (Payload) Shape

Example payload:

```ts
const message = {
  user: "0x1234...abcd",        // wallet for which scores are computed
  metaScore: 47,                // 0–100 MetaScore
  providers: [
    "0x4f7ac860...NEYNAR_ID...",         // bytes32("ETHOS")
    "0xbc5a...NEYNAR_ID...",             // bytes32("NEYNAR")
    "0x...TALENT_BUILDER_ID...",         // bytes32("TALENT_BUILDER")
    "0x...TALENT_CREATOR_ID...",         // bytes32("TALENT_CREATOR")
    "0x...PASSPORT_ID...",               // bytes32("PASSPORT")
    "0x...QUOTIENT_ID..."                // bytes32("QUOTIENT")
  ],
  scores: [44, 98, 50, 31, 27, 0],       // all 0–100 normalized
  timestamp: 1710000000
}
```

The mapping between provider names and IDs is handled off-chain. A
recommended convention is:

```ts
const PROVIDERS = {
  ETHOS:          ethers.id("ETHOS"),
  NEYNAR:         ethers.id("NEYNAR"),
  TALENT_BUILDER: ethers.id("TALENT_BUILDER"),
  TALENT_CREATOR: ethers.id("TALENT_CREATOR"),
  PASSPORT:       ethers.id("PASSPORT"),
  QUOTIENT:       ethers.id("QUOTIENT")
}
```

These same IDs must be registered on-chain as `allowedProviders`.

---

## 4. Signing (Backend Example)

Using `ethers` v6:

```ts
import { TypedDataDomain, TypedDataField, Wallet } from "ethers";

const domain: TypedDataDomain = {
  name: "SocialScoreHub",
  version: "1",
  chainId,
  verifyingContract: attestatorAddress
};

const types: Record<string, TypedDataField[]> = {
  ScorePayload: [
    { name: "user",      type: "address" },
    { name: "metaScore", type: "uint256" },
    { name: "providers", type: "bytes32[]" },
    { name: "scores",    type: "uint256[]" },
    { name: "timestamp", type: "uint256" }
  ]
};

// message constructed as shown above
const signature = await backendSigner.signTypedData(domain, types, message);
```

The backend returns to the frontend:

```json
{
  "payload": { ...message },
  "signature": "0x..."
}
```

---

## 5. On-Chain Verification (Conceptual)

The contract:

1. Recomputes the struct hash:

   ```solidity
   bytes32 structHash = keccak256(
     abi.encode(
       SCORE_PAYLOAD_TYPEHASH,
       payload.user,
       payload.metaScore,
       keccak256(abi.encodePacked(payload.providers)),
       keccak256(abi.encodePacked(payload.scores)),
       payload.timestamp
     )
   );
   ```

2. Builds EIP-712 digest:

   ```solidity
   bytes32 digest = _hashTypedDataV4(structHash);
   ```

3. Recovers signer and checks:

   ```solidity
   address signer = ECDSA.recover(digest, signature);
   require(signer == backendSigner, "INVALID_SIGNATURE");
   ```

4. If valid, updates:

   * `metaScores[payload.user]`
   * `providerScores[payload.user][providerId]`

---

## 6. Freshness / Replay Protection

* `timestamp` is checked against `block.timestamp` with a configurable
  `maxTimestampSkew` (e.g. 1 day).
* Backends SHOULD avoid reusing the same payload; instead, recompute scores
  on refresh.
* For stronger replay protection, a per-user nonce can be added in a future
  version.

---

This schema is the **canonical EIP-712 format** used by
`SocialScoreAttestator.submitScores`.

````

---

## `SocialScoreAttestator.sol`

Below is a full, upgradeable, modular EIP-712 attestation contract.

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @notice SocialScoreAttestator
/// Upgradeable contract that verifies backend-signed EIP-712 payloads
/// and stores normalized provider scores + MetaScore on-chain.

import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {EIP712} from "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

contract SocialScoreAttestator is Initializable, UUPSUpgradeable, OwnableUpgradeable, EIP712 {
    // ------------------------------------------------------------------------
    // Types
    // ------------------------------------------------------------------------

    struct ProviderScore {
        uint256 score;      // normalized score: 0–100
        uint256 updatedAt;  // unix timestamp (seconds)
    }

    struct ScorePayload {
        address user;
        uint256 metaScore;
        bytes32[] providers;
        uint256[] scores;
        uint256 timestamp;
    }

    // ------------------------------------------------------------------------
    // Storage
    // ------------------------------------------------------------------------

    /// @notice EIP-712 typehash for ScorePayload
    bytes32 public constant SCORE_PAYLOAD_TYPEHASH =
        keccak256("ScorePayload(address user,uint256 metaScore,bytes32[] providers,uint256[] scores,uint256 timestamp)");

    /// @notice Authorized backend signer address
    address public backendSigner;

    /// @notice Max age (in seconds) allowed for payload.timestamp.
    /// If zero, freshness checks are disabled.
    uint256 public maxTimestampSkew;

    /// @notice User -> MetaScore (0–100)
    mapping(address => uint256) public metaScores;

    /// @notice User -> providerId -> score struct
    mapping(address => mapping(bytes32 => ProviderScore)) public providerScores;

    /// @notice Set of allowed provider identifiers
    mapping(bytes32 => bool) public allowedProviders;

    // ------------------------------------------------------------------------
    // Events
    // ------------------------------------------------------------------------

    event BackendSignerUpdated(address indexed oldSigner, address indexed newSigner);
    event AllowedProviderUpdated(bytes32 indexed providerId, bool allowed);
    event MaxTimestampSkewUpdated(uint256 oldValue, uint256 newValue);
    event ScoreUpdated(address indexed user, bytes32 indexed providerId, uint256 score, uint256 timestamp);
    event MetaScoreUpdated(address indexed user, uint256 metaScore, uint256 timestamp);

    // ------------------------------------------------------------------------
    // Initialization / Upgrade
    // ------------------------------------------------------------------------

    /// @notice Initializer (UUPS). Must be called via proxy.
    /// @param _backendSigner backend address that signs ScorePayloads
    /// @param _allowedProviders initial list of allowed provider ids
    function initialize(address _backendSigner, bytes32[] memory _allowedProviders) public initializer {
        require(_backendSigner != address(0), "SSA: backendSigner zero");

        __Ownable_init();
        __UUPSUpgradeable_init();
        __EIP712_init("SocialScoreHub", "1");

        backendSigner = _backendSigner;
        maxTimestampSkew = 1 days;

        for (uint256 i = 0; i < _allowedProviders.length; i++) {
            allowedProviders[_allowedProviders[i]] = true;
            emit AllowedProviderUpdated(_allowedProviders[i], true);
        }
    }

    /// @inheritdoc UUPSUpgradeable
    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}

    // ------------------------------------------------------------------------
    // Admin
    // ------------------------------------------------------------------------

    /// @notice Update backend signer.
    function setBackendSigner(address _backendSigner) external onlyOwner {
        require(_backendSigner != address(0), "SSA: backendSigner zero");
        emit BackendSignerUpdated(backendSigner, _backendSigner);
        backendSigner = _backendSigner;
    }

    /// @notice Set or unset an allowed provider id.
    function setAllowedProvider(bytes32 providerId, bool allowed) external onlyOwner {
        allowedProviders[providerId] = allowed;
        emit AllowedProviderUpdated(providerId, allowed);
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
    ///  - Updates per-provider scores and MetaScore mappings
    ///
    /// @param payload ScorePayload struct (see EIP712 docs)
    /// @param signature EIP-712 signature from backendSigner
    function submitScores(ScorePayload calldata payload, bytes calldata signature) external {
        require(payload.providers.length > 0, "SSA: empty providers");
        require(payload.providers.length == payload.scores.length, "SSA: length mismatch");
        require(payload.metaScore <= 100, "SSA: metaScore > 100");

        // Optional: require caller is the user (prevents griefing / spam updates)
        require(payload.user == msg.sender, "SSA: caller != user");

        // Timestamp freshness check
        if (maxTimestampSkew != 0) {
            require(payload.timestamp <= block.timestamp, "SSA: future timestamp");
            require(block.timestamp - payload.timestamp <= maxTimestampSkew, "SSA: payload too old");
        }

        // Verify signature
        bytes32 structHash = keccak256(
            abi.encode(
                SCORE_PAYLOAD_TYPEHASH,
                payload.user,
                payload.metaScore,
                keccak256(abi.encodePacked(payload.providers)),
                keccak256(abi.encodePacked(payload.scores)),
                payload.timestamp
            )
        );

        bytes32 digest = _hashTypedDataV4(structHash);
        address signer = ECDSA.recover(digest, signature);
        require(signer == backendSigner, "SSA: invalid signature");

        // Update MetaScore
        metaScores[payload.user] = payload.metaScore;
        emit MetaScoreUpdated(payload.user, payload.metaScore, payload.timestamp);

        // Update provider scores
        for (uint256 i = 0; i < payload.providers.length; i++) {
            bytes32 providerId = payload.providers[i];
            require(allowedProviders[providerId], "SSA: provider not allowed");

            providerScores[payload.user][providerId] = ProviderScore({
                score: payload.scores[i],
                updatedAt: payload.timestamp
            });

            emit ScoreUpdated(payload.user, providerId, payload.scores[i], payload.timestamp);
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
}
````

---Here’s a full **upgradeable, non-transferable Profile SBT** contract wired for **EIP-712 mint vouchers** and optional integration with `SocialScoreAttestator`.

You can drop this in as `ProfileSBT.sol`.

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ProfileSBT
 * @notice Soulbound (non-transferable) profile NFT.
 * - One profile per wallet (by default)
 * - Minting is gated by an EIP-712 MintVoucher signed by a backend `voucherSigner`
 *   (e.g. after x402 payment is verified off-chain).
 * - Optionally linked to SocialScoreAttestator to read on-chain MetaScore.
 */

import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {ERC721Upgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import {EIP712Upgradeable} from "@openzeppelin/contracts-upgradeable/utils/cryptography/EIP712Upgradeable.sol";
import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

interface ISocialScoreAttestator {
    function metaScores(address user) external view returns (uint256);
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

    /// @notice backend signer that authorizes profile mints (e.g. after x402 payment)
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
    // Init / Upgrade
    // ------------------------------------------------------------------------

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
        require(_voucherSigner != address(0), "SBT: voucherSigner zero");

        __Ownable_init();
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
        require(_voucherSigner != address(0), "SBT: voucherSigner zero");
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
        require(voucher.user == msg.sender, "SBT: caller != user");

        if (voucher.expiresAt != 0) {
            require(block.timestamp <= voucher.expiresAt, "SBT: voucher expired");
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
        require(signer == voucherSigner, "SBT: invalid signature");

        bytes32 key = keccak256(abi.encodePacked(voucher.user, voucher.nonce));
        require(!usedVouchers[key], "SBT: voucher used");
        usedVouchers[key] = true;

        require(!hasMinted[msg.sender], "SBT: already minted");
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
        revert("SBT: approvals disabled");
    }

    function setApprovalForAll(address, bool) public pure override {
        revert("SBT: approvals disabled");
    }

    /// @dev Block transfers (only allow minting and burning).
    function _update(address to, uint256 tokenId, address auth)
        internal
        override
        returns (address)
    {
        // If from != 0 and to != 0, it's a transfer → block it.
        address from = _ownerOf(tokenId);
        if (from != address(0) && to != address(0)) {
            revert("SBT: non-transferable");
        }
        return super._update(to, tokenId, auth);
    }

    // ------------------------------------------------------------------------
    // Views / Helpers
    // ------------------------------------------------------------------------

    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }

    /// @notice Convenience view to get a user's MetaScore from the attestator.
    function getUserMetaScore(address user) external view returns (uint256) {
        if (scoreAttestator == address(0)) return 0;
        return ISocialScoreAttestator(scoreAttestator).metaScores(user);
    }

    /// @notice Returns the tokenId for a given owner, or 0 if none.
    function getProfileTokenId(address user) external view returns (uint256) {
        return profileTokenId[user];
    }

    // ------------------------------------------------------------------------
    // Interface Support
    // ------------------------------------------------------------------------

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721Upgradeable, UUPSUpgradeable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
```

This gives you:

* ✅ Upgradeable UUPS SBT
* ✅ One token per wallet
* ✅ EIP-712 `MintVoucher` flow (perfect for x402-gated mints)
* ✅ Non-transferable enforcement
* ✅ Optional hook into `SocialScoreAttestator` for reading MetaScore
* ✅ Simple `baseURI` metadata model you can point to a dynamic renderer


# C — a clean, production-ready **TypeScript helper** for:

* Building the EIP-712 typed data for `MintVoucher`
* Signing it with your backend signer
* Producing `{ voucher, signature }` ready for your frontend → `mintProfile()`

Works with **Ethers v6** (recommended).

---

# 📁 `mintVoucherHelper.ts`

```ts
import { Wallet, TypedDataDomain, TypedDataField, ethers } from "ethers";

/**
 * Types matching ProfileSBT.sol
 */
export interface MintVoucher {
  user: string;       // wallet allowed to mint
  expiresAt: number;  // unix timestamp (0 = no expiry)
  nonce: number;      // unique per voucher
}

export interface SignedMintVoucher {
  voucher: MintVoucher;
  signature: string;
}

/**
 * Minimal helper to build & sign MintVoucher EIP-712 typed data.
 */
export class MintVoucherHelper {
  private voucherSigner: Wallet;
  private domain: TypedDataDomain;

  constructor(
    privateKey: string,
    chainId: number,
    verifyingContract: string
  ) {
    this.voucherSigner = new Wallet(privateKey);

    this.domain = {
      name: "ProfileSBT",
      version: "1",
      chainId,
      verifyingContract,
    };
  }

  /**
   * EIP-712 Types for MintVoucher
   */
  private types: Record<string, TypedDataField[]> = {
    MintVoucher: [
      { name: "user", type: "address" },
      { name: "expiresAt", type: "uint256" },
      { name: "nonce", type: "uint256" },
    ],
  };

  /**
   * Build + sign EIP-712 typed data for MintVoucher
   */
  async signMintVoucher(voucher: MintVoucher): Promise<SignedMintVoucher> {
    const signature = await this.voucherSigner.signTypedData(
      this.domain,
      this.types,
      voucher
    );

    return { voucher, signature };
  }
}
```

---

# 🧪 Example Usage

```ts
import { MintVoucherHelper } from "./mintVoucherHelper";

async function main() {
  // Backend signer private key (the one configured in the contract)
  const PRIVATE_KEY = process.env.VOUCHER_SIGNER!;

  // Base chain ID example
  const chainId = 8453;

  // Your deployed ProfileSBT proxy address
  const PROFILE_SBT_ADDRESS = "0xYourProfileSbtAddress";

  // Initialize helper
  const helper = new MintVoucherHelper(PRIVATE_KEY, chainId, PROFILE_SBT_ADDRESS);

  // Build voucher
  const voucher = {
    user: "0xUserWalletAddress",
    expiresAt: Math.floor(Date.now() / 1000) + 3600, // expires in 1 hour
    nonce: Date.now(),                                // use timestamp as nonce
  };

  // Sign EIP712 typed data
  const { signature } = await helper.signMintVoucher(voucher);

  console.log("Voucher:", voucher);
  console.log("Signature:", signature);

  /**
   * Frontend will receive:
   * {
   *   voucher: { user, expiresAt, nonce },
   *   signature: "0x..."
   * }
   * and call:
   *
   * profileSbt.mintProfile(voucher, signature)
   */
}

main().catch(console.error);
```

---

# ⚡ Frontend Usage Example (wagmi v1)

```ts
const { writeContractAsync } = useWriteContract();

async function mintProfile({ voucher, signature }) {
  await writeContractAsync({
    address: PROFILE_SBT_ADDRESS,
    abi: ProfileSBTABI,
    functionName: "mintProfile",
    args: [voucher, signature],
  });
}
```

---

# 🧠 Tips

* `nonce` **must be unique per voucher** (timestamp or counter works fine).
* `expiresAt = 0` means **no expiry**.
* The backend key used here must match `voucherSigner` in ProfileSBT.
* You can integrate this directly after verifying `x402` payment.

---

If you want next, I can generate:

### 🔹 `scorePayloadHelper.ts` for EIP-712 scoring

### 🔹 A unified backend service combining scoring + voucher minting

### 🔹 Automatic nonce + anti-replay protection logic



Got you, C — here is a **clean, production-ready metadata server spec** for your Profile SBT.

It:

* Reads **metaScore + provider scores** directly from **SocialScoreAttestator**
* Renders **dynamic NFT metadata JSON**
* Supports tier logic (Bronze/Silver/Gold/Platinum)
* Works for OpenSea, BaseScan, Farcaster Frames, and your own frontend
* Is structured as a standalone **metadata microservice**

You can drop this into `/metadata-server` in your repo.

---

# 📄 `METADATA_SERVER_SPEC.md`

```md
# Profile SBT Metadata Server Specification

This document defines the official metadata server for ProfileSBT. It dynamically
generates ERC721 Metadata JSON using:

- MetaScore (0–100)
- Per-provider scores from SocialScoreAttestator
- Tiering rules
- User attributes (domain name, avatar, etc.)

The output is fully compatible with OpenSea, Zora, BaseScan, Farcaster Frames,
and any ERC721 metadata consumer.

---

# 1. Overview

The metadata server exposes:

```

GET /metadata/:tokenId

```

It resolves:

1. The wallet address owning `tokenId`
   - via `ProfileSBT.ownerOf(tokenId)`
2. Fetches:
   - `metaScore`
   - provider scores
3. Computes:
   - SBT tier (Bronze/Silver/Gold/Platinum)
4. Returns JSON metadata:
   - name
   - description
   - image (or SVG renderer)
   - attributes (scores, provider breakdown, tier, etc.)

---

# 2. Required Inputs (On-chain)

The server must read:

### From **ProfileSBT**
- `ownerOf(tokenId)`
- `getUserMetaScore(user)` (optional convenience)

### From **SocialScoreAttestator**
- `metaScores(user)`
- `providerScores(user, providerId)` for all providers

### Providers
Recommended provider IDs:

```

bytes32("ETHOS")
bytes32("NEYNAR")
bytes32("TALENT_BUILDER")
bytes32("TALENT_CREATOR")
bytes32("PASSPORT")
bytes32("QUOTIENT")

````

---

# 3. Metadata Shape (ERC721 JSON)

The server MUST return:

```json
{
  "name": "Onchain Identity — Profile #123",
  "description": "Your onchain reputation passport. Powered by SocialScoreHub.",
  "image": "https://<domain>/render/image/123",
  "attributes": [
    { "trait_type": "MetaScore", "value": 47 },
    { "trait_type": "Tier", "value": "Silver" },

    { "trait_type": "Ethos Score", "value": 44 },
    { "trait_type": "Neynar Score", "value": 98 },
    { "trait_type": "Talent Builder", "value": 50 },
    { "trait_type": "Talent Creator", "value": 31 },
    { "trait_type": "Passport Score", "value": 27 },
    { "trait_type": "Quotient", "value": 0 },

    { "trait_type": "Owner", "value": "0x1234...abcd" }
  ]
}
````

---

# 4. Tier Logic

Tier thresholds:

| Tier     | Score  |
| -------- | ------ |
| Bronze   | 0–39   |
| Silver   | 40–69  |
| Gold     | 70–89  |
| Platinum | 90–100 |

Pseudo-code:

```ts
function getTier(metaScore: number): string {
  if (metaScore >= 90) return "Platinum";
  if (metaScore >= 70) return "Gold";
  if (metaScore >= 40) return "Silver";
  return "Bronze";
}
```

---

# 5. Provider Ordering

Always return attributes in a consistent order:

1. MetaScore
2. Tier
3. ETHOS
4. NEYNAR
5. TALENT_BUILDER
6. TALENT_CREATOR
7. PASSPORT
8. QUOTIENT
9. Owner

---

# 6. REST API Endpoints

### `GET /metadata/:tokenId`

Returns ERC721 JSON.

### `GET /render/image/:tokenId`

(optional) Returns a dynamic PNG or SVG with:

* MetaScore ring / badge
* Breakdown of provider scores
* User handle + avatar

---

# 7. On-chain Reads (TS Example)

Example using viem:

```ts
import { createPublicClient, http, parseAbi } from "viem";

const client = createPublicClient({
  chain: base,
  transport: http()
});

const profileAbi = parseAbi([
  "function ownerOf(uint256) view returns (address)",
]);

const attestatorAbi = parseAbi([
  "function metaScores(address) view returns (uint256)",
  "function providerScores(address, bytes32) view returns (uint256 score, uint256 updatedAt)",
]);

async function fetchScores(tokenId) {
  const user = await client.readContract({
    address: PROFILE_SBT_ADDRESS,
    abi: profileAbi,
    functionName: "ownerOf",
    args: [tokenId],
  });

  const metaScore = await client.readContract({
    address: SCORE_ATTESTATOR_ADDRESS,
    abi: attestatorAbi,
    functionName: "metaScores",
    args: [user],
  });

  const providerIds = [
    "ETHOS",
    "NEYNAR",
    "TALENT_BUILDER",
    "TALENT_CREATOR",
    "PASSPORT",
    "QUOTIENT",
  ].map((id) => ethers.id(id));

  const providerScores = {};

  for (const id of providerIds) {
    const { score } = await client.readContract({
      address: SCORE_ATTESTATOR_ADDRESS,
      abi: attestatorAbi,
      functionName: "providerScores",
      args: [user, id],
    });
    providerScores[id] = Number(score);
  }

  return { user, metaScore, providerScores };
}
```

---

# 8. Metadata Builder (TS Example)

```ts
export function buildMetadata(tokenId: number, user: string, metaScore: number, scores: Record<string, number>) {
  const tier = getTier(metaScore);

  return {
    name: `Onchain Identity — Profile #${tokenId}`,
    description: "Your onchain reputation passport.",
    image: `https://<domain>/render/image/${tokenId}`,
    attributes: [
      { trait_type: "MetaScore", value: metaScore },
      { trait_type: "Tier", value: tier },

      { trait_type: "Ethos Score", value: scores["ETHOS"] },
      { trait_type: "Neynar Score", value: scores["NEYNAR"] },
      { trait_type: "Talent Builder", value: scores["TALENT_BUILDER"] },
      { trait_type: "Talent Creator", value: scores["TALENT_CREATOR"] },
      { trait_type: "Passport Score", value: scores["PASSPORT"] },
      { trait_type: "Quotient", value: scores["QUOTIENT"] },

      { trait_type: "Owner", value: user }
    ]
  };
}
```

---

# 9. Example Full Metadata Response

```json
{
  "name": "Onchain Identity — Profile #1",
  "description": "Your onchain reputation passport. Fully dynamic.",
  "image": "https://metadata.geoart.com/render/image/1",
  "attributes": [
    { "trait_type": "MetaScore", "value": 47 },
    { "trait_type": "Tier", "value": "Silver" },
    { "trait_type": "Ethos Score", "value": 44 },
    { "trait_type": "Neynar Score", "value": 98 },
    { "trait_type": "Talent Builder", "value": 50 },
    { "trait_type": "Talent Creator", "value": 31 },
    { "trait_type": "Passport Score", "value": 27 },
    { "trait_type": "Quotient", "value": 0 },
    { "trait_type": "Owner", "value": "0x1234...abcd" }
  ]
}
```

---

# 10. Deployment Tips

### Recommended stack:

* Next.js (App Router) serverless functions
* Vercel Edge Functions
* OR Node.js Express microservice
* OR Cloudflare Worker for low latency

### Cache strategy:

* Cache metadata for 30–60 seconds
* Revalidate on each score refresh (user clicks "Refresh")

---

# 11. Optional: Dynamic SVG Renderer

If you want a **beautiful circular MetaScore badge**, I can generate:

* **SVG component** with animated score ring
* Farcaster-ready image
* Base brand colors

Just say **“C, generate the SVG renderer.”**

---

All done, C.
Your Profile SBT metadata pipeline is now fully specified and production-grade.
