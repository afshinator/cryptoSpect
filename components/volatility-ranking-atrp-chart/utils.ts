// components/volatility-ranking-atrp-chart/utils.ts
// Utility functions for processing volatility data

import { CRYPTO_SYMBOL_MAP } from '@/constants/cryptoSymbolsMap';
import { getStablecoinSymbols as getStablecoinSymbolsFromConstants } from '@/constants/stablecoins';
import type { CoinMaps } from '@/features/marketsData/api';
import type { CoinGeckoMarketData } from '@/constants/coinGecko';
import type { RankedCoinItem, RankedDataResult, VolatilityData } from './types';

/**
 * Builds a comprehensive symbol-to-name mapping from markets data
 * Includes both symbol-based and ID-based lookups for wrapped/staked coins
 */
export function buildSymbolToName(
  marketsData: CoinGeckoMarketData[] | undefined,
  coinMaps: CoinMaps | null
): Record<string, string> {
  const map: Record<string, string> = {};
  
  if (marketsData) {
    marketsData.forEach((coin) => {
      if (coin.symbol && coin.name) {
        // Store both lowercase and uppercase symbol mappings
        map[coin.symbol.toLowerCase()] = coin.name;
        map[coin.symbol.toUpperCase()] = coin.name;
      }
      // Also map by ID (for wrapped/staked coins that might use IDs)
      if (coin.id && coin.name) {
        map[coin.id.toLowerCase()] = coin.name;
        map[coin.id.toUpperCase()] = coin.name;
      }
    });
  }
  
  // Also use coinMaps if available for additional coverage
  if (coinMaps?.idToSymbol && marketsData) {
    // Build reverse lookup: symbol -> name via id
    marketsData.forEach((coin) => {
      if (coin.id && coin.name) {
        const symbol = coinMaps.idToSymbol[coin.id];
        if (symbol) {
          map[symbol.toLowerCase()] = coin.name;
          map[symbol.toUpperCase()] = coin.name;
        }
      }
    });
  }
  
  return map;
}

/**
 * Gets the set of stablecoin symbols to filter out
 * 
 * This function delegates to the centralized getStablecoinSymbols() from '@/constants/stablecoins'
 * to ensure all stablecoin definitions are in one place.
 */
export function getStablecoinSymbols(): Set<string> {
  return getStablecoinSymbolsFromConstants();
}

/**
 * Creates a function to map coin symbols to short display symbols
 * Prefers markets data maps over static CRYPTO_SYMBOL_MAP
 */
export function createGetShortSymbol(coinMaps: CoinMaps | null): (coinNameOrSymbol: string) => string {
  const symbolToId = coinMaps?.symbolToId || {};
  const idToSymbol = coinMaps?.idToSymbol || {};
  
  // Fallback to static map
  const mapValues = new Set(Object.values(CRYPTO_SYMBOL_MAP).map(v => v.toUpperCase()));
  const keyMap = new Map<string, string>();
  Object.keys(CRYPTO_SYMBOL_MAP).forEach(key => {
    keyMap.set(key.toUpperCase(), CRYPTO_SYMBOL_MAP[key as keyof typeof CRYPTO_SYMBOL_MAP]);
  });
  
  return (coinNameOrSymbol: string): string => {
    const input = coinNameOrSymbol.trim();
    const upperInput = input.toUpperCase();
    const lowerInput = input.toLowerCase();
    
    // First, try markets data maps (preferred)
    if (coinMaps) {
      // Check if input is a symbol (case-insensitive) - VWATR returns lowercase symbols like "sol"
      const foundId = symbolToId[lowerInput] || symbolToId[upperInput];
      if (foundId) {
        // Get the uppercase symbol from idToSymbol (e.g., "sol" -> "solana" -> "SOL")
        const displaySymbol = idToSymbol[foundId];
        if (displaySymbol) {
          return displaySymbol;
        }
      }
      
      // Check if input is already an ID (e.g., "solana")
      if (idToSymbol[lowerInput] || idToSymbol[input]) {
        return idToSymbol[lowerInput] || idToSymbol[input] || upperInput;
      }
    }
    
    // Fallback to static CRYPTO_SYMBOL_MAP
    if (mapValues.has(upperInput)) {
      return upperInput;
    }
    
    const foundSymbol = keyMap.get(upperInput);
    if (foundSymbol) {
      return foundSymbol;
    }
    
    // Final fallback: uppercase the input
    return upperInput;
  };
}

