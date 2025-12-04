// components/CurrentVolatilityWidget.tsx
// Displays current market volatility with 1h and 24h metrics

import { BorderedSection } from '@/components/bordered-section';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BorderRadius, Colors, Spacing } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';

// --- CONSTANTS ---
const TOOLTIP_AUTO_DISMISS_MS = 3000;
const BADGE_OPACITY_HEX = '20'; // ~12% opacity for badge backgrounds
const BACKGROUND_OPACITY_HEX = '10'; // ~6% opacity for background color **NEW**
const TOOLTIP_BG_OPACITY = 0.9;

// Emojis for volatility context
const EMOJI_SUSTAINED_VOLATILITY = '🔥'; // Both 1h and 24h HIGH/EXTREME
const EMOJI_SHORT_TERM_SPIKE = '⚡'; // Only 1h HIGH/EXTREME

// Emojis for volatility levels
const EMOJI_LEVEL = {
  LOW: '😴',
  NORMAL: '✅',
  HIGH: '🚩',
  EXTREME: '🚨',
} as const;

// Number formatting
const VOLATILITY_DECIMAL_PLACES = 2;

// Volatility scale thresholds (for visual scale)
// 1-Hour: < 1.5% = LOW, 1.5-4% = NORMAL, 4-8% = HIGH, > 8% = EXTREME
const SCALE_1H = {
  LOW_MAX: 1.5,
  NORMAL_MAX: 4,
  HIGH_MAX: 8,
  // EXTREME is anything above HIGH_MAX
};

// 24-Hour: < 2% = LOW, 2-5% = NORMAL, 5-10% = HIGH, > 10% = EXTREME
const SCALE_24H = {
  LOW_MAX: 2,
  NORMAL_MAX: 5,
  HIGH_MAX: 10,
  // EXTREME is anything above HIGH_MAX
};

// Visual
const DIVIDER_WIDTH = 1;
const SCALE_BAR_HEIGHT = 8;

type VolatilityLevel = 'LOW' | 'NORMAL' | 'HIGH' | 'EXTREME';

export interface VolatilityData {
  volatility1h: number;
  volatility24h: number;
  level1h: VolatilityLevel;
  level24h: VolatilityLevel;
  lastUpdated?: string; // ISO timestamp or relative time string
}

interface CurrentVolatilityWidgetProps {
  data: VolatilityData;
  /** Display mode: 'compact' for minimal space, 'normal' for spacious layout */
  mode?: 'compact' | 'normal';
  /** Optional callback when widget is tapped */
  onPress?: () => void;
}

// Map VolatilityLevel to a numeric severity (0-3)
const SEVERITY_MAP: { [key in VolatilityLevel]: number } = {
  LOW: 0,
  NORMAL: 1,
  HIGH: 2,
  EXTREME: 3,
};

// Map average severity (0.0 to 3.0) to a color for background tint
const getSeverityColor = (avgSeverity: number): { light: string; dark: string } => {
  // Simple mapping: 0.0=LOW/NORMAL (Success), ~1.5=Warning, 3.0=EXTREME (Error)
  if (avgSeverity <= 1.0) {
    return { light: Colors.light.success, dark: Colors.dark.success };
  } else if (avgSeverity <= 2.0) {
    return { light: Colors.light.warning, dark: Colors.dark.warning };
  } else {
    return { light: Colors.light.error, dark: Colors.dark.error };
  }
};

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

  // --- Background Color Calculation (NEW) ---
  const severity1h = SEVERITY_MAP[data.level1h];
  const severity24h = SEVERITY_MAP[data.level24h];
  const avgSeverity = (severity1h + severity24h) / 2;
  
  // Get color based on average severity
  const baseColor = getSeverityColor(avgSeverity);
  const widgetBackgroundColor = {
    light: `${baseColor.light}${BACKGROUND_OPACITY_HEX}`,
    dark: `${baseColor.dark}${BACKGROUND_OPACITY_HEX}`,
  };
  // --- End Background Color Calculation ---

  // Determine volatility context
  const isHighVolatility = (level: VolatilityLevel) =>
    level === 'HIGH' || level === 'EXTREME';
  
  const sustained = isHighVolatility(data.level1h) && isHighVolatility(data.level24h);
  const spike = isHighVolatility(data.level1h) && !isHighVolatility(data.level24h);
  
  const contextEmoji = sustained ? EMOJI_SUSTAINED_VOLATILITY : spike ? EMOJI_SHORT_TERM_SPIKE : '';
  const contextText = sustained
    ? 'Sustained volatility - Both short and long-term movement elevated'
    : spike
    ? 'Short-term spike - Temporary 1h movement, 24h remains stable'
    : '';

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
        // Apply calculated background color
        backgroundColor={widgetBackgroundColor} 
      >
        {mode === 'compact' ? (
          <CompactView data={data} contextEmoji={contextEmoji} />
        ) : (
          <NormalView data={data} contextEmoji={contextEmoji} />
        )}

        {/* Tooltip */}
        {showTooltip && contextText && (
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
        )}
      </BorderedSection>
    </TouchableOpacity>
  );
}

