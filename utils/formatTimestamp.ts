// utils/formatTimestamp.ts
// Shared utility for formatting timestamps into human-readable relative time strings

/**
 * Formats a timestamp into a human-readable relative time string
 * Supports both ISO timestamp strings and Unix timestamps (milliseconds)
 * @param timestamp ISO timestamp string, Unix timestamp (number), or undefined
 * @returns Formatted time string (e.g., "5m ago", "2h ago", "just now", or "?" if invalid)
 */
export function formatTimestamp(timestamp?: string | number): string {
  if (!timestamp) return '?';

  try {
    // Handle both string (ISO) and number (Unix timestamp in milliseconds)
    const date = typeof timestamp === 'string' 
      ? new Date(timestamp)
      : new Date(timestamp);
    
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
    return typeof timestamp === 'string' ? timestamp : '?';
  }
}

