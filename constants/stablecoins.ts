/* constants/stablecoins.ts
 * Interface for a stablecoin asset.
 * Note: Market Cap and other data points are omitted as they are highly volatile and should be fetched
 * via a real-time API (e.g., CoinGecko, CoinMarketCap, Messari) for production use.
 */
export interface Stablecoin {
    /** The full name of the stablecoin. */
    name: string;
    /** The official ticker symbol. */
    symbol: string;
    /** The asset the coin is pegged to (e.g., USD, EUR, Gold). */
    pegAsset: string;
    /** The general type of collateralization (e.g., Fiat-Backed, Crypto-Backed, Algorithmic/Hybrid). */
    collateralType: 'Fiat-Backed' | 'Crypto-Backed' | 'Algorithmic/Hybrid' | 'Commodity-Backed';
    /** The issuer or managing DAO. */
    issuer: string;
  }
  
  /**
   * A list of major stablecoins, generally ranked by market capitalization.
   * Data is based on publicly available information and may not be exhaustive or real-time.
   */
  export const stablecoins: Stablecoin[] = [
    {
      name: "Tether",
      symbol: "USDT",
      pegAsset: "US Dollar",
      collateralType: "Fiat-Backed",
      issuer: "Tether Limited",
    },
    {
      name: "USD Coin",
      symbol: "USDC",
      pegAsset: "US Dollar",
      collateralType: "Fiat-Backed",
      issuer: "Circle",
    },
    {
      name: "Dai",
      symbol: "DAI",
      pegAsset: "US Dollar",
      collateralType: "Crypto-Backed",
      issuer: "MakerDAO",
    },
    {
      name: "Ethena USDe",
      symbol: "USDE",
      pegAsset: "US Dollar",
      collateralType: "Algorithmic/Hybrid",
      issuer: "Ethena Labs",
    },
    {
      name: "PayPal USD",
      symbol: "PYUSD",
      pegAsset: "US Dollar",
      collateralType: "Fiat-Backed",
      issuer: "PayPal (via Paxos)",
    },
    {
      name: "First Digital USD",
      symbol: "FDUSD",
      pegAsset: "US Dollar",
      collateralType: "Fiat-Backed",
      issuer: "First Digital Labs",
    },
    {
      name: "TrueUSD",
      symbol: "TUSD",
      pegAsset: "US Dollar",
      collateralType: "Fiat-Backed",
      issuer: "TrustToken",
    },
    {
      name: "Tether Gold",
      symbol: "XAUT",
      pegAsset: "Gold",
      collateralType: "Commodity-Backed",
      issuer: "Tether Limited",
    },
    {
      name: "Pax Gold",
      symbol: "PAXG",
      pegAsset: "Gold",
      collateralType: "Commodity-Backed",
      issuer: "Paxos Trust Company",
    },
    {
      name: "Euro Coin",
      symbol: "EURC",
      pegAsset: "Euro",
      collateralType: "Fiat-Backed",
      issuer: "Circle",
    },
    {
      name: "Gemini Dollar",
      symbol: "GUSD",
      pegAsset: "US Dollar",
      collateralType: "Fiat-Backed",
      issuer: "Gemini Trust Company",
    },
    // Note: BUSD (Binance USD) is generally excluded now as its issuance has largely ceased.
  ];

/**
 * CoinGecko API IDs for fiat-pegged stablecoins used in dominance calculations
 * 
 * Note: Gold-backed tokens (tether-gold, pax-gold) are excluded
 * as they track gold prices rather than fiat currencies.
 * 
 * This list includes stablecoins that should be included in market dominance calculations.
 */
export const STABLECOIN_IDS = [
  'tether',
  'usd-coin',
  'dai',
  'ethena-usde',
  'paypal-usd',
  'first-digital-usd',
  'true-usd',
  'gemini-dollar',
  'euro-coin',
  'usdd',
  'liquity-usd',
  'paxos-standard',
] as const;

/**
 * Number of stablecoins in the dominance calculation
 */
export const STABLECOIN_COUNT = STABLECOIN_IDS.length;

/**
 * Set of stablecoin symbols (uppercase) for filtering and badge display
 * 
 * This includes:
 * - All symbols from the main stablecoins array
 * - Additional common stablecoin symbols that may appear in market data
 * 
 * Use this for:
 * - Filtering stablecoins from volatility rankings
 * - Displaying stablecoin badges in lists
 * - Any other symbol-based stablecoin detection
 */
export function getStablecoinSymbols(): Set<string> {
  const symbols = new Set<string>();
  
  // Add all symbols from the main stablecoins array (uppercase)
  stablecoins.forEach(coin => {
    symbols.add(coin.symbol.toUpperCase());
  });
  
  // Add additional stablecoin symbols that may appear in market data
  // These are variants or additional stablecoins not in the main list
  const additionalSymbols = [
    'BUSD',    // Binance USD (largely deprecated but may still appear)
    'USDP',    // Pax Dollar
    'USDD',    // Decentralized USD
    'HUSD',    // HUSD
    'USDX',    // USDX
    'FRAX',    // Frax
    'LUSD',    // Liquity USD
    'USDC.E',  // USDC on Ethereum (variant)
    'USDT.E',  // USDT on Ethereum (variant)
    'USD',     // Generic USD (for filtering)
    'USDS',    // USDS
  ];
  
  additionalSymbols.forEach(symbol => {
    symbols.add(symbol.toUpperCase());
  });
  
  return symbols;
}

/**
 * Pre-computed set of stablecoin symbols for performance
 * Use this when you need a Set and don't need to add custom symbols
 */
export const STABLECOIN_SYMBOLS = getStablecoinSymbols();