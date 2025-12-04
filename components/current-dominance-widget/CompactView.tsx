// components/current-dominance-widget/CompactView.tsx
// Compact display mode for the dominance widget

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, Spacing } from '@/constants/theme';
import { formatTimestamp } from '@/utils/formatTimestamp';
import { StyleSheet } from 'react-native';
import type { CompactViewProps } from './types';

export function CompactView({ data, percentagePrecision }: CompactViewProps) {
  return (
    <ThemedView style={styles.compactContainer} transparent>
      <ThemedView style={styles.compactRow}>
        {/* BTC */}
        <ThemedView style={styles.compactItem}>
          <ThemedText type="defaultSemiBold" style={styles.compactLabel}>
            BTC
          </ThemedText>
          <ThemedText type="large" style={styles.compactValue}>
            {data.btc.dominance.toFixed(percentagePrecision)}%
          </ThemedText>
        </ThemedView>

        <ThemedText type="default" lightColor={Colors.light.textSubtle} darkColor={Colors.dark.textSubtle}>
          |
        </ThemedText>

        {/* ETH */}
        <ThemedView style={styles.compactItem}>
          <ThemedText type="defaultSemiBold" style={styles.compactLabel}>
            ETH
          </ThemedText>
          <ThemedText type="large" style={styles.compactValue}>
            {data.eth.dominance.toFixed(percentagePrecision)}%
          </ThemedText>
        </ThemedView>
      </ThemedView>

      <ThemedView style={styles.compactLastUpdated}>
        <ThemedText
          type="xsmall"
          lightColor={Colors.light.textSubtle}
          darkColor={Colors.dark.textSubtle}
          style={styles.compactLabelBold}
        >
          Market Dominance
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
          {formatTimestamp(data.timestamp)}
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
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
    gap: Spacing.sm,
  },
  compactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  compactLabel: {
    marginRight: Spacing.xs / 2,
  },
  compactValue: {
    fontWeight: '600',
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

