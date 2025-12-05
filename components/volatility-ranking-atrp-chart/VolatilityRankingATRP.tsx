/* components/volatility-ranking-atrp-chart/VolatilityRankingATRP.tsx
 *
 * DESCRIPTION:
 * This React Native Expo component displays a ranking of cryptocurrencies based on their
 * 30-day Average True Range Percentage (ATRP).
 *
 * CORE LOGIC:
 * 1. Data Filtering: It processes the raw volatility data, explicitly removing known
 * stablecoins (as defined in 'constants/stablecoins.ts') to focus on volatile assets.
 * 2. Metric Extraction: It extracts the 30-day ATRP for the remaining coins.
 * 3. Ranking: The list is sorted in descending order of 30-day ATRP (highest volatility first).
 * 4. Visualization: It renders the list with horizontal bar chart visualizations, where bar
 * width is relative to the highest ATRP value in the filtered list.
 * 5. Theming: Uses the custom 'useThemeColor' hook and provided theme constants for styling,
 * with optional props for color overrides.
 *
 * DEPENDENCIES:
 * - constants/theme.ts
 * - hooks/use-theme-color.ts
 * - constants/stablecoins.ts
 */

import { Colors, Opacity, Spacing, typographySizes } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useLatestStore } from '@/stores/latestStore';
import React, { useMemo } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import { CoinSymbolWithTooltip } from './CoinSymbolWithTooltip';
import { MOCK_VOLATILITY_DATA } from './constants';
import type { RankedCoinItem, VolatilityRankingProps } from './types';
import { buildSymbolToName, createGetShortSymbol, getStablecoinSymbols, processRankedData } from './utils';

/**
 * Main component that displays a ranking of cryptocurrencies by volatility (ATRP)
 */
export const VolatilityRankingATRP: React.FC<VolatilityRankingProps> = ({
  containerStyle,
  titleColor,
  textColor,
  highVolColor,
  lowVolColor,
  data = MOCK_VOLATILITY_DATA,
  mode = 'normal',
  description,
}) => {
  // --- THEME & COLOR HOOKS ---
  const containerBg = useThemeColor({}, 'cardBackground');
  const primaryText = useThemeColor(textColor || {}, 'text');
  const secondaryText = useThemeColor(textColor || {}, 'textSubtle');
  const titleDefaultColor = useThemeColor(titleColor || {}, 'textAlt');
  const highColor = useThemeColor(highVolColor || {}, 'error');
  const lowColor = useThemeColor(lowVolColor || {}, 'success');
  const neutralBarColor = useThemeColor({}, 'inputBackground');
  const borderColor = useThemeColor({}, 'border');
  const tintColor = useThemeColor({}, 'tint');

  // --- GET COIN MAPS AND MARKETS DATA FROM STORE ---
  const { coinMaps, marketsData } = useLatestStore();

  // --- BUILD SYMBOL TO NAME MAP ---
  const symbolToName = useMemo(
    () => buildSymbolToName(marketsData?.data, coinMaps),
    [marketsData, coinMaps]
  );

  // --- STABLECOIN FILTERING LOGIC ---
  const stablecoinSymbols = useMemo(() => getStablecoinSymbols(), []);

  // --- SYMBOL MAPPING FUNCTION ---
  const getShortSymbol = useMemo(
    () => createGetShortSymbol(coinMaps),
    [coinMaps]
  );

  // --- DATA PROCESSING & RANKING ---
  const rankedData = useMemo(
    () => processRankedData(
      data,
      getShortSymbol,
      stablecoinSymbols,
      symbolToName,
      coinMaps,
      marketsData?.data
    ),
    [data, getShortSymbol, stablecoinSymbols, symbolToName, coinMaps, marketsData]
  );

  const { ranked, maxAtrp, minAtrp } = rankedData;
  const range = maxAtrp - minAtrp;

  if (!ranked || ranked.length === 0) {
    return (
      <View style={[styles.container, containerStyle, { backgroundColor: containerBg, justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color={titleDefaultColor} />
        <Text style={[styles.title, { color: primaryText, textAlign: 'center' }]}>No Relevant Volatility Data Found</Text>
      </View>
    );
  }

  // --- RENDER ITEM ---
  const renderItemWithTooltip = ({ item, index }: { item: RankedCoinItem; index: number }) => {
    // Bar width is relative to the *maximum* ATRP value in the current list
    const barWidth = (item.atrp_30d / maxAtrp) * 100;

    // Simple logic: Use highColor for top 2, lowColor for bottom 2, and tint for the rest.
    let barColor = neutralBarColor;
    if (index < 2) {
      barColor = highColor;
    } else if (index >= ranked.length - 2) {
      barColor = lowColor;
    } else {
      // Use the tint color for middle-ranked coins
      barColor = tintColor;
    }

    return (
      <View style={styles.itemContainer}>
        {/* Rank & Symbol */}
        <View style={styles.rankAndSymbol}>
          <Text style={[styles.rank, { color: secondaryText }]}>{index + 1}.</Text>
          <CoinSymbolWithTooltip 
            symbol={item.symbol}
            coinName={item.coinName}
            textColor={primaryText}
            textStyle={styles.symbol}
          />
        </View>

        {/* Bar Chart Representation */}
        <View style={styles.barBackground}>
          <View
            style={[
              styles.bar,
              { width: `${barWidth}%`, backgroundColor: barColor },
            ]}
          />
        </View>

        {/* Value */}
        <Text style={[styles.atrpValue, { color: primaryText }]}>
          {item.atrp_30d.toFixed(2)}%
        </Text>
      </View>
    );
  };

  return (
    <View style={[styles.container, containerStyle, { backgroundColor: containerBg, borderColor: borderColor }]}>
      <Text style={[styles.title, { color: titleDefaultColor }]}>
        30-Day Volatility Ranking (ATRP %)
      </Text>
      {description && (
        <Text style={[styles.description, { color: secondaryText }]}>
          {description}
        </Text>
      )}
      <Text style={[styles.subtitle, { color: secondaryText }]}>
        Excluding Stablecoins (Highest Volatility First)
      </Text>
      
      {/* Legend (only in normal mode) */}
      {mode === 'normal' && (
        <View style={[styles.legendContainer, { backgroundColor: neutralBarColor }]}>
          <View style={styles.legendItem}>
            <View style={[styles.legendColorBox, { backgroundColor: highColor }]} />
            <Text style={[styles.legendText, { color: secondaryText }]}>High Volatility (Top 2)</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColorBox, { backgroundColor: tintColor }]} />
            <Text style={[styles.legendText, { color: secondaryText }]}>Medium Volatility</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColorBox, { backgroundColor: lowColor }]} />
            <Text style={[styles.legendText, { color: secondaryText }]}>Low Volatility (Bottom 2)</Text>
          </View>
        </View>
      )}

      <FlatList
        data={ranked}
        renderItem={renderItemWithTooltip}
        keyExtractor={item => item.symbol}
        style={styles.list}
        ItemSeparatorComponent={() => <View style={[styles.separator, { backgroundColor: borderColor }]} />}
      />
    </View>
  );
};