// --- Volatility Scale Component ---
function VolatilityScale({
  timeframe,
  value,
}: {
  timeframe: '1h' | '24h';
  value: number;
}) {
  const scale = timeframe === '1h' ? SCALE_1H : SCALE_24H;
  const maxValue = scale.HIGH_MAX * 1.5; // Show scale up to 1.5x HIGH threshold (for EXTREME range)

  // Calculate position percentage (capped at 100%)
  const position = Math.min((value / maxValue) * 100, 100);

  return (
    <ThemedView style={styles.scale} lightColor="transparent" darkColor="transparent">
      <ThemedText
        type="xsmall"
        lightColor={Colors.light.textSubtle}
        darkColor={Colors.dark.textSubtle}
        style={styles.scaleLabel}
      >
        {timeframe} scale
      </ThemedText>

      {/* Scale bar with segments */}
      <ThemedView style={styles.scaleBarContainer} lightColor="transparent" darkColor="transparent">
        {/* Background segments with colors */}
        <ThemedView style={styles.scaleBar} lightColor="transparent" darkColor="transparent">
          <ThemedView
            lightColor={`${Colors.light.textSubtle}${BADGE_OPACITY_HEX}`}
            darkColor={`${Colors.dark.textSubtle}${BADGE_OPACITY_HEX}`}
            style={[styles.scaleSegment, { flex: scale.LOW_MAX }]}
          />
          <ThemedView
            lightColor={`${Colors.light.success}${BADGE_OPACITY_HEX}`}
            darkColor={`${Colors.dark.success}${BADGE_OPACITY_HEX}`}
            style={[styles.scaleSegment, { flex: scale.NORMAL_MAX - scale.LOW_MAX }]}
          />
          <ThemedView
            lightColor={`${Colors.light.warning}${BADGE_OPACITY_HEX}`}
            darkColor={`${Colors.dark.warning}${BADGE_OPACITY_HEX}`}
            style={[styles.scaleSegment, { flex: scale.HIGH_MAX - scale.NORMAL_MAX }]}
          />
          <ThemedView
            lightColor={`${Colors.light.error}${BADGE_OPACITY_HEX}`}
            darkColor={`${Colors.dark.error}${BADGE_OPACITY_HEX}`}
            style={[styles.scaleSegment, { flex: maxValue - scale.HIGH_MAX }]}
          />
        </ThemedView>

        {/* Position indicator */}
        <ThemedView
          lightColor={Colors.light.tint}
          darkColor={Colors.dark.tint}
          style={[styles.scaleIndicator, { left: `${position}%` }]}
        />
      </ThemedView>

      {/* Labels */}
      <ThemedView style={styles.scaleLabels} lightColor="transparent" darkColor="transparent">
        <ThemedText
          type="xsmall"
          lightColor={Colors.light.textSubtle}
          darkColor={Colors.dark.textSubtle}
        >
          LOW
        </ThemedText>
        <ThemedText
          type="xsmall"
          lightColor={Colors.light.textSubtle}
          darkColor={Colors.dark.textSubtle}
        >
          NORMAL
        </ThemedText>
        <ThemedText
          type="xsmall"
          lightColor={Colors.light.textSubtle}
          darkColor={Colors.dark.textSubtle}
        >
          HIGH
        </ThemedText>
        <ThemedText
          type="xsmall"
          lightColor={Colors.light.textSubtle}
          darkColor={Colors.dark.textSubtle}
        >
          EXTREME
        </ThemedText>
      </ThemedView>
    </ThemedView>
  );
}

