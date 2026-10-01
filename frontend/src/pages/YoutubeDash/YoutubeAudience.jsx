// ── YouTube Audience Page ───────────────────────────────────────────
// Audience demographics: age, gender, geography and device split.
//
// Every value on this page is measured by the YouTube Reporting API.
// The previous version showed "Returning Viewers" as `reach * 0.35` — a
// hard-coded guess presented as a metric — and "Unique Viewers" as `reach`,
// which the YouTube API does not expose at all. Both are gone.

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from "recharts";
import { Users, Eye, Globe, Smartphone, TrendingUp, UserCheck, Clock, MapPin } from "lucide-react";
import ChartCard from "@/components/charts/ChartCard";
import ChartTooltip from "@/components/charts/ChartTooltip";
import DonutChart from "@/components/charts/DonutChart";
import {
  CHART_COLORS,
  CURSOR,
  axisX,
  axisY,
  compact,
  niceDomain,
  percentDomain,
} from "@/components/charts/chartTheme";
import {
  parseCoreMetrics,
  parseCountryData,
  parseDeviceData,
  parseAgeGenderData,
  parseEffectiveRange,
  parseReportHealth,
  formatCompactNumber,
  formatWatchTime,
} from "@/services/ytapi";

// ── Skeleton loading state ──────────────────────────────────────────
function AudienceSkeleton() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="surface-card">
            <CardContent className="p-5">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="mt-3 h-7 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        {[1, 2].map((i) => (
          <Card key={i} className="surface-card">
            <CardHeader>
              <Skeleton className="h-5 w-36" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[280px] w-full rounded-lg" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ── Empty audience state ────────────────────────────────────────────
function EmptyAudience() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center animate-fade-in">
      <div className="max-w-md text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-500/10 ring-1 ring-violet-500/20">
          <Users className="h-8 w-8 text-violet-400" />
        </div>
        <h3 className="text-lg font-semibold text-white">No audience demographics available</h3>
        <p className="mt-2 text-sm leading-relaxed text-slate-400">
          YouTube only publishes age, gender and geography breakdowns once a channel passes its
          privacy threshold. Until then the Reporting API returns no rows, so there is nothing
          honest to display here.
        </p>
      </div>
    </div>
  );
}

// ── Small KPI tile ──────────────────────────────────────────────────
function AudienceKpi({ title, value, icon: Icon, hint }) {
  return (
    <Card className="surface-card group p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">{title}</p>
          <p className="mt-2 text-[26px] font-bold leading-none tracking-tight text-white tabular-nums">
            {value}
          </p>
          {hint && <p className="mt-2 text-[10px] leading-relaxed text-slate-500">{hint}</p>}
        </div>
        {Icon && (
          <span className="rounded-lg bg-white/5 p-1.5 ring-1 ring-white/10 transition-colors group-hover:bg-white/10">
            <Icon className="h-3.5 w-3.5 text-slate-300" />
          </span>
        )}
      </div>
    </Card>
  );
}

