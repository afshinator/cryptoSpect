// components/bordered-section.tsx
// Reusable bordered section component for consistent styling across screens

import { ThemedView, ThemedViewProps } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';

export type EmojiPlacement = 'center' | 'upperRight';

export interface BorderedSectionProps extends Omit<ThemedViewProps, 'style'> {
  /** Padding inside the section (default: 16) */
  padding?: number;
  /** Custom background color (light and dark) */
  backgroundColor?: { light?: string; dark?: string };
  /** Custom border color (light and dark). Defaults to theme border color */
  borderColor?: { light?: string; dark?: string };
  /** Margin bottom (default: 24) */
  marginBottom?: number;
  /** Optional emoji to display in the background, prominently large, under all content */
  backgroundEmoji?: string;
  /** Opacity for the background emoji (default: 0.1) */
  emojiOpacity?: number;
  /** Placement of the background emoji (default: 'center') */
  emojiPlacement?: EmojiPlacement;
  /** Size of the background emoji in pixels (default: 120) */
  emojiSize?: number;
  /** Additional styles to apply */
  style?: ViewStyle;
}

/**
 * A reusable bordered section component with consistent styling
 * Used for grouping related settings/controls in configuration screens
 */
export function BorderedSection({
  padding = 16,
  backgroundColor,
  borderColor,
  marginBottom = 24,
  backgroundEmoji,
  emojiOpacity = 0.1,
  emojiPlacement = 'center',
  emojiSize = 120,
  style,
  lightColor,
  darkColor,
  children,
  ...otherProps
}: BorderedSectionProps) {
  // Use provided borderColor or fall back to theme border color
  const border = borderColor
    ? useThemeColor(borderColor, 'border')
    : useThemeColor({}, 'border');

  const sectionStyle: ViewStyle = {
    padding,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: border,
    marginBottom,
    overflow: 'hidden', // Ensure emoji doesn't overflow rounded corners
  };

  // Determine emoji container style based on placement
  const emojiContainerStyle = emojiPlacement === 'upperRight' 
    ? styles.emojiContainerUpperRight 
    : styles.emojiContainerCenter;

  return (
    <ThemedView
      style={[sectionStyle, style]}
      lightColor={lightColor || backgroundColor?.light}
      darkColor={darkColor || backgroundColor?.dark}
      {...otherProps}
    >
      {backgroundEmoji && (
        <View style={emojiContainerStyle} pointerEvents="none">
          <Text style={[styles.emoji, { opacity: emojiOpacity, fontSize: emojiSize }]}>
            {backgroundEmoji}
          </Text>
        </View>
      )}
      <View style={styles.contentContainer}>
        {children}
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  emojiContainerCenter: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
    zIndex: 0,
  },
  emojiContainerUpperRight: {
    position: 'absolute',
    top: 0,
    right: 0,
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 8,
    paddingRight: 8,
    zIndex: 0,
  },
  emoji: {
    textAlign: 'center',
  },
  contentContainer: {
    position: 'relative',
    zIndex: 1,
  },
});

