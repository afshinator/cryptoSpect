// features/lists/top20List.ts
// Utility for deriving "Current top 20" list from marketsData

import { SupportedCurrency } from '@/constants/currency';
import { MarketsResponse } from '@/features/marketsData/api';
import { CoinList, CoinListItem } from './types';

/** ID for the "Current top 20" virtual list */
export const TOP20_LIST_ID = 'current-top-20';

/** Name for the "Current top 20" list */
export const TOP20_LIST_NAME = 'Current top 20';

/**
 * Derives a CoinList from the top 20 coins in marketsData
 * 
 * @param marketsData The markets data response, or null if not available
 * @param currency The currency to use for the coins
 * @returns CoinList object with top 20 coins, or null if marketsData is not available
 */
export function getTop20List(marketsData: MarketsResponse | null, currency: SupportedCurrency): CoinList | null {
  if (!marketsData?.data || marketsData.data.length === 0) {
    return null;
  }

  // Get top 20 by market cap (data is already sorted by market_cap_desc)
  const top20Coins = marketsData.data.slice(0, 20);

  const coins: CoinListItem[] = top20Coins.map((coin) => ({
    coinId: coin.id,
    symbol: coin.symbol.toUpperCase(),
    name: coin.name,
    image: coin.image,
    addedAt: marketsData.fetchedAt || Date.now(),
    vsCurrency: currency,
  }));

  return {
    id: TOP20_LIST_ID,
    name: TOP20_LIST_NAME,
    coins,
    createdAt: marketsData.fetchedAt || Date.now(),
    updatedAt: marketsData.fetchedAt || Date.now(),
    notes: 'Top 20 cryptocurrencies by market cap',
  };
}

