export const ProfileSBTABI = [
    {
        "type": "constructor",
        "inputs": [],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "approve",
        "inputs": [
            { "name": "", "type": "address", "internalType": "address" },
            { "name": "", "type": "uint256", "internalType": "uint256" }
        ],
        "outputs": [],
        "stateMutability": "pure"
    },
    {
        "type": "function",
        "name": "balanceOf",
        "inputs": [
            { "name": "owner", "type": "address", "internalType": "address" }
        ],
        "outputs": [
            { "name": "", "type": "uint256", "internalType": "uint256" }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "burn",
        "inputs": [],
        "outputs": [],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "contractURI",
        "inputs": [],
        "outputs": [
            { "name": "", "type": "string", "internalType": "string" }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "getApproved",
        "inputs": [
            { "name": "tokenId", "type": "uint256", "internalType": "uint256" }
        ],
        "outputs": [
            { "name": "", "type": "address", "internalType": "address" }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "getProfileTokenId",
        "inputs": [
            { "name": "user", "type": "address", "internalType": "address" }
        ],
        "outputs": [
            { "name": "", "type": "uint256", "internalType": "uint256" }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "getUserSSAIndex",
        "inputs": [
            { "name": "user", "type": "address", "internalType": "address" }
        ],
        "outputs": [
            { "name": "", "type": "uint256", "internalType": "uint256" }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "hasMinted",
        "inputs": [
            { "name": "", "type": "address", "internalType": "address" }
        ],
        "outputs": [
            { "name": "", "type": "bool", "internalType": "bool" }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "initialize",
        "inputs": [
            { "name": "_voucherSigner", "type": "address", "internalType": "address" },
            { "name": "_scoreAttestator", "type": "address", "internalType": "address" },
            { "name": "_name", "type": "string", "internalType": "string" },
            { "name": "_symbol", "type": "string", "internalType": "string" }
        ],
        "outputs": [],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "isApprovedForAll",
        "inputs": [
            { "name": "owner", "type": "address", "internalType": "address" },
            { "name": "operator", "type": "address", "internalType": "address" }
        ],
        "outputs": [
            { "name": "", "type": "bool", "internalType": "bool" }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "locked",
        "inputs": [
            { "name": "tokenId", "type": "uint256", "internalType": "uint256" }
        ],
        "outputs": [
            { "name": "", "type": "bool", "internalType": "bool" }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "maxVoucherLifetime",
        "inputs": [],
        "outputs": [
            { "name": "", "type": "uint256", "internalType": "uint256" }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "mintProfile",
        "inputs": [
            {
                "name": "voucher",
                "type": "tuple",
                "internalType": "struct ProfileSBT.MintVoucher",
                "components": [
                    { "name": "user", "type": "address", "internalType": "address" },
                    { "name": "expiresAt", "type": "uint256", "internalType": "uint256" },
                    { "name": "nonce", "type": "uint256", "internalType": "uint256" }
                ]
            },
            { "name": "signature", "type": "bytes", "internalType": "bytes" }
        ],
        "outputs": [
            { "name": "tokenId", "type": "uint256", "internalType": "uint256" }
        ],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "name",
        "inputs": [],
        "outputs": [
            { "name": "", "type": "string", "internalType": "string" }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "owner",
        "inputs": [],
        "outputs": [
            { "name": "", "type": "address", "internalType": "address" }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "ownerOf",
        "inputs": [
            { "name": "tokenId", "type": "uint256", "internalType": "uint256" }
        ],
        "outputs": [
            { "name": "", "type": "address", "internalType": "address" }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "profileTokenId",
        "inputs": [
            { "name": "", "type": "address", "internalType": "address" }
        ],
        "outputs": [
            { "name": "", "type": "uint256", "internalType": "uint256" }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "renderer",
        "inputs": [],
        "outputs": [
            { "name": "", "type": "address", "internalType": "address" }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "renounceOwnership",
        "inputs": [],
        "outputs": [],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "revoke",
        "inputs": [
            { "name": "user", "type": "address", "internalType": "address" }
        ],
        "outputs": [],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "safeTransferFrom",
        "inputs": [
            { "name": "from", "type": "address", "internalType": "address" },
            { "name": "to", "type": "address", "internalType": "address" },
            { "name": "tokenId", "type": "uint256", "internalType": "uint256" }
        ],
        "outputs": [],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "safeTransferFrom",
        "inputs": [
            { "name": "from", "type": "address", "internalType": "address" },
            { "name": "to", "type": "address", "internalType": "address" },
            { "name": "tokenId", "type": "uint256", "internalType": "uint256" },
            { "name": "data", "type": "bytes", "internalType": "bytes" }
        ],
        "outputs": [],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "scoreAttestator",
        "inputs": [],
        "outputs": [
            { "name": "", "type": "address", "internalType": "address" }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "setApprovalForAll",
        "inputs": [
            { "name": "", "type": "address", "internalType": "address" },
            { "name": "", "type": "bool", "internalType": "bool" }
        ],
        "outputs": [],
        "stateMutability": "pure"
    },
    {
        "type": "function",
        "name": "setCollectionExternalLink",
        "inputs": [
            { "name": "url", "type": "string", "internalType": "string" }
        ],
        "outputs": [],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "setMaxVoucherLifetime",
        "inputs": [
            { "name": "lifetime", "type": "uint256", "internalType": "uint256" }
        ],
        "outputs": [],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "setRenderer",
        "inputs": [
            { "name": "_renderer", "type": "address", "internalType": "address" }
        ],
        "outputs": [],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "setScoreAttestator",
        "inputs": [
            { "name": "_scoreAttestator", "type": "address", "internalType": "address" }
        ],
        "outputs": [],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "setVoucherSigner",
        "inputs": [
            { "name": "_voucherSigner", "type": "address", "internalType": "address" }
        ],
        "outputs": [],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "supportsInterface",
        "inputs": [
            { "name": "interfaceId", "type": "bytes4", "internalType": "bytes4" }
        ],
        "outputs": [
            { "name": "", "type": "bool", "internalType": "bool" }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "symbol",
        "inputs": [],
        "outputs": [
            { "name": "", "type": "string", "internalType": "string" }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "tokenURI",
        "inputs": [
            { "name": "tokenId", "type": "uint256", "internalType": "uint256" }
        ],
        "outputs": [
            { "name": "", "type": "string", "internalType": "string" }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "totalSupply",
        "inputs": [],
        "outputs": [
            { "name": "", "type": "uint256", "internalType": "uint256" }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "transferFrom",
        "inputs": [
            { "name": "from", "type": "address", "internalType": "address" },
            { "name": "to", "type": "address", "internalType": "address" },
            { "name": "tokenId", "type": "uint256", "internalType": "uint256" }
        ],
        "outputs": [],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "transferOwnership",
        "inputs": [
            { "name": "newOwner", "type": "address", "internalType": "address" }
        ],
        "outputs": [],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "upgradeToAndCall",
        "inputs": [
            { "name": "newImplementation", "type": "address", "internalType": "address" },
            { "name": "data", "type": "bytes", "internalType": "bytes" }
        ],
        "outputs": [],
        "stateMutability": "payable"
    },
    {
        "type": "function",
        "name": "usedVouchers",
        "inputs": [
            { "name": "", "type": "bytes32", "internalType": "bytes32" }
        ],
        "outputs": [
            { "name": "", "type": "bool", "internalType": "bool" }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "voucherSigner",
        "inputs": [],
        "outputs": [
            { "name": "", "type": "address", "internalType": "address" }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "emitMetadataUpdate",
        "inputs": [
            { "name": "tokenId", "type": "uint256", "internalType": "uint256" }
        ],
        "outputs": [],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "emitBatchMetadataUpdate",
        "inputs": [],
        "outputs": [],
        "stateMutability": "nonpayable"
    },
    {
        "type": "event",
        "name": "Approval",
        "inputs": [
            { "name": "owner", "type": "address", "indexed": true, "internalType": "address" },
            { "name": "approved", "type": "address", "indexed": true, "internalType": "address" },
            { "name": "tokenId", "type": "uint256", "indexed": true, "internalType": "uint256" }
        ],
        "anonymous": false
    },
    {
        "type": "event",
        "name": "ApprovalForAll",
        "inputs": [
            { "name": "owner", "type": "address", "indexed": true, "internalType": "address" },
            { "name": "operator", "type": "address", "indexed": true, "internalType": "address" },
            { "name": "approved", "type": "bool", "indexed": false, "internalType": "bool" }
        ],
        "anonymous": false
    },
    {
        "type": "event",
        "name": "CollectionExternalLinkUpdated",
        "inputs": [
            { "name": "oldUrl", "type": "string", "indexed": false, "internalType": "string" },
            { "name": "newUrl", "type": "string", "indexed": false, "internalType": "string" }
        ],
        "anonymous": false
    },
    {
        "type": "event",
        "name": "Initialized",
        "inputs": [
            { "name": "version", "type": "uint64", "indexed": false, "internalType": "uint64" }
        ],
        "anonymous": false
    },
    {
        "type": "event",
        "name": "Locked",
        "inputs": [
            { "name": "tokenId", "type": "uint256", "indexed": true, "internalType": "uint256" }
        ],
        "anonymous": false
    },
    {
        "type": "event",
        "name": "MaxVoucherLifetimeUpdated",
        "inputs": [
            { "name": "oldValue", "type": "uint256", "indexed": false, "internalType": "uint256" },
            { "name": "newValue", "type": "uint256", "indexed": false, "internalType": "uint256" }
        ],
        "anonymous": false
    },
    {
        "type": "event",
        "name": "OwnershipTransferred",
        "inputs": [
            { "name": "previousOwner", "type": "address", "indexed": true, "internalType": "address" },
            { "name": "newOwner", "type": "address", "indexed": true, "internalType": "address" }
        ],
        "anonymous": false
    },
    {
        "type": "event",
        "name": "ProfileBurned",
        "inputs": [
            { "name": "user", "type": "address", "indexed": true, "internalType": "address" },
            { "name": "tokenId", "type": "uint256", "indexed": true, "internalType": "uint256" }
        ],
        "anonymous": false
    },
    {
        "type": "event",
        "name": "ProfileMinted",
        "inputs": [
            { "name": "user", "type": "address", "indexed": true, "internalType": "address" },
            { "name": "tokenId", "type": "uint256", "indexed": true, "internalType": "uint256" },
            { "name": "nonce", "type": "uint256", "indexed": false, "internalType": "uint256" }
        ],
        "anonymous": false
    },
    {
        "type": "event",
        "name": "ProfileRevoked",
        "inputs": [
            { "name": "user", "type": "address", "indexed": true, "internalType": "address" },
            { "name": "tokenId", "type": "uint256", "indexed": true, "internalType": "uint256" },
            { "name": "revoker", "type": "address", "indexed": true, "internalType": "address" }
        ],
        "anonymous": false
    },
    {
        "type": "event",
        "name": "RendererUpdated",
        "inputs": [
            { "name": "oldRenderer", "type": "address", "indexed": true, "internalType": "address" },
            { "name": "newRenderer", "type": "address", "indexed": true, "internalType": "address" }
        ],
        "anonymous": false
    },
    {
        "type": "event",
        "name": "ScoreAttestatorUpdated",
        "inputs": [
            { "name": "oldAddr", "type": "address", "indexed": true, "internalType": "address" },
            { "name": "newAddr", "type": "address", "indexed": true, "internalType": "address" }
        ],
        "anonymous": false
    },
    {
        "type": "event",
        "name": "Transfer",
        "inputs": [
            { "name": "from", "type": "address", "indexed": true, "internalType": "address" },
            { "name": "to", "type": "address", "indexed": true, "internalType": "address" },
            { "name": "tokenId", "type": "uint256", "indexed": true, "internalType": "uint256" }
        ],
        "anonymous": false
    },
    {
        "type": "event",
        "name": "Unlocked",
        "inputs": [
            { "name": "tokenId", "type": "uint256", "indexed": true, "internalType": "uint256" }
        ],
        "anonymous": false
    },
    {
        "type": "event",
        "name": "MetadataUpdate",
        "inputs": [
            { "name": "_tokenId", "type": "uint256", "indexed": false, "internalType": "uint256" }
        ],
        "anonymous": false
    },
    {
        "type": "event",
        "name": "BatchMetadataUpdate",
        "inputs": [
            { "name": "_fromTokenId", "type": "uint256", "indexed": false, "internalType": "uint256" },
            { "name": "_toTokenId", "type": "uint256", "indexed": false, "internalType": "uint256" }
        ],
        "anonymous": false
    },
    {
        "type": "event",
        "name": "Upgraded",
        "inputs": [
            { "name": "implementation", "type": "address", "indexed": true, "internalType": "address" }
        ],
        "anonymous": false
    },
    {
        "type": "event",
        "name": "VoucherSignerUpdated",
        "inputs": [
            { "name": "oldSigner", "type": "address", "indexed": true, "internalType": "address" },
            { "name": "newSigner", "type": "address", "indexed": true, "internalType": "address" }
        ],
        "anonymous": false
    },
    {
        "type": "error",
        "name": "AddressEmptyCode",
        "inputs": [
            { "name": "target", "type": "address", "internalType": "address" }
        ]
    },
    {
        "type": "error",
        "name": "AlreadyMinted",
        "inputs": []
    },
    {
        "type": "error",
        "name": "ApprovalsDisabled",
        "inputs": []
    },
    {
        "type": "error",
        "name": "CallerNotUser",
        "inputs": []
    },
    {
        "type": "error",
        "name": "ERC1967InvalidImplementation",
        "inputs": [
            { "name": "implementation", "type": "address", "internalType": "address" }
        ]
    },
    {
        "type": "error",
        "name": "ERC1967NonPayable",
        "inputs": []
    },
    {
        "type": "error",
        "name": "FailedInnerCall",
        "inputs": []
    },
    {
        "type": "error",
        "name": "InvalidInitialization",
        "inputs": []
    },
    {
        "type": "error",
        "name": "InvalidSignature",
        "inputs": []
    },
    {
        "type": "error",
        "name": "NoProfileToBurn",
        "inputs": []
    },
    {
        "type": "error",
        "name": "NoProfileToRevoke",
        "inputs": []
    },
    {
        "type": "error",
        "name": "NonTransferable",
        "inputs": []
    },
    {
        "type": "error",
        "name": "NotInitializing",
        "inputs": []
    },
    {
        "type": "error",
        "name": "OwnableInvalidOwner",
        "inputs": [
            { "name": "owner", "type": "address", "internalType": "address" }
        ]
    },
    {
        "type": "error",
        "name": "OwnableUnauthorizedAccount",
        "inputs": [
            { "name": "account", "type": "address", "internalType": "address" }
        ]
    },
    {
        "type": "error",
        "name": "UUPSUnauthorizedCallContext",
        "inputs": []
    },
    {
        "type": "error",
        "name": "UUPSUnsupportedProxiableUUID",
        "inputs": [
            { "name": "slot", "type": "bytes32", "internalType": "bytes32" }
        ]
    },
    {
        "type": "error",
        "name": "VoucherAlreadyUsed",
        "inputs": []
    },
    {
        "type": "error",
        "name": "VoucherExpired",
        "inputs": []
    },
    {
        "type": "error",
        "name": "ZeroAddress",
        "inputs": []
    }
] as const;

export default ProfileSBTABI;
