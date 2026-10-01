// ── Chart Design Tokens ──────────────────────────────────────────────
// A single source of truth for chart colour, axis, grid and scale behaviour.
// Previously every dashboard page hard-coded its own palette, axis props and
// a `domain={([min,max]) => [0, max === 0 ? 2 : ...]}` hack. That hack was the
// direct cause of "blank chart" symptoms: an all-zero series produced a 0–2
// axis with zero-height bars, which is visually identical to a broken chart.

/** Categorical series palette — ordered for maximum adjacent contrast. */
export const CHART_COLORS = {
  primary: "#6366F1", // indigo
  primaryAlt: "#818CF8",
  secondary: "#22D3EE", // cyan
  tertiary: "#A78BFA", // violet
  success: "#34D399", // emerald
  warning: "#FBBF24", // amber
  danger: "#F87171", // red
  info: "#60A5FA", // blue
  pink: "#F472B6",
};

/** Ordered list for multi-series charts (pies, grouped bars). */
export const CATEGORICAL = [
  CHART_COLORS.primary,
  CHART_COLORS.secondary,
  CHART_COLORS.tertiary,
  CHART_COLORS.success,
  CHART_COLORS.warning,
  CHART_COLORS.pink,
  CHART_COLORS.info,
  CHART_COLORS.danger,
];

/** Gradient stops for area charts. */
export const areaGradient = (id, color, { from = 0.35, to = 0.02 } = {}) => ({
  id,
  color,
  from,
  to,
});

/** Shared grid styling — horizontal only, recessive. */
export const GRID_PROPS = {
  strokeDasharray: "3 3",
  stroke: "rgba(148,163,184,0.12)",
  vertical: false,
};

/** Shared X axis styling. */
export const axisX = (extra = {}) => ({
  stroke: "#64748B",
  tickLine: false,
  axisLine: false,
  tick: { fill: "#94A3B8", fontSize: 11 },
  dy: 8,
  ...extra,
});

/** Shared Y axis styling. */
export const axisY = (extra = {}) => ({
  stroke: "#64748B",
  tickLine: false,
  axisLine: false,
  tick: { fill: "#94A3B8", fontSize: 11 },
  width: 56,
  ...extra,
});

/** Shared cursor behaviour for hover tooltips. */
export const CURSOR = { fill: "rgba(148,163,184,0.08)" };

/** Shared legend styling. */
export const legendProps = (extra = {}) => ({
  iconType: "circle",
  iconSize: 8,
  wrapperStyle: {
    fontSize: "12px",
    paddingTop: "12px",
    color: "#94A3B8",
    ...(extra.wrapperStyle || {}),
  },
  ...extra,
});

/**
 * "Nice number" axis scaling (1 / 2 / 5 × 10ⁿ).
 * Produces round gridline values (e.g. 1,500 instead of 1,237) and never
 * collapses to a degenerate 0–1 range when every value is zero.
 */
export const niceMax = (value) => {
  if (!Number.isFinite(value) || value <= 0) return 1;
  const exponent = Math.floor(Math.log10(value));
  const magnitude = Math.pow(10, exponent);
  const normalized = value / magnitude;
  const step = normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10;
  return step * magnitude;
};

/**
 * Recharts Y axis domain that always yields readable round ticks.
 * Always returns at least [0, niceMax] so a chart can never collapse to a
 * zero-height, unreadable frame.
 */
export const niceDomain = (padding = 1.15) => ([dataMin, dataMax]) => {
  const max = Number.isFinite(dataMax) && dataMax > 0 ? dataMax : 0;
  if (max === 0) return [0, 1];
  return [0, niceMax(max * padding)];
};

/**
 * Domain for charts that cross zero (e.g. subscribers gained vs unsubscribed).
 * Both bounds round outward so negative bars are never clipped by a
 * zero-anchored domain.
 */
export const signedDomain = (padding = 1.15) => ([dataMin, dataMax]) => {
  const min = Number.isFinite(dataMin) && dataMin < 0 ? dataMin : 0;
  const max = Number.isFinite(dataMax) && dataMax > 0 ? dataMax : 0;
  if (min === 0 && max === 0) return [0, 1];
  return [
    min < 0 ? -niceMax(Math.abs(min) * padding) : 0,
    max > 0 ? niceMax(max * padding) : 0,
  ];
};

/** Domain for percentage axes (0–100). */
export const percentDomain = [0, 100];

// ── Formatters ───────────────────────────────────────────────────────

