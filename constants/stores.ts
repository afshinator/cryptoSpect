// constants/stores.ts
// These a
import { CurrentVolatilityResponse } from '@/features/currentVolatility/api';
import { CurrentDominanceResponse } from '@/features/dominance/current/api';
import { CoinMaps, MarketsResponse } from '@/features/marketsData/api';
import { VwatrResponse } from '@/features/vwatr/api';
import { DEFAULT_CURRENCY } from './currency';

// AsyncStorage keys
export const PREFS_STORAGE_KEY = 'prefs';
export const LATEST_STORAGE_KEY = 'latest';

// Default preference values
export const DEFAULT_PREFS = {
  theme: 'default',
  fontScale: 1.0,
  lightDarkMode: 'system' as const,
  currency: DEFAULT_CURRENCY,
  compactMode: false,
} as const;

// Default latest values
export const DEFAULT_LATEST = {
  currentVolatilityData: null as CurrentVolatilityResponse | null,
  currentDominanceData: null as CurrentDominanceResponse | null,
  vwatrData: null as VwatrResponse | null,
  marketsData: null as MarketsResponse | null,
  coinMaps: null as CoinMaps | null,
} as const;

