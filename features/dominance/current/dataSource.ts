/**
 * Data Source Layer for Market Dominance
 * 
 * This module handles all data fetching from CoinGecko API.
 * The calculation logic is separated from the data source to allow
 * easy switching to alternative data providers in the future.
 */

import {
  STABLECOIN_COUNT,
  STABLECOIN_IDS,
} from '@/constants/stablecoins';
import { callEndpoint } from '@/utils/api';
import { ERR, log, LOG, TMI, WARN } from '@/utils/log';
import {
  BITCOIN_ID,
  ETHEREUM_ID,
} from './constants';
import type {
  CoinGeckoGlobalData,
  CoinGeckoMarketData,
  MarketCapData,
} from './types';

/**
 * Fetches total market cap from CoinGecko /global endpoint
 * @returns Total market cap in USD
 */
export async function fetchTotalMarketCap(): Promise<number> {
  log('💪 Fetching total market cap from /global endpoint...', TMI);

  const result = await callEndpoint<CoinGeckoGlobalData>('COINGECKO_GLOBAL', {});

  if (!result.success || !result.data) {
    const error = result.error || 'Unknown error fetching total market cap';
    log(`💪 ⚠️ Failed to fetch total market cap: ${error}`, ERR);
    throw new Error(error);
  }

  const totalMarketCap = result.data.data.total_market_cap.usd || 0;
  log(`💪 Total market cap: $${totalMarketCap.toLocaleString()}`, TMI);

  return totalMarketCap;
}

/**
 * Fetches Bitcoin market cap from CoinGecko /coins/markets endpoint
 * @returns Bitcoin market cap in USD
 */
export async function fetchBitcoinMarketCap(): Promise<number> {
  log('💪 Fetching Bitcoin market cap...', TMI);

  const result = await callEndpoint<CoinGeckoMarketData[]>('COINGECKO_COINS_MARKETS', {
    queryParams: {
      vs_currency: 'usd',
      ids: BITCOIN_ID,
    },
  });

  if (!result.success || !result.data) {
    const error = result.error || 'Unknown error fetching Bitcoin market cap';
    log(`💪 ⚠️ Failed to fetch Bitcoin market cap: ${error}`, WARN);
    return 0;
  }

  if (result.data.length === 0) {
    log('💪 ⚠️ Bitcoin market data not found', WARN);
    return 0;
  }

  const btcMarketCap = result.data[0].market_cap || 0;
  log(`💪 Bitcoin market cap: $${btcMarketCap.toLocaleString()}`, TMI);

  return btcMarketCap;
}

/**
 * Fetches Ethereum market cap from CoinGecko /coins/markets endpoint
 * @returns Ethereum market cap in USD
 */
export async function fetchEthereumMarketCap(): Promise<number> {
  log('💪 Fetching Ethereum market cap...', TMI);

  const result = await callEndpoint<CoinGeckoMarketData[]>('COINGECKO_COINS_MARKETS', {
    queryParams: {
      vs_currency: 'usd',
      ids: ETHEREUM_ID,
    },
  });

  if (!result.success || !result.data) {
    const error = result.error || 'Unknown error fetching Ethereum market cap';
    log(`💪 ⚠️ Failed to fetch Ethereum market cap: ${error}`, WARN);
    return 0;
  }

  if (result.data.length === 0) {
    log('💪 ⚠️ Ethereum market data not found', WARN);
    return 0;
  }

  const ethMarketCap = result.data[0].market_cap || 0;
  log(`💪 Ethereum market cap: $${ethMarketCap.toLocaleString()}`, TMI);

  return ethMarketCap;
}

/**
 * Fetches all stablecoin market caps from CoinGecko /coins/markets endpoint
 * @returns Sum of all stablecoin market caps in USD
 */
export async function fetchStablecoinsMarketCap(): Promise<number> {
  log(`💪 Fetching stablecoin market caps for ${STABLECOIN_COUNT} coins...`, LOG);

  const result = await callEndpoint<CoinGeckoMarketData[]>('COINGECKO_COINS_MARKETS', {
    queryParams: {
      vs_currency: 'usd',
      ids: STABLECOIN_IDS.join(','),
    },
  });

  if (!result.success || !result.data) {
    const error = result.error || 'Unknown error fetching stablecoin market caps';
    log(`💪 ⚠️ Failed to fetch stablecoin market caps: ${error}`, WARN);
    return 0;
  }

  if (result.data.length === 0) {
    log('💪 ⚠️ No stablecoin market data found', WARN);
    return 0;
  }

  // Create a map of coin IDs to market caps for easier lookup
  const marketCapMap = new Map<string, number>();
  for (const coin of result.data) {
    marketCapMap.set(coin.id, coin.market_cap || 0);
  }

  // Sum market caps for all stablecoins
  let totalStablecoinMarketCap = 0;
  let foundCount = 0;
  let missingCoins: string[] = [];

  for (const stablecoinId of STABLECOIN_IDS) {
    const marketCap = marketCapMap.get(stablecoinId);
    if (marketCap !== undefined && marketCap > 0) {
      totalStablecoinMarketCap += marketCap;
      foundCount++;
    } else {
      missingCoins.push(stablecoinId);
    }
  }

  if (missingCoins.length > 0) {
    log(`💪 ⚠️ ${missingCoins.length} stablecoin(s) not found or have zero market cap: ${missingCoins.join(', ')}`, WARN);
  }

  log(`💪 Stablecoins market cap: $${totalStablecoinMarketCap.toLocaleString()} (${foundCount}/${STABLECOIN_COUNT} coins found)`, TMI);

  return totalStablecoinMarketCap;
}

