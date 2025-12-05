// utils/markets.ts
// Functions for fetching cryptocurrency market data from Crypto Proxy API with automatic fallback to CoinGecko

import { CoinGeckoMarketData } from '@/constants/coinGecko';
import { getEffectivePreferences, isGlobalApiBlocked, shouldBlockEndpoint } from '@/stores/apiBlockingStore';
import { callFeatureEndpoint } from './apiWrappers';
import { ERR, log, LOG, TMI } from './log';

/**
 * Options for fetching markets data
 */
export interface MarketsOptions {
  /** Currency to display prices in (default: "usd") */
  vs_currency?: string;
  /** Sort order (default: "market_cap_desc") */
  order?: string;
  /** Number of results per page (default: 250, max for CoinGecko) */
  per_page?: number;
  /** Page number (default: 1) */
  page?: number;
  /** Include sparkline data (default: false) */
  sparkline?: boolean;
  /** Price change percentage (e.g., "24h", "7d", "30d") */
  price_change_percentage?: string;
  /** Comma-separated list of coin IDs to filter */
  ids?: string;
  /** Category filter */
  category?: string;
}

/**
 * Response type for markets endpoint
 */
export interface MarketsResponse {
  /** Array of market data for each coin */
  data: CoinGeckoMarketData[];
  /** Unix timestamp (milliseconds) of when this data was fetched and stored by the app */
  fetchedAt: number;
}

const FEATURE_ID = 'markets' as const;

/**
 * Fetches markets data from the backend API (primary source)
 * @param options Optional parameters for the request
 * @returns Promise resolving to the markets data or null if error
 */
async function fetchFromBackend(
  options: MarketsOptions = {}
): Promise<MarketsResponse | null> {
  const {
    vs_currency = 'usd',
    order = 'market_cap_desc',
    per_page = 250,
    page = 1,
    sparkline = false,
    price_change_percentage,
    ids,
    category,
  } = options;

  const queryParams: Record<string, string | number | boolean> = {
    vs_currency,
    order,
    per_page,
    page,
    sparkline,
  };

  if (price_change_percentage !== undefined) {
    queryParams.price_change_percentage = price_change_percentage;
  }
  if (ids !== undefined) {
    queryParams.ids = ids;
  }
  if (category !== undefined) {
    queryParams.category = category;
  }

  log(`💰 Fetching markets from backend with per_page=${per_page}`, TMI);
  const result = await callFeatureEndpoint<CoinGeckoMarketData[]>(
    FEATURE_ID,
    'CRYPTO_PROXY_MARKETS',
    'primary',
    {
      queryParams,
    }
  );

  if (result.success && result.data) {
    log('💰 Markets data fetched successfully from backend (primary)', LOG);
    // Add client-side timestamp when data is received
    return {
      data: result.data,
      fetchedAt: Date.now(),
    };
  } else {
    if (result.blocked) {
      log(`💰 Primary data source (backend) ⛔blocked⛔ for markets`, TMI);
    } else {
      log(`💰 Failed to fetch markets data from backend: ${result.error}`, ERR);
    }
    return null;
  }
}

/**
 * Fetches markets data from CoinGecko API (secondary source)
 * @param options Optional parameters for the request
 * @returns Promise resolving to the markets data or null if error
 */
async function fetchFromCoinGecko(
  options: MarketsOptions = {}
): Promise<MarketsResponse | null> {
  // Check if CoinGecko is blocked globally or for this feature
  if (isGlobalApiBlocked('coingecko')) {
    log('💰 CoinGecko API is blocked globally, cannot use secondary source', ERR);
    return null;
  }
  
  if (shouldBlockEndpoint(FEATURE_ID, 'COINGECKO_COINS_MARKETS', 'secondary')) {
    log('💰 CoinGecko secondary source is blocked for this feature', ERR);
    return null;
  }

  const {
    vs_currency = 'usd',
    order = 'market_cap_desc',
    per_page = 250,
    page = 1,
    sparkline = false,
    price_change_percentage,
    ids,
    category,
  } = options;

  const queryParams: Record<string, string | number | boolean> = {
    vs_currency,
    order,
    per_page,
    page,
    sparkline,
  };

  if (price_change_percentage !== undefined) {
    queryParams.price_change_percentage = price_change_percentage;
  }
  if (ids !== undefined) {
    queryParams.ids = ids;
  }
  if (category !== undefined) {
    queryParams.category = category;
  }

  try {
    log(`💰 Fetching markets data from CoinGecko (secondary source)🏵️ with per_page=${per_page}...`, TMI);
    
    const result = await callFeatureEndpoint<CoinGeckoMarketData[]>(
      FEATURE_ID,
      'COINGECKO_COINS_MARKETS',
      'secondary',
      {
        queryParams,
      }
    );

    if (result.success && result.data) {
      log('💰 Markets data fetched successfully from CoinGecko', TMI);
      // Add client-side timestamp when data is received
      return {
        data: result.data,
        fetchedAt: Date.now(),
      };
    } else {
      if (result.blocked) {
        log(`💰 CoinGecko secondary source ⛔blocked⛔ for markets`, TMI);
      } else {
        log(`💰 Failed to fetch markets data from CoinGecko: ${result.error}`, ERR);
      }
      return null;
    }
  } catch (error: any) {
    const errorMessage = error?.message || 'Unknown error fetching markets from CoinGecko';
    log(`💰 Failed to fetch markets from CoinGecko: ${errorMessage}`, ERR);
    return null;
  }
}

/**
 * Fetches markets data respecting user preferences
 * Tries preferred source first, then falls back to other source if enabled and preferred fails
 * @param options Optional parameters for the request
 * @returns Promise resolving to the markets data or null if both sources fail
 */
export async function fetchMarkets(
  options: MarketsOptions = {}
): Promise<MarketsResponse | null> {
  const preferences = getEffectivePreferences(FEATURE_ID);
  const { preferredDataSource, enableFallback } = preferences;

  // Try preferred source first
  const preferredResult = preferredDataSource === 'primary' 
    ? await fetchFromBackend(options) 
    : await fetchFromCoinGecko(options);
  
  if (preferredResult) {
    return preferredResult;
  }

  // Preferred source failed - try fallback if enabled
  if (enableFallback) {
    log(`💰 Preferred source (${preferredDataSource}) unavailable, falling back to ${preferredDataSource === 'primary' ? 'secondary' : 'primary'}...`, TMI);
    const fallbackResult = preferredDataSource === 'primary' 
      ? await fetchFromCoinGecko(options) 
      : await fetchFromBackend(options);
    
    if (fallbackResult) {
      return fallbackResult;
    }
  }

  // Both sources failed or fallback disabled
  log(`💰 Both ${preferredDataSource === 'primary' ? 'primary and secondary' : 'secondary and primary'} failed to provide markets data${!enableFallback ? ' (fallback disabled)' : ''}`, ERR);
  return null;
}

