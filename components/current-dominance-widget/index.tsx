// components/current-dominance-widget/index.tsx
// Main CurrentDominanceWidget component

import { BorderedSection } from '@/components/bordered-section';
import { HOME_SCREEN_PERCENTAGE_PRECISION } from '@/constants/displayPrecision';
import { Spacing } from '@/constants/theme';
import { CompactView } from './CompactView';
import { NormalView } from './NormalView';
import type { CurrentDominanceWidgetProps } from './types';

/**
 * Displays current market dominance metrics with BTC, ETH, Stablecoins, and Others.
 * Compact mode shows BTC & ETH only. Normal mode shows pie chart and all categories.
 */
export function CurrentDominanceWidget({
  data,
  mode = 'normal',
  percentagePrecision = HOME_SCREEN_PERCENTAGE_PRECISION,
}: CurrentDominanceWidgetProps) {
  return (
    <BorderedSection
      padding={mode === 'compact' ? Spacing.sm : Spacing.md}
      marginBottom={Spacing.md}
      backgroundEmoji="👑"
      emojiPlacement="upperLeft"
      emojiOpacity={0.3}
      emojiSize={30}
    >
      {mode === 'compact' ? (
        <CompactView data={data} percentagePrecision={percentagePrecision} />
      ) : (
        <NormalView data={data} percentagePrecision={percentagePrecision} />
      )}
    </BorderedSection>
  );
}

// Re-export types for convenience
export type { CurrentDominanceWidgetProps, DominanceData } from './types';

