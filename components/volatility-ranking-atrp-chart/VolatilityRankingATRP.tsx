/* components/VolatilityRankingATRP.tsx
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

import { CRYPTO_SYMBOL_MAP } from '@/constants/cryptoSymbolsMap';
import { stablecoins } from '@/constants/stablecoins';
import { Colors, Opacity, Spacing, typographySizes } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import React, { useMemo } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View, ViewStyle } from 'react-native';

// --- DATA STRUCTURES (Mocked) ---

interface VolatilityResult {
  period: number;
  vwatr: number;
  atrp: number; // The metric used for ranking
}

interface CoinVolatility {
  symbol: string;
  results: VolatilityResult[];
}

interface VolatilityData {
  type: string;
  bag: string;
  periods: number[];
  maxPeriod: number;
  timestamp: number;
  data: CoinVolatility[];
}

// Mock Data Structure
const MOCK_VOLATILITY_DATA: VolatilityData = {
  type: "atrp",
  bag: "top20_bag",
  periods: [7, 14, 30],
  maxPeriod: 30,
  timestamp: Date.now(),
  data: [
    // High Volatility / Non-Stablecoins (Sorted by 30d ATRP for the list)
    { symbol: "DOT", results: [{ period: 30, vwatr: 0.15, atrp: 7.92 }] }, // Highest
    { symbol: "ADA", results: [{ period: 30, vwatr: 0.035, atrp: 7.64 }] },
    { symbol: "LINK", results: [{ period: 30, vwatr: 0.99, atrp: 7.08 }] },
    { symbol: "DOGE", results: [{ period: 30, vwatr: 0.01, atrp: 6.99 }] },
    { symbol: "SOL", results: [{ period: 30, vwatr: 9.85, atrp: 6.77 }] },
    { symbol: "XRP", results: [{ period: 30, vwatr: 0.14, atrp: 6.47 }] },
    { symbol: "ETH", results: [{ period: 30, vwatr: 211.99, atrp: 6.53 }] },
    { symbol: "BNB", results: [{ period: 30, vwatr: 47.96, atrp: 5.08 }] },
    { symbol: "BTC", results: [{ period: 30, vwatr: 4069.72, atrp: 4.33 }] }, // Lowest Non-Stable
    // Stablecoins (to be filtered out)
    { symbol: "USDT", results: [{ period: 30, vwatr: 0.0008, atrp: 0.07 }] },
    { symbol: "USDC", results: [{ period: 30, vwatr: 0.0002, atrp: 0.03 }] },
    { symbol: "DAI", results: [{ period: 30, vwatr: 0.0005, atrp: 0.05 }] },
    { symbol: "TUSD", results: [{ period: 30, vwatr: 0.0012, atrp: 0.15 }] },
    { symbol: "EGLD", results: [{ period: 30, vwatr: 0.5, atrp: 7.15 }] }, // Another non-stable
  ],
};

// --- COMPONENT PROPS & STYLING ---

interface VolatilityRankingProps {
  /** Optional override for the background color of the main card/container. */
  containerStyle?: ViewStyle;
  /** Optional override for the title text color. */
  titleColor?: { light?: string; dark?: string };
  /** Optional override for the list item text color. */
  textColor?: { light?: string; dark?: string };
  /** Optional override for the color of the highest volatility bar. */
  highVolColor?: { light?: string; dark?: string };
  /** Optional override for the color of the lowest volatility bar. */
  lowVolColor?: { light?: string; dark?: string };
  /** Optional data source (defaults to MOCK_VOLATILITY_DATA for demo) */
  data?: VolatilityData;
}

// --- MAIN COMPONENT ---

export const VolatilityRankingATRP: React.FC<VolatilityRankingProps> = ({
  containerStyle,
  titleColor,
  textColor,
  highVolColor,
  lowVolColor,
  data = MOCK_VOLATILITY_DATA,
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

  // --- STABLECOIN FILTERING LOGIC ---
  const stablecoinSymbols = useMemo(() => {
    const symbols = new Set(stablecoins.map(s => s.symbol.toUpperCase()));
    // Add additional stablecoin symbols that should be filtered out
    symbols.add('USD');
    symbols.add('USDS');
    return symbols;
  }, []);

  // --- SYMBOL MAPPING FUNCTION ---
  // Maps long coin names to short symbols using CRYPTO_SYMBOL_MAP, with fallback to original value
  const getShortSymbol = useMemo(() => {
    const mapValues = new Set(Object.values(CRYPTO_SYMBOL_MAP).map(v => v.toUpperCase()));
    // Create a case-insensitive lookup map for keys (long names)
    const keyMap = new Map<string, string>();
    Object.keys(CRYPTO_SYMBOL_MAP).forEach(key => {
      keyMap.set(key.toUpperCase(), CRYPTO_SYMBOL_MAP[key as keyof typeof CRYPTO_SYMBOL_MAP]);
    });
    
    return (coinNameOrSymbol: string): string => {
      const upperInput = coinNameOrSymbol.toUpperCase();
      
      // Check if it's already a short symbol (exists as a value in the map, case-insensitive)
      if (mapValues.has(upperInput)) {
        return upperInput;
      }
      
      // Try to find it as a key in the map (long name like "Bitcoin", "Ethereum") - case-insensitive
      const foundSymbol = keyMap.get(upperInput);
      if (foundSymbol) {
        return foundSymbol;
      }
      
      // Fallback to original value (uppercase for consistency)
      // This handles cases where API returns lowercase symbols like "btc" -> "BTC"
      return upperInput;
    };
  }, []);

  // --- DATA PROCESSING & RANKING ---
  const rankedData = useMemo(() => {
    // 1. Filter out stablecoins by symbol (using short symbol for comparison)
    const filteredData = data.data.filter(coin => {
      const shortSymbol = getShortSymbol(coin.symbol);
      // Filter based on the provided stablecoins list
      return !stablecoinSymbols.has(shortSymbol);
    });

    // 2. Extract the 30-day ATRP, map to short symbols, and sort
    const ranked = filteredData
      .map(coin => {
        const result30d = coin.results.find(r => r.period === 30);
        const shortSymbol = getShortSymbol(coin.symbol);
        return {
          symbol: shortSymbol,
          atrp_30d: result30d?.atrp || 0,
        };
      })
      .filter(item => item.atrp_30d > 0) // Remove any with zero volatility
      .sort((a, b) => b.atrp_30d - a.atrp_30d); // Sort descending (Highest volatility first)

    // 3. Calculate min/max for bar scaling/coloring
    const maxAtrp = ranked.length > 0 ? ranked[0].atrp_30d : 1;
    const minAtrp = ranked.length > 0 ? ranked[ranked.length - 1].atrp_30d : 0;

    return { ranked, maxAtrp, minAtrp };
  }, [data.data, stablecoinSymbols, getShortSymbol]);

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
  const renderItem = ({ item, index }: { item: { symbol: string; atrp_30d: number }; index: number }) => {
    // Bar width is relative to the *maximum* ATRP value in the current list
    const barWidth = (item.atrp_30d / maxAtrp) * 100;

    // Linear interpolation for color between low and high based on the current item's rank
    const colorRatio = range > 0 ? (item.atrp_30d - minAtrp) / range : 0;

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
          <Text style={[styles.symbol, { color: primaryText }]}>{item.symbol}</Text>
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
      <Text style={[styles.subtitle, { color: secondaryText }]}>
        Excluding Stablecoins (Highest Volatility First)
      </Text>
      <FlatList
        data={ranked}
        renderItem={renderItem}
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
  subtitle: {
    ...typographySizes.small,
    marginBottom: Spacing.md,
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
  }
});