/**
 * Gets the coin name from markets data using multiple lookup strategies
 */
export function getCoinName(
  coinSymbol: string,
  shortSymbol: string,
  symbolToName: Record<string, string>,
  coinMaps: CoinMaps | null,
  marketsData: CoinGeckoMarketData[] | undefined
): string | null {
  // Try multiple lookup strategies:
  // 1. Try shortSymbol (uppercase and lowercase)
  // 2. Try original coin.symbol (uppercase and lowercase) - in case getShortSymbol didn't find a match
  // 3. Try using coinMaps to find the ID, then look up the name by ID
  let coinName: string | null = symbolToName[shortSymbol] 
    || symbolToName[shortSymbol.toLowerCase()] 
    || symbolToName[coinSymbol.toLowerCase()]
    || symbolToName[coinSymbol.toUpperCase()]
    || null;
  
  // If still not found and we have coinMaps, try ID-based lookup
  if (!coinName && coinMaps) {
    // Check if coin.symbol might actually be an ID (e.g., "wrapped-ethereum")
    const possibleId = coinSymbol.toLowerCase();
    const idFromSymbol = coinMaps.symbolToId[possibleId] || coinMaps.symbolToId[coinSymbol.toUpperCase()];
    if (idFromSymbol) {
      // Find the coin in marketsData by ID
      const coinData = marketsData?.find(c => c.id === idFromSymbol);
      if (coinData?.name) {
        coinName = coinData.name;
      }
    } else if (marketsData) {
      // Try direct ID match (in case coin.symbol is already an ID)
      const coinData = marketsData.find(c => c.id === possibleId || c.id === coinSymbol);
      if (coinData?.name) {
        coinName = coinData.name;
      }
    }
  }
  
  return coinName;
}

/**
 * Processes and ranks volatility data, filtering out stablecoins
 */
export function processRankedData(
  data: VolatilityData,
  getShortSymbol: (coinNameOrSymbol: string) => string,
  stablecoinSymbols: Set<string>,
  symbolToName: Record<string, string>,
  coinMaps: CoinMaps | null,
  marketsData: CoinGeckoMarketData[] | undefined
): RankedDataResult {
  // 1. Filter out stablecoins by symbol (using short symbol for comparison)
  const filteredData = data.data.filter(coin => {
    const shortSymbol = getShortSymbol(coin.symbol);
    // Filter based on the provided stablecoins list
    return !stablecoinSymbols.has(shortSymbol);
  });

  // 2. Extract the 30-day ATRP, map to short symbols, and sort
  const ranked = filteredData
    .map(coin => {
      const result30d = coin.results.find(r => r.period === 30);
      const shortSymbol = getShortSymbol(coin.symbol);
      const coinName = getCoinName(coin.symbol, shortSymbol, symbolToName, coinMaps, marketsData);
      
      return {
        symbol: shortSymbol,
        atrp_30d: result30d?.atrp || 0,
        coinName, // Store coin name for tooltip
      };
    })
    .filter(item => item.atrp_30d > 0) // Remove any with zero volatility
    .sort((a, b) => b.atrp_30d - a.atrp_30d); // Sort descending (Highest volatility first)

  // 3. Calculate min/max for bar scaling/coloring
  const maxAtrp = ranked.length > 0 ? ranked[0].atrp_30d : 1;
  const minAtrp = ranked.length > 0 ? ranked[ranked.length - 1].atrp_30d : 0;

  return { ranked, maxAtrp, minAtrp };
}