// --- Compact Mode Component ---
function CompactView({
  data,
  contextEmoji,
}: {
  data: VolatilityData;
  contextEmoji: string;
}) {
  return (
    <ThemedView 
      style={styles.compactContainer}
      lightColor="transparent" // Make background transparent to show parent BorderedSection tint
      darkColor="transparent" // Make background transparent to show parent BorderedSection tint
    >
      <ThemedView style={styles.compactRow} lightColor="transparent" darkColor="transparent">
        {/* 1-Hour Section (Stacked) */}
        <ThemedView style={styles.compactItemStacked} lightColor="transparent" darkColor="transparent">
          <ThemedView style={styles.compactValueRow} lightColor="transparent" darkColor="transparent">
            <ThemedText type="default" style={styles.compactLabel}>
              1h:
            </ThemedText>
            <ThemedText type="title" style={styles.compactValueTitle}>
              {data.volatility1h.toFixed(VOLATILITY_DECIMAL_PLACES)}%
            </ThemedText>
          </ThemedView>
          {/* Badge is now below the percentage */}
          <VolatilityBadge level={data.level1h} compact />
        </ThemedView>

        <ThemedText type="default" lightColor={Colors.light.textSubtle} darkColor={Colors.dark.textSubtle}>
          |
        </ThemedText>

        {/* 24-Hour Section (Stacked) */}
        <ThemedView style={styles.compactItemStacked} lightColor="transparent" darkColor="transparent">
          <ThemedView style={styles.compactValueRow} lightColor="transparent" darkColor="transparent">
            <ThemedText type="default" style={styles.compactLabel}>
              24h:
            </ThemedText>
            <ThemedText type="title" style={styles.compactValueTitle}>
              {data.volatility24h.toFixed(VOLATILITY_DECIMAL_PLACES)}%
            </ThemedText>
          </ThemedView>
          {/* Badge is now below the percentage */}
          <VolatilityBadge level={data.level24h} compact />
        </ThemedView>

        {contextEmoji && (
          <ThemedText type="default" style={styles.compactEmoji}>
            {contextEmoji}
          </ThemedText>
        )}
      </ThemedView>

      <ThemedText
        type="xsmall"
        lightColor={Colors.light.textSubtle}
        darkColor={Colors.dark.textSubtle}
        style={styles.compactLastUpdated}
      >
        Last updated: {formatTimestamp(data.lastUpdated)}
      </ThemedText>
    </ThemedView>
  );
}

// --- Normal Mode Component ---
function NormalView({
  data,
  contextEmoji,
}: {
  data: VolatilityData;
  contextEmoji: string;
}) {
  const borderColor = useThemeColor({}, 'border');

  return (
    <ThemedView 
      lightColor="transparent" // Make background transparent to show parent BorderedSection tint
      darkColor="transparent" // Make background transparent to show parent BorderedSection tint
    >
      {/* Header with emoji if present */}
      <ThemedView style={styles.normalHeader} lightColor="transparent" darkColor="transparent">
        {/* Updated widget title */}
        <ThemedText type="subtitle">Current Market Volatility</ThemedText> 
        {contextEmoji && (
          // Increased emoji size to xlarge
          <ThemedText type="xlarge" style={styles.normalEmoji}>
            {contextEmoji}
          </ThemedText>
        )}
      </ThemedView>

      {/* Data Grid: 1h and 24h side by side with divider */}
      <ThemedView style={styles.normalDataGrid} lightColor="transparent" darkColor="transparent">
        {/* 1-Hour Section */}
        <ThemedView style={styles.normalDataColumn} lightColor="transparent" darkColor="transparent">
          <ThemedText
            type="small"
            lightColor={Colors.light.textSubtle}
            darkColor={Colors.dark.textSubtle}
            style={styles.normalColumnLabel}
          >
            1-Hour
          </ThemedText>
          <ThemedText type="title" style={styles.normalPercentage}>
            {data.volatility1h.toFixed(VOLATILITY_DECIMAL_PLACES)}%
          </ThemedText>
          <VolatilityBadge level={data.level1h} />
        </ThemedView>

        {/* Vertical Divider */}
        <ThemedView
          lightColor={Colors.light.border}
          darkColor={Colors.dark.border}
          style={styles.normalDivider}
        />

        {/* 24-Hour Section */}
        <ThemedView style={styles.normalDataColumn} lightColor="transparent" darkColor="transparent">
          <ThemedText
            type="small"
            lightColor={Colors.light.textSubtle}
            darkColor={Colors.dark.textSubtle}
            style={styles.normalColumnLabel}
          >
            24-Hour
          </ThemedText>
          <ThemedText type="title" style={styles.normalPercentage}>
            {data.volatility24h.toFixed(VOLATILITY_DECIMAL_PLACES)}%
          </ThemedText>
          <VolatilityBadge level={data.level24h} />
        </ThemedView>
      </ThemedView>

      {/* Scale Indicators */}
      <ThemedView style={styles.scaleContainer} lightColor="transparent" darkColor="transparent">
        <VolatilityScale timeframe="1h" value={data.volatility1h} />
        <ThemedView style={styles.scaleSpacing} lightColor="transparent" darkColor="transparent" />
        <VolatilityScale timeframe="24h" value={data.volatility24h} />
      </ThemedView>

      {/* Last Updated */}
      <ThemedText
        type="xsmall"
        lightColor={Colors.light.textSubtle}
        darkColor={Colors.dark.textSubtle}
        style={styles.normalLastUpdated}
      >
        Last updated: {formatTimestamp(data.lastUpdated)}
      </ThemedText>
    </ThemedView>
  );
}

