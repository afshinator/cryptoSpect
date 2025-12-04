// components/current-dominance-widget/utils.ts
// Utility functions for the CurrentDominanceWidget component

/**
 * Formats a market cap value into a human-readable string
 * @param value Market cap value in USD
 * @returns Formatted string (e.g., "$1.23T", "$456.78B", "$789.12M")
 */
export function formatMarketCap(value: number): string {
  if (value >= 1e12) {
    return `$${(value / 1e12).toFixed(2)}T`;
  } else if (value >= 1e9) {
    return `$${(value / 1e9).toFixed(2)}B`;
  } else if (value >= 1e6) {
    return `$${(value / 1e6).toFixed(2)}M`;
  } else {
    return `$${value.toFixed(2)}`;
  }
}

