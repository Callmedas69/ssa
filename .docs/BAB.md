Skip to main content
Binance Logo

Products
▼
Current
All
English

BAB Token
Introduction
APIs Spec
APIs Spec
APIs Spec
Abstract
A soulbound token is a token that is bound to another Non-Fungible Token when it is minted, and cannot be transferred/moved after that.

APIs Map - Extends from ERC721
apis-map

Specification
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface ISBT721 {
    /**
     * @dev This emits when a new token is created and bound to an account by
     * any mechanism.
     * Note: For a reliable `to` parameter, retrieve the transaction's
     * authenticated `to` field.
     */
    event Attest(address indexed to, uint256 indexed tokenId);

    /**
     * @dev This emits when an existing SBT is revoked from an account and
     * destroyed by any mechanism.
     * Note: For a reliable `from` parameter, retrieve the transaction's
     * authenticated `from` field.
     */
    event Revoke(address indexed from, uint256 indexed tokenId);

    /**
     * @dev This emits when an existing SBT is burned by an account
     */
    event Burn(address indexed from, uint256 indexed tokenId);

    /**
     * @dev Emitted when `tokenId` token is transferred from `from` to `to`.
     */
    event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);

    /**
     * @dev Mints SBT
     *
     * Requirements:
     *
     * - `to` must be valid.
     * - `to` must not exist.
     *
     * Emits a {Attest} event.
     * Emits a {Transfer} event.
     * @return The tokenId of the minted SBT
     */
    function attest(address to) external returns (uint256);

    /**
     * @dev Revokes SBT
     *
     * Requirements:
     *
     * - `from` must exist.
     *
     * Emits a {Revoke} event.
     * Emits a {Transfer} event.
     */
    function revoke(address from) external;

    /**
     * @notice At any time, an SBT receiver must be able to
     *  disassociate themselves from an SBT publicly through calling this
     *  function.
     *
     * Emits a {Burn} event.
     * Emits a {Transfer} event.
     */
    function burn() external;

    /**
     * @notice Count all SBTs assigned to an owner
     * @dev SBTs assigned to the zero address is considered invalid, and this
     * function throws for queries about the zero address.
     * @param owner An address for whom to query the balance
     * @return The number of SBTs owned by `owner`, possibly zero
     */
    function balanceOf(address owner) external view returns (uint256);

    /**
     * @param from The address of the SBT owner
     * @return The tokenId of the owner's SBT, and throw an error if there is no SBT belongs to the given address
     */
    function tokenIdOf(address from) external view returns (uint256);

    /**
     * @notice Find the address bound to a SBT
     * @dev SBTs assigned to zero address are considered invalid, and queries
     *  about them do throw.
     * @param tokenId The identifier for an SBT
     * @return The address of the owner bound to the SBT
     */
    function ownerOf(uint256 tokenId) external view returns (address);

    /**
     * @dev Returns the amount of tokens in existence.
     */
    function totalSupply() external view returns (uint256);
}

Mainnet
Network	Contract Address
BSC	Proxy
Testnet
Network	Contract Address
BSC Testnet	Proxy Proxy Admin
Goerli	Proxy Proxy Admin
FAQ
How to get the SBTs on testnet?
If you want to mint the BAB Token to wallet accounts, please fill in the form.

How to check if an account holds BABT or not? Any Code Example？
To invoke the balanceOf method with the wallet address and it will return 0 or 1.

-> Code Sandbox

const Web3 = require('web3')

const provider = new Web3.providers.HttpProvider('https://data-seed-prebsc-1-s1.binance.org:8545')
const web3 = new Web3(provider)
const contractInstance = new web3.eth.Contract(abi, '0x2B09d47D550061f995A3b5C6F0Fd58005215D7c8')
// 0 - does not have any SBT
// 1 - has a SBT
const balance = await contractInstance.methods.balanceOf(address).call()

How to recognize the user if he/she remint a new BAB token to another wallet address?
Don't use tokenId as the identity of a KYC user, because the user can revoke the old BAB token and mint a new one to another wallet, in this case, the tokenId will change.

We now have exposed a new k/v named id to the token metadata. You can use the id as the identity and for the same person, id will never be changed.

The flow diagram:

flow-diagram

From a security perspective, we've utilized an encryption algorithm to prevent the id been inferred by the hash cracking(like the rainbow table).

From a privacy perspective, if the user remints his/her BAB token to a new wallet, we will return empty when someone accesses the old token's metadata so that the others can't relate those two different wallets by the id.

The metadata will look like the following:

{
  "id": "0x7fef65adeab075496445d6d81956dffd32b57883fa263d0cda96cf3ca4590622",
  "description": "Binance Account Bound Token",
  "externalUrl": "https://safu.im/U9eeKjE4",
  "image": "https://public.nftstatic.com/images/babt/token-dark.gif",
  "name": "BABT",
  "attributes": []
}

Media Resources
Logo
NFT
Refs
EIP-721: Non-Fungible Token Standard
EIPs/eip-747.md at master · ethereum/EIPs
EIP-4973: Account-bound Tokens
EIP-5114: Soulbound Token
Previous
Introduction
Abstract
APIs Map - Extends from ERC721
Specification
Mainnet
Testnet
FAQ
How to get the SBTs on testnet?
How to check if an account holds BABT or not? Any Code Example？
How to recognize the user if he/she remint a new BAB token to another wallet address?
Media Resources
Refs
Copyright © 2025 Binance.