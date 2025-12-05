// constants/endpoints.ts
// Central registry for all API endpoints used by the app

import {
  COINGECKO_COIN_BY_ID_BASE_ENDPOINT,
  COINGECKO_COINS_MARKETS_ENDPOINT,
  COINGECKO_GLOBAL_DATA_ENDPOINT,
  COINGECKO_SEARCH_ENDPOINT,
} from "./coinGecko";
import { CRYPTO_PROXY_BASE_URL } from "./urls";

/**
 * Endpoint configuration interface
 * This structure supports future features like enable/disable and statistics
 */
export interface EndpointConfig {
  /** Unique identifier for the endpoint */
  id: string;
  /** Full URL of the endpoint */
  url: string;
  /** Human-readable name/description */
  name: string;
  /** Whether the endpoint is currently enabled (for future use) */
  enabled: boolean;
  /** Statistics tracking (for future use) */
  stats?: {
    callCount: number;
    lastCalled?: number;
    errorCount: number;
    lastError?: string;
  };
}

/**
 * Registry of all API endpoints
 */
export const ENDPOINTS: Record<string, EndpointConfig> = {
  // CoinGecko endpoints
  COINGECKO_GLOBAL: {
    id: 'coingecko-global',
    url: COINGECKO_GLOBAL_DATA_ENDPOINT,
    name: 'CoinGecko Global Market Data',
    enabled: true,
    stats: {
      callCount: 0,
      errorCount: 0,
    },
  },
  COINGECKO_COINS_MARKETS: {
    id: 'coingecko-coins-markets',
    url: COINGECKO_COINS_MARKETS_ENDPOINT,
    name: 'CoinGecko Coins Markets',
    enabled: true,
    stats: {
      callCount: 0,
      errorCount: 0,
    },
  },
  COINGECKO_SEARCH: {
    id: 'coingecko-search',
    url: COINGECKO_SEARCH_ENDPOINT,
    name: 'CoinGecko Search',
    enabled: true,
    stats: {
      callCount: 0,
      errorCount: 0,
    },
  },
  COINGECKO_COIN_BY_ID: {
    id: 'coingecko-coin-by-id',
    url: COINGECKO_COIN_BY_ID_BASE_ENDPOINT,
    name: 'CoinGecko Coin by ID',
    enabled: true,
    stats: {
      callCount: 0,
      errorCount: 0,
    },
  },
  // Crypto Proxy endpoints
  CRYPTO_PROXY_CURRENT_VOLATILITY: {
    id: 'crypto-proxy-current-volatility',
    url: `${CRYPTO_PROXY_BASE_URL}/api/volatility`,
    name: 'Crypto Proxy Current Volatility',
    enabled: true,
    stats: {
      callCount: 0,
      errorCount: 0,
    },
  },
  CRYPTO_PROXY_VWATR: {
    id: 'crypto-proxy-vwatr',
    url: `${CRYPTO_PROXY_BASE_URL}/api/volatility`,
    name: 'Crypto Proxy VWATR',
    enabled: true,
    stats: {
      callCount: 0,
      errorCount: 0,
    },
  },
  CRYPTO_PROXY_CURRENT_DOMINANCE: {
    id: 'crypto-proxy-current-dominance',
    url: `${CRYPTO_PROXY_BASE_URL}/api/dominance`,
    name: 'Crypto Proxy Current Dominance',
    enabled: true,
    stats: {
      callCount: 0,
      errorCount: 0,
    },
  },
  CRYPTO_PROXY_MARKETS: {
    id: 'crypto-proxy-markets',
    url: `${CRYPTO_PROXY_BASE_URL}/api/markets`,
    name: 'Crypto Proxy Markets',
    enabled: true,
    stats: {
      callCount: 0,
      errorCount: 0,
    },
  },
};

/**
 * Get an endpoint configuration by its key
 * @param key The key from the ENDPOINTS object
 * @returns The endpoint configuration or undefined if not found
 */
export function getEndpoint(key: string): EndpointConfig | undefined {
  return ENDPOINTS[key];
}

/**
 * Check if an endpoint is enabled
 * @param key The key from the ENDPOINTS object
 * @returns true if enabled, false otherwise
 */
export function isEndpointEnabled(key: string): boolean {
  const endpoint = getEndpoint(key);
  return endpoint?.enabled ?? false;
}

/**
 * Enable or disable an endpoint (for future use)
 * @param key The key from the ENDPOINTS object
 * @param enabled Whether to enable or disable the endpoint
 */
export function setEndpointEnabled(key: string, enabled: boolean): void {
  const endpoint = getEndpoint(key);
  if (endpoint) {
    endpoint.enabled = enabled;
  }
}

/**
 * Get statistics for an endpoint (for future use)
 * @param key The key from the ENDPOINTS object
 * @returns The statistics object or undefined if endpoint not found
 */
export function getEndpointStats(key: string) {
  const endpoint = getEndpoint(key);
  return endpoint?.stats;
}

