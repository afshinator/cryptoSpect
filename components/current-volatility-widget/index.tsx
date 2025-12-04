// components/current-volatility-widget/index.tsx
// Main CurrentVolatilityWidget component

import { BorderedSection } from '@/components/bordered-section';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, Spacing } from '@/constants/theme';
import { useState } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { CompactView } from './CompactView';
import { BACKGROUND_OPACITY_HEX, TOOLTIP_AUTO_DISMISS_MS, TOOLTIP_BG_OPACITY } from './constants';
import { NormalView } from './NormalView';
import type { CurrentVolatilityWidgetProps } from './types';
import { calculateAverageSeverity, getSeverityColor, getVolatilityContext } from './utils';

/**
 * Displays current market volatility metrics with 1h and 24h data.
 * Shows contextual emoji for sustained vs short-term volatility spikes.
 */
export function CurrentVolatilityWidget({
  data,
  mode = 'normal',
  onPress,
}: CurrentVolatilityWidgetProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  // Calculate background color based on average severity
  const avgSeverity = calculateAverageSeverity(data.level1h, data.level24h);
  const baseColor = getSeverityColor(avgSeverity);
  const widgetBackgroundColor = {
    light: `${baseColor.light}${BACKGROUND_OPACITY_HEX}`,
    dark: `${baseColor.dark}${BACKGROUND_OPACITY_HEX}`,
  };

  // Determine volatility context (emoji and text)
  const { contextEmoji, contextText } = getVolatilityContext(data.level1h, data.level24h);

  const handlePress = () => {
    if (contextText) {
      setShowTooltip(true);
      setTimeout(() => setShowTooltip(false), TOOLTIP_AUTO_DISMISS_MS);
    }
    onPress?.();
  };

  return (
    <TouchableOpacity activeOpacity={0.7} onPress={handlePress} disabled={!contextText}>
      <BorderedSection
        padding={mode === 'compact' ? Spacing.sm : Spacing.md}
        marginBottom={Spacing.md}
        backgroundColor={widgetBackgroundColor}
        backgroundEmoji="⚡"
        emojiPlacement="upperLeft"
        emojiOpacity={0.3}
        emojiSize={30}
      >
        {mode === 'compact' ? (
          <CompactView data={data} contextEmoji={contextEmoji} />
        ) : (
          <NormalView data={data} contextEmoji={contextEmoji} />
        )}

        {/* Tooltip */}
        {showTooltip && contextText ? (
          <ThemedView
            lightColor={Colors.light.overlay}
            darkColor={Colors.dark.overlay}
            style={styles.tooltip}
          >
            <ThemedText
              type="xsmall"
              lightColor={Colors.light.highlightedText}
              darkColor={Colors.dark.highlightedText}
              style={styles.tooltipText}
            >
              {contextText}
            </ThemedText>
          </ThemedView>
        ) : null}
      </BorderedSection>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  tooltip: {
    position: 'absolute',
    top: -40,
    left: 0,
    right: 0,
    padding: Spacing.sm,
    borderRadius: 8,
    zIndex: 1000,
    opacity: TOOLTIP_BG_OPACITY,
  },
  tooltipText: {
    textAlign: 'center',
  },
});

// Re-export types for convenience
export type { VolatilityData, VolatilityLevel } from './types';

