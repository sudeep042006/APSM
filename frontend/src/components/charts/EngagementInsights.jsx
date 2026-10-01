// ── Engagement Insights ──────────────────────────────────────────────
// A single "what is actually happening" panel shared by the Facebook,
// Instagram and YouTube overview pages.
//
// Why this exists: the daily insight reports are empty for low-traffic pages
// (Meta returns no day-level rows, YouTube returns zero rows), so a purely
// time-series overview renders as blank cards. But the *content* endpoints
// always return measured per-item counts — reactions/likes/comments/views per
// post, video or media item. Those numbers are real and non-zero, so this
// panel builds the insights view from them instead of from an empty series.
//
// Everything rendered here is a measured count or a ratio of two measured
// counts. Nothing is estimated, forward-filled or invented. When a platform
// does not expose a metric (Instagram returns no share/reach/view counts on
// the public media endpoint), the panel says so instead of showing a zero.

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  Legend,
  Line,
  ComposedChart,
} from "recharts";
import { Activity, Eye, MessageCircle, Heart, Share2, MousePointerClick, Layers } from "lucide-react";
import ChartCard from "./ChartCard";
import DonutChart from "./DonutChart";
import ChartTooltip from "./ChartTooltip";
import { CHART_COLORS, CURSOR, axisX, axisY, compact } from "./chartTheme";

const shortLabel = (text, max = 22) => {
  const t = String(text || "").replace(/\s+/g, " ").trim();
  if (!t) return "Untitled";
  return t.length > max ? `${t.slice(0, max - 1)}…` : t;
};

const sum = (rows, key) =>
  (Array.isArray(rows) ? rows : []).reduce((a, r) => a + (Number(r?.[key]) || 0), 0);

/**
 * Normalises the per-item rows each page already has into one shape:
 * `{ id, label, date, likes, comments, shares, views }`.
 * `shares === null` means the platform does not expose it, which is different
 * from a measured zero and is preserved as null.
 */
const normalise = (rows, map) =>
  (Array.isArray(rows) ? rows : []).filter(Boolean).map((r, i) => {
    const m = map(r, i);
    const likes = Number(m.likes) || 0;
    const comments = Number(m.comments) || 0;
    const shares = m.shares === null || m.shares === undefined ? null : Number(m.shares) || 0;
    const views = m.views === null || m.views === undefined ? null : Number(m.views) || 0;
    const interactions = likes + comments + (shares || 0);
    return {
      id: m.id ?? `item-${i}`,
      label: shortLabel(m.label),
      date: m.date || null,
      likes,
      comments,
      shares,
      views,
      interactions,
      // A rate only exists when there is something to divide by.
      engagementRate: views && views > 0 ? (interactions / views) * 100 : null,
    };
  });

/**
 * @param {object} props
 * @param {Array}  props.items              per-item rows from the platform service
 * @param {Function} props.map               (row, index) => normalised fields
 * @param {string} props.platform            "facebook" | "instagram" | "youtube"
 * @param {string} props.accent             brand colour for single-series charts
 * @param {string} props.itemNoun           "post" / "video" / "reel" — used in copy
 * @param {boolean} [props.hasShares]       false when the platform exposes no share count
 * @param {boolean} [props.hasViews]        false when the platform exposes no view count
 */
