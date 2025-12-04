// components/current-volatility-widget/constants.ts
// Constants for the CurrentVolatilityWidget component

import type { VolatilityLevel } from './types';

// Tooltip and UI constants
export const TOOLTIP_AUTO_DISMISS_MS = 3000;
export const BADGE_OPACITY_HEX = '80';
export const BACKGROUND_OPACITY_HEX = '10';
export const TOOLTIP_BG_OPACITY = 0.9;

// Emojis for volatility context
export const EMOJI_SUSTAINED_VOLATILITY = '🔥'; // Both 1h and 24h HIGH/EXTREME
export const EMOJI_SHORT_TERM_SPIKE = '🚩'; // Only 1h HIGH/EXTREME

// Emojis for volatility levels
export const EMOJI_LEVEL: { [key in VolatilityLevel]: string } = {
  LOW: '😴',
  NORMAL: '✅',
  HIGH: '🚩',
  EXTREME: '🚨',
} as const;

// Number formatting
export const VOLATILITY_DECIMAL_PLACES = 2;

// Volatility scale thresholds (for visual scale)
// 1-Hour: < 1.5% = LOW, 1.5-4% = NORMAL, 4-8% = HIGH, > 8% = EXTREME
export const SCALE_1H = {
  LOW_MAX: 1.5,
  NORMAL_MAX: 4,
  HIGH_MAX: 8,
  // EXTREME is anything above HIGH_MAX
} as const;

// 24-Hour: < 2% = LOW, 2-5% = NORMAL, 5-10% = HIGH, > 10% = EXTREME
export const SCALE_24H = {
  LOW_MAX: 2,
  NORMAL_MAX: 5,
  HIGH_MAX: 10,
  // EXTREME is anything above HIGH_MAX
} as const;

// Visual constants
export const DIVIDER_WIDTH = 1;
export const SCALE_BAR_HEIGHT = 12;

// Map VolatilityLevel to a numeric severity (0-3)
export const SEVERITY_MAP: { [key in VolatilityLevel]: number } = {
  LOW: 0,
  NORMAL: 1,
  HIGH: 2,
  EXTREME: 3,
};

