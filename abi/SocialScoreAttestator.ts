export const SocialScoreAttestatorABI = [
    {
        "type": "constructor",
        "inputs": [],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "MIN_SUBMISSION_INTERVAL",
        "inputs": [],
        "outputs": [
            { "name": "", "type": "uint256", "internalType": "uint256" }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "PROVIDER_ETHOS",
        "inputs": [],
        "outputs": [
            { "name": "", "type": "bytes32", "internalType": "bytes32" }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "PROVIDER_NEYNAR",
        "inputs": [],
        "outputs": [
            { "name": "", "type": "bytes32", "internalType": "bytes32" }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "PROVIDER_PASSPORT",
        "inputs": [],
        "outputs": [
            { "name": "", "type": "bytes32", "internalType": "bytes32" }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "PROVIDER_QUOTIENT",
        "inputs": [],
        "outputs": [
            { "name": "", "type": "bytes32", "internalType": "bytes32" }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "PROVIDER_TALENT_BUILDER",
        "inputs": [],
        "outputs": [
            { "name": "", "type": "bytes32", "internalType": "bytes32" }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "PROVIDER_TALENT_CREATOR",
        "inputs": [],
        "outputs": [
            { "name": "", "type": "bytes32", "internalType": "bytes32" }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "SCORE_PAYLOAD_TYPEHASH",
        "inputs": [],
        "outputs": [
            { "name": "", "type": "bytes32", "internalType": "bytes32" }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "VERSION",
        "inputs": [],
        "outputs": [
            { "name": "", "type": "uint256", "internalType": "uint256" }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "allowedProviders",
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
        "name": "backendSigner",
        "inputs": [],
        "outputs": [
            { "name": "", "type": "address", "internalType": "address" }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "getBatchProviderScores",
        "inputs": [
            { "name": "user", "type": "address", "internalType": "address" },
            { "name": "providerIds", "type": "bytes32[]", "internalType": "bytes32[]" }
        ],
        "outputs": [
            {
                "name": "scores",
                "type": "tuple[]",
                "internalType": "struct SocialScoreAttestator.ProviderScore[]",
                "components": [
                    { "name": "score", "type": "uint256", "internalType": "uint256" },
                    { "name": "updatedAt", "type": "uint256", "internalType": "uint256" }
                ]
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "getProviderScore",
        "inputs": [
            { "name": "user", "type": "address", "internalType": "address" },
            { "name": "providerId", "type": "bytes32", "internalType": "bytes32" }
        ],
        "outputs": [
            {
                "name": "",
                "type": "tuple",
                "internalType": "struct SocialScoreAttestator.ProviderScore",
                "components": [
                    { "name": "score", "type": "uint256", "internalType": "uint256" },
                    { "name": "updatedAt", "type": "uint256", "internalType": "uint256" }
                ]
            }
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
            { "name": "ssaIndex", "type": "uint256", "internalType": "uint256" },
            { "name": "updatedAt", "type": "uint256", "internalType": "uint256" }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "initialize",
        "inputs": [
            { "name": "_backendSigner", "type": "address", "internalType": "address" },
            { "name": "_allowedProviders", "type": "bytes32[]", "internalType": "bytes32[]" }
        ],
        "outputs": [],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "isProviderAllowed",
        "inputs": [
            { "name": "providerId", "type": "bytes32", "internalType": "bytes32" }
        ],
        "outputs": [
            { "name": "", "type": "bool", "internalType": "bool" }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "lastUpdated",
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
        "name": "maxTimestampSkew",
        "inputs": [],
        "outputs": [
            { "name": "", "type": "uint256", "internalType": "uint256" }
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
        "name": "pause",
        "inputs": [],
        "outputs": [],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "paused",
        "inputs": [],
        "outputs": [
            { "name": "", "type": "bool", "internalType": "bool" }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "providerScores",
        "inputs": [
            { "name": "", "type": "address", "internalType": "address" },
            { "name": "", "type": "bytes32", "internalType": "bytes32" }
        ],
        "outputs": [
            { "name": "score", "type": "uint256", "internalType": "uint256" },
            { "name": "updatedAt", "type": "uint256", "internalType": "uint256" }
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
        "name": "setAllowedProvider",
        "inputs": [
            { "name": "providerId", "type": "bytes32", "internalType": "bytes32" },
            { "name": "allowed", "type": "bool", "internalType": "bool" }
        ],
        "outputs": [],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "setAllowedProviders",
        "inputs": [
            { "name": "providerIds", "type": "bytes32[]", "internalType": "bytes32[]" },
            { "name": "allowed", "type": "bool", "internalType": "bool" }
        ],
        "outputs": [],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "setBackendSigner",
        "inputs": [
            { "name": "_backendSigner", "type": "address", "internalType": "address" }
        ],
        "outputs": [],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "setMaxTimestampSkew",
        "inputs": [
            { "name": "newValue", "type": "uint256", "internalType": "uint256" }
        ],
        "outputs": [],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "ssaIndexScores",
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
        "name": "submitScores",
        "inputs": [
            {
                "name": "payload",
                "type": "tuple",
                "internalType": "struct SocialScoreAttestator.ScorePayload",
                "components": [
                    { "name": "user", "type": "address", "internalType": "address" },
                    { "name": "ssaIndex", "type": "uint256", "internalType": "uint256" },
                    { "name": "providers", "type": "bytes32[]", "internalType": "bytes32[]" },
                    { "name": "scores", "type": "uint256[]", "internalType": "uint256[]" },
                    { "name": "timestamp", "type": "uint256", "internalType": "uint256" }
                ]
            },
            { "name": "signature", "type": "bytes", "internalType": "bytes" }
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
        "name": "unpause",
        "inputs": [],
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
        "name": "usedSignatures",
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
        "name": "version",
        "inputs": [],
        "outputs": [
            { "name": "", "type": "uint256", "internalType": "uint256" }
        ],
        "stateMutability": "pure"
    },
    {
        "type": "event",
        "name": "AllowedProviderUpdated",
        "inputs": [
            { "name": "providerId", "type": "bytes32", "indexed": true, "internalType": "bytes32" },
            { "name": "allowed", "type": "bool", "indexed": false, "internalType": "bool" }
        ],
        "anonymous": false
    },
    {
        "type": "event",
        "name": "BackendSignerUpdated",
        "inputs": [
            { "name": "oldSigner", "type": "address", "indexed": true, "internalType": "address" },
            { "name": "newSigner", "type": "address", "indexed": true, "internalType": "address" }
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
        "name": "MaxTimestampSkewUpdated",
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
        "name": "Paused",
        "inputs": [
            { "name": "account", "type": "address", "indexed": false, "internalType": "address" }
        ],
        "anonymous": false
    },
    {
        "type": "event",
        "name": "SSAIndexUpdated",
        "inputs": [
            { "name": "user", "type": "address", "indexed": true, "internalType": "address" },
            { "name": "ssaIndex", "type": "uint256", "indexed": false, "internalType": "uint256" },
            { "name": "timestamp", "type": "uint256", "indexed": false, "internalType": "uint256" }
        ],
        "anonymous": false
    },
    {
        "type": "event",
        "name": "ScoreUpdated",
        "inputs": [
            { "name": "user", "type": "address", "indexed": true, "internalType": "address" },
            { "name": "providerId", "type": "bytes32", "indexed": true, "internalType": "bytes32" },
            { "name": "score", "type": "uint256", "indexed": false, "internalType": "uint256" },
            { "name": "timestamp", "type": "uint256", "indexed": false, "internalType": "uint256" }
        ],
        "anonymous": false
    },
    {
        "type": "event",
        "name": "Unpaused",
        "inputs": [
            { "name": "account", "type": "address", "indexed": false, "internalType": "address" }
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
        "type": "error",
        "name": "AddressEmptyCode",
        "inputs": [
            { "name": "target", "type": "address", "internalType": "address" }
        ]
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
        "name": "EmptyProviders",
        "inputs": []
    },
    {
        "type": "error",
        "name": "EnforcedPause",
        "inputs": []
    },
    {
        "type": "error",
        "name": "ExpectedPause",
        "inputs": []
    },
    {
        "type": "error",
        "name": "FailedInnerCall",
        "inputs": []
    },
    {
        "type": "error",
        "name": "FutureTimestamp",
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
        "name": "LengthMismatch",
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
        "name": "PayloadTooOld",
        "inputs": []
    },
    {
        "type": "error",
        "name": "ProviderNotAllowed",
        "inputs": [
            { "name": "providerId", "type": "bytes32", "internalType": "bytes32" }
        ]
    },
    {
        "type": "error",
        "name": "SSAIndexTooHigh",
        "inputs": []
    },
    {
        "type": "error",
        "name": "ScoreTooHigh",
        "inputs": [
            { "name": "score", "type": "uint256", "internalType": "uint256" }
        ]
    },
    {
        "type": "error",
        "name": "SignatureAlreadyUsed",
        "inputs": []
    },
    {
        "type": "error",
        "name": "SubmissionTooFrequent",
        "inputs": [
            { "name": "nextAllowedTime", "type": "uint256", "internalType": "uint256" }
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
        "name": "ZeroAddress",
        "inputs": []
    }
] as const;

export default SocialScoreAttestatorABI;
