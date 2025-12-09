import { http } from 'wagmi'
import { base } from 'wagmi/chains'
import { getDefaultConfig } from '@rainbow-me/rainbowkit'

export const wagmiConfig = getDefaultConfig({
  appName: 'Social Score Attestator',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'demo',
  chains: [base],
  transports: {
    [base.id]: http(
      process.env.NEXT_PUBLIC_BASE_RPC_URL || 
      'https://mainnet.base.org',
      {
        timeout: 10_000,
        retryCount: 3,
        retryDelay: 1000,
      }
    ),
  },
  ssr: true,
})
