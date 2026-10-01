// ── Chart Type Toggle ────────────────────────────────────────────────
// Segmented Area / Bar / Line switch. Lets a single set of measured values be
// re-read as a different shape without another data request, so the "graph
// section" is genuinely interactive rather than a static SVG dump.
const OPTIONS = [
  { value: "area", label: "Area", title: "Filled area — good for cumulative volume" },
  { value: "line", label: "Line", title: "Line — good for spotting trends and crossovers" },
  { value: "bar", label: "Bars", title: "Bars — good for comparing individual days" },
];

/**
 * @param {object} props
 * @param {("area"|"line"|"bar")} props.value
 * @param {Function} props.onChange
 * @param {Array<{value,label,title}>} [props.options]
 */
export default function ChartTypeToggle({ value, onChange, options = OPTIONS, className = "" }) {
  if (!onChange) return null;

  return (
    <div
      role="group"
      aria-label="Chart type"
      className={`inline-flex items-center gap-0.5 rounded-lg border border-white/[0.07] bg-slate-900/60 p-0.5 ${className}`}
    >
      {options.map((opt) => {
        const active = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            title={opt.title}
            aria-pressed={active}
            onClick={() => onChange(opt.value)}
            className={[
              "rounded-[6px] px-2.5 py-1 text-[11px] font-semibold tracking-tight transition-colors",
              active
                ? "bg-white/[0.10] text-slate-100 shadow-[0_1px_2px_rgba(0,0,0,0.4)]"
                : "text-slate-500 hover:text-slate-300",
            ].join(" ")}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}