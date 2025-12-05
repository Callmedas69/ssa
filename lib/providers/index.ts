import { providerRegistry } from './registry';
import { resolveFid } from './fid-resolver';
import {
  neynarConfig,
  fetchNeynar,
  ethosConfig,
  fetchEthos,
  talentBuilderConfig,
  fetchTalentBuilder,
  talentCreatorConfig,
  fetchTalentCreator,
  quotientConfig,
  fetchQuotient,
  passportConfig,
  fetchPassport,
} from './fetchers';

// ============================================================================
// PROVIDER REGISTRATION
// ============================================================================
// To add a new provider:
// 1. Create fetcher file in lib/providers/fetchers/newprovider.ts
// 2. Export config and fetcher from lib/providers/fetchers/index.ts
// 3. Import and register below
// 4. Run: cast send $CONTRACT "setAllowedProvider(bytes32,bool)" $(cast keccak "NEWPROVIDER") true
// ============================================================================

// Register all providers
providerRegistry.register(neynarConfig, fetchNeynar);
providerRegistry.register(ethosConfig, fetchEthos);
providerRegistry.register(talentBuilderConfig, fetchTalentBuilder);
providerRegistry.register(talentCreatorConfig, fetchTalentCreator);
providerRegistry.register(quotientConfig, fetchQuotient);
providerRegistry.register(passportConfig, fetchPassport);

// Export registry and types
export { providerRegistry } from './registry';
export type {
  ProviderConfig,
  ProviderResult,
  ProviderFetcher,
  RegisteredProvider,
  NormalizationType,
  InputType,
} from './registry';
export { normalizeScore } from './registry';

/**
 * Fetch all provider scores for an address
 * Handles dependencies (FID-based providers wait for address-based)
 */
export async function fetchAllProviderScores(
  address: string
): Promise<Map<string, import('./registry').ProviderResult | null>> {
  const results = new Map<string, import('./registry').ProviderResult | null>();

  // Get providers by type
  const addressProviders = providerRegistry.getByInputType('address');
  const fidProviders = providerRegistry.getByInputType('fid');

  // Fetch address-based providers in parallel
  const addressResults = await Promise.allSettled(
    addressProviders.map(async (p) => ({
      id: p.id,
      result: await p.fetcher(address),
    }))
  );

  // Store address-based results
  for (const res of addressResults) {
    if (res.status === 'fulfilled') {
      results.set(res.value.id, res.value.result);
    } else {
      // Find which provider failed
      const index = addressResults.indexOf(res);
      if (index >= 0 && index < addressProviders.length) {
        results.set(addressProviders[index].id, null);
      }
    }
  }

  // Resolve FID using shared resolver (cached, so free if Neynar already resolved it)
  const fidInfo = await resolveFid(address);
  const fid = fidInfo?.fid;

  // Fetch FID-based providers (only if FID available)
  if (fid) {
    const fidResults = await Promise.allSettled(
      fidProviders.map(async (p) => ({
        id: p.id,
        result: await p.fetcher(fid),
      }))
    );

    for (const res of fidResults) {
      if (res.status === 'fulfilled') {
        results.set(res.value.id, res.value.result);
      } else {
        const index = fidResults.indexOf(res);
        if (index >= 0 && index < fidProviders.length) {
          results.set(fidProviders[index].id, null);
        }
      }
    }
  } else {
    // No FID available, set FID-based providers to null
    for (const p of fidProviders) {
      results.set(p.id, null);
    }
  }

  return results;
}
