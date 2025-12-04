// components/current-volatility-widget/VolatilityBadge.tsx
// Badge component displaying volatility level with emoji

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BorderRadius, Colors, Spacing } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { StyleSheet } from 'react-native';
import { EMOJI_LEVEL } from './constants';
import type { VolatilityBadgeProps } from './types';

export function VolatilityBadge({
  level,
  compact,
  showEmoji = true,
}: VolatilityBadgeProps) {
  const getColors = () => {
    switch (level) {
      case 'LOW':
        return {
          light: Colors.light.textSubtle,
          dark: Colors.dark.textSubtle,
        };
      case 'NORMAL':
        return {
          light: Colors.light.success,
          dark: Colors.dark.success,
        };
      case 'HIGH':
        return {
          light: Colors.light.warning,
          dark: Colors.dark.warning,
        };
      case 'EXTREME':
        return {
          light: Colors.light.error,
          dark: Colors.dark.error,
        };
    }
  };

  const colors = getColors();
  const bgColor = useThemeColor(colors, 'textSubtle');
  const emoji = EMOJI_LEVEL[level];

  return (
    <ThemedView
      style={[
        styles.badge,
        compact && styles.badgeCompact,
        // {
        //   backgroundColor: `${bgColor}${BADGE_OPACITY_HEX}`,
        // },
      ]}
      transparent
    >
      {showEmoji && (
        <ThemedText type="large">
          {emoji}{' '}
        </ThemedText>
      )}
      <ThemedText
        type={compact ? 'xsmall' : 'small'}
        lightColor={colors.light}
        darkColor={colors.dark}
        style={styles.badgeText}
      >
        {level}
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
  badgeCompact: {
    paddingHorizontal: Spacing.xs / 2,
    paddingVertical: 2,
    alignSelf: 'center',
  },
  badgeText: {
    fontWeight: '600',
  },
});

