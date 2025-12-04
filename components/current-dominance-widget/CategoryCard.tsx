// components/current-dominance-widget/CategoryCard.tsx
// Category card component for displaying individual category information

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BorderRadius, Colors, Spacing } from '@/constants/theme';
import { StyleSheet } from 'react-native';
import { formatMarketCap } from './utils';
import type { CategoryCardProps } from './types';

export function CategoryCard({
  icon,
  label,
  dominance,
  marketCap,
  color,
  percentagePrecision,
}: CategoryCardProps) {
  return (
    <ThemedView style={styles.categoryCard}>
      <ThemedView style={styles.categoryHeader}>
        <ThemedText type="large">{icon}</ThemedText>
        <ThemedView
          lightColor={color.light}
          darkColor={color.dark}
          style={styles.categoryDot}
        />
      </ThemedView>
      <ThemedText type="small" style={styles.categoryLabel}>
        {label}
      </ThemedText>
      <ThemedText type="large" style={styles.categoryDominance}>
        {dominance.toFixed(percentagePrecision)}%
      </ThemedText>
      <ThemedText
        type="xsmall"
        lightColor={Colors.light.textSubtle}
        darkColor={Colors.dark.textSubtle}
      >
        {formatMarketCap(marketCap)}
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  categoryCard: {
    flex: 1,
    alignItems: 'center',
    gap: Spacing.xs / 2,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs / 2,
  },
  categoryDot: {
    width: 8,
    height: 8,
    borderRadius: BorderRadius.full,
  },
  categoryLabel: {
    textAlign: 'center',
  },
  categoryDominance: {
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

