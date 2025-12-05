// features/lists/constants.ts
// Constants for the CoinList feature

import { SupportedCurrency } from '@/constants/currency';

/** AsyncStorage key for coin lists */
export const COINLISTS_STORAGE_KEY = 'coinlists';

/** Modal focus delays for platform-specific behavior */
export const MODAL_FOCUS_DELAY_IOS_MS = 300;
export const MODAL_FOCUS_DELAY_ANDROID_MS = 100;

/** Maximum number of search results to display */
export const MAX_SEARCH_RESULTS = 50;

/** Search debounce delay (TBD - placeholder) */
export const SEARCH_DEBOUNCE_MS = 300;

/** Default currency for new coins (uses user preference from prefsStore) */
export const DEFAULT_COIN_CURRENCY: SupportedCurrency = 'usd';

/** Stablecoin symbols for badge display */
export const STABLECOIN_SYMBOLS = new Set([
  'USDT', 'USDC', 'DAI', 'BUSD', 'TUSD', 'USDP', 'USDD', 'GUSD', 'HUSD', 'USDX',
  'FRAX', 'LUSD', 'USDE', 'PYUSD', 'FDUSD', 'EURC', 'USDC.e', 'USDT.e'
]);

/** CSV export headers */
export const CSV_HEADERS = [
  'List Name',
  'List Notes',
  'Coin ID',
  'Symbol',
  'Name',
  'Coin Notes',
  'Currency',
  'Added At'
] as const;

