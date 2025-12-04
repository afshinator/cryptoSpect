// constants/features.ts
// Registry of all features in the application

/**
 * Feature identifier type
 */
export type FeatureId = 'currentVolatility';

/**
 * Data source type for features
 * 'default' = primary/backend API
 * 'alternate' = fallback/alternative API
 */
export type DataSource = 'default' | 'alternate';

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
  /** Whether this feature supports alternate data sources */
  supportsAlternateSource: boolean;
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
    supportsAlternateSource: false, // Will be true when alternate source is added
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

