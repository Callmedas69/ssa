import { http, createConfig } from 'wagmi'
import { base } from 'wagmi/chains'
import { connectorsForWallets } from '@rainbow-me/rainbowkit'
import {
  rainbowWallet,
  walletConnectWallet,
  coinbaseWallet,
  metaMaskWallet,
} from '@rainbow-me/rainbowkit/wallets'
import { farcasterMiniApp } from '@farcaster/miniapp-wagmi-connector'

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'demo'

// RainbowKit wallet connectors for web users
const walletConnectors = connectorsForWallets(
  [
    {
      groupName: 'Popular',
      wallets: [
        coinbaseWallet,
        metaMaskWallet,
        rainbowWallet,
        walletConnectWallet,
      ],
    },
  ],
  {
    appName: 'SSA Index',
    projectId,
  }
)

// Farcaster Mini App connector for seamless wallet integration in Warpcast
const farcasterConnector = farcasterMiniApp()

export const wagmiConfig = createConfig({
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
  connectors: [
    farcasterConnector,
    ...walletConnectors,
  ],
  ssr: true,
})
