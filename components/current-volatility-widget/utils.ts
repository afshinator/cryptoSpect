// components/current-volatility-widget/utils.ts
// Utility functions for the CurrentVolatilityWidget component

import { Colors } from '@/constants/theme';
import { EMOJI_SHORT_TERM_SPIKE, EMOJI_SUSTAINED_VOLATILITY, SEVERITY_MAP } from './constants';
import type { VolatilityLevel } from './types';

/**
 * Maps average severity (0.0 to 3.0) to a color for background tint
 * @param avgSeverity Average severity value (0.0-3.0)
 * @returns Color object with light and dark theme colors
 */
export function getSeverityColor(avgSeverity: number): { light: string; dark: string } {
  // Simple mapping: 0.0=LOW/NORMAL (Success), ~1.5=Warning, 3.0=EXTREME (Error)
  if (avgSeverity <= 1.0) {
    return { light: Colors.light.success, dark: Colors.dark.success };
  } else if (avgSeverity <= 2.0) {
    return { light: Colors.light.warning, dark: Colors.dark.warning };
  } else {
    return { light: Colors.light.error, dark: Colors.dark.error };
  }
}

/**
 * Calculates the average severity from two volatility levels
 * @param level1h 1-hour volatility level
 * @param level24h 24-hour volatility level
 * @returns Average severity (0.0-3.0)
 */
export function calculateAverageSeverity(
  level1h: VolatilityLevel,
  level24h: VolatilityLevel
): number {
  const severity1h = SEVERITY_MAP[level1h];
  const severity24h = SEVERITY_MAP[level24h];
  return (severity1h + severity24h) / 2;
}

/**
 * Determines if a volatility level is considered high (HIGH or EXTREME)
 * @param level Volatility level to check
 * @returns True if level is HIGH or EXTREME
 */
export function isHighVolatility(level: VolatilityLevel): boolean {
  return level === 'HIGH' || level === 'EXTREME';
}

// formatTimestamp has been moved to @/utils/formatTimestamp for shared use
// Re-export it here for backward compatibility
export { formatTimestamp } from '@/utils/formatTimestamp';

/**
 * Determines the context emoji and text based on volatility levels
 * @param level1h 1-hour volatility level
 * @param level24h 24-hour volatility level
 * @returns Object with emoji and text, or empty strings if no context
 */
export function getVolatilityContext(level1h: VolatilityLevel, level24h: VolatilityLevel) {
  const sustained = isHighVolatility(level1h) && isHighVolatility(level24h);
  const spike = isHighVolatility(level1h) && !isHighVolatility(level24h);

  const contextEmoji = sustained
    ? EMOJI_SUSTAINED_VOLATILITY
    : spike
      ? EMOJI_SHORT_TERM_SPIKE
      : '';

  const contextText = sustained
    ? 'Sustained volatility - Both short and long-term movement elevated'
    : spike
      ? 'Short-term spike - Temporary 1h movement, 24h remains stable'
      : '';

  return { contextEmoji, contextText };
}

