// constants/features.ts
// Registry of all features in the application

/**
 * Feature identifier type
 */
export type FeatureId = 'currentVolatility' | 'currentDominance' | 'vwatr';

/**
 * Data source type for features
 * 'primary' = backend API (default)
 * 'secondary' = CoinGecko API (fallback)
 */
export type DataSource = 'primary' | 'secondary';

/**
 * Feature configuration
 */
export interface FeatureConfig {
  /** Unique identifier for the feature */
  id: FeatureId;
  /** Human-readable name */
  name: string;
  /** Description of what the feature does */
  description: string;
  /** Endpoint keys used by this feature */
  endpoints: string[];
  /** Whether this feature supports secondary data sources */
  supportsSecondarySource: boolean;
}

/**
 * Registry of all features
 */
export const FEATURES: Record<FeatureId, FeatureConfig> = {
  currentVolatility: {
    id: 'currentVolatility',
    name: 'Current Volatility',
    description: 'Fetches and displays current cryptocurrency market volatility data',
    endpoints: ['CRYPTO_PROXY_CURRENT_VOLATILITY'],
    supportsSecondarySource: false, // Will be true when secondary source is added
  },
  currentDominance: {
    id: 'currentDominance',
    name: 'Current Dominance',
    description: 'Fetches and displays current cryptocurrency market dominance data (BTC, ETH, stablecoins, others)',
    endpoints: ['CRYPTO_PROXY_CURRENT_DOMINANCE', 'COINGECKO_GLOBAL', 'COINGECKO_COINS_MARKETS'],
    supportsSecondarySource: true,
  },
  vwatr: {
    id: 'vwatr',
    name: 'VWATR',
    description: 'Fetches and displays Volume-Weighted Average True Range (VWATR) volatility data for cryptocurrency assets',
    endpoints: ['CRYPTO_PROXY_VWATR'],
    supportsSecondarySource: false,
  },
};

/**
 * Get all feature IDs
 */
export function getFeatureIds(): FeatureId[] {
  return Object.keys(FEATURES) as FeatureId[];
}

/**
 * Get feature configuration by ID
 */
export function getFeature(id: FeatureId): FeatureConfig | undefined {
  return FEATURES[id];
}

/**
 * Get all features
 */
export function getAllFeatures(): FeatureConfig[] {
  return Object.values(FEATURES);
}

