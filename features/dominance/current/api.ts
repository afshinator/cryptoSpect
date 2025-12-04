// features/dominance/current/api.ts
// Functions for fetching current dominance data from Crypto Proxy API with automatic fallback to CoinGecko

import { getEffectivePreferences, isGlobalApiBlocked, shouldBlockEndpoint } from '@/stores/apiBlockingStore';
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
 * Fetches current dominance data from the backend API (primary source)
 * @returns Promise resolving to the current dominance data or null if error
 */
async function fetchFromBackend(): Promise<CurrentDominanceResponse | null> {
  const result = await callFeatureEndpoint<CurrentDominanceResponse>(
    FEATURE_ID,
    'CRYPTO_PROXY_CURRENT_DOMINANCE',
    'primary',
    {}
  );

  if (result.success && result.data) {
    log('💪 Current dominance data fetched successfully from backend (primary)', LOG);
    // Add client-side timestamp when data is received
    return {
      ...result.data,
      fetchedAt: Date.now(),
    };
  } else {
    if (result.blocked) {
      log(`💪 Primary data source (backend) ⛔blocked⛔ for current dominance`, TMI);
    } else {
      log(`💪 Failed to fetch current dominance data from backend: ${result.error}`, ERR);
    }
    return null;
  }
}

/**
 * Fetches current dominance data from CoinGecko and calculates it locally (secondary source)
 * @returns Promise resolving to the current dominance data or null if error
 */
async function fetchFromCoinGecko(): Promise<CurrentDominanceResponse | null> {
  // Check if CoinGecko is blocked globally or for this feature
  if (isGlobalApiBlocked('coingecko')) {
    log('💪 CoinGecko API is blocked globally, cannot use secondary source', ERR);
    return null;
  }
  
  if (shouldBlockEndpoint(FEATURE_ID, 'COINGECKO_GLOBAL', 'secondary')) {
    log('💪 CoinGecko secondary source is blocked for this feature', ERR);
    return null;
  }
  
  try {
    log('💪 Fetching dominance data from CoinGecko (secondary source)🏵️...', TMI);
    
    // Fetch all market cap data from CoinGecko
    const marketCapData = await fetchAllMarketCapData();
    
    // Calculate dominance using the calculator
    const dominanceData = calculateDominance(marketCapData);
    
    log('💪 Current dominance data calculated successfully from CoinGecko', TMI);
    // Add client-side timestamp when data is received
    return {
      ...dominanceData,
      fetchedAt: Date.now(),
    };
  } catch (error: any) {
    const errorMessage = error?.message || 'Unknown error calculating dominance from CoinGecko';
    log(`💪 Failed to calculate dominance from CoinGecko: ${errorMessage}`, ERR);
    return null;
  }
}

/**
 * Fetches current dominance data respecting user preferences
 * Tries preferred source first, then falls back to other source if enabled and preferred fails
 * @returns Promise resolving to the current dominance data or null if both sources fail
 */
export async function fetchCurrentDominance(): Promise<CurrentDominanceResponse | null> {
  const preferences = getEffectivePreferences(FEATURE_ID);
  const { preferredDataSource, enableFallback } = preferences;

  // Try preferred source first
  const preferredResult = preferredDataSource === 'primary' 
    ? await fetchFromBackend() 
    : await fetchFromCoinGecko();
  
  if (preferredResult) {
    return preferredResult;
  }

  // Preferred source failed - try fallback if enabled
  if (enableFallback) {
    log(`💪 Preferred source (${preferredDataSource}) unavailable, falling back to ${preferredDataSource === 'primary' ? 'secondary' : 'primary'}...`, TMI);
    const fallbackResult = preferredDataSource === 'primary' 
      ? await fetchFromCoinGecko() 
      : await fetchFromBackend();
    
    if (fallbackResult) {
      return fallbackResult;
    }
  }

  // Both sources failed or fallback disabled
  log(`💪 Both ${preferredDataSource === 'primary' ? 'primary and secondary' : 'secondary and primary'} failed to provide dominance data${!enableFallback ? ' (fallback disabled)' : ''}`, ERR);
  return null;
}

/**
 * Fetches current dominance data from a specific source
 * @param dataSource The data source to use ('primary' for backend, 'secondary' for CoinGecko)
 * @returns Promise resolving to the current dominance data or null if error
 */
export async function fetchCurrentDominanceFromSource(
  dataSource: 'primary' | 'secondary' = 'primary'
): Promise<CurrentDominanceResponse | null> {
  if (dataSource === 'primary') {
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
    log(`💪 Fetched At: ${new Date(data.fetchedAt).toISOString()}`, LOG);
    log('💪 ===============================', LOG);
  } else {
    log('💪 Failed to fetch current dominance data', ERR);
  }
}

