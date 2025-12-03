// features/currentVolatility/api.ts
// Functions for fetching current volatility data from Crypto Proxy API

import { callEndpoint } from '../../utils/api';
import { log, LOG, ERR } from '../../utils/log';

/**
 * Response type for current volatility endpoint
 */
export interface CurrentVolatilityResponse {
  volatility1h: number;
  volatility24h: number;
  level1h: string;
  level24h: string;
  topMoverPercentage: number;
  topMoverCoin: string;
  marketCapCoverage: number;
}

/**
 * Options for fetching current volatility data
 */
export interface CurrentVolatilityOptions {
  /** Number of top coins to analyze (default: 50, max: 250) */
  per_page?: number;
}

/**
 * Fetches current volatility data from the Crypto Proxy API
 * @param options Optional parameters for the request
 * @returns Promise resolving to the current volatility data or null if error
 */
export async function fetchCurrentVolatility(
  options: CurrentVolatilityOptions = {}
): Promise<CurrentVolatilityResponse | null> {
  const { per_page } = options;

  const result = await callEndpoint<CurrentVolatilityResponse>(
    'CRYPTO_PROXY_CURRENT_VOLATILITY',
    {
      queryParams: {
        type: 'current',
        ...(per_page !== undefined && { per_page }),
      },
    }
  );

  if (result.success && result.data) {
    log('⚡ Current volatility data fetched successfully', LOG);
    return result.data;
  } else {
    log(`⚡ Failed to fetch current volatility data: ${result.error}`, ERR);
    return null;
  }
}

/**
 * Fetches and logs current volatility data
 * Convenience function for testing/debugging
 */
export async function fetchAndLogCurrentVolatility(
  options: CurrentVolatilityOptions = {}
): Promise<void> {
  const data = await fetchCurrentVolatility(options);
  
  if (data) {
    log('⚡ === Current Volatility Data ===', LOG);
    log(`⚡ 1h Volatility: ${data.volatility1h}% (${data.level1h})`, LOG);
    log(`⚡ 24h Volatility: ${data.volatility24h}% (${data.level24h})`, LOG);
    log(`⚡ Top Mover: ${data.topMoverCoin} (${data.topMoverPercentage}%)`, LOG);
    log(`⚡ Market Cap Coverage: ${(data.marketCapCoverage * 100).toFixed(1)}%`, LOG);
    log('⚡ ===============================', LOG);
  } else {
    log('⚡ Failed to fetch current volatility data', ERR);
  }
}

