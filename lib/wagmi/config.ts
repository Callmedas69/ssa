import { http } from 'wagmi'
import { base } from 'wagmi/chains'
import { getDefaultConfig } from '@rainbow-me/rainbowkit'

export const wagmiConfig = getDefaultConfig({
  appName: 'Social Score Attestator',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'demo',
  chains: [base],
  transports: {
    [base.id]: http(),
  },
  ssr: true,
})
