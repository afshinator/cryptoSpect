/**
 * Type definitions for Market Dominance Calculator
 */

/**
 * CoinGecko Global API response structure
 * Matches the actual CoinGecko API response format
 */
export interface CoinGeckoGlobalData {
  data: {
    active_cryptocurrencies: number;
    upcoming_icos: number;
    ongoing_icos: number;
    ended_icos: number;
    markets: number;
    total_market_cap: { [key: string]: number };
    total_volume: { [key: string]: number };
    market_cap_percentage: { [key: string]: number };
    market_cap_change_percentage_24h_usd: number;
    updated_at: number;
  };
}

/**
 * CoinGecko Market Data response structure (from /coins/markets)
 * Matches the actual CoinGecko API response format
 */
export interface CoinGeckoMarketData {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number | null;
  market_cap: number | null;
  market_cap_rank: number | null;
  fully_diluted_valuation: number | null;
  total_volume: number | null;
  high_24h: number | null;
  low_24h: number | null;
  price_change_24h: number | null;
  price_change_percentage_24h: number | null;
  market_cap_change_24h: number | null;
  market_cap_change_percentage_24h: number | null;
  circulating_supply: number | null;
  total_supply: number | null;
  max_supply: number | null;
  ath: number | null;
  ath_change_percentage: number | null;
  ath_date: string | null;
  atl: number | null;
  atl_change_percentage: number | null;
  atl_date: string | null;
  roi: any | null;
  last_updated: string | null;
}

/**
 * Dominance data for a single category
 */
export interface CategoryDominance {
  marketCap: number;
  dominance: number;
}

/**
 * Complete dominance analysis result
 */
export interface DominanceAnalysis {
  /** Total market capitalization in USD */
  totalMarketCap: number;
  
  /** Bitcoin dominance data */
  btc: CategoryDominance;
  
  /** Ethereum dominance data */
  eth: CategoryDominance;
  
  /** Stablecoins dominance data */
  stablecoins: CategoryDominance;
  
  /** Others dominance data (calculated) */
  others: CategoryDominance;
  
  /** Unix timestamp (milliseconds) of when the calculation was performed (from API or calculation) */
  timestamp: number;
  
  /** Unix timestamp (milliseconds) of when this data was fetched and stored by the app */
  fetchedAt: number;
}

/**
 * Raw market cap data used for calculations
 * This structure is independent of the data source
 */
export interface MarketCapData {
  total: number;
  btc: number;
  eth: number;
  stablecoins: number;
}

