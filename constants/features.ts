// constants/features.ts
// Registry of all features in the application

/**
 * Feature identifier type
 */
export type FeatureId = 'currentVolatility' | 'currentDominance' | 'vwatr' | 'markets' | 'coinlists';

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
  /** Emoji icon for the feature (used in config screen) */
  emoji: string;
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
    emoji: '⚡',
  },
  currentDominance: {
    id: 'currentDominance',
    name: 'Current Dominance',
    description: 'Fetches and displays current cryptocurrency market dominance data (BTC, ETH, stablecoins, others)',
    endpoints: ['CRYPTO_PROXY_CURRENT_DOMINANCE', 'COINGECKO_GLOBAL', 'COINGECKO_COINS_MARKETS'],
    supportsSecondarySource: true,
    emoji: '💪',
  },
  vwatr: {
    id: 'vwatr',
    name: 'VWATR',
    description: 'Fetches and displays Volume-Weighted Average True Range (VWATR) volatility data for cryptocurrency assets',
    endpoints: ['CRYPTO_PROXY_VWATR'],
    supportsSecondarySource: false,
    emoji: '📊',
  },
  markets: {
    id: 'markets',
    name: 'Markets',
    description: 'Fetches and displays cryptocurrency market data including prices, market caps, and volume',
    endpoints: ['CRYPTO_PROXY_MARKETS', 'COINGECKO_COINS_MARKETS'],
    supportsSecondarySource: true,
    emoji: '📈',
  },
  coinlists: {
    id: 'coinlists',
    name: 'Coin Lists',
    description: 'Create and manage custom lists of cryptocurrencies with notes and market data',
    endpoints: ['CRYPTO_PROXY_MARKETS', 'COINGECKO_COINS_MARKETS', 'COINGECKO_SEARCH'],
    supportsSecondarySource: true,
    emoji: '📜',
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

