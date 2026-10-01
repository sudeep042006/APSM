// ── Time Series Chart ────────────────────────────────────────────────
// The single interactive plot surface for every time-series graph in the
// product. Facebook and Instagram previously shipped four hand-rolled
// `CustomTooltip` components, hard-coded `#161B22` panels and per-page axis
// props, which is why the same metric looked different on each tab.
//
// This component owns the whole plot: axes, grid, crosshair, tooltip, legend
// and the empty-data gate. Interactivity is real, not cosmetic:
//   • crosshair + rich tooltip listing every visible series and the row total
//   • click any legend entry to hide/show that series
//   • Area / Line / Bars switch re-renders the same measured values
//   • an optional dashed average line, computed from the visible rows only
//
// It never invents data. If the API returned nothing, `ChartCard` renders an
// explanation instead of a blank frame.
import { useMemo, useState } from "react";
import {
  ResponsiveContainer,
  Area,
  Line,
  Bar,
  AreaChart,
  LineChart,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
} from "recharts";
import ChartCard from "./ChartCard";
import ChartTooltip from "./ChartTooltip";
import ChartLegend from "./ChartLegend";
import ChartTypeToggle from "./ChartTypeToggle";
import {
  CURSOR,
  GRID_PROPS,
  axisX as axisXBase,
  axisY as axisYBase,
  niceDomain,
  signedDomain,
  percentDomain,
  shortDate,
  meanOf,
  sumOf,
} from "./chartTheme";
import { seriesColors, withAlpha } from "./platformTheme";

const CHART_BY_TYPE = { area: AreaChart, line: LineChart, bar: BarChart };

/**
 * @typedef {Object} SeriesSpec
 * @property {string} key              row key, e.g. "reach"
 * @property {string} name             legend label
 * @property {"area"|"line"|"bar"} [kind="area"]
 * @property {string} [color]          override; otherwise derived from the platform palette
 * @property {boolean} [percentAxis]   plot this series on a 0–100 right-hand axis
 * @property {boolean} [rightAxis]     plot this series on an unscales right-hand axis
 * @property {number} [opacity]
 * @property {boolean} [dot]
 * @property {number[]} [radius]
 * @property {number} [barSize]
 */

/**
 * @param {object} props
 * @param {Array} props.data                        time-ordered rows
 * @param {SeriesSpec[]} props.series               one entry per plotted series
 * @param {string} [props.platform="youtube"]        selects the brand palette
 * @param {string} [props.title]
 * @param {string} [props.subtitle]
 * @param {React.ReactNode} [props.icon]
 * @param {React.ReactNode} [props.badge]
 * @param {string} [props.dateKey="date"]           X axis key
 * @param {string[]} [props.valueKeys]              keys proving the chart has real data
 * @param {number} [props.height=300]
 * @param {"compact"|"number"|"percent"|"watchTime"|"seconds"} [props.format="compact"]
 * @param {"normal"|"percent"|"signed"} [props.domainMode="normal"]
 * @param {boolean} [props.showAverage]             dashed measured-average reference line
 * @param {boolean} [props.allowTypeSwitch=true]
 * @param {("area"|"line"|"bar")} [props.initialType="area"]
 * @param {object} [props.emptyMessages]
 * @param {string} [props.technical]                API-level reason shown when empty
 * @param {Function} [props.tickX]
 * @param {Function} [props.onRowHover]             (row | null) => void
 */
