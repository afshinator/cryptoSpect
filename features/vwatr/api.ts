// features/vwatr/api.ts
// Functions for fetching VWATR (Volume-Weighted Average True Range) data from Crypto Proxy API

import { callFeatureEndpoint } from '../../utils/apiWrappers';
import { ERR, log, LOG, TMI } from '../../utils/log';

const FEATURE_ID = 'vwatr' as const;

/**
 * VWATR result for a specific period
 */
export interface VwatrResult {
  /** Period in days (e.g., 7, 14, 30) */
  period: number;
  /** Volume-Weighted Average True Range (raw currency value) */
  vwatr: number;
  /** ATR Percentage (normalized percentage) */
  atrp: number;
}

/**
 * VWATR data for a specific coin
 */
export interface VwatrCoinData {
  /** Coin symbol (e.g., "btc", "eth") */
  symbol: string;
  /** Results for each requested period */
  results: VwatrResult[];
}

/**
 * Response type for VWATR endpoint
 */
export interface VwatrResponse {
  /** Response type identifier */
  type: 'vwatr';
  /** Bag identifier (e.g., "top20_bag", "superstar_bag", "all_coins") */
  bag: string;
  /** Array of periods requested (e.g., [7, 14, 30]) */
  periods: number[];
  /** Maximum supported period (30 days) */
  maxPeriod: number;
  /** Unix timestamp (seconds) of when this data was calculated */
  timestamp: number;
  /** VWATR data for each coin in the bag */
  data: VwatrCoinData[];
  /** Unix timestamp (milliseconds) of when this data was fetched and stored by the app */
  fetchedAt: number;
}

/**
 * Options for fetching VWATR data
 */
export interface VwatrOptions {
  /** Bag identifier (default: "top20_bag", options: "top20_bag", "superstar_bag", "all_coins") */
  bag?: 'top20_bag' | 'superstar_bag' | 'all_coins';
  /** Comma-separated list of periods in days (default: "7,14,30", max: 30 days) */
  periods?: string;
}

/**
 * Fetches VWATR data from the Crypto Proxy API
 * @param options Optional parameters for the request
 * @param dataSource The data source to use ('primary' or 'secondary')
 * @returns Promise resolving to the VWATR data or null if error
 */
export async function fetchVwatr(
  options: VwatrOptions = {},
  dataSource: 'primary' | 'secondary' = 'primary'
): Promise<VwatrResponse | null> {
  const { bag = 'top20_bag', periods = '7,14,30' } = options;

  const result = await callFeatureEndpoint<VwatrResponse>(
    FEATURE_ID,
    'CRYPTO_PROXY_VWATR',
    dataSource,
    {
      queryParams: {
        type: 'vwatr',
        bag,
        periods,
      },
    }
  );

  if (result.success && result.data) {
    log('📊 VWATR data fetched successfully', LOG);
    log(`📊 VWATR data: ${JSON.stringify(result.data)}`, TMI);
    // Add client-side timestamp when data is received
    return {
      ...result.data,
      fetchedAt: Date.now(),
    };
  } else {
    // Log different messages for blocked vs actual errors
    if (result.blocked) {
      log(`📊 VWATR data blocked: ${result.error}`, ERR);
    } else {
      log(`📊 Failed to fetch VWATR data: ${result.error}`, ERR);
    }
    return null;
  }
}

/**
 * Fetches and logs VWATR data
 * Convenience function for testing/debugging
 */
export async function fetchAndLogVwatr(
  options: VwatrOptions = {}
): Promise<void> {
  const data = await fetchVwatr(options);
  
  if (data) {
    log('📊 === VWATR Data ===', LOG);
    log(`📊 Bag: ${data.bag}`, LOG);
    log(`📊 Periods: ${data.periods.join(', ')}`, LOG);
    log(`📊 Max Period: ${data.maxPeriod} days`, LOG);
    log(`📊 Coins: ${data.data.length}`, LOG);
    log(`📊 Timestamp: ${new Date(data.timestamp * 1000).toISOString()}`, LOG);
    log(`📊 Fetched At: ${new Date(data.fetchedAt).toISOString()}`, LOG);
    
    // Log sample data for first coin
    if (data.data.length > 0) {
      const firstCoin = data.data[0];
      log(`📊 Sample - ${firstCoin.symbol.toUpperCase()}:`, LOG);
      firstCoin.results.forEach((result) => {
        log(`📊   ${result.period}d: VWATR=${result.vwatr}, ATRP=${result.atrp}%`, LOG);
      });
    }
    log('📊 ===================', LOG);
  } else {
    log('📊 Failed to fetch VWATR data', ERR);
  }
}

