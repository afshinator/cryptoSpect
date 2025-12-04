// components/bordered-section.tsx
// Reusable bordered section component for consistent styling across screens

import { ThemedView, ThemedViewProps } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Platform, StyleSheet, Text, View, ViewStyle } from 'react-native';

export type EmojiPlacement = 'center' | 'upperRight' | 'upperLeft';
export type BorderType = 'default' | 'double' | 'dashed' | 'thick';

export interface BorderedSectionProps extends Omit<ThemedViewProps, 'style'> {
  /** Padding inside the section (default: 16) */
  padding?: number;
  /** Custom background color (light and dark) */
  backgroundColor?: { light?: string; dark?: string };
  /** Custom border color (light and dark). Defaults to theme border color */
  borderColor?: { light?: string; dark?: string };
  /** Border type/style (default: 'default') */
  borderType?: BorderType;
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
  borderType = 'default',
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

  // Base style for all border types
  const baseStyle: ViewStyle = {
    padding,
    borderRadius: 8,
    marginBottom,
    overflow: 'hidden', // Ensure emoji doesn't overflow rounded corners
  };

  // Determine emoji container style based on placement
  const getEmojiContainerStyle = (): ViewStyle => {
    const baseStyle = 
      emojiPlacement === 'upperRight' 
        ? styles.emojiContainerUpperRight 
        : emojiPlacement === 'upperLeft'
        ? styles.emojiContainerUpperLeft
        : styles.emojiContainerCenter;
    
    // Apply padding only on desktop for upperLeft placement
    if (emojiPlacement === 'upperLeft' && Platform.OS === 'web') {
      return {
        ...baseStyle,
        paddingTop: 8,
        paddingLeft: 8,
      };
    }
    
    return baseStyle;
  };
  
  const emojiContainerStyle = getEmojiContainerStyle();

  // For double border, we need to wrap in an additional view
  if (borderType === 'double') {
    const outerBorderStyle: ViewStyle = {
      borderWidth: 1,
      borderColor: border,
      borderRadius: 8,
      marginBottom,
      padding: 2, // Gap between borders
    };

    const innerBorderStyle: ViewStyle = {
      ...baseStyle,
      borderWidth: 1,
      borderColor: border,
      marginBottom: 0, // Reset margin since parent handles it
    };

    return (
      <ThemedView
        style={[outerBorderStyle, style]}
        {...otherProps}
      >
        <ThemedView
          style={innerBorderStyle}
          lightColor={lightColor || backgroundColor?.light}
          darkColor={darkColor || backgroundColor?.dark}
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
      </ThemedView>
    );
  }

  // Determine border style based on borderType for non-double borders
  const getBorderStyle = (): ViewStyle => {
    switch (borderType) {
      case 'dashed':
        return {
          ...baseStyle,
          borderWidth: 1,
          borderColor: border,
          borderStyle: 'dashed',
        };
      case 'thick':
        return {
          ...baseStyle,
          borderWidth: 3,
          borderColor: border,
        };
      case 'default':
      default:
        return {
          ...baseStyle,
          borderWidth: 1,
          borderColor: border,
        };
    }
  };

  const sectionStyle: ViewStyle = getBorderStyle();

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
  emojiContainerUpperLeft: {
    position: 'absolute',
    top: 0,
    left: 0,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
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

