// components/current-volatility-widget/CompactView.tsx
// Compact display mode for the volatility widget

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, Spacing } from '@/constants/theme';
import { StyleSheet } from 'react-native';
import type { CompactViewProps } from './types';
import { formatTimestamp } from './utils';
import { VolatilityBadge } from './VolatilityBadge';

export function CompactView({ data, contextEmoji, percentagePrecision }: CompactViewProps) {
  return (
    <ThemedView
      style={styles.compactContainer}
      transparent
    >
      <ThemedView style={styles.compactRow} transparent>
        <ThemedView style={styles.compactItemStacked} transparent>
          <ThemedView style={styles.compactValueRow} transparent>
            <ThemedText type="default" style={styles.compactLabel}>
              1h:
            </ThemedText>
            <ThemedText type="title" style={styles.compactValueTitle}>
              {data.volatility1h.toFixed(percentagePrecision)}%
            </ThemedText>
          </ThemedView>
          <VolatilityBadge level={data.level1h} compact />
        </ThemedView>

        <ThemedText type="default" lightColor={Colors.light.textSubtle} darkColor={Colors.dark.textSubtle}>
          |
        </ThemedText>

        <ThemedView style={styles.compactItemStacked} transparent>
          <ThemedView style={styles.compactValueRow} transparent>
            <ThemedText type="default" style={styles.compactLabel}>
              24h:
            </ThemedText>
            <ThemedText type="title" style={styles.compactValueTitle}>
              {data.volatility24h.toFixed(percentagePrecision)}%
            </ThemedText>
          </ThemedView>
          <VolatilityBadge level={data.level24h} compact />
        </ThemedView>

        {contextEmoji && contextEmoji.length > 0 ? (
          <ThemedText type="default" style={styles.compactEmoji}>
            {contextEmoji}
          </ThemedText>
        ) : null}
      </ThemedView>

      <ThemedView style={styles.compactLastUpdated}>
        <ThemedText
          type="xsmall"
          lightColor={Colors.light.textSubtle}
          darkColor={Colors.dark.textSubtle}
          style={styles.compactLabelBold}
        >
          Market Volatility
        </ThemedText>
        <ThemedText
          type="xsmall"
          lightColor={Colors.light.textSubtle}
          darkColor={Colors.dark.textSubtle}
        >
          {' • Updated: '}
        </ThemedText>
        <ThemedText
          type="xsmall"
          lightColor={Colors.light.textSubtle}
          darkColor={Colors.dark.textSubtle}
        >
          {formatTimestamp(data.lastUpdated)}
        </ThemedText>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  compactContainer: {
    alignItems: 'center',
  },
  compactRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
    gap: Spacing.lg,
  },
  compactItemStacked: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
  },
  compactValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: Spacing.xs / 2,
  },
  compactValueTitle: {
    fontWeight: 'bold',
    fontSize: 22,
  },
  compactLabel: {
    // Style for '1h:' and '24h:' labels
  },
  compactEmoji: {
    marginLeft: Spacing.xs,
  },
  compactLastUpdated: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  compactLabelBold: {
    fontWeight: 'bold',
  },
});

