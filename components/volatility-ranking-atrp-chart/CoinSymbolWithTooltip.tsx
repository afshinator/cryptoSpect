// components/volatility-ranking-atrp-chart/CoinSymbolWithTooltip.tsx
// Tooltip component for displaying full coin names on hover (web only)

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, Spacing } from '@/constants/theme';
import React, { useState } from 'react';
import { Platform, Pressable, StyleSheet, Text } from 'react-native';
import type { CoinSymbolWithTooltipProps } from './types';

/**
 * Component that displays a coin symbol with an optional tooltip showing the full coin name
 * Tooltip only appears on web platforms when hovering over the symbol
 */
export const CoinSymbolWithTooltip: React.FC<CoinSymbolWithTooltipProps> = ({
  symbol,
  coinName,
  textColor,
  textStyle,
}) => {
  const [showTooltip, setShowTooltip] = useState(false);

  // Only show tooltip on web and if coin name is available
  const canShowTooltip = Platform.OS === 'web' && coinName;

  if (!canShowTooltip) {
    return <Text style={[textStyle, { color: textColor }]}>{symbol}</Text>;
  }

  // For web, use Pressable with hover events (React Native Web supports these)
  const webHoverProps: any = Platform.OS === 'web' ? {
    onHoverIn: () => setShowTooltip(true),
    onHoverOut: () => setShowTooltip(false),
  } : {};

  return (
    <Pressable style={styles.tooltipContainer} {...webHoverProps}>
      <Text style={[textStyle, { color: textColor }]}>{symbol}</Text>
      {showTooltip && coinName && (
        <ThemedView
          lightColor={Colors.light.cardBackground}
          darkColor={Colors.dark.cardBackground}
          style={styles.tooltip}
        >
          <ThemedText
            type="xsmall"
            lightColor={Colors.light.text}
            darkColor={Colors.dark.text}
            style={styles.tooltipText}
          >
            {coinName}
          </ThemedText>
        </ThemedView>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  tooltipContainer: {
    position: 'relative' as const,
  },
  tooltip: {
    position: 'absolute' as const,
    bottom: Platform.OS === 'web' ? '100%' : undefined,
    top: Platform.OS === 'web' ? undefined : -30,
    left: 0,
    marginBottom: Platform.OS === 'web' ? 4 : 0,
    padding: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    borderRadius: 4,
    zIndex: 1000,
    minWidth: 100,
    maxWidth: 200,
    borderWidth: 1,
    // Add shadow for better visibility on web
    ...(Platform.OS === 'web' ? {
      boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.3)',
    } : {}),
  },
  tooltipText: {
    textAlign: 'center',
  },
});

