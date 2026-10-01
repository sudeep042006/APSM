// ── Platform Chart Themes ────────────────────────────────────────────
// One accent per platform, with a derived series palette. Facebook and
// Instagram previously hand-coded `#1877F2` / `#E1306C` and their own axis,
// grid and tooltip props on every chart, so the three dashboards rendered
// three different visual languages. Deriving the palette from a single
// accent keeps every chart on the same tokens while still looking branded.

/** Brand accents — the one hard-coded value per platform. */
export const PLATFORM_ACCENT = {
  youtube: "#FF3B30",
  facebook: "#1877F2",
  instagram: "#E1306C",
  linkedin: "#0A66C2",
};

/** Neutral ramp used for the non-accent series so contrast stays readable. */
const NEUTRALS = [
  "#22D3EE", // cyan
  "#A78BFA", // violet
  "#34D399", // emerald
  "#FBBF24", // amber
  "#60A5FA", // blue
  "#F472B6", // pink
  "#F87171", // red
];

/**
 * Ordered series palette for a platform: accent first, then the neutral
 * ramp. Adjacent entries are always high-contrast against each other.
 */
export const platformPalette = (platform) => {
  const accent = PLATFORM_ACCENT[platform] || PLATFORM_ACCENT.youtube;
  return [accent, ...NEUTRALS];
};

/**
 * Picks `count` visually distinct colours from a platform's palette,
 * starting at `offset`. Used when a chart needs a stable colour per series
 * across several cards (so "Likes" is the same blue on every card).
 */
export const seriesColors = (platform, count, offset = 0) => {
  const palette = platformPalette(platform);
  return Array.from({ length: Math.max(0, count) }, (_, i) => palette[(offset + i) % palette.length]);
};

/** Translucent gradient stops for an area fill, from a solid colour. */
export const areaStops = (color, from = 0.34, to = 0.02) => [
  { offset: "0%", stopColor: color, stopOpacity: from },
  { offset: "100%", stopColor: color, stopOpacity: to },
];

/** rgba() string from a hex colour — for cursor fills and soft chips. */
export const withAlpha = (hex, alpha) => {
  const value = String(hex || "").replace("#", "");
  if (value.length !== 6) return `rgba(148,163,184,${alpha})`;
  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
};

export default PLATFORM_ACCENT;