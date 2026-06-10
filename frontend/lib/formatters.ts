// Utility: Date formatting helpers for analytics displays
// Provides consistent date formatting across the dashboard

/**
 * Formats a date into a human-readable short string
 * e.g. "Jun 10, 2026"
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Formats a number with comma separators
 * e.g. 1234567 → "1,234,567"
 */
export function formatNumber(num: number): string {
  return num.toLocaleString("en-US");
}

/**
 * Returns a relative time string
 * e.g. "2 hours ago", "3 days ago"
 */
export function timeAgo(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
  if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  if (diffMins > 0) return `${diffMins} min${diffMins > 1 ? "s" : ""} ago`;
  return "Just now";
}
