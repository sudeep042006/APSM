// ── Chart Tooltip ────────────────────────────────────────────────────
// A single professional tooltip shared by every chart. The previous codebase
// declared a separate `CustomTooltip` per page file, which is why tooltip
// styling drifted between dashboards.

import { compact, percent, watchTime } from "./chartTheme";

const VALUE_FORMATTERS = {
  compact,
  percent: (v) => percent(v),
  watchTime: (v) => watchTime(v),
  number: (v) => Number(v || 0).toLocaleString(),
  seconds: (v) => {
    const s = Number(v) || 0;
    const m = Math.floor(s / 60);
    return m > 0 ? `${m}m ${s % 60}s` : `${s}s`;
  },
};

/**
 * @param {object} props
 * @param {"compact"|"percent"|"watchTime"|"number"|"seconds"} [props.format]
 * @param {string} [props.valueSuffix] appended after the formatted value
 */
export default function ChartTooltip({
  active,
  payload,
  label,
  format = "compact",
  valueSuffix = "",
  labelFormatter,
  totalFor,
  showShare = false,
}) {
  if (!active || !Array.isArray(payload) || payload.length === 0) return null;

  const formatValue = VALUE_FORMATTERS[format] || compact;
  const visible = payload.filter((p) => p && p.value !== null && p.value !== undefined);
  if (visible.length === 0) return null;

  const total = typeof totalFor === "function" ? totalFor(visible) : visible.reduce((a, p) => a + (Number(p.value) || 0), 0);

  return (
    <div className="pointer-events-none min-w-[9rem] rounded-xl border border-white/10 bg-slate-900/95 p-3 shadow-2xl shadow-black/50 backdrop-blur-xl">
      {label !== undefined && label !== null && label !== "" && (
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          {typeof labelFormatter === "function" ? labelFormatter(label) : label}
        </p>
      )}

      <div className="space-y-1.5">
        {visible.map((entry, i) => (
          <div key={i} className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-2 text-xs text-slate-300">
              <span
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: entry.color || entry.fill || "#6366F1" }}
              />
              {entry.name || "value"}
            </span>
            <span className="font-semibold tabular-nums text-white">
              {formatValue(entry.value)}
              {valueSuffix}
            </span>
          </div>
        ))}
      </div>

      {showShare && visible.length > 1 && total > 0 && (
        <div className="mt-2 space-y-1.5 border-t border-white/10 pt-2">
          <p className="text-[11px] uppercase tracking-wider text-slate-500">Share of total</p>
          {visible.map((entry, i) => (
            <div key={`share-${i}`} className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-2 text-xs text-slate-400">
                <span
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ backgroundColor: entry.color || entry.fill || "#6366F1" }}
                />
                {entry.name || "value"}
              </span>
              <span className="text-xs font-semibold tabular-nums text-slate-200">
                {((Number(entry.value) / total) * 100).toFixed(1).replace(/\.0$/, "")}%
              </span>
            </div>
          ))}
        </div>
      )}

      {visible.length > 1 && (
        <div className="mt-2 flex items-center justify-between gap-4 border-t border-white/10 pt-2">
          <span className="text-[11px] uppercase tracking-wider text-slate-500">Total</span>
          <span className="text-xs font-bold tabular-nums text-slate-200">
            {formatValue(total)}
            {valueSuffix}
          </span>
        </div>
      )}
    </div>
  );
}
