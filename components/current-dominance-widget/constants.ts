// components/current-dominance-widget/constants.ts
// Constants for the CurrentDominanceWidget component

// Category icons
export const ICON_BTC = '₿';
export const ICON_ETH = '⟠';
export const ICON_STABLECOINS = '💵';
export const ICON_OTHERS = '📊';

// Category colors
export const COLORS = {
  BTC: {
    light: '#F7931A', // Bitcoin orange
    dark: '#F7931A',
  },
  ETH: {
    light: '#627EEA', // Ethereum purple
    dark: '#627EEA',
  },
  STABLECOINS: {
    light: '#26A17B', // Green
    dark: '#26A17B',
  },
  OTHERS: {
    light: '#9BA1A6', // Gray
    dark: '#9BA1A6',
  },
} as const;

// Pie chart constants
export const PIE_SIZE = 160;
export const PIE_STROKE_WIDTH = 40;
export const PIE_RADIUS = (PIE_SIZE - PIE_STROKE_WIDTH) / 2;
export const PIE_CIRCUMFERENCE = 2 * Math.PI * PIE_RADIUS;

