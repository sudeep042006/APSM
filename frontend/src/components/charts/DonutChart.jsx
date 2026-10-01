// ── Donut Chart ──────────────────────────────────────────────────────
// Reusable hollow-pie used for device split, gender split and share meters.
// The centre label shows the total so the chart is readable at a glance
// instead of being a bare ring.

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import ChartTooltip from "./ChartTooltip";
import { CATEGORICAL, compact } from "./chartTheme";

export default function DonutChart({
  data,
  dataKey = "value",
  nameKey = "name",
  colors = CATEGORICAL,
  height = 240,
  outerRadius = 92,
  innerRadius = 62,
  centerLabel,
  centerValue,
  tooltipFormat = "compact",
  tooltipSuffix = "",
  showTooltip = true,
}) {
  const total = data.reduce((a, d) => a + (Number(d?.[dataKey]) || 0), 0);

  return (
    <div className="relative" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            paddingAngle={2.5}
            dataKey={dataKey}
            nameKey={nameKey}
            stroke="rgba(15,23,42,0.9)"
            strokeWidth={2}
            isAnimationActive
            animationDuration={700}
          >
            {data.map((entry, i) => (
              <Cell key={`${entry?.[nameKey]}-${i}`} fill={colors[i % colors.length]} />
            ))}
          </Pie>
          {showTooltip && (
            <Tooltip
              content={<ChartTooltip format={tooltipFormat} valueSuffix={tooltipSuffix} />}
            />
          )}
        </PieChart>
      </ResponsiveContainer>

      {(centerLabel || centerValue !== undefined) && (
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold tabular-nums text-white">
            {centerValue !== undefined ? centerValue : compact(total)}
          </span>
          {centerLabel && (
            <span className="mt-0.5 text-[10px] font-medium uppercase tracking-wider text-slate-400">
              {centerLabel}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
