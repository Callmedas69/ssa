getEnsName
Action for fetching primary ENS name for address.

Import

import { getEnsName } from '@wagmi/core'
Usage

index.ts

config.ts

import { getEnsName } from '@wagmi/core'
import { config } from './config'

const ensName = getEnsName(config, {
address: '0xd2135CfB216b74109775236E36d4b433F1DF507B',
})
Parameters

import { type GetEnsNameParameters } from '@wagmi/core'
address
Address

Address to get the name for.

index.ts

import { getEnsName } from '@wagmi/core'
import { config } from './config'

const ensName = await getEnsName(config, {
address: '0xd2135CfB216b74109775236E36d4b433F1DF507B',
universalResolverName: '0x74E20Bd2A1fE0cdbe45b9A1d89cb7e0a45b36376',
})

config.ts

import { getEnsName } from '@wagmi/core'
import { config } from './config'

const ensName = await getEnsName(config, {
address: '0xd2135CfB216b74109775236E36d4b433F1DF507B',
})
blockNumber
bigint | undefined

Block number to get name at.

index.ts

config.ts

import { getEnsName } from '@wagmi/core'
import { config } from './config'

const ensName = getEnsName(config, {
address: '0xd2135CfB216b74109775236E36d4b433F1DF507B',
blockNumber: 17829139n,
})
blockTag
'latest' | 'earliest' | 'pending' | 'safe' | 'finalized' | undefined

Block tag to get name at.

index.ts

config.ts

import { getEnsName } from '@wagmi/core'
import { config } from './config'

const ensName = getEnsName(config, {
address: '0xd2135CfB216b74109775236E36d4b433F1DF507B',
blockTag: 'latest',
})
chainId
config['chains'][number]['id'] | undefined

ID of chain to use when fetching data.

index.ts

config.ts

import { getEnsName } from '@wagmi/core'
import { mainnet } from '@wagmi/core/chains'
import { config } from './config'

const ensName = await getEnsName(config, {
address: '0xd2135CfB216b74109775236E36d4b433F1DF507B',
chainId: mainnet.id,
})
universalResolverAddress
Address | undefined

Address of ENS Universal Resolver Contract.
Defaults to current chain's Universal Resolver Contract address.

index.ts

config.ts

import { getEnsName } from '@wagmi/core'
import { config } from './config'

const ensName = await getEnsName(config, {
address: '0xd2135CfB216b74109775236E36d4b433F1DF507B',
universalResolverName: '0x74E20Bd2A1fE0cdbe45b9A1d89cb7e0a45b36376',
})
Return Type

import { type GetEnsNameReturnType } from '@wagmi/core'
string | null

The primary ENS name for the address. Returns null if address does not have primary name assigned.

Error

import { type GetEnsNameErrorType } from '@wagmi/core'
TanStack Query

import {
type GetEnsNameData,
type GetEnsNameOptions,
type GetEnsNameQueryFnData,
type GetEnsNameQueryKey,
getEnsNameQueryKey,
getEnsNameQueryOptions,
} from '@wagmi/core/query'
Viem