export default function TimeSeriesChart({
  data,
  series,
  platform = "youtube",
  title,
  subtitle,
  icon,
  badge,
  dateKey = "date",
  valueKeys,
  height = 300,
  format = "compact",
  domainMode = "normal",
  showAverage = false,
  allowTypeSwitch = true,
  initialType = "area",
  emptyMessages,
  technical,
  tickX = shortDate,
  className = "",
  contentClassName = "",
}) {
  const [type, setType] = useState(initialType);
  const [hidden, setHidden] = useState(() => new Set());
  const [isolated, setIsolated] = useState(null);

  const specs = useMemo(() => {
    const list = Array.isArray(series) ? series.filter((s) => s && s.key) : [];
    return list.map((s, i) => ({
      ...s,
      name: s.name || s.key,
      kind: s.kind || "area",
      color: s.color || seriesColors(platform, list.length, 0)[i] || seriesColors(platform, 1)[0],
    }));
  }, [series, platform]);

  const guardKeys = useMemo(
    () => (Array.isArray(valueKeys) && valueKeys.length ? valueKeys : specs.map((s) => s.key)),
    [valueKeys, specs]
  );

  const yDomain = useMemo(() => {
    if (domainMode === "percent") return percentDomain;
    if (domainMode === "signed") return signedDomain(1.15);
    return niceDomain(1.2);
  }, [domainMode]);

  // Only the series still switched on participate in axis scaling and the
  // average line, so hiding a series actually changes what you read.
  const plotted = useMemo(
    () => specs.filter((s) => !hidden.has(s.key)).map((s) => s.key),
    [specs, hidden]
  );

  const average = useMemo(() => {
    if (!showAverage || plotted.length === 0 || !Array.isArray(data)) return null;
    const total = plotted.reduce((acc, k) => acc + meanOf(data, k), 0);
    return total > 0 ? total : null;
  }, [showAverage, plotted, data]);

  const toggle = (key) =>
    setHidden((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  const legendItems = useMemo(() => {
    const visible = plotted.length > 0 ? plotted : specs.map((s) => s.key);
    const rowTotal = specs.reduce(
      (acc, s) => acc + (visible.includes(s.key) ? sumOf(data, s.key) : 0),
      0
    );
    return specs.map((s) => {
      const v = sumOf(data, s.key);
      return {
        key: s.key,
        name: s.name,
        color: s.color,
        visible: !hidden.has(s.key),
        value: v,
        share: rowTotal > 0 && !hidden.has(s.key) ? (v / rowTotal) * 100 : undefined,
      };
    });
  }, [specs, plotted, data, hidden]);

  // Isolating a series raises it above the rest so the crossover is readable.
  const opacityFor = (spec) => {
    if (hidden.has(spec.key)) return 0;
    if (isolated && isolated !== spec.key) return 0.22;
    return 1;
  };

  const ChartRoot = CHART_BY_TYPE[type] || AreaChart;
  const wantsRightAxis = specs.some((s) => s.rightAxis);
  const wantsPercentAxis = specs.some((s) => s.percentAxis);
  const cursorFill = withAlpha(specs[0]?.color || "#6366F1", 0.07);

  /** Left-axis series scale together; right-axis series get their own. */
  const leftKeys = specs.filter((s) => !s.rightAxis && !s.percentAxis).map((s) => s.key);
  const rightKeys = specs.filter((s) => s.rightAxis && !s.percentAxis).map((s) => s.key);
  const hasRight = wantsRightAxis || wantsPercentAxis;

  const axisFor = (keys) => {
    const rows = Array.isArray(data) ? data : [];
    const peak = keys.reduce((acc, k) => Math.max(acc, ...rows.map((r) => Number(r?.[k]) || 0)), 0);
    return niceDomain(peak > 0 ? peak * 1.2 : 0);
  };

  const plot = (rows) => {
    const visibleRows = Array.isArray(rows) ? rows : [];
    return (
      <div>
        <ResponsiveContainer width="100%" height={height}>
          <ChartRoot data={visibleRows} margin={{ top: 10, right: hasRight ? 4 : 8, left: 0, bottom: 0 }}>
            <CartesianGrid {...GRID_PROPS} />
            <XAxis dataKey={dateKey} {...axisXBase({ tickFormatter: tickX })} />
            <YAxis yAxisId="left" {...axisYBase({ domain: leftKeys.length ? axisFor(leftKeys) : yDomain })} />
            {hasRight && (
              <YAxis
                yAxisId="right"
                orientation="right"
                width={46}
                domain={wantsPercentAxis ? percentDomain : axisFor(rightKeys)}
                {...axisYBase({
                  width: 46,
                  orientation: "right",
                  domain: wantsPercentAxis ? percentDomain : axisFor(rightKeys),
                  tickFormatter: wantsPercentAxis ? (v) => `${v}%` : undefined,
                })}
              />
            )}

            {average !== null && (
              <ReferenceLine
                y={average}
                yAxisId="left"
                stroke="rgba(148,163,184,0.5)"
                strokeDasharray="4 4"
                label={{
                  value: `avg ${format === "percent" ? `${average.toFixed(1)}%` : Math.round(average).toLocaleString()}`,
                  position: "insideTopRight",
                  fill: "rgba(148,163,184,0.9)",
                  fontSize: 10,
                }}
              />
            )}

            <Tooltip
              cursor={{ stroke: CURSOR, strokeWidth: 1, fill: cursorFill }}
              labelFormatter={shortDate}
              content={<ChartTooltip format={format} showShare={specs.length > 1} />}
            />

            {specs.map((spec) => {
              const yAxisId = spec.percentAxis || spec.rightAxis ? "right" : "left";
              // `key` is deliberately absent here. Recharts renders one series
              // element per spec, and spreading `key` into the JSX props object
              // made React warn that keys must be passed directly. It is passed
              // explicitly on each element below instead.
              const common = {
                yAxisId,
                name: spec.name,
                dataKey: spec.key,
                stroke: spec.color,
                fillOpacity: opacityFor(spec),
                strokeOpacity: opacityFor(spec),
                hide: hidden.has(spec.key),
                isAnimationActive: false,
              };

              if (spec.kind === "bar") {
                return (
                  <Bar
                    key={spec.key}
                    {...common}
                    fill={spec.color}
                    maxBarSize={spec.barSize ?? 26}
                    radius={spec.radius ?? [4, 4, 0, 0]}
                    activeBar={{ fill: spec.color, fillOpacity: 0.85 }}
                  />
                );
              }

              if (spec.kind === "line") {
                return (
                  <Line
                    key={spec.key}
                    {...common}
                    type="monotone"
                    strokeWidth={spec.strokeWidth ?? 2.2}
                    dot={spec.dot ?? false}
                    activeDot={{ r: 4, strokeWidth: 0, fill: spec.color }}
                  />
                );
              }

              const gid = `ts-${platform}-${spec.key.replace(/[^a-zA-Z0-9]/g, "")}`;
              const top = spec.opacity ?? 0.32;
              return (
                <Area
                  key={spec.key}
                  {...common}
                  type="monotone"
                  strokeWidth={spec.strokeWidth ?? 2.2}
                  dot={spec.dot ?? false}
                  activeDot={{ r: 4, strokeWidth: 0, fill: spec.color }}
                  fill={`url(#${gid})`}
                >
                  <defs>
                    <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={spec.color} stopOpacity={top} />
                      <stop offset="100%" stopColor={spec.color} stopOpacity={0.01} />
                    </linearGradient>
                  </defs>
                </Area>
              );
            })}
          </ChartRoot>
        </ResponsiveContainer>

        <ChartLegend
          items={legendItems}
          format={format}
          onToggle={toggle}
          onHover={setIsolated}
        />
      </div>
    );
  };

  return (
    <ChartCard
      title={title}
      subtitle={subtitle}
      icon={icon}
      badge={badge}
      data={data}
      valueKeys={guardKeys}
      technical={technical}
      height={height}
      emptyMessages={emptyMessages}
      className={className}
      contentClassName={contentClassName}
      actions={
        allowTypeSwitch ? (
          <ChartTypeToggle value={type} onChange={setType} />
        ) : (
          badge
        )
      }
    >
      {plot}
    </ChartCard>
  );
}