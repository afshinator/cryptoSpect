// components/current-dominance-widget/NormalView.tsx
// Normal display mode for the dominance widget

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, Spacing } from '@/constants/theme';
import { formatTimestamp } from '@/utils/formatTimestamp';
import { Platform, StyleSheet } from 'react-native';
import { CategoryCard } from './CategoryCard';
import { COLORS, ICON_BTC, ICON_ETH, ICON_OTHERS, ICON_STABLECOINS } from './constants';
import { PieChart } from './PieChart';
import type { NormalViewProps } from './types';
import { formatMarketCap } from './utils';

export function NormalView({ data, percentagePrecision }: NormalViewProps) {
  return (
    <ThemedView transparent>
      {/* Header */}
      <ThemedView style={styles.normalHeader} transparent>
        <ThemedText type="subtitle">Current Market Dominance</ThemedText>
      </ThemedView>

      {Platform.OS === 'web' ? (
        /* Desktop: 5 columns in one row - BTC, ETH, Pie Chart, Stablecoins, Others */
        <ThemedView style={styles.desktopRow}>
          <CategoryCard
            icon={ICON_BTC}
            label="Bitcoin"
            dominance={data.btc.dominance}
            marketCap={data.btc.marketCap}
            color={COLORS.BTC}
            percentagePrecision={percentagePrecision}
          />
          <CategoryCard
            icon={ICON_ETH}
            label="Ethereum"
            dominance={data.eth.dominance}
            marketCap={data.eth.marketCap}
            color={COLORS.ETH}
            percentagePrecision={percentagePrecision}
          />
          <ThemedView style={styles.pieContainer}>
            <PieChart data={data} />
          </ThemedView>
          <CategoryCard
            icon={ICON_STABLECOINS}
            label="Stablecoins"
            dominance={data.stablecoins.dominance}
            marketCap={data.stablecoins.marketCap}
            color={COLORS.STABLECOINS}
            percentagePrecision={percentagePrecision}
          />
          <CategoryCard
            icon={ICON_OTHERS}
            label="Others"
            dominance={data.others.dominance}
            marketCap={data.others.marketCap}
            color={COLORS.OTHERS}
            percentagePrecision={percentagePrecision}
          />
        </ThemedView>
      ) : (
        /* Mobile: Pie Chart above, Categories in row below */
        <>
          <ThemedView style={styles.pieContainer}>
            <PieChart data={data} />
          </ThemedView>
          <ThemedView style={styles.categoryGrid}>
            <ThemedView style={styles.mobileCategoryCard}>
              <CategoryCard
                icon={ICON_BTC}
                label="Bitcoin"
                dominance={data.btc.dominance}
                marketCap={data.btc.marketCap}
                color={COLORS.BTC}
                percentagePrecision={percentagePrecision}
              />
            </ThemedView>
            <ThemedView style={styles.mobileCategoryCard}>
              <CategoryCard
                icon={ICON_ETH}
                label="Ethereum"
                dominance={data.eth.dominance}
                marketCap={data.eth.marketCap}
                color={COLORS.ETH}
                percentagePrecision={percentagePrecision}
              />
            </ThemedView>
            <ThemedView style={styles.mobileCategoryCard}>
              <CategoryCard
                icon={ICON_STABLECOINS}
                label="Stable"
                dominance={data.stablecoins.dominance}
                marketCap={data.stablecoins.marketCap}
                color={COLORS.STABLECOINS}
                percentagePrecision={percentagePrecision}
              />
            </ThemedView>
            <ThemedView style={styles.mobileCategoryCard}>
              <CategoryCard
                icon={ICON_OTHERS}
                label="Others"
                dominance={data.others.dominance}
                marketCap={data.others.marketCap}
                color={COLORS.OTHERS}
                percentagePrecision={percentagePrecision}
              />
            </ThemedView>
          </ThemedView>
        </>
      )}

      {/* Total Market Cap */}
      <ThemedView style={styles.totalContainer}>
        <ThemedText
          type="small"
          lightColor={Colors.light.textSubtle}
          darkColor={Colors.dark.textSubtle}
        >
          Total Market Cap
        </ThemedText>
        <ThemedText type="large" style={styles.totalValue}>
          {formatMarketCap(data.totalMarketCap)}
        </ThemedText>
      </ThemedView>

      {/* Last Updated */}
      <ThemedText
        type="xsmall"
        lightColor={Colors.light.textSubtle}
        darkColor={Colors.dark.textSubtle}
        style={styles.normalLastUpdated}
      >
        Updated: {formatTimestamp(data.timestamp)}
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  normalHeader: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  desktopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
    width: '100%',
  },
  pieContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    minWidth: 160, // Ensure pie chart has minimum width
  },
  categoryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 0,
    marginBottom: Spacing.lg,
    width: '100%',
  },
  mobileCategoryCard: {
    flex: 1,
    minWidth: 0, // Allow cards to shrink below content size
  },
  totalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    // marginBottom: Spacing.md,
    // paddingTop: Spacing.md,
    borderTopWidth: 0.2,
    borderTopColor: Colors.light.tabIconDefault,
    borderStyle:'dashed',
  },
  totalValue: {
    fontWeight: 'bold',
  },
  normalLastUpdated: {
    textAlign: 'center',
  },
});