// --- STYLESHEET ---

const styles = StyleSheet.create({
  container: {
    padding: Spacing.md,
    margin: Spacing.md,
    borderRadius: Spacing.sm,
    borderWidth: 1,
    boxShadow: '0px 2px 4px 0px rgba(0, 0, 0, 0.1)',
  },
  title: {
    ...typographySizes.subtitle,
    marginBottom: Spacing.xs,
  },
  description: {
    ...typographySizes.small,
    marginBottom: Spacing.xs,
    fontStyle: 'italic',
  },
  subtitle: {
    ...typographySizes.small,
    marginBottom: Spacing.md,
  },
  legendContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    marginBottom: Spacing.md,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.xs,
    borderRadius: Spacing.xs,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  legendColorBox: {
    width: 12,
    height: 12,
    borderRadius: 2,
  },
  legendText: {
    ...typographySizes.xsmall,
  },
  list: {
    flexGrow: 0,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  rankAndSymbol: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 90, // Fixed width for Rank and Symbol
  },
  rank: {
    ...typographySizes.defaultSemiBold,
    width: 25,
    textAlign: 'right',
    marginRight: Spacing.xs,
  },
  symbol: {
    ...typographySizes.default,
    textTransform: 'uppercase',
  },
  barBackground: {
    flex: 1,
    height: 10,
    backgroundColor: Colors.dark.inputBackground, // Use a neutral background color for the bar track
    borderRadius: 5,
    marginHorizontal: Spacing.md,
    overflow: 'hidden',
  },
  bar: {
    height: '100%',
    borderRadius: 5,
  },
  atrpValue: {
    ...typographySizes.defaultSemiBold,
    width: 60, // Fixed width for value
    textAlign: 'right',
  },
  separator: {
    height: 1,
    opacity: Opacity.gridLine,
  },
});
