// features/lists/mockData.ts
// Mock market data for development

import { CoinGeckoMarketData } from '@/constants/coinGecko';

/**
 * Generate mock market data for a coin
 */
export function generateMockMarketData(
  coinId: string,
  symbol: string,
  name: string,
  price: number = 50000,
  change24h: number = 2.5
): CoinGeckoMarketData {
  return {
    id: coinId,
    symbol: symbol.toLowerCase(),
    name,
    image: `https://assets.coingecko.com/coins/images/${Math.floor(Math.random() * 1000)}/large/${coinId}.png`,
    current_price: price,
    market_cap: price * 1000000,
    market_cap_rank: Math.floor(Math.random() * 100) + 1,
    fully_diluted_valuation: null,
    total_volume: price * 100000,
    high_24h: price * 1.05,
    low_24h: price * 0.95,
    price_change_24h: price * (change24h / 100),
    price_change_percentage_24h: change24h,
    market_cap_change_24h: null,
    market_cap_change_percentage_24h: null,
    circulating_supply: null,
    total_supply: null,
    max_supply: null,
    ath: price * 1.5,
    ath_change_percentage: -33.33,
    ath_date: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
    atl: price * 0.5,
    atl_change_percentage: 100,
    atl_date: new Date(Date.now() - 730 * 24 * 60 * 60 * 1000).toISOString(),
    roi: null,
    last_updated: new Date().toISOString(),
  };
}

/**
 * Mock market data cache for common coins
 */
export const MOCK_MARKET_DATA: Record<string, CoinGeckoMarketData> = {
  bitcoin: generateMockMarketData('bitcoin', 'BTC', 'Bitcoin', 45000, 1.2),
  ethereum: generateMockMarketData('ethereum', 'ETH', 'Ethereum', 3000, -0.5),
  cardano: generateMockMarketData('cardano', 'ADA', 'Cardano', 0.5, 3.1),
  solana: generateMockMarketData('solana', 'SOL', 'Solana', 100, 5.2),
  polkadot: generateMockMarketData('polkadot', 'DOT', 'Polkadot', 7, -1.8),
  'binancecoin': generateMockMarketData('binancecoin', 'BNB', 'BNB', 350, 2.3),
  'ripple': generateMockMarketData('ripple', 'XRP', 'XRP', 0.6, 4.5),
  'dogecoin': generateMockMarketData('dogecoin', 'DOGE', 'Dogecoin', 0.08, -2.1),
};

/**
 * Get mock market data for a coin (returns null if not found)
 */
export function getMockMarketData(coinId: string): CoinGeckoMarketData | null {
  return MOCK_MARKET_DATA[coinId.toLowerCase()] || null;
}

