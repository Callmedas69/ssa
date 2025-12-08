import { keccak256, toBytes, type Hex } from 'viem';
import { PROVIDER_ID_MAP } from '@/lib/contracts/providerIds';

/**
 * Normalization strategy for converting raw scores to 0-100
 */
export type NormalizationType = 'multiply' | 'divide' | 'none';

/**
 * Input type the fetcher requires
 */
export type InputType = 'address' | 'fid';

/**
 * Provider configuration
 */
export interface ProviderConfig {
  /** Unique provider ID (e.g., 'ethos', 'neynar') */
  id: string;
  /** Display name for UI */
  name: string;
  /** SSA Index weight (0-1, all weights should sum to 1) */
  weight: number;
  /** Normalization cap (used with 'divide' normalization) */
  cap: number;
  /** How to normalize raw score to 0-100 */
  normalization: NormalizationType;
  /** What input the fetcher needs */
  inputType: InputType;
  /** Provider ID this depends on (e.g., quotient depends on neynar for FID) */
  dependsOn?: string;
  /** Whether this provider is currently enabled */
  enabled: boolean;
}

/**
 * Result from a provider fetcher
 */
export interface ProviderResult {
  /** Raw score from the provider */
  score: number;
  /** Provider-specific metadata (fid, level, tier, etc.) */
  metadata?: Record<string, unknown>;
}

/**
 * Fetcher function signature
 */
export type ProviderFetcher = (input: string | number) => Promise<ProviderResult | null>;

/**
 * Registered provider (config + fetcher)
 */
export interface RegisteredProvider extends ProviderConfig {
  fetcher: ProviderFetcher;
  /** On-chain provider ID (keccak256 of uppercase ID) */
  onChainId: Hex;
}

/**
 * Provider Registry - manages all score providers
 */
class ProviderRegistry {
  private providers = new Map<string, RegisteredProvider>();

  /**
   * Register a new provider
   * 
   * Provider ID calculation MUST match the contract constants exactly.
   * Uses PROVIDER_ID_MAP which contains the correct keccak256 hashes.
   */
  register(config: ProviderConfig, fetcher: ProviderFetcher): void {
    // Get the on-chain provider ID from the centralized map
    const onChainId = PROVIDER_ID_MAP[config.id];
    
    if (!onChainId) {
      throw new Error(`No on-chain provider ID found for ${config.id}. Update PROVIDER_ID_MAP.`);
    }
    
    this.providers.set(config.id, { ...config, fetcher, onChainId });
  }

  /**
   * Get a provider by ID
   */
  get(id: string): RegisteredProvider | undefined {
    return this.providers.get(id);
  }

  /**
   * Get all registered providers
   */
  getAll(): RegisteredProvider[] {
    return Array.from(this.providers.values());
  }

  /**
   * Get only enabled providers
   */
  getEnabled(): RegisteredProvider[] {
    return this.getAll().filter(p => p.enabled);
  }

  /**
   * Get providers by input type
   */
  getByInputType(inputType: InputType): RegisteredProvider[] {
    return this.getEnabled().filter(p => p.inputType === inputType);
  }

  /**
   * Get providers that have dependencies
   */
  getWithDependencies(): RegisteredProvider[] {
    return this.getEnabled().filter(p => p.dependsOn);
  }

  /**
   * Get providers without dependencies (can be fetched in parallel)
   */
  getIndependent(): RegisteredProvider[] {
    return this.getEnabled().filter(p => !p.dependsOn);
  }

  /**
   * Get total weight of enabled providers
   */
  getTotalWeight(): number {
    return this.getEnabled().reduce((sum, p) => sum + p.weight, 0);
  }

  /**
   * Get on-chain provider IDs for all enabled providers
   */
  getOnChainIds(): Hex[] {
    return this.getEnabled().map(p => p.onChainId);
  }

  /**
   * Enable/disable a provider
   */
  setEnabled(id: string, enabled: boolean): void {
    const provider = this.providers.get(id);
    if (provider) {
      provider.enabled = enabled;
    }
  }

  /**
   * Update a provider's weight
   */
  setWeight(id: string, weight: number): void {
    const provider = this.providers.get(id);
    if (provider) {
      provider.weight = weight;
    }
  }
}

/**
 * Global provider registry instance
 */
export const providerRegistry = new ProviderRegistry();

/**
 * Normalize a raw score to 0-100 based on provider config
 */
export function normalizeScore(rawScore: number, config: ProviderConfig): number {
  switch (config.normalization) {
    case 'multiply':
      // 0-1 scale → 0-100
      return Math.min(rawScore * 100, 100);
    case 'divide':
      // Raw / cap * 100
      return Math.min((rawScore / config.cap) * 100, 100);
    case 'none':
      // Already 0-100
      return Math.min(rawScore, 100);
  }
}

/**
 * Verify provider ID calculation matches deployed contract
 * This is a development/debugging utility
 * 
 * Note: The deployed contract uses provider IDs without underscores
 * (e.g., "TALENTBUILDER" not "TALENT_BUILDER"), even though the contract
 * constants define them with underscores.
 */
export function verifyProviderIdCalculation(providerId: string): {
  normalized: string;
  onChainId: Hex;
  expectedProviders: string[];
} {
  const normalized = providerId.toUpperCase();
  const onChainId = keccak256(toBytes(normalized));
  
  // Known provider config IDs
  const knownProviders = [
    'ethos',
    'neynar',
    'talentBuilder',
    'talentCreator',
    'passport',
    'quotient',
  ];

  return {
    normalized,
    onChainId,
    expectedProviders: knownProviders,
  };
}

/**
 * Get the expected on-chain provider ID for a provider config ID
 * This matches what the deployed contract expects
 */
export function getExpectedProviderId(providerConfigId: string): Hex {
  const normalized = providerConfigId.toUpperCase();
  return keccak256(toBytes(normalized));
}