/**
 * Fetches Bitcoin, Ethereum, and stablecoin market caps in a single CoinGecko call
 * This is more efficient than making separate calls
 * @returns Object with BTC, ETH, and stablecoins market caps
 */
export async function fetchBitcoinEthereumAndStablecoinsMarketCaps(): Promise<{
  btc: number;
  eth: number;
  stablecoins: number;
}> {
  log(`💪 Fetching BTC, ETH, and ${STABLECOIN_COUNT} stablecoins market caps ...`, TMI);

  // Combine all coin IDs: BTC, ETH, and all stablecoins
  const allCoinIds = [BITCOIN_ID, ETHEREUM_ID, ...STABLECOIN_IDS].join(',');

  const result = await callEndpoint<CoinGeckoMarketData[]>('COINGECKO_COINS_MARKETS', {
    queryParams: {
      vs_currency: 'usd',
      ids: allCoinIds,
    },
  });

  if (!result.success || !result.data) {
    const error = result.error || 'Unknown error fetching BTC, ETH, and stablecoins market caps';
    log(`💪 ⚠️ Failed to fetch market caps: ${error}`, WARN);
    return { btc: 0, eth: 0, stablecoins: 0 };
  }

  if (result.data.length === 0) {
    log('💪 ⚠️ No market data found', WARN);
    return { btc: 0, eth: 0, stablecoins: 0 };
  }

  // Create a map of coin IDs to market caps for easier lookup
  const marketCapMap = new Map<string, number>();
  for (const coin of result.data) {
    marketCapMap.set(coin.id, coin.market_cap || 0);
  }

  // Get BTC market cap
  const btcMarketCap = marketCapMap.get(BITCOIN_ID) || 0;
  log(`💪 Bitcoin market cap: $${btcMarketCap.toLocaleString()}`, TMI);

  // Get ETH market cap
  const ethMarketCap = marketCapMap.get(ETHEREUM_ID) || 0;
  log(`💪 Ethereum market cap: $${ethMarketCap.toLocaleString()}`, TMI);

  // Sum market caps for all stablecoins
  let totalStablecoinMarketCap = 0;
  let foundCount = 0;
  let missingCoins: string[] = [];

  for (const stablecoinId of STABLECOIN_IDS) {
    const marketCap = marketCapMap.get(stablecoinId);
    if (marketCap !== undefined && marketCap > 0) {
      totalStablecoinMarketCap += marketCap;
      foundCount++;
    } else {
      missingCoins.push(stablecoinId);
    }
  }

  if (missingCoins.length > 0) {
    log(`💪 ⚠️ ${missingCoins.length} stablecoin(s) not found or have zero market cap: ${missingCoins.join(', ')}`, WARN);
  }

  log(`💪 Stablecoins market cap: $${totalStablecoinMarketCap.toLocaleString()} (${foundCount}/${STABLECOIN_COUNT} coins found)`, TMI);

  return {
    btc: btcMarketCap,
    eth: ethMarketCap,
    stablecoins: totalStablecoinMarketCap,
  };
}

/**
 * Fetches all market cap data needed for dominance calculation
 * This is the main entry point for data fetching
 * Optimized to make only 2 API calls: one for total market cap, one for BTC/ETH/stablecoins
 * @returns MarketCapData object with all required market caps
 */
export async function fetchAllMarketCapData(): Promise<MarketCapData> {
  log('💪 Starting market cap data fetch...', TMI);

  // Fetch total market cap and BTC/ETH/stablecoins in parallel (2 calls total)
  const [total, coinsData] = await Promise.all([
    fetchTotalMarketCap(),
    fetchBitcoinEthereumAndStablecoinsMarketCaps(),
  ]);

  log('💪 All market cap data fetched successfully', TMI);

  return {
    total,
    btc: coinsData.btc,
    eth: coinsData.eth,
    stablecoins: coinsData.stablecoins,
  };
}

