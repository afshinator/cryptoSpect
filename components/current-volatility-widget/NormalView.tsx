// components/current-volatility-widget/NormalView.tsx
// Normal display mode for the volatility widget

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BorderRadius, Colors, Spacing } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { StyleSheet } from 'react-native';
import { DIVIDER_WIDTH, VOLATILITY_DECIMAL_PLACES } from './constants';
import { formatTimestamp } from './utils';
import { VolatilityBadge } from './VolatilityBadge';
import { VolatilityScale } from './VolatilityScale';
import type { NormalViewProps } from './types';

export function NormalView({ data, contextEmoji }: NormalViewProps) {
  return (
    <ThemedView transparent>
      <ThemedView style={styles.normalHeader} transparent>
        <ThemedText type="subtitle">Current Market Volatility</ThemedText>
        {contextEmoji && contextEmoji.length > 0 ? (
          <ThemedText type="xlarge" style={styles.normalEmoji}>
            {contextEmoji}
          </ThemedText>
        ) : null}
      </ThemedView>

      {/* Data Grid: 1h and 24h side by side with divider */}
      <ThemedView style={styles.normalDataGrid} transparent>
        {/* 1-Hour Section */}
        <ThemedView style={styles.normalDataColumn} transparent>
          <ThemedText
            type="small"
            lightColor={Colors.light.textSubtle}
            darkColor={Colors.dark.textSubtle}
            style={styles.normalColumnLabel}
          >
            1-Hour
          </ThemedText>
          <ThemedText type="title" style={styles.normalPercentage}>
            {data.volatility1h.toFixed(VOLATILITY_DECIMAL_PLACES)}%
          </ThemedText>
          <VolatilityBadge level={data.level1h} />
        </ThemedView>

        {/* Vertical Divider */}
        <ThemedView
          lightColor={Colors.light.border}
          darkColor={Colors.dark.border}
          style={styles.normalDivider}
        />

        {/* 24-Hour Section */}
        <ThemedView style={styles.normalDataColumn} transparent>
          <ThemedText
            type="small"
            lightColor={Colors.light.textSubtle}
            darkColor={Colors.dark.textSubtle}
            style={styles.normalColumnLabel}
          >
            24-Hour
          </ThemedText>
          <ThemedText type="title" style={styles.normalPercentage}>
            {data.volatility24h.toFixed(VOLATILITY_DECIMAL_PLACES)}%
          </ThemedText>
          <VolatilityBadge level={data.level24h} />
        </ThemedView>
      </ThemedView>

      {/* Scale Indicators */}
      <ThemedView style={styles.scaleContainer}>
        <VolatilityScale timeframe="1h" value={data.volatility1h} />
        <ThemedView style={styles.scaleSpacing} />
        <VolatilityScale timeframe="24h" value={data.volatility24h} />
      </ThemedView>

      {/* Last Updated */}
      <ThemedText
        type="xsmall"
        lightColor={Colors.light.textSubtle}
        darkColor={Colors.dark.textSubtle}
        style={styles.normalLastUpdated}
      >
        Last updated: {formatTimestamp(data.lastUpdated)}
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  normalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  normalEmoji: {
    marginLeft: Spacing.xs,
  },
  normalDataGrid: {
    flexDirection: 'row',
    alignItems: 'stretch',
    marginBottom: Spacing.lg,
  },
  normalDataColumn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  normalColumnLabel: {
    textAlign: 'center',
  },
  normalPercentage: {
    fontWeight: 'bold',
    textAlign: 'center',
  },
  normalDivider: {
    width: DIVIDER_WIDTH,
    marginHorizontal: Spacing.md,
  },
  normalLastUpdated: {
    textAlign: 'center',
    marginTop: Spacing.md,
  },
  scaleContainer: {
    marginBottom: Spacing.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
  scaleSpacing: {
    height: Spacing.md,
  },
});

