// ── Category Bars ────────────────────────────────────────────────────
// Horizontal bars for age bands, countries, formats and similar ranked
// categories. Facebook/Instagram drew these as fixed-height divs with
// hand-written percentages; here every width, share and label is computed
// from the value the API returned.
import { useMemo, useState } from "react";
import { compact, percent as formatPercent } from "./chartTheme";
import { withAlpha } from "./platformTheme";

/**
 * @param {object} props
 * @param {Array<{name,value,share?}>} props.data
 * @param {string} [props.color="#1877F2"]       single colour for every bar
 * @param {string[]} [props.colors]               optional per-row colours, same order as `data`
 * @param {string} [props.valueLabel]
 * @param {boolean} [props.showShare=true]
 * @param {boolean} [props.sortable=true]
 * @param {number} [props.limit]
 * @param {"compact"|"number"|"percent"} [props.format="compact"]
 * @param {string} [props.emptyTitle]
 * @param {string} [props.emptyDetail]
 */
export default function CategoryBars({
  data,
  color = "#1877F2",
  colors,
  valueLabel,
  showShare = true,
  sortable = true,
  limit,
  format = "compact",
  emptyTitle = "No breakdown available",
  emptyDetail = "This metric is not available for the connected account or period.",
  className = "",
}) {
  const [desc, setDesc] = useState(true);
  const [focus, setFocus] = useState(null);

  const rows = useMemo(() => {
    const list = (Array.isArray(data) ? data : []).filter((r) => r && r.name && Number(r.value) > 0);
    const palette = Array.isArray(colors) ? colors : [];
    // Sorting reorders rows, so the colour has to travel with the row rather
    // than stay at a fixed index.
    const decorated = list.map((r, i) => ({
      name: r.name,
      value: Number(r.value) || 0,
      share: Number(r.share) || 0,
      color: r.color || palette[i] || color,
    }));
    const sorted = decorated.sort((a, b) => (desc ? b.value - a.value : a.value - b.value));
    return typeof limit === "number" ? sorted.slice(0, limit) : sorted;
  }, [data, colors, color, desc, limit]);

  if (rows.length === 0) {
    return (
      <div
        className={`flex flex-col items-center justify-center rounded-xl border border-dashed border-white/10 bg-slate-900/30 px-6 py-9 text-center ${className}`}
      >
        <p className="text-sm font-semibold text-slate-200">{emptyTitle}</p>
        <p className="mt-1 max-w-xs text-xs text-slate-400">{emptyDetail}</p>
      </div>
    );
  }

  const total = rows.reduce((a, r) => a + r.value, 0) || 1;
  const peak = rows.reduce((a, r) => Math.max(a, r.value), 0) || 1;
  const fmt = format === "percent" ? formatPercent : format === "number" ? (v) => v.toLocaleString() : compact;

  return (
    <div className={className}>
      {sortable && rows.length > 1 && (
        <div className="mb-2 flex items-center justify-between">
          <span className="text-[11px] font-medium uppercase tracking-wider text-slate-500">
            {valueLabel || "Value"}
          </span>
          <button
            type="button"
            onClick={() => setDesc((d) => !d)}
            className="rounded-md px-2 py-1 text-[11px] font-medium text-slate-500 transition-colors hover:bg-white/[0.05] hover:text-slate-300"
          >
            {desc ? "Highest first" : "Lowest first"}
          </button>
        </div>
      )}

      <ul className="space-y-2.5">
        {rows.map((row, i) => {
          const width = Math.max(2, (row.value / peak) * 100);
          const share = (row.value / total) * 100;
          const dimmed = focus !== null && focus !== row.name;
          return (
            <li
              key={`${row.name}-${i}`}
              onMouseEnter={() => setFocus(row.name)}
              onMouseLeave={() => setFocus(null)}
              title={`${row.name}: ${fmt(row.value)} (${formatPercent(share)} of ${fmt(total)})`}
              className={`transition-opacity ${dimmed ? "opacity-40" : ""}`}
            >
              <div className="mb-1 flex items-baseline justify-between gap-3">
                <span className="truncate text-xs font-medium text-slate-200">{row.name}</span>
                <span className="shrink-0 text-[11px] tabular-nums text-slate-400">
                  {fmt(row.value)}
                  {showShare && (
                    <span className="ml-1.5 text-slate-500">{formatPercent(share)}</span>
                  )}
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800/60">
                <div
                  className="h-full rounded-full transition-[width] duration-500"
                  style={{ width: `${width}%`, background: withAlpha(row.color, 0.85) }}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}