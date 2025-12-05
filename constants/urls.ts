// constants/urls.ts
// Centralized configuration for all API base URLs
// Secrets should be configured in .env.local and will not have hardcoded fallbacks

/**
 * CoinGecko API base URL
 * Public API - no authentication required
 */
export const COINGECKO_BASE_URL = "https://api.coingecko.com/api/v3";

/**
 * Exchange Rate API base URL
 * Public API - no authentication required
 */
export const EXCHANGE_RATE_API_BASE_URL = "https://open.er-api.com/v6/latest/USD";

/**
 * Crypto Proxy API base URL
 * Must be configured in .env.local as EXPO_PUBLIC_BACKEND_BASE_URL
 * Note: EXPO_PUBLIC_ prefix is required for Expo to expose the variable to client-side code
 * No hardcoded fallback - must be explicitly set in environment
 * In test environments, a mock URL is used to allow tests to run
 * 
 * The URL is normalized to remove trailing slashes to prevent double-slash issues in endpoint paths
 */
const rawBaseUrl = 
  process.env.EXPO_PUBLIC_BACKEND_BASE_URL || 
  (process.env.NODE_ENV === 'test' ? 'https://test-crypto-proxy.example.com' : undefined);

if (!rawBaseUrl && process.env.NODE_ENV !== 'test') {
  throw new Error(
    "EXPO_PUBLIC_BACKEND_BASE_URL environment variable is required. " +
    "Please set it in your .env.local file."
  );
}

// Normalize the base URL by removing trailing slashes to prevent double-slash issues
export const CRYPTO_PROXY_BASE_URL = rawBaseUrl ? rawBaseUrl.replace(/\/+$/, '') : undefined;

