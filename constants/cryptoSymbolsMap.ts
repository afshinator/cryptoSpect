/* cryptoSymbolMap.ts
 * Maps the long name of a cryptocurrency to its short ticker symbol.
 */

// Utility type to extract all valid symbols from the map
export type CryptoSymbol = typeof CRYPTO_SYMBOL_MAP[keyof typeof CRYPTO_SYMBOL_MAP];

export const CRYPTO_SYMBOL_MAP = {
    // Top 10
    "Bitcoin": "BTC",
    "Ethereum": "ETH",
    "Tether USDt": "USDT",
    "XRP": "XRP",
    "BNB": "BNB",
    "Solana": "SOL",
    "USDC": "USDC",
    "TRON": "TRX",
    "Dogecoin": "DOGE",
    "Cardano": "ADA",

    // Rank 11-20
    "Hyperliquid": "HYPE",
    "Bitcoin Cash": "BCH",
    "Chainlink": "LINK",
    "UNUS SED LEO": "LEO",
    "Stellar": "XLM",
    "Monero": "XMR",
    "Ethena USDe": "USDe",
    "Litecoin": "LTC",
    "Avalanche": "AVAX",
    "Sui": "SUI",

    // Rank 21-30
    "Hedera": "HBAR",
    "Zcash": "ZEC",
    "Dai": "DAI",
    "Shiba Inu": "SHIB",
    "World Liberty Financial": "WLFI",
    "Cronos": "CRO",
    "Toncoin": "TON",
    "PayPal USD": "PYUSD",
    "Polkadot": "DOT",
    "Uniswap": "UNI",
    
    // Rank 31-40
    "Mantle": "MNT",
    "Bittensor": "TAO",
    "Aave": "AAVE",
    "World Liberty Financial USD": "USD1",
    "Canton": "CC",
    "Bitget Token": "BGB",
    "Aster": "ASTER",
    "NEAR Protocol": "NEAR",
    "OKB": "OKB",
    "Ethereum Classic": "ETC",

    // Rank 41-50
    "Ethena": "ENA",
    "Pepe": "PEPE",
    "Internet Computer": "ICP",
    "Pi": "PI",
    "Tether Gold": "XAUt",
    "Ondo": "ONDO",
    "Kaspa": "KAS",
    "Worldcoin": "WLD",
    "Aptos": "APT",
    "PAX Gold": "PAXG",

    // Rank 51-64 (Extended)
    "KuCoin Token": "KCS",
    "MemeCore": "M",
    "Polygon (prev. MATIC)": "POL",
    "Sky": "SKY",
    "Global Dollar": "USDG",
    "Algorand": "ALGO",
    "Arbitrum": "ARB",
    "OFFICIAL TRUMP": "TRUMP",
    "Pump.fun": "PUMP",
    "Filecoin": "FIL",
    "VeChain": "VET",
    "Quant": "QNT",
    "Cosmos": "ATOM",
    "Flare": "FLR"
} as const; // 'as const' enforces literal types for strong type checking

