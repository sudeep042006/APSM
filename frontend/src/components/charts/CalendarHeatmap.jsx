// ── Calendar Heatmap ────────────────────────────────────────────────
// A calendar grid of daily values. Far easier to read at a glance than a
// 30-point line, because it exposes weekday/weekend patterns and outliers
// immediately. Built entirely from the measured daily report.

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

/** Perceptually-ordered steps — dark → bright, readable on a dark surface. */
const HEAT_STEPS = [
  "bg-white/[0.03]",
  "bg-indigo-500/25",
  "bg-indigo-500/45",
  "bg-indigo-500/70",
  "bg-indigo-400",
];

const stepFor = (value, max) => {
  if (!value || max <= 0) return 0;
  const ratio = value / max;
  if (ratio <= 0.2) return 1;
  if (ratio <= 0.45) return 2;
  if (ratio <= 0.7) return 3;
  return 4;
};

export default function CalendarHeatmap({
  data = [],
  valueKey = "views",
  formatValue = (v) => v,
  onSelect,
  title,
}) {
  const [hover, setHover] = useState(null);
  const [offset, setOffset] = useState(0); // 0 = most recent month

  const max = useMemo(
    () => data.reduce((m, d) => Math.max(m, Number(d?.[valueKey]) || 0), 0),
    [data, valueKey]
  );

  const byDate = useMemo(() => {
    const map = new Map();
    for (const d of data) if (d?.rawDate) map.set(d.rawDate, d);
    return map;
  }, [data]);

  // Determine which months are covered so the pager has real bounds.
  const months = useMemo(() => {
    if (data.length === 0) return [];
    const first = new Date(data[0].rawDate);
    const last = new Date(data[data.length - 1].rawDate);
    const list = [];
    const cur = new Date(first.getFullYear(), first.getMonth(), 1);
    const end = new Date(last.getFullYear(), last.getMonth(), 1);
    while (cur <= end) {
      list.push(new Date(cur));
      cur.setMonth(cur.getMonth() + 1);
    }
    return list.reverse(); // newest first
  }, [data]);

  const activeMonth = months[0] ? new Date(months[0].getFullYear(), months[0].getMonth() + offset) : null;
  const canGoBack = offset < months.length - 1;
  const canGoForward = offset > 0;

  const cells = useMemo(() => {
    if (!activeMonth) return [];
    const year = activeMonth.getFullYear();
    const month = activeMonth.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    // Monday-first grid offset
    const firstWeekday = (new Date(year, month, 1).getDay() + 6) % 7;

    const out = [];
    for (let i = 0; i < firstWeekday; i++) out.push(null);
    for (let day = 1; day <= daysInMonth; day++) {
      const raw = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      const entry = byDate.get(raw);
      const value = entry ? Number(entry[valueKey]) || 0 : 0;
      out.push({
        day,
        raw,
        value,
        hasData: !!entry,
        label: entry?.date || raw,
      });
    }
    return out;
  }, [activeMonth, byDate, valueKey]);

  if (data.length === 0) return null;

  return (
    <div className="space-y-3">
      {months.length > 1 && (
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setOffset((o) => Math.min(months.length - 1, o + 1))}
            disabled={!canGoBack}
            className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-white/5 hover:text-slate-200 disabled:opacity-30 disabled:hover:bg-transparent"
            aria-label="Previous month"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-xs font-semibold text-slate-300">
            {activeMonth ? `${MONTHS[activeMonth.getMonth()]} ${activeMonth.getFullYear()}` : "—"}
          </span>
          <button
            type="button"
            onClick={() => setOffset((o) => Math.max(0, o - 1))}
            disabled={!canGoForward}
            className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-white/5 hover:text-slate-200 disabled:opacity-30 disabled:hover:bg-transparent"
            aria-label="Next month"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="overflow-x-auto">
        <div className="min-w-max">
          <div className="mb-1.5 grid grid-cols-[repeat(7,1fr)_56px] gap-1.5 text-[10px] font-medium text-slate-500">
            {WEEKDAYS.map((d) => (
              <span key={d} className="text-center">
                {d}
              </span>
            ))}
            <span />
          </div>

          <div className="grid grid-cols-[repeat(7,1fr)_56px] gap-1.5">
            {cells.map((cell, i) =>
              cell === null ? (
                <span key={`pad-${i}`} />
              ) : (
                <button
                  key={cell.raw}
                  type="button"
                  disabled={!cell.hasData}
                  onMouseEnter={() => setHover(cell)}
                  onMouseLeave={() => setHover(null)}
                  onFocus={() => setHover(cell)}
                  onBlur={() => setHover(null)}
                  onClick={() => cell.hasData && onSelect?.(cell)}
                  className={`group relative aspect-square rounded-md ring-1 transition-all duration-150 ${HEAT_STEPS[stepFor(cell.value, max)]} ${
                    cell.hasData
                      ? "cursor-pointer ring-white/10 hover:scale-110 hover:ring-white/40 focus:outline-none focus:ring-2 focus:ring-primary"
                      : "cursor-default ring-transparent"
                  }`}
                  aria-label={`${cell.label}: ${formatValue(cell.value)}`}
                >
                  <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-[9px] font-semibold text-white/0 transition-colors group-hover:text-white/80">
                    {cell.day}
                  </span>
                </button>
              )
            )}

            {/* Row total for the month, so the grid also reads numerically. */}
            <div className="flex items-center justify-end text-[10px] font-semibold text-slate-400">
              {cells
                .filter(Boolean)
                .reduce((a, c) => a + c.value, 0) > 0
                ? formatValue(cells.filter(Boolean).reduce((a, c) => a + c.value, 0))
                : "—"}
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 pt-1">
        <div className="min-h-4 text-[11px] text-slate-400">
          {hover ? (
            <span>
              <strong className="text-slate-200">{hover.label}</strong> · {formatValue(hover.value)}
              {title ? ` ${title}` : ""}
            </span>
          ) : (
            <span className="text-slate-500">Hover a square for the exact value</span>
          )}
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
          <span>Low</span>
          {HEAT_STEPS.map((s, i) => (
            <span key={i} className={`h-3 w-3 rounded-sm ring-1 ring-white/10 ${s}`} />
          ))}
          <span>High</span>
        </div>
      </div>
    </div>
  );
}
