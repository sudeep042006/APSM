// ── Meta Insight Series ──────────────────────────────────────────────
// The backend already stores Meta's daily insight rows verbatim:
//   rawPlatformData.facebook.insights = [
//     { name: "page_impressions", values: [{ end_time: "2025-03-04T00:00:00+0000", value: 12043 }] },
//     { name: "page_impressions_unique", values: [...] },
//     { name: "page_post_engagements", values: [...] }
//   ]
// and the Instagram equivalent (`reach`, `profile_views`).
//
// The API layer never read these — it invented series instead. This module
// is the single place that turns those stored rows into chart data, so every
// Facebook/Instagram chart is drawn from measured daily values.

/** "2025-03-04T00:00:00+0000" → "2025-03-04" */
export const endTimeToDate = (endTime) => {
  if (!endTime) return "";
  return String(endTime).slice(0, 10);
};

/** Clamps a raw numeric value to a finite number, or null when absent. */
const asNumber = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

/**
 * Reads one metric out of a stored `insights` array and returns its daily
 * rows: `[{ date: "2025-03-04", value: 12043 }]`, sorted ascending.
 * Returns `[]` when the metric was never stored — callers must treat that as
 * "not available", not as "zero".
 */
export const dailyFromInsights = (insights, metricName) => {
  if (!Array.isArray(insights)) return [];
  const metric = insights.find((m) => m && m.name === metricName);
  if (!metric || !Array.isArray(metric.values)) return [];

  const byDate = new Map();
  metric.values.forEach((entry) => {
    if (!entry) return;
    const date = endTimeToDate(entry.end_time);
    if (!date) return;
    const value = asNumber(entry.value);
    if (value === null) return;
    // A metric can legitimately emit more than one bucket per day
    // (time_increment); sum rather than overwrite.
    byDate.set(date, (byDate.get(date) || 0) + value);
  });

  return [...byDate.entries()]
    .map(([date, value]) => ({ date, value }))
    .sort((a, b) => a.date.localeCompare(b.date));
};

/**
 * Joins several single-metric series onto one row per date, aligned on the
 * union of all dates so no day's value is silently dropped.
 *
 * @param {Array<{metric:string,key:string,aggregate?:'sum'|'last'}>} specs
 * @param {Array} insights
 * @returns {Array<{date:string}> & Record<string, any>}
 */
export const joinDailySeries = (insights, specs) => {
  const list = Array.isArray(specs) ? specs.filter((s) => s && s.metric && s.key) : [];
  if (list.length === 0) return [];

  const perMetric = list.map((spec) => ({ spec, rows: dailyFromInsights(insights, spec.metric) }));
  const dates = [...new Set(perMetric.flatMap(({ rows }) => rows.map((r) => r.date)))].sort();

  return dates.map((date) => {
    const row = { date };
    perMetric.forEach(({ spec, rows }) => {
      const match = rows.find((r) => r.date === date);
      row[spec.key] = match ? match.value : 0;
    });
    return row;
  });
};

/**
 * Restricts rows to an inclusive `YYYY-MM-DD` window. Rows outside the
 * window are dropped rather than clamped, so a chart never implies activity
 * on a day it has no data for.
 */
export const withinRange = (rows, start, end) => {
  if (!Array.isArray(rows)) return [];
  if (!start && !end) return rows;
  return rows.filter((r) => {
    if (start && r.date < start) return false;
    if (end && r.date > end) return false;
    return true;
  });
};

/**
 * Normalises a `dateRange` prop (`{start, end}`) into comparable ISO days.
 * Returns `{}` when no usable range was supplied.
 */
export const normaliseRange = (dateRange) => {
  if (!dateRange || (!dateRange.start && !dateRange.end)) return {};
  return {
    start: dateRange.start ? endTimeToDate(dateRange.start) : undefined,
    end: dateRange.end ? endTimeToDate(dateRange.end) : undefined,
  };
};

/**
 * Groups rows into a chronological day-bucketed timeline from post/media
 * timestamps. Only days that actually contain content are emitted, so the
 * resulting series reflects real publishing days.
 */
export const groupByDay = (items, getDay, getValue) => {
  const byDate = new Map();
  (Array.isArray(items) ? items : []).forEach((item) => {
    const day = getDay(item);
    if (!day) return;
    const v = asNumber(getValue(item)) || 0;
    byDate.set(day, (byDate.get(day) || 0) + v);
  });
  return [...byDate.entries()]
    .map(([date, value]) => ({ date, value }))
    .sort((a, b) => a.date.localeCompare(b.date));
};

/** True only when at least one row carries a real non-zero measurement. */
export const hasMeasurements = (rows) =>
  Array.isArray(rows) && rows.some((r) => Number(r && r.value) > 0);

/**
 * Follower series built from consecutive stored snapshots. Each point is the
 * measured fan count on that snapshot date — never a re-used constant and
 * never interpolated. Returns `[]` when fewer than two snapshots exist,
 * because a single reading cannot show growth.
 */
export const followerSeriesFromHistory = (history, getFollowers) => {
  const list = Array.isArray(history) ? history : [];
  const points = [];
  list.forEach((snap) => {
    if (!snap) return;
    const date = endTimeToDate(snap.snapshotDate);
    const followers = asNumber(typeof getFollowers === "function" ? getFollowers(snap) : null);
    if (!date || followers === null) return;
    points.push({ date, followers });
  });

  const deduped = [...new Map(points.map((p) => [p.date, p])).values()].sort((a, b) =>
    a.date.localeCompare(b.date)
  );

  if (deduped.length < 2) return [];

  return deduped.map((p, i) => ({
    date: p.date,
    followers: p.followers,
    // Net change is a difference of two measured readings — not an estimate.
    net: i === 0 ? 0 : p.followers - deduped[i - 1].followers,
  }));
};