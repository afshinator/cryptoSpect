// components/current-volatility-widget/VolatilityScale.tsx
// Visual scale component showing volatility level ranges

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BorderRadius, Colors, Spacing } from '@/constants/theme';
import { StyleSheet } from 'react-native';
import { BADGE_OPACITY_HEX, SCALE_1H, SCALE_24H, SCALE_BAR_HEIGHT } from './constants';
import type { VolatilityScaleProps } from './types';

export function VolatilityScale({ timeframe, value }: VolatilityScaleProps) {
  const scale = timeframe === '1h' ? SCALE_1H : SCALE_24H;
  const maxValue = scale.HIGH_MAX * 1.5; // Show scale up to 1.5x HIGH threshold (for EXTREME range)

  // Calculate position percentage (capped at 100%)
  const position = Math.min((value / maxValue) * 100, 100);

  return (
    <ThemedView style={styles.scale} transparent>
      <ThemedText
        type="xsmall"
        lightColor={Colors.light.textSubtle}
        darkColor={Colors.dark.textSubtle}
        style={styles.scaleLabel}
      >
        {timeframe === '1h' ? '1-Hour' : '24-Hour'} scale
      </ThemedText>

      {/* Scale bar with segments */}
      <ThemedView style={styles.scaleBarContainer} transparent>
        {/* Background segments with colors */}
        <ThemedView style={styles.scaleBar} transparent>
          <ThemedView
            lightColor={`${Colors.light.textSubtle}${BADGE_OPACITY_HEX}`}
            darkColor={`${Colors.dark.textSubtle}${BADGE_OPACITY_HEX}`}
            style={[styles.scaleSegment, { flex: scale.LOW_MAX }]}
          />
          <ThemedView
            lightColor={`${Colors.light.success}${BADGE_OPACITY_HEX}`}
            darkColor={`${Colors.dark.success}${BADGE_OPACITY_HEX}`}
            style={[styles.scaleSegment, { flex: scale.NORMAL_MAX - scale.LOW_MAX }]}
          />
          <ThemedView
            lightColor={`${Colors.light.warning}${BADGE_OPACITY_HEX}`}
            darkColor={`${Colors.dark.warning}${BADGE_OPACITY_HEX}`}
            style={[styles.scaleSegment, { flex: scale.HIGH_MAX - scale.NORMAL_MAX }]}
          />
          <ThemedView
            lightColor={`${Colors.light.error}${BADGE_OPACITY_HEX}`}
            darkColor={`${Colors.dark.error}${BADGE_OPACITY_HEX}`}
            style={[styles.scaleSegment, { flex: maxValue - scale.HIGH_MAX }]}
          />
        </ThemedView>

        {/* Position indicator */}
        <ThemedView
          lightColor={Colors.light.tint}
          darkColor={Colors.dark.tint}
          style={[styles.scaleIndicator, { left: `${position}%` }]}
        />
      </ThemedView>

      {/* Labels */}
      <ThemedView style={styles.scaleLabels} transparent>
        <ThemedText
          type="xsmall"
          lightColor={Colors.light.textSubtle}
          darkColor={Colors.dark.textSubtle}
        >
          LOW
        </ThemedText>
        <ThemedText
          type="xsmall"
          lightColor={Colors.light.textSubtle}
          darkColor={Colors.dark.textSubtle}
        >
          NORMAL
        </ThemedText>
        <ThemedText
          type="xsmall"
          lightColor={Colors.light.textSubtle}
          darkColor={Colors.dark.textSubtle}
        >
          HIGH
        </ThemedText>
        <ThemedText
          type="xsmall"
          lightColor={Colors.light.textSubtle}
          darkColor={Colors.dark.textSubtle}
        >
          EXTREME
        </ThemedText>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  scale: {
    gap: Spacing.xs,
  },
  scaleLabel: {
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  scaleBarContainer: {
    position: 'relative',
    height: SCALE_BAR_HEIGHT,
  },
  scaleBar: {
    flexDirection: 'row',
    height: SCALE_BAR_HEIGHT,
    borderRadius: BorderRadius.sm,
    overflow: 'hidden',
  },
  scaleSegment: {
    height: '100%',
  },
  scaleIndicator: {
    position: 'absolute',
    top: -2,
    width: 3,
    height: SCALE_BAR_HEIGHT + 4,
    borderRadius: BorderRadius.sm,
    marginLeft: -1.5,
  },
  scaleLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xs,
  },
});

