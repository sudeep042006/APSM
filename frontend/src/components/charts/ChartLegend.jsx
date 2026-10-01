// ── Interactive Legend ───────────────────────────────────────────────
// Recharts' built-in <Legend> is static markup: it cannot be clicked, and it
// renders the same grey dot whether or not a series carries data. This is a
// real legend — click a series to hide/show it, hover to isolate its shape,
// and read each series' total straight from the legend row.
import { useState } from "react";
import { compact, percent } from "./chartTheme";

/**
 * @param {object} props
 * @param {Array<{key,name,color,value,total,format}>} props.items
 * @param {Function} [props.onToggle]   called with (key, visible)
 * @param {Function} [props.onHover]    called with (key | null)
 * @param {boolean} [props.interactive]  disable to render a static legend
 */
export default function ChartLegend({
  items = [],
  onToggle,
  onHover,
  interactive = true,
  format = "compact",
  className = "",
}) {
  const [hovered, setHovered] = useState(null);

  if (items.length === 0) return null;

  const fmt = (v) => (format === "percent" ? percent(v) : compact(v));

  return (
    <ul className={`flex flex-wrap items-center gap-x-4 gap-y-2 pt-3 ${className}`}>
      {items.map((item) => {
        const off = item.visible === false;
        const isHovered = hovered === item.key;

        const handleEnter = () => {
          setHovered(item.key);
          if (onHover) onHover(item.key);
        };
        const handleLeave = () => {
          setHovered(null);
          if (onHover) onHover(null);
        };
        const handleClick = () => {
          if (interactive && onToggle) onToggle(item.key, off);
        };

        return (
          <li key={item.key}>
            <button
              type="button"
              onMouseEnter={handleEnter}
              onMouseLeave={handleLeave}
              onFocus={handleEnter}
              onBlur={handleLeave}
              onClick={handleClick}
              aria-pressed={!off}
              disabled={!interactive}
              title={
                interactive
                  ? `${off ? "Show" : "Hide"} ${item.name}`
                  : item.name
              }
              className={[
                "flex items-center gap-2 rounded-md px-1.5 py-1 transition-colors",
                interactive ? "cursor-pointer hover:bg-white/[0.05]" : "cursor-default",
                isHovered && !off ? "bg-white/[0.06]" : "",
                off ? "opacity-35" : "",
              ].join(" ")}
            >
              <span
                className="h-2 w-2 shrink-0 rounded-full transition-transform"
                style={{
                  backgroundColor: item.color,
                  transform: isHovered && !off ? "scale(1.35)" : "scale(1)",
                }}
              />
              <span
                className={`text-[11px] font-medium tracking-tight ${
                  off ? "text-slate-600 line-through" : "text-slate-400"
                }`}
              >
                {item.name}
              </span>
              {item.value !== undefined && (
                <span className="text-[11px] font-semibold tabular-nums text-slate-200">
                  {fmt(item.value)}
                </span>
              )}
              {item.share !== undefined && (
                <span className="text-[10px] tabular-nums text-slate-500">
                  {Math.round(item.share * 10) / 10}%
                </span>
              )}
            </button>
          </li>
        );
      })}
    </ul>
  );
}