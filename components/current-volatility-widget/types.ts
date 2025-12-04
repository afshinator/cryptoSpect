// components/current-volatility-widget/types.ts
// Type definitions for the CurrentVolatilityWidget component

export type VolatilityLevel = 'LOW' | 'NORMAL' | 'HIGH' | 'EXTREME';

export interface VolatilityData {
  volatility1h: number;
  volatility24h: number;
  level1h: VolatilityLevel;
  level24h: VolatilityLevel;
  lastUpdated?: string; // ISO timestamp or relative time string
}

export interface CurrentVolatilityWidgetProps {
  data: VolatilityData;
  /** Display mode: 'compact' for minimal space, 'normal' for spacious layout */
  mode?: 'compact' | 'normal';
  /** Optional callback when widget is tapped */
  onPress?: () => void;
  /** Placement of the background emoji (default: 'upperRight') */
  emojiPlacement?: 'center' | 'upperRight' | 'upperLeft';
}

export interface VolatilityScaleProps {
  timeframe: '1h' | '24h';
  value: number;
}

export interface VolatilityBadgeProps {
  level: VolatilityLevel;
  compact?: boolean;
  showEmoji?: boolean;
}

export interface CompactViewProps {
  data: VolatilityData;
  contextEmoji: string;
}

export interface NormalViewProps {
  data: VolatilityData;
  contextEmoji: string;
}

