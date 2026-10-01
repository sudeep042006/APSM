// ── Range Chips ──────────────────────────────────────────────────────
// Client-side window selector for an already-fetched series. Lets the user
// narrow a chart to the last 7 / 30 / 90 days without another API round-trip,
// and without the previous hard-coded "always 30 days" assumption.
const DEFAULT_RANGES = [
  { label: "7D", days: 7 },
  { label: "30D", days: 30 },
  { label: "90D", days: 90 },
  { label: "All", days: null },
];

/**
 * @param {object} props
 * @param {number} props.value            currently selected day count (null = all)
 * @param {Function} props.onChange        called with the new day count
 * @param {Array<{label,days}>} [props.ranges]
 * @param {number} [props.availableDays]   disables windows longer than the data
 */
export default function RangeChips({
  value,
  onChange,
  ranges = DEFAULT_RANGES,
  availableDays,
  className = "",
}) {
  if (!onChange) return null;

  return (
    <div
      role="group"
      aria-label="Time range"
      className={`inline-flex items-center gap-0.5 rounded-lg border border-white/[0.07] bg-slate-900/60 p-0.5 ${className}`}
    >
      {ranges.map((r) => {
        const active = value === r.days;
        const tooLong = r.days !== null && availableDays !== undefined && r.days > availableDays;
        return (
          <button
            key={r.label}
            type="button"
            disabled={tooLong}
            aria-pressed={active}
            title={
              tooLong
                ? `Only ${availableDays} days of history stored`
                : r.days
                ? `Last ${r.days} days`
                : "Full stored history"
            }
            onClick={() => onChange(r.days)}
            className={[
              "rounded-[6px] px-2 py-1 text-[11px] font-semibold tracking-tight transition-colors",
              active
                ? "bg-white/[0.10] text-slate-100 shadow-[0_1px_2px_rgba(0,0,0,0.4)]"
                : "text-slate-500 hover:text-slate-300",
              tooLong ? "cursor-not-allowed opacity-30 hover:text-slate-500" : "",
            ].join(" ")}
          >
            {r.label}
          </button>
        );
      })}
    </div>
  );
}