export default function EngagementInsights({
  items,
  map,
  platform = "facebook",
  accent = CHART_COLORS.primary,
  itemNoun = "post",
  hasShares = true,
  hasViews = false,
}) {
  const rows = normalise(items, map);

  const totalLikes = sum(rows, "likes");
  const totalComments = sum(rows, "comments");
  const totalShares = hasShares ? sum(rows, "shares") : 0;
  const totalViews = hasViews ? sum(rows, "views") : 0;
  const totalInteractions = totalLikes + totalComments + totalShares;

  // Donut inputs only include categories the platform actually measured.
  const mix = [
    { name: "Likes", value: totalLikes },
    { name: "Comments", value: totalComments },
    ...(hasShares ? [{ name: "Shares", value: totalShares }] : []),
  ].filter((m) => m.value > 0);

  const perItem = rows.filter((r) => r.interactions > 0).sort((a, b) => b.interactions - a.interactions);

  const bestItem = perItem[0] || null;
  const avgInteractions = perItem.length > 0 ? totalInteractions / rows.length : 0;

  const rateRows = rows.filter((r) => r.engagementRate !== null);

  const emptyCopy = {
    noDataTitle: `No ${itemNoun} data`,
    noDataDetail: `The API returned no ${itemNoun} items for this account, so there is nothing to break down.`,
    zeroTitle: "No interactions yet",
    zeroDetail: `${rows.length} ${itemNoun}${rows.length === 1 ? "" : "s"} found, but none has recorded a like, comment or share.`,
  };

  return (
    <>
      {/* ── Composition: how interactions split ─────────────────────── */}
      <div className="grid gap-6 lg:grid-cols-3">
        <ChartCard
          title="Interaction Mix"
          subtitle={`Measured likes, comments${hasShares ? " and shares" : ""} across ${rows.length} ${itemNoun}${rows.length === 1 ? "" : "s"}`}
          icon={<Layers className="h-4 w-4" style={{ color: accent }} />}
          data={mix}
          valueKeys="value"
          height={260}
          emptyMessages={{
            noDataTitle: "No interactions to split",
            noDataDetail: emptyCopy.noDataDetail,
            zeroTitle: emptyCopy.zeroTitle,
            zeroDetail: emptyCopy.zeroDetail,
          }}
        >
          {(chartRows) => (
            <DonutChart
              data={chartRows}
              height={260}
              outerRadius={92}
              innerRadius={60}
              tooltipFormat="number"
              centerLabel="interactions"
              centerValue={compact(totalInteractions)}
            />
          )}
        </ChartCard>

        <ChartCard
          title={`Interactions per ${itemNoun[0].toUpperCase()}${itemNoun.slice(1)}`}
          subtitle={`Ranked by measured interactions. Average ${compact(Math.round(avgInteractions))} per ${itemNoun}.`}
          icon={<Heart className="h-4 w-4" style={{ color: accent }} />}
          data={perItem}
          valueKeys="interactions"
          height={Math.max(260, perItem.length * 30 + 40)}
          emptyMessages={{
            noDataTitle: emptyCopy.zeroTitle,
            noDataDetail: emptyCopy.zeroDetail,
          }}
        >
          {(chartRows) => (
            <ResponsiveContainer width="100%" height={Math.max(260, chartRows.length * 30 + 40)}>
              <BarChart data={chartRows} layout="vertical" margin={{ top: 4, right: 20, left: 8, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.12)" horizontal={false} />
                <XAxis type="number" {...axisX({ tickFormatter: compact, dy: 0 })} />
                <YAxis
                  type="category"
                  dataKey="label"
                  width={128}
                  {...axisY({ width: 128, tick: { fill: "#CBD5E1", fontSize: 11 }, dy: 0 })}
                />
                <Tooltip content={<ChartTooltip />} cursor={CURSOR} />
                <Legend
                  wrapperStyle={{ fontSize: 11, color: "#94A3B8", paddingTop: 8 }}
                  iconType="circle"
                  iconSize={8}
                />
                <Bar dataKey="likes" name="Likes" stackId="a" fill={CHART_COLORS.primary} maxBarSize={20} />
                <Bar dataKey="comments" name="Comments" stackId="a" fill={CHART_COLORS.secondary} maxBarSize={20} />
                {hasShares && (
                  <Bar
                    dataKey="shares"
                    name="Shares"
                    stackId="a"
                    fill={CHART_COLORS.pink}
                    radius={[0, 4, 4, 0]}
                    maxBarSize={20}
                  />
                )}
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        {/* ── Rate: interactions ÷ views. Only when views are measured. ── */}
        <ChartCard
          title="Engagement Rate per Item"
          subtitle={
            hasViews
              ? "Interactions divided by views, per item. Bars only appear where views are above zero."
              : `${platform} does not expose a per-item view or reach count here, so a rate cannot be measured.`
          }
          icon={<Activity className="h-4 w-4" style={{ color: accent }} />}
          data={rateRows}
          valueKeys="engagementRate"
          height={Math.max(260, rateRows.length * 30 + 40)}
          emptyMessages={{
            noDataTitle: hasViews ? "No rate to plot" : "Views not available",
            noDataDetail: hasViews
              ? "None of the items has a view count above zero, so interactions ÷ views is undefined."
              : `The ${platform} API returns no view count for these items. Reach and view metrics require per-item insight endpoints that this integration does not call, so the rate is not shown rather than guessed.`,
            zeroTitle: "Zero engagement rate",
            zeroDetail: "Every item has views but no interactions, so the rate measures 0%.",
          }}
        >
          {(chartRows) => (
            <ResponsiveContainer width="100%" height={Math.max(260, chartRows.length * 30 + 40)}>
              <BarChart data={chartRows} layout="vertical" margin={{ top: 4, right: 20, left: 8, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.12)" horizontal={false} />
                <XAxis type="number" {...axisX({ tickFormatter: (v) => `${v}%`, dy: 0 })} />
                <YAxis
                  type="category"
                  dataKey="label"
                  width={128}
                  {...axisY({ width: 128, tick: { fill: "#CBD5E1", fontSize: 11 }, dy: 0 })}
                />
                <Tooltip content={<ChartTooltip format="percent" />} cursor={CURSOR} />
                <Bar dataKey="engagementRate" name="Engagement rate" radius={[0, 4, 4, 0]} maxBarSize={20}>
                  {chartRows.map((row, i) => (
                    <Cell key={row.id || i} fill={accent} fillOpacity={1 - i * 0.07} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>

      {/* ── Highlight strip: the one number worth remembering ───────── */}
      {bestItem && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Highlight
            icon={<MousePointerClick className="h-4 w-4" />}
            label={`Top ${itemNoun} by interactions`}
            value={bestItem.label}
            detail={`${compact(bestItem.interactions)} interactions${bestItem.date ? ` · ${bestItem.date}` : ""}`}
            accent={accent}
          />
          <Highlight
            icon={<Heart className="h-4 w-4" />}
            label="Likes"
            value={compact(totalLikes)}
            detail={
              totalInteractions > 0
                ? `${((totalLikes / totalInteractions) * 100).toFixed(0)}% of all interactions`
                : "No interactions recorded"
            }
            accent={accent}
          />
          <Highlight
            icon={<MessageCircle className="h-4 w-4" />}
            label="Comments"
            value={compact(totalComments)}
            detail={
              totalInteractions > 0
                ? `${((totalComments / totalInteractions) * 100).toFixed(0)}% of all interactions`
                : "No comments recorded"
            }
            accent={accent}
          />
          {hasViews ? (
            <Highlight
              icon={<Eye className="h-4 w-4" />}
              label="Views"
              value={compact(totalViews)}
              detail={`${rateRows.length} item${rateRows.length === 1 ? "" : "s"} with measurable views`}
              accent={accent}
            />
          ) : (
            <Highlight
              icon={<Share2 className="h-4 w-4" />}
              label="Shares"
              value={hasShares ? compact(totalShares) : "Not exposed"}
              detail={
                hasShares
                  ? `${((totalShares / totalInteractions) * 100).toFixed(0)}% of all interactions`
                  : `The ${platform} API returns no share count for these items`
              }
              accent={accent}
            />
          )}
        </div>
      )}

      {/* ── Trend across items, in published order ───────────────────── */}
      {rows.length > 1 && (
        <ChartCard
          title={`Interaction Trend by ${itemNoun[0].toUpperCase()}${itemNoun.slice(1)}`}
          subtitle="Measured interactions for each item, oldest first — hover to read exact values"
          icon={<Activity className="h-4 w-4" style={{ color: accent }} />}
          data={[...rows].reverse()}
          valueKeys="interactions"
          height={280}
          emptyMessages={{
            noDataTitle: emptyCopy.zeroTitle,
            noDataDetail: emptyCopy.zeroDetail,
          }}
        >
          {(chartRows) => (
            <ResponsiveContainer width="100%" height={280}>
              <ComposedChart data={chartRows} margin={{ top: 10, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.12)" vertical={false} />
                <XAxis dataKey="label" interval={0} angle={-18} textAnchor="end" height={64} {...axisX({ tick: { fill: "#94A3B8", fontSize: 10 }, dy: 0 })} />
                <YAxis {...axisY()} />
                <Tooltip content={<ChartTooltip />} cursor={CURSOR} />
                <Legend
                  wrapperStyle={{ fontSize: 11, color: "#94A3B8", paddingTop: 8 }}
                  iconType="circle"
                  iconSize={8}
                />
                <Bar dataKey="likes" name="Likes" stackId="a" fill={CHART_COLORS.primary} maxBarSize={26} radius={[0, 0, 0, 0]} />
                <Bar dataKey="comments" name="Comments" stackId="a" fill={CHART_COLORS.secondary} maxBarSize={26} radius={[4, 4, 0, 0]} />
                <Line type="monotone" dataKey="interactions" name="Total" stroke={CHART_COLORS.warning} strokeWidth={2} dot={{ r: 3 }} isAnimationActive={false} />
              </ComposedChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      )}
    </>
  );
}

/** Compact stat used in the highlight strip. */
function Highlight({ icon, label, value, detail, accent }) {
  return (
    <div className="surface-card flex items-start gap-3 p-4">
      <span
        className="rounded-lg p-2 ring-1 ring-inset"
        style={{ backgroundColor: `${accent}1a`, color: accent, "--tw-ring-color": `${accent}33` }}
      >
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">{label}</p>
        <p className="mt-1 truncate text-base font-bold text-white" title={value}>
          {value}
        </p>
        <p className="mt-0.5 text-[11px] text-slate-500">{detail}</p>
      </div>
    </div>
  );
}