/** 1200 → "1.2K", 1500000 → "1.5M" */
export const compact = (num) => {
  const n = Number(num);
  if (num === null || num === undefined || !Number.isFinite(n)) return "0";
  const abs = Math.abs(n);
  if (abs >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1).replace(/\.0$/, "") + "B";
  if (abs >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (abs >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
  return n.toLocaleString();
};

/** Minutes → "45m" / "1,234h" */
export const watchTime = (minutes) => {
  const m = Number(minutes);
  if (!Number.isFinite(m) || m <= 0) return "0m";
  if (m < 60) return `${Math.round(m)}m`;
  return `${Math.round(m / 60).toLocaleString()}h`;
};

/** 0.1234 → "12.3%" */
export const percent = (n, digits = 1) => {
  const v = Number(n);
  if (!Number.isFinite(v)) return "0%";
  return `${v.toFixed(digits).replace(/\.0$/, "")}%`;
};

// ── Dates ─────────────────────────────────────────────────────────────

/**
 * Meta and YouTube report different date shapes ("2025-03-04", "2025-03-04T00:00:00+0000",
 * a JS Date). Normalising to "Mar 4" in one place keeps every axis label identical.
 */
export const shortDate = (value) => {
  if (value === null || value === undefined || value === "") return "";
  const raw = value instanceof Date ? value : String(value);
  const iso = raw.slice(0, 10);
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return raw;
  return new Date(y, m - 1, d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

/** Sort key for ISO-ish date strings — lexicographic order is chronological. */
export const dateKey = (value) => String(value ?? "").slice(0, 10);

// ── Series maths (all measured, never assumed) ───────────────────────

export const sumOf = (rows, keys) => {
  const list = Array.isArray(keys) ? keys : [keys];
  return (rows || []).reduce(
    (acc, row) => acc + list.reduce((a, k) => a + (Number(row?.[k]) || 0), 0),
    0
  );
};

export const maxOf = (rows, keys) => {
  const list = Array.isArray(keys) ? keys : [keys];
  return (rows || []).reduce((acc, row) => {
    const rowMax = list.reduce((a, k) => Math.max(a, Number(row?.[k]) || 0), 0);
    return Math.max(acc, rowMax);
  }, 0);
};

/** Arithmetic mean of a measured series, or 0 when there is nothing to average. */
export const meanOf = (rows, key) => {
  if (!Array.isArray(rows) || rows.length === 0) return 0;
  const total = sumOf(rows, key);
  return total / rows.length;
};

/**
 * Sums the values of two series that share a row shape but different keys —
 * the basis for a real "impressions" or "engagement rate" line built from
 * columns Meta actually returned.
 */
export const withDerivedTotals = (rows, outputKey, inputKeys) =>
  (rows || []).map((row) => ({
    ...row,
    [outputKey]: (Array.isArray(inputKeys) ? inputKeys : [inputKeys]).reduce(
      (a, k) => a + (Number(row?.[k]) || 0),
      0
    ),
  }));

/** Share of a total, as a percentage rounded to `digits`. 0 when total is 0. */
export const sharePercent = (value, total, digits = 1) => {
  const v = Number(value) || 0;
  const t = Number(total) || 0;
  if (t <= 0) return 0;
  return Math.round((v / t) * 100 * 10 ** digits) / 10 ** digits;
};

// ── Renderability guards ─────────────────────────────────────────────

/**
 * A chart is only worth rendering if at least one of its series has a
 * non-zero value. Guards like `data.length > 0` pass for an array of zeros,
 * which produces a visually broken chart instead of an honest empty state.
 */
export const hasValues = (data, keys) => {
  if (!Array.isArray(data) || data.length === 0) return false;
  const list = Array.isArray(keys) ? keys : [keys];
  return data.some((row) => list.some((k) => Number(row?.[k]) > 0));
};

/**
 * Resolves what a chart should display: the data, or the reason it is empty.
 * Returns `{ empty: false, data }` or `{ empty: true, title, detail }`.
 */
export const resolveChartState = (data, keys, messages = {}) => {
  if (!Array.isArray(data) || data.length === 0) {
    return {
      empty: true,
      title: messages.noDataTitle || "No data available",
      detail: messages.noDataDetail || "The platform API returned no rows for this period.",
    };
  }
  if (!hasValues(data, keys)) {
    return {
      empty: true,
      title: messages.zeroTitle || "All values are zero",
      detail:
        messages.zeroDetail ||
        "Rows were returned but every value is 0. This channel recorded no activity in the selected window.",
    };
  }
  return { empty: false, data };
};