// ── Main Audience Component ─────────────────────────────────────────
export default function YoutubeAudience({ data, loading }) {
  if (loading) return <AudienceSkeleton />;
  if (!data) return <EmptyAudience />;

  const metrics = parseCoreMetrics(data);
  const countryData = parseCountryData(data).slice(0, 12);
  const deviceData = parseDeviceData(data);
  const { age: ageData, gender: genderData } = parseAgeGenderData(data);
  const range = parseEffectiveRange(data);
  const health = parseReportHealth(data);

  const totalViews = metrics.periodViews || countryData.reduce((a, c) => a + c.views, 0);
  const topCountry = countryData[0];
  const topCountryShare = totalViews > 0 && topCountry ? (topCountry.views / totalViews) * 100 : null;

  const rangeBadge = range ? (
    <span className="shrink-0 rounded-md bg-white/5 px-2 py-1 text-[10px] font-medium text-slate-400 ring-1 ring-white/10">
      {new Date(range.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })} –{" "}
      {new Date(range.endDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
    </span>
  ) : null;

  const anyDemographic = ageData.length > 0 || genderData.length > 0 || countryData.length > 0 || deviceData.length > 0;
  if (!anyDemographic) return <EmptyAudience />;

  const audienceKPIs = [
    {
      title: "Views in Period",
      value: formatCompactNumber(metrics.periodViews),
      icon: Eye,
      hint: "Measured daily views from the Reporting API",
    },
    {
      title: "Subscribers",
      value: formatCompactNumber(metrics.subscribers),
      icon: UserCheck,
      hint: "Lifetime, from channel statistics",
    },
    {
      title: "Watch Time",
      value: formatWatchTime(metrics.watchTimeMinutes),
      icon: Clock,
      hint: `${compact(Math.round(metrics.watchTimeMinutes))} minutes watched`,
    },
    {
      title: topCountry ? `Views from ${topCountry.country}` : "Top Country",
      value: topCountry ? formatCompactNumber(topCountry.views) : "—",
      icon: MapPin,
      hint: topCountryShare !== null ? `${topCountryShare.toFixed(1)}% of period views` : undefined,
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {audienceKPIs.map((kpi) => (
          <AudienceKpi key={kpi.title} {...kpi} />
        ))}
      </div>

      {/* ── Age & Gender ────────────────────────────────────────────── */}
      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard
          title="Audience by Age"
          subtitle="Share of viewers per age group"
          icon={<Users className="h-4 w-4 text-amber-400" />}
          badge={rangeBadge}
          data={ageData}
          valueKeys="percentage"
          technical={health.ageGender.reason}
          height={280}
          emptyMessages={{
            noDataTitle: "No age data",
            noDataDetail:
              "YouTube withholds age demographics for channels below its privacy threshold, so the report returns no rows.",
          }}
        >
          {(rows) => (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={rows} margin={{ top: 16, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.12)" vertical={false} />
                <XAxis dataKey="group" {...axisX({ tick: { fill: "#CBD5E1", fontSize: 11 }, dy: 4 })} />
                <YAxis {...axisY({ width: 44, domain: percentDomain, tickFormatter: (v) => `${v}%` })} />
                <Tooltip content={<ChartTooltip format="percent" />} cursor={CURSOR} />
                <Bar dataKey="percentage" name="Viewers" radius={[4, 4, 0, 0]} maxBarSize={52}>
                  {rows.map((row, i) => (
                    <Cell key={row.group || i} fill={CHART_COLORS.warning} fillOpacity={1 - i * 0.09} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard
          title="Audience by Gender"
          subtitle="Share of viewers per gender"
          icon={<Users className="h-4 w-4 text-pink-400" />}
          badge={rangeBadge}
          data={genderData}
          valueKeys="percentage"
          technical={health.ageGender.reason}
          height={280}
          emptyMessages={{
            noDataTitle: "No gender data",
            noDataDetail:
              "YouTube withholds gender demographics for channels below its privacy threshold, so the report returns no rows.",
          }}
        >
          {(rows) => (
            <DonutChart
              data={rows.map((g) => ({ ...g, name: g.label, value: g.percentage }))}
              height={280}
              outerRadius={92}
              innerRadius={60}
              tooltipFormat="percent"
              tooltipSuffix=" of viewers"
              centerLabel="of viewers"
            />
          )}
        </ChartCard>
      </div>

      {/* ── Geography ───────────────────────────────────────────────── */}
      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard
          title="Top Countries by Views"
          subtitle="Measured view count per country"
          icon={<Globe className="h-4 w-4 text-cyan-400" />}
          badge={rangeBadge}
          data={countryData}
          valueKeys="views"
          technical={health.country.reason}
          height={Math.max(280, countryData.length * 28 + 40)}
          emptyMessages={{
            noDataTitle: "No geographic data",
            noDataDetail: "The country report returned no rows with views for this window.",
          }}
        >
          {(rows) => (
            <ResponsiveContainer width="100%" height={Math.max(280, rows.length * 28 + 40)}>
              <BarChart data={rows} layout="vertical" margin={{ top: 4, right: 28, left: 8, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.12)" horizontal={false} />
                <XAxis type="number" {...axisX({ tickFormatter: compact, dy: 0 })} />
                <YAxis
                  type="category"
                  dataKey="country"
                  {...axisY({ width: 92, tick: { fill: "#CBD5E1", fontSize: 12 }, dy: 0 })}
                />
                <Tooltip content={<ChartTooltip />} cursor={CURSOR} />
                <Bar dataKey="views" name="Views" radius={[0, 4, 4, 0]} maxBarSize={20}>
                  {rows.map((row, i) => (
                    <Cell key={row.code || row.country || i} fill={CHART_COLORS.secondary} fillOpacity={1 - i * 0.06} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard
          title="Watch Time by Country"
          subtitle="Estimated minutes watched per country"
          icon={<Clock className="h-4 w-4 text-emerald-400" />}
          badge={rangeBadge}
          data={countryData.filter((c) => c.watchTime > 0)}
          valueKeys="watchTime"
          technical={health.country.reason}
          height={280}
          emptyMessages={{
            noDataTitle: "No watch-time breakdown",
            noDataDetail: "The country report did not include estimatedMinutesWatched for this window.",
          }}
        >
          {(rows) => (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart
                data={rows.slice(0, 8).map((r) => ({ ...r, watchHours: Math.round(r.watchTime / 60) }))}
                layout="vertical"
                margin={{ top: 4, right: 28, left: 8, bottom: 4 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.12)" horizontal={false} />
                <XAxis type="number" {...axisX({ tickFormatter: (v) => `${compact(v)}h`, dy: 0 })} />
                <YAxis
                  type="category"
                  dataKey="country"
                  {...axisY({ width: 92, tick: { fill: "#CBD5E1", fontSize: 12 }, dy: 0 })}
                />
                <Tooltip content={<ChartTooltip format="watchTime" valueSuffix=" watched" />} cursor={CURSOR} />
                <Bar dataKey="watchHours" name="Watch time" radius={[0, 4, 4, 0]} maxBarSize={20} fill={CHART_COLORS.success} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>

      {/* ── Devices ─────────────────────────────────────────────────── */}
      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard
          title="Viewing Devices"
          subtitle="Share of views by device type"
          icon={<Smartphone className="h-4 w-4 text-violet-400" />}
          badge={rangeBadge}
          data={deviceData}
          valueKeys="views"
          technical={health.device.reason}
          height={300}
          emptyMessages={{
            noDataTitle: "No device data",
            noDataDetail: "The deviceType report returned no rows for this window.",
          }}
        >
          {(rows) => (
            <DonutChart
              data={rows.map((d) => ({ ...d, name: d.device, value: d.views }))}
              height={300}
              outerRadius={98}
              innerRadius={64}
              centerLabel="Total Views"
            />
          )}
        </ChartCard>

        <ChartCard
          title="Watch Time by Device"
          subtitle="Where the watch time is actually spent"
          icon={<TrendingUp className="h-4 w-4 text-amber-400" />}
          badge={rangeBadge}
          data={deviceData.filter((d) => d.watchTime > 0)}
          valueKeys="watchTime"
          technical={health.device.reason}
          height={300}
          emptyMessages={{
            noDataTitle: "No device watch-time data",
            noDataDetail: "The device report did not include estimatedMinutesWatched for this window.",
          }}
        >
          {(rows) => (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={rows.map((r) => ({ ...r, watchHours: Math.round(r.watchTime / 60) }))}
                margin={{ top: 16, right: 8, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.12)" vertical={false} />
                <XAxis dataKey="device" {...axisX({ tick: { fill: "#CBD5E1", fontSize: 11 }, dy: 4 })} />
                <YAxis {...axisY({ domain: niceDomain(1.2), tickFormatter: (v) => `${compact(v)}h` })} />
                <Tooltip content={<ChartTooltip format="number" valueSuffix="h watched" />} cursor={CURSOR} />
                <Bar dataKey="watchHours" name="Watch time" radius={[4, 4, 0, 0]} maxBarSize={64}>
                  {rows.map((row, i) => (
                    <Cell key={row.device || i} fill={CHART_COLORS.warning} fillOpacity={1 - i * 0.12} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>
    </div>
  );
}