// --- Volatility Badge Component ---
function VolatilityBadge({
  level,
  compact,
  showEmoji = true,
}: {
  level: VolatilityLevel;
  compact?: boolean;
  showEmoji?: boolean;
}) {
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
        compact && styles.badgeCompact, // New padding/margin for compact stacked view
        {
          backgroundColor: `${bgColor}${BADGE_OPACITY_HEX}`,
        },
      ]}
      lightColor="transparent" // Make badge container transparent
      darkColor="transparent" // Make badge container transparent
    >
      {showEmoji && (
        // Use 'large' size for emoji in both compact and normal mode to make it prominent
        <ThemedText type={'large'}  > 
          {emoji}{' '}
        </ThemedText>
      )}
      <ThemedText
        // Use 'xsmall' for the text in compact mode, and 'small' for normal mode
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

// --- Utility Functions ---
function formatTimestamp(timestamp?: string): string {
  if (!timestamp) return '?';

  try {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  } catch {
    return timestamp;
  }
}

// --- Styles ---
const styles = StyleSheet.create({
  // Compact Mode
  compactContainer: {
    alignItems: 'center',
  },
  compactRow: {
    flexDirection: 'row',
    alignItems: 'flex-start', // Align items to the top (or center if heights are equal)
    justifyContent: 'center',
    marginBottom: Spacing.xs,
    gap: Spacing.md, // Increased gap between 1h and 24h columns
  },
  // NEW: Style for the stacked item container
  compactItemStacked: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs, // Gap between the percentage row and the badge
  },
  // NEW: Style for the row containing "1h:" and the percentage number
  compactValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline', // Align '1h:' text and percentage number
    gap: Spacing.xs / 2,
  },
  // NEW: Style for the main percentage number
  compactValueTitle: {
    fontWeight: 'bold',
    fontSize: 22, // Make the percentage number clearly the largest text
  },
  compactLabel: {
    // Style for '1h:' and '24h:' labels
  },
  compactEmoji: {
    marginLeft: Spacing.xs,
  },
  compactLastUpdated: {
    textAlign: 'center',
  },

  // Normal Mode
  normalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  normalEmoji: {
    marginLeft: Spacing.xs,
  },
  normalDataGrid: {
    flexDirection: 'row',
    alignItems: 'stretch',
    marginBottom: Spacing.lg,
  },
  normalDataColumn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  normalColumnLabel: {
    textAlign: 'center',
  },
  normalPercentage: {
    fontWeight: 'bold',
    textAlign: 'center',
  },
  normalDivider: {
    width: DIVIDER_WIDTH,
    marginHorizontal: Spacing.md,
  },
  normalLastUpdated: {
    textAlign: 'center',
    marginTop: Spacing.md,
  },

  // Scale
  scaleContainer: {
    marginBottom: Spacing.md,
  },
  scaleSpacing: {
    height: Spacing.md,
  },
  scale: {
    gap: Spacing.xs,
  },
  scaleLabel: {
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  scaleBarContainer: {
    position: 'relative',
    height: SCALE_BAR_HEIGHT,
  },
  scaleBar: {
    flexDirection: 'row',
    height: SCALE_BAR_HEIGHT,
    borderRadius: BorderRadius.sm,
    overflow: 'hidden',
  },
  scaleSegment: {
    height: '100%',
  },
  scaleIndicator: {
    position: 'absolute',
    top: -2,
    width: 3,
    height: SCALE_BAR_HEIGHT + 4,
    borderRadius: BorderRadius.sm,
    marginLeft: -1.5,
  },
  scaleLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xs,
  },

  // Badge
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
// marginVertical: Spacing.md,
    borderRadius: BorderRadius.sm,
  },
  badgeCompact: {
    paddingHorizontal: Spacing.xs / 2, // Less horizontal padding
    paddingVertical: 2,
    // When compact, the badge is now a column item, so horizontal centering is important
    alignSelf: 'center', 
  },
  badgeText: {
    fontWeight: '600',
  },

  // Tooltip
  tooltip: {
    position: 'absolute',
    top: -40,
    left: 0,
    right: 0,
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    zIndex: 1000,
    opacity: TOOLTIP_BG_OPACITY,
  },
  tooltipText: {
    textAlign: 'center',
  },
});