// components/current-dominance-widget/types.ts
// Type definitions for the CurrentDominanceWidget component

export interface DominanceData {
  totalMarketCap: number;
  btc: {
    marketCap: number;
    dominance: number;
  };
  eth: {
    marketCap: number;
    dominance: number;
  };
  stablecoins: {
    marketCap: number;
    dominance: number;
  };
  others: {
    marketCap: number;
    dominance: number;
  };
  timestamp: number;
}

export interface CurrentDominanceWidgetProps {
  data: DominanceData;
  /** Display mode: 'compact' for minimal space, 'normal' for full layout with pie chart */
  mode?: 'compact' | 'normal';
  /** Number of decimal places for percentage display (default: 1 for home screen) */
  percentagePrecision?: number;
}

export interface CompactViewProps {
  data: DominanceData;
  percentagePrecision: number;
}

export interface NormalViewProps {
  data: DominanceData;
  percentagePrecision: number;
}

export interface PieChartProps {
  data: DominanceData;
}

export interface CategoryCardProps {
  icon: string;
  label: string;
  dominance: number;
  marketCap: number;
  color: { light: string; dark: string };
  percentagePrecision: number;
}

