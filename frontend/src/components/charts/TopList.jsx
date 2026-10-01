// ── Top List ─────────────────────────────────────────────────────────
// Ranked list of real entities (videos, posts, reels, hashtags) sized by a
// measured value. Facebook and Instagram previously drew ranking bars from
// hand-written pixel heights and hard-coded percentages, so the "top video"
// list looked identical no matter what the Graph API returned. Here the bar
// width and the share label are both derived from the value on screen.
import { useMemo, useState } from "react";
import { compact, percent as formatPercent, shortDate } from "./chartTheme";
import { withAlpha } from "./platformTheme";

/**
 * @param {object} props
 * @param {Array<{id?,label,sub?,value,meta?,share?,href?}>} props.items
 * @param {string} [props.valueLabel="Engagements"]  header for the measured column
 * @param {string} [props.platform="facebook"]        brand accent
 * @param {number} [props.limit]
 * @param {number} [props.total]                     denominator for share-of-total; defaults to the sum of items
 * @param {Function} [props.formatValue]
 * @param {string} [props.emptyTitle]
 * @param {string} [props.emptyDetail]
 */
export default function TopList({
  items,
  valueLabel = "Engagements",
  platform = "facebook",
  limit,
  total,
  formatValue = compact,
  emptyTitle = "Nothing to rank yet",
  emptyDetail = "The platform API returned no content in this period.",
  className = "",
}) {
  const [hovered, setHovered] = useState(null);

  const rows = useMemo(() => {
    const list = Array.isArray(items) ? items.filter((r) => r && r.label) : [];
    const sliced = typeof limit === "number" ? list.slice(0, limit) : list;
    const denominator = Number(total) > 0 ? Number(total) : sliced.reduce((a, r) => a + (Number(r.value) || 0), 0);
    return sliced.map((r, i) => ({
      ...r,
      rank: i + 1,
      value: Number(r.value) || 0,
      share: denominator > 0 ? ((Number(r.value) || 0) / denominator) * 100 : 0,
    }));
  }, [items, limit, total]);

  if (rows.length === 0) {
    return (
      <div
        className={`flex flex-col items-center justify-center rounded-xl border border-dashed border-white/10 bg-slate-900/30 px-6 py-10 text-center ${className}`}
      >
        <p className="text-sm font-semibold text-slate-200">{emptyTitle}</p>
        <p className="mt-1 max-w-xs text-xs text-slate-400">{emptyDetail}</p>
      </div>
    );
  }

  const peak = rows.reduce((a, r) => Math.max(a, r.value), 0) || 1;

  return (
    <ol className={`space-y-2 ${className}`}>
      {rows.map((row, i) => {
        const width = peak > 0 ? Math.max(2, (row.value / peak) * 100) : 0;
        const active = hovered === i;
        return (
          <li key={row.id || `${row.label}-${i}`}>
            <div
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              title={`${row.label} — ${formatValue(row.value)}`}
              className={[
                "group relative overflow-hidden rounded-lg border border-white/[0.06] bg-slate-900/40 px-3 py-2.5 transition-colors",
                active ? "border-white/15 bg-white/[0.04]" : "hover:border-white/10",
              ].join(" ")}
            >
              {/* measured bar: width and share both come from the API value */}
              <div
                className="pointer-events-none absolute inset-y-0 left-0 rounded-lg transition-[width] duration-500"
                style={{ width: `${width}%`, background: withAlpha(row.color || "#6366F1", 0.16) }}
                aria-hidden="true"
              />

              <div className="relative flex items-center gap-3">
                <span className="w-5 shrink-0 text-right text-[11px] font-bold tabular-nums text-slate-500">
                  {row.rank}
                </span>

                <span
                  className="h-7 w-1 shrink-0 rounded-full"
                  style={{ backgroundColor: row.color || "#6366F1" }}
                  aria-hidden="true"
                />

                <span className="min-w-0 flex-1">
                  <span className="block truncate text-xs font-semibold text-slate-100">
                    {row.label}
                  </span>
                  {(row.sub || row.meta) && (
                    <span className="mt-0.5 flex flex-wrap items-center gap-x-2 text-[11px] text-slate-500">
                      {row.sub}
                      {row.meta}
                    </span>
                  )}
                </span>

                <span className="shrink-0 text-right">
                  <span className="block text-xs font-bold tabular-nums text-slate-100">
                    {formatValue(row.value)}
                  </span>
                  <span className="block text-[10px] tabular-nums text-slate-500">
                    {formatPercent(row.share)}
                  </span>
                </span>
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}