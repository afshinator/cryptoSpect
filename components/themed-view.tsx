// components/themed-view.tsx

import { StyleSheet, View, type ViewProps } from 'react-native';

import { useThemeColor } from '@/hooks/use-theme-color';

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
  /** Shortcut prop: sets both lightColor and darkColor to "transparent" */
  transparent?: boolean;
};

export function ThemedView({ style, lightColor, darkColor, transparent, ...otherProps }: ThemedViewProps) {
  // If transparent prop is true, override lightColor and darkColor
  const finalLightColor = transparent ? 'transparent' : lightColor;
  const finalDarkColor = transparent ? 'transparent' : darkColor;
  
  const backgroundColor = useThemeColor({ light: finalLightColor, dark: finalDarkColor }, 'background');

  // Combine internal style and external style prop into one array
  const allStyles = [
    { backgroundColor },
    style,
  ];

  // FIXES: Use StyleSheet.flatten to guarantee a single style object.
  // This resolves the "Indexed property setter is not supported" TypeError on Web.
  const mergedStyle = StyleSheet.flatten(allStyles);

  return <View style={mergedStyle} {...otherProps} />;
}