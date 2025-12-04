// constants/stores.ts

import { CurrentVolatilityResponse } from '@/features/currentVolatility/api';
import { CurrentDominanceResponse } from '@/features/dominance/current/api';
import { DEFAULT_CURRENCY } from './currency';

// AsyncStorage keys
export const PREFS_STORAGE_KEY = 'prefs';

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
} as const;

