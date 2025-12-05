// components/volatility-ranking-atrp-chart/types.ts
// TypeScript interfaces and types for the VolatilityRankingATRP component

import { ViewStyle } from 'react-native';

/**
 * Individual volatility result for a specific period
 */
export interface VolatilityResult {
  period: number;
  vwatr: number;
  atrp: number; // The metric used for ranking
}

/**
 * Volatility data for a single coin
 */
export interface CoinVolatility {
  symbol: string;
  results: VolatilityResult[];
}

/**
 * Complete volatility data structure from the API
 */
export interface VolatilityData {
  type: string;
  bag: string;
  periods: number[];
  maxPeriod: number;
  timestamp: number;
  data: CoinVolatility[];
}

/**
 * Processed coin item ready for display
 */
export interface RankedCoinItem {
  symbol: string;
  atrp_30d: number;
  coinName: string | null;
}

/**
 * Props for the VolatilityRankingATRP component
 */
export interface VolatilityRankingProps {
  /** Optional override for the background color of the main card/container. */
  containerStyle?: ViewStyle;
  /** Optional override for the title text color. */
  titleColor?: { light?: string; dark?: string };
  /** Optional override for the list item text color. */
  textColor?: { light?: string; dark?: string };
  /** Optional override for the color of the highest volatility bar. */
  highVolColor?: { light?: string; dark?: string };
  /** Optional override for the color of the lowest volatility bar. */
  lowVolColor?: { light?: string; dark?: string };
  /** Optional data source (defaults to MOCK_VOLATILITY_DATA for demo) */
  data?: VolatilityData;
  /** Display mode: 'compact' or 'normal' (default: 'normal') */
  mode?: 'compact' | 'normal';
  /** Optional description text displayed below the title */
  description?: string;
}

/**
 * Props for the CoinSymbolWithTooltip component
 */
export interface CoinSymbolWithTooltipProps {
  symbol: string;
  coinName: string | null;
  textColor: string;
  textStyle: any;
}

/**
 * Result of processing and ranking volatility data
 */
export interface RankedDataResult {
  ranked: RankedCoinItem[];
  maxAtrp: number;
  minAtrp: number;
}

