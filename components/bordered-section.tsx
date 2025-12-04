// components/bordered-section.tsx
// Reusable bordered section component for consistent styling across screens

import { ThemedView, ThemedViewProps } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { ViewStyle } from 'react-native';

export interface BorderedSectionProps extends Omit<ThemedViewProps, 'style'> {
  /** Padding inside the section (default: 16) */
  padding?: number;
  /** Custom background color (light and dark) */
  backgroundColor?: { light?: string; dark?: string };
  /** Custom border color (light and dark). Defaults to theme border color */
  borderColor?: { light?: string; dark?: string };
  /** Margin bottom (default: 24) */
  marginBottom?: number;
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
  };

  return (
    <ThemedView
      style={[sectionStyle, style]}
      lightColor={lightColor || backgroundColor?.light}
      darkColor={darkColor || backgroundColor?.dark}
      {...otherProps}
    >
      {children}
    </ThemedView>
  );
}

