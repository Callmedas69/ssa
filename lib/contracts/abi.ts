/**
 * ABI for SocialScoreAttestator contract
 * Only includes functions needed by the frontend
 */
export const SOCIAL_SCORE_ATTESTATOR_ABI = [
  // Read functions
  {
    type: 'function',
    name: 'ssaIndexScores',
    inputs: [{ name: 'user', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'lastUpdated',
    inputs: [{ name: 'user', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getProviderScore',
    inputs: [
      { name: 'user', type: 'address' },
      { name: 'providerId', type: 'bytes32' },
    ],
    outputs: [
      {
        name: '',
        type: 'tuple',
        components: [
          { name: 'score', type: 'uint256' },
          { name: 'updatedAt', type: 'uint256' },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getUserSSAIndex',
    inputs: [{ name: 'user', type: 'address' }],
    outputs: [
      { name: 'ssaIndex', type: 'uint256' },
      { name: 'updatedAt', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getBatchProviderScores',
    inputs: [
      { name: 'user', type: 'address' },
      { name: 'providerIds', type: 'bytes32[]' },
    ],
    outputs: [
      {
        name: 'scores',
        type: 'tuple[]',
        components: [
          { name: 'score', type: 'uint256' },
          { name: 'updatedAt', type: 'uint256' },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'isProviderAllowed',
    inputs: [{ name: 'providerId', type: 'bytes32' }],
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'view',
  },
  // Write functions
  {
    type: 'function',
    name: 'submitScores',
    inputs: [
      {
        name: 'payload',
        type: 'tuple',
        components: [
          { name: 'user', type: 'address' },
          { name: 'ssaIndex', type: 'uint256' },
          { name: 'providers', type: 'bytes32[]' },
          { name: 'scores', type: 'uint256[]' },
          { name: 'timestamp', type: 'uint256' },
        ],
      },
      { name: 'signature', type: 'bytes' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  // Events
  {
    type: 'event',
    name: 'SSAIndexUpdated',
    inputs: [
      { name: 'user', type: 'address', indexed: true },
      { name: 'ssaIndex', type: 'uint256', indexed: false },
      { name: 'timestamp', type: 'uint256', indexed: false },
    ],
  },
  {
    type: 'event',
    name: 'ScoreUpdated',
    inputs: [
      { name: 'user', type: 'address', indexed: true },
      { name: 'providerId', type: 'bytes32', indexed: true },
      { name: 'score', type: 'uint256', indexed: false },
      { name: 'timestamp', type: 'uint256', indexed: false },
    ],
  },
  // Errors
  {
    type: 'error',
    name: 'ZeroAddress',
    inputs: [],
  },
  {
    type: 'error',
    name: 'EmptyProviders',
    inputs: [],
  },
  {
    type: 'error',
    name: 'LengthMismatch',
    inputs: [],
  },
  {
    type: 'error',
    name: 'SSAIndexTooHigh',
    inputs: [],
  },
  {
    type: 'error',
    name: 'CallerNotUser',
    inputs: [],
  },
  {
    type: 'error',
    name: 'FutureTimestamp',
    inputs: [],
  },
  {
    type: 'error',
    name: 'PayloadTooOld',
    inputs: [],
  },
  {
    type: 'error',
    name: 'InvalidSignature',
    inputs: [],
  },
  {
    type: 'error',
    name: 'ProviderNotAllowed',
    inputs: [{ name: 'providerId', type: 'bytes32' }],
  },
  {
    type: 'error',
    name: 'ScoreTooHigh',
    inputs: [{ name: 'score', type: 'uint256' }],
  },
] as const;

/**
 * ABI for ProfileSBT contract
 * Only includes functions needed by the frontend
 */
export const PROFILE_SBT_ABI = [
  // Read functions
  {
    type: 'function',
    name: 'hasMinted',
    inputs: [{ name: 'user', type: 'address' }],
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'profileTokenId',
    inputs: [{ name: 'user', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getProfileTokenId',
    inputs: [{ name: 'user', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getUserSSAIndex',
    inputs: [{ name: 'user', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'totalSupply',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'tokenURI',
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    outputs: [{ name: '', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'ownerOf',
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'view',
  },
  // Write functions
  {
    type: 'function',
    name: 'mintProfile',
    inputs: [
      {
        name: 'voucher',
        type: 'tuple',
        components: [
          { name: 'user', type: 'address' },
          { name: 'expiresAt', type: 'uint256' },
          { name: 'nonce', type: 'uint256' },
        ],
      },
      { name: 'signature', type: 'bytes' },
    ],
    outputs: [{ name: 'tokenId', type: 'uint256' }],
    stateMutability: 'nonpayable',
  },
  // Events
  {
    type: 'event',
    name: 'ProfileMinted',
    inputs: [
      { name: 'user', type: 'address', indexed: true },
      { name: 'tokenId', type: 'uint256', indexed: true },
      { name: 'nonce', type: 'uint256', indexed: false },
    ],
  },
  // Errors
  {
    type: 'error',
    name: 'ZeroAddress',
    inputs: [],
  },
  {
    type: 'error',
    name: 'CallerNotUser',
    inputs: [],
  },
  {
    type: 'error',
    name: 'VoucherExpired',
    inputs: [],
  },
  {
    type: 'error',
    name: 'InvalidSignature',
    inputs: [],
  },
  {
    type: 'error',
    name: 'VoucherAlreadyUsed',
    inputs: [],
  },
  {
    type: 'error',
    name: 'AlreadyMinted',
    inputs: [],
  },
  {
    type: 'error',
    name: 'ApprovalsDisabled',
    inputs: [],
  },
  {
    type: 'error',
    name: 'NonTransferable',
    inputs: [],
  },
] as const;
