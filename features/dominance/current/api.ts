// features/dominance/current/api.ts
// Functions for fetching current dominance data from Crypto Proxy API with automatic fallback to CoinGecko

import { isGlobalApiBlocked, shouldBlockEndpoint } from '@/stores/apiBlockingStore';
import { callFeatureEndpoint } from '@/utils/apiWrappers';
import { ERR, log, LOG, TMI } from '@/utils/log';
import { calculateDominance, fetchAllMarketCapData } from './index';
import type { DominanceAnalysis } from './types';

const FEATURE_ID = 'currentDominance' as const;

/**
 * Response type for current dominance endpoint
 * Reuses DominanceAnalysis type from the calculator
 */
export type CurrentDominanceResponse = DominanceAnalysis;

/**
 * Fetches current dominance data from the backend API
 * @param dataSource The data source to use ('default' for backend, 'alternate' for CoinGecko)
 * @returns Promise resolving to the current dominance data or null if error
 */
async function fetchFromBackend(): Promise<CurrentDominanceResponse | null> {
  const result = await callFeatureEndpoint<CurrentDominanceResponse>(
    FEATURE_ID,
    'CRYPTO_PROXY_CURRENT_DOMINANCE',
    'default',
    {}
  );

  if (result.success && result.data) {
    log('💪 Current dominance data fetched successfully from backend', LOG);
    return result.data;
  } else {
    if (result.blocked) {
      log(`💪 Default data source (backend) ⛔blocked⛔ for current dominance, will try alternate source`, LOG);
    } else {
      log(`💪 Failed to fetch current dominance data from backend: ${result.error}`, ERR);
    }
    return null;
  }
}

/**
 * Fetches current dominance data from CoinGecko and calculates it locally
 * @returns Promise resolving to the current dominance data or null if error
 */
async function fetchFromCoinGecko(): Promise<CurrentDominanceResponse | null> {
  // Check if CoinGecko is blocked globally or for this feature
  if (isGlobalApiBlocked('coingecko')) {
    log('💪 CoinGecko API is blocked globally, cannot use as fallback', ERR);
    return null;
  }
  
  if (shouldBlockEndpoint(FEATURE_ID, 'COINGECKO_GLOBAL', 'alternate')) {
    log('💪 CoinGecko alternate source is blocked for this feature', ERR);
    return null;
  }
  
  try {
    log('💪 Fetching dominance data from CoinGecko (alternate source)🏵️...', LOG);
    
    // Fetch all market cap data from CoinGecko
    const marketCapData = await fetchAllMarketCapData();
    
    // Calculate dominance using the calculator
    const dominanceData = calculateDominance(marketCapData);
    
    log('💪 Current dominance data calculated successfully from CoinGecko', LOG);
    return dominanceData;
  } catch (error: any) {
    const errorMessage = error?.message || 'Unknown error calculating dominance from CoinGecko';
    log(`💪 Failed to calculate dominance from CoinGecko: ${errorMessage}`, ERR);
    return null;
  }
}

/**
 * Fetches current dominance data with automatic fallback
 * Tries backend first, then falls back to CoinGecko if backend is blocked or fails
 * @returns Promise resolving to the current dominance data or null if both sources fail
 */
export async function fetchCurrentDominance(): Promise<CurrentDominanceResponse | null> {
  // Try backend first
  const backendResult = await fetchFromBackend();
  if (backendResult) {
    return backendResult;
  }

  // Backend failed or blocked - try CoinGecko fallback
  log('💪 Backend unavailable, falling back to CoinGecko...', TMI);
  const coinGeckoResult = await fetchFromCoinGecko();
  if (coinGeckoResult) {
    return coinGeckoResult;
  }

  // Both sources failed
  log('💪 Both backend and CoinGecko failed to provide dominance data', ERR);
  return null;
}

/**
 * Fetches current dominance data from a specific source
 * @param dataSource The data source to use ('default' for backend, 'alternate' for CoinGecko)
 * @returns Promise resolving to the current dominance data or null if error
 */
export async function fetchCurrentDominanceFromSource(
  dataSource: 'default' | 'alternate' = 'default'
): Promise<CurrentDominanceResponse | null> {
  if (dataSource === 'default') {
    return fetchFromBackend();
  } else {
    return fetchFromCoinGecko();
  }
}

/**
 * Fetches and logs current dominance data
 * Convenience function for testing/debugging
 */
export async function fetchAndLogCurrentDominance(): Promise<void> {
  const data = await fetchCurrentDominance();
  
  if (data) {
    log('💪 === Current Dominance Data ===', LOG);
    log(`💪 Total Market Cap: $${data.totalMarketCap.toLocaleString()}`, LOG);
    log(`💪 BTC: ${data.btc.dominance}% ($${data.btc.marketCap.toLocaleString()})`, LOG);
    log(`💪 ETH: ${data.eth.dominance}% ($${data.eth.marketCap.toLocaleString()})`, LOG);
    log(`💪 Stablecoins: ${data.stablecoins.dominance}% ($${data.stablecoins.marketCap.toLocaleString()})`, LOG);
    log(`💪 Others: ${data.others.dominance}% ($${data.others.marketCap.toLocaleString()})`, LOG);
    log(`💪 Timestamp: ${new Date(data.timestamp).toISOString()}`, LOG);
    log('💪 ===============================', LOG);
  } else {
    log('💪 Failed to fetch current dominance data', ERR);
  }
}

