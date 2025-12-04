// components/current-volatility-widget/VolatilityScale.tsx
// Visual scale component showing volatility level ranges

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BorderRadius, Colors, Spacing } from '@/constants/theme';
import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { BADGE_OPACITY_HEX, SCALE_1H, SCALE_24H, SCALE_BAR_HEIGHT } from './constants';
import type { VolatilityScaleProps } from './types';

export function VolatilityScale({ timeframe, value }: VolatilityScaleProps) {
  const scale = timeframe === '1h' ? SCALE_1H : SCALE_24H;
  const maxValue = scale.HIGH_MAX * 1.5; // Show scale up to 1.5x HIGH threshold (for EXTREME range)

  // Calculate position percentage (capped at 100%)
  const position = Math.min((value / maxValue) * 100, 100);

  // Animation values for pulsing effect
  const pulseScale = useSharedValue(1);
  const glowOpacity = useSharedValue(0.5);

  useEffect(() => {
    // Start pulsing animation - indicator scales up and down to make it stand out
    pulseScale.value = withRepeat(
      withTiming(1.4, { duration: 1200 }),
      -1,
      true
    );
    // Glow pulses with opacity for a subtle effect
    glowOpacity.value = withRepeat(
      withTiming(0.8, { duration: 1200 }),
      -1,
      true
    );
  }, []);

  // Animated style for the indicator - scales to make it stand out
  const animatedIndicatorStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: pulseScale.value }],
    };
  });

  // Animated style for the glow effect
  const animatedGlowStyle = useAnimatedStyle(() => {
    return {
      opacity: glowOpacity.value,
    };
  });

  return (
    <ThemedView style={styles.scale} transparent>
      <ThemedText
        type="xsmall"
        lightColor={Colors.light.textSubtle}
        darkColor={Colors.dark.textSubtle}
        style={styles.scaleLabel}
      >
        {timeframe === '1h' ? '1-Hour' : '24-Hour'} scale
      </ThemedText>

      {/* Scale bar with segments */}
      <ThemedView style={styles.scaleBarContainer} transparent>
        {/* Background segments with colors */}
        <ThemedView style={styles.scaleBar} transparent>
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
        <Animated.View
          style={[
            styles.scaleIndicator,
            { left: `${position}%` },
            animatedIndicatorStyle,
          ]}>
          <ThemedView
            lightColor={Colors.light.tint}
            darkColor={Colors.dark.tint}
            style={styles.scaleIndicatorInner}
          />
          {/* Glow effect */}
          <Animated.View
            style={[
              styles.scaleIndicatorGlow,
              animatedGlowStyle,
            ]}
          />
        </Animated.View>
      </ThemedView>

      {/* Labels */}
      <ThemedView style={styles.scaleLabels} transparent>
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

const styles = StyleSheet.create({
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
    marginLeft: -1.5,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  scaleIndicatorInner: {
    width: 3,
    height: SCALE_BAR_HEIGHT + 4,
    borderRadius: BorderRadius.sm,
    zIndex: 2,
  },
  scaleIndicatorGlow: {
    position: 'absolute',
    width: 7,
    height: SCALE_BAR_HEIGHT + 8,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.light.tint,
    zIndex: 1,
  },
  scaleLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xs,
  },
});

