import { Activity, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ChartTooltip from "@/components/charts/ChartTooltip";
import { PLATFORM_ACCENT } from "@/components/charts/platformTheme";
import { compact, percent } from "@/components/charts/chartTheme";

const FB_BLUE = PLATFORM_ACCENT.facebook;

export function EmptyState({ title, description, icon: Icon, actionLabel, onAction, accent = "blue" }) {
  const ring = accent === "pink" ? "bg-pink-500/10 text-pink-400" : "bg-blue-500/10 text-blue-400";
  const btn = accent === "pink" ? "bg-[#E1306C] hover:bg-[#E1306C]/90" : "bg-blue-600 hover:bg-blue-700";
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-white/10 bg-slate-900/30 px-4 py-16 text-center">
      {Icon && (
        <div className={`mb-5 flex h-14 w-14 items-center justify-center rounded-full ${ring}`}>
          <Icon className="h-7 w-7" />
        </div>
      )}
      <h3 className="mb-2 text-base font-semibold text-white">{title}</h3>
      {description && <p className="max-w-md text-sm leading-relaxed text-slate-400">{description}</p>}
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className={`mt-5 rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors ${btn}`}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}

// ── Empty Data State ─────────────────────────────────────────────────────────
// Shown when the user IS connected but the API has returned no analytics data.
// Prevents "0s and N/As" from rendering across all chart panels.
export function EmptyDataState({ platform }) {
  const isFb = platform === "Facebook";
  const accent = isFb ? "text-blue-400" : "text-pink-400";
  const ring   = isFb ? "bg-blue-500/10" : "bg-pink-500/10";
  return (
    <div className="flex min-h-[50vh] items-center justify-center w-full">
      <div className="flex flex-col items-center gap-4 text-center max-w-sm">
        {/* Pulsing icon ring */}
        <div className={`flex h-16 w-16 items-center justify-center rounded-full ${ring} animate-pulse`}>
          <Activity className={`h-7 w-7 ${accent}`} />
        </div>
        <h3 className="text-base font-semibold text-white">
          Connection successful — no data yet
        </h3>
        <p className="text-sm text-slate-400 leading-relaxed">
          Your {platform} account is connected, but there is no analytics data available for this account yet.
          This can happen with newly created pages or accounts with very limited activity.
          Try refreshing in a few minutes.
        </p>
      </div>
    </div>
  );
}

export function ConnectPrompt({ onConnect, platform, icon: Icon }) {
  const isFb = platform === "Facebook";
  const bg = isFb ? "bg-blue-500/10" : "bg-pink-500/10";
  const text = isFb ? "text-blue-500" : "text-pink-500";
  const btn = isFb ? "bg-[#1877F2] hover:bg-[#1877F2]/90" : "bg-[#E1306C] hover:bg-[#E1306C]/90";
  
  return (
    <div className="flex min-h-[60vh] items-center justify-center animate-fade-in w-full">
      <Card className="surface-card w-full max-w-md p-6 text-center">
        <CardHeader className="flex flex-col items-center gap-2 p-0">
          <div className={`flex h-16 w-16 items-center justify-center rounded-2xl ${bg}`}>
            <Icon className={`h-8 w-8 ${text}`} />
          </div>
          <CardTitle className="text-xl mt-4 text-white">Connect {platform}</CardTitle>
          <p className="text-sm text-slate-400 mt-2 leading-relaxed">
            Connect your {platform} account to view reach, engagement, followers, and detailed visual performance graphs.
          </p>
        </CardHeader>
        <CardContent className="mt-6 p-0">
          <button
            onClick={onConnect}
            className={`w-full py-3 px-4 rounded-md font-medium transition-colors text-white ${btn}`}
          >
            Connect {platform}
          </button>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Scaffolded Facebook Child Components ────────────────────────────────

/**
 * KPI tile.
 *
 * `hint` replaced the old `showActive` flag. That badge rendered a green
 * "Active" tick for any metric above zero, which carried no information — it
 * claimed a trend that was never measured. Now the row under the value either
 * shows a real period-over-period delta or states that no comparison exists.
 */
export function KpiCard({ title, value, hint, hintTone, icon: Icon, unavailable = false }) {
  return (
    <Card className="surface-card p-5">
      <div className="flex items-start justify-between gap-2">
        <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
          {title}
        </span>
        {Icon && (
          <span className="rounded-lg bg-white/5 p-1.5 ring-1 ring-white/10">
            <Icon className="h-3.5 w-3.5 text-slate-400" />
          </span>
        )}
      </div>

      <div
        className={`mt-2.5 text-[26px] font-bold leading-none tracking-tight tabular-nums ${
          unavailable ? "text-slate-500" : "text-white"
        }`}
      >
        {value}
      </div>

      {hint && (
        <p
          className={`mt-2.5 text-[11px] ${
            hintTone === "muted" ? "text-slate-500" : "text-slate-400"
          }`}
        >
          {hint}
        </p>
      )}
    </Card>
  );
}

// Re-exported rather than re-implemented: Facebook and Instagram each carried
// their own tooltip with slightly different markup, which is why hover states
// looked inconsistent between tabs.
export const DarkTooltip = ChartTooltip;

export function FacebookDataTable({ data, title, icon: Icon, kpis = [] }) {
  if (!data || data.length === 0) return <EmptyState title={`No ${title} Found`} description={`You haven't published any ${title.toLowerCase()} yet.`} icon={Icon} />;

  const isStories = title === "Stories";
  const isVideos = title === "Videos";

  return (
    <div className="space-y-6">
      {kpis.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {kpis.map((k, i) => (
            <KpiCard
              key={i}
              title={k.label}
              value={k.value}
              hint={k.hint}
              unavailable={k.value === "—"}
            />
          ))}
        </div>
      )}

      <Card className="bg-[#161B22] border-white/5 text-white">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-medium text-slate-200">All {title}</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left table-fixed">
              <thead className="text-xs text-slate-400 bg-white/5 uppercase border-y border-white/5">
                <tr>
                  <th className="px-6 py-4 font-medium">Content</th>
                  <th className="px-6 py-4 font-medium">Published</th>
                  {isVideos ? (
                    <>
                      <th className="px-6 py-4 font-medium text-right">Plays</th>
                      <th className="px-6 py-4 font-medium text-right">Watch Time</th>
                    </>
                  ) : (
                    <>
                      <th className="px-6 py-4 font-medium text-right">Reach</th>
                      <th className="px-6 py-4 font-medium text-right">{isStories ? "Tap Forwards" : "Impressions"}</th>
                    </>
                  )}
                  {isStories ? (
                    <>
                      <th className="px-6 py-4 font-medium text-right">Tap Backs</th>
                      <th className="px-6 py-4 font-medium text-right">Exits</th>
                      <th className="px-6 py-4 font-medium text-right">Replies</th>
                    </>
                  ) : (
                    <>
                      <th className="px-6 py-4 font-medium text-right">Likes</th>
                      <th className="px-6 py-4 font-medium text-right">Comments</th>
                      <th className="px-6 py-4 font-medium text-right">Eng. Rate</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {data.map((item, i) => (
                  <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4 truncate max-w-[150px]">
                      <div className="flex items-center gap-3">
                        <img src={item.image} alt="thumbnail" className="w-10 h-10 rounded object-cover" />
                        <div className="flex flex-col">
                          <span className="font-medium text-slate-200 whitespace-nowrap overflow-hidden text-ellipsis max-w-[200px] lg:max-w-[250px]">{item.title}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-400 whitespace-nowrap">{item.date}</td>
                    
                    {isVideos ? (
                      <>
                        <td className="px-6 py-4 text-slate-200 text-right font-medium">{item.plays}</td>
                        <td className="px-6 py-4 text-slate-200 text-right font-medium">{item.watchTime}</td>
                      </>
                    ) : (
                      <>
                        <td className="px-6 py-4 text-slate-200 text-right font-medium">{item.reach}</td>
                        <td className="px-6 py-4 text-slate-200 text-right font-medium">{isStories ? item.tapForwards : item.impressions}</td>
                      </>
                    )}

                    {isStories ? (
                      <>
                        <td className="px-6 py-4 text-slate-200 text-right">{item.tapBacks}</td>
                        <td className="px-6 py-4 text-slate-200 text-right">{item.exits}</td>
                        <td className="px-6 py-4 text-emerald-400 text-right font-medium">{item.replies}</td>
                      </>
                    ) : (
                      <>
                        <td className="px-6 py-4 text-slate-200 text-right">{item.likes}</td>
                        <td className="px-6 py-4 text-slate-200 text-right">{item.comments}</td>
                        <td className="px-6 py-4 text-emerald-400 text-right font-medium">{item.rate}</td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function InstagramDataTable({ data, title, icon: Icon, kpis = [] }) {
  if (!data || data.length === 0) return <EmptyState title={`No ${title} Found`} description={`You haven't published any ${title.toLowerCase()} yet.`} icon={Icon} />;

  const isStories = title === "Stories";
  const isReels = title === "Reels";

  return (
    <div className="space-y-6">
      {kpis.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {kpis.map((k, i) => (
            <KpiCard
              key={i}
              title={k.label}
              value={k.value}
              hint={k.hint}
              unavailable={k.value === "—"}
            />
          ))}
        </div>
      )}

      <Card className="bg-[#161B22] border-white/5 text-white">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-medium text-slate-200">All {title}</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left table-fixed">
              <thead className="text-xs text-slate-400 bg-white/5 uppercase border-y border-white/5">
                <tr>
                  <th className="px-6 py-4 font-medium">Content</th>
                  <th className="px-6 py-4 font-medium">Published</th>
                  {isReels ? (
                    <>
                      <th className="px-6 py-4 font-medium text-right">Plays</th>
                      <th className="px-6 py-4 font-medium text-right">Watch Time</th>
                    </>
                  ) : (
                    <>
                      <th className="px-6 py-4 font-medium text-right">Reach</th>
                      <th className="px-6 py-4 font-medium text-right">{isStories ? "Tap Forwards" : "Impressions"}</th>
                    </>
                  )}
                  {isStories ? (
                    <>
                      <th className="px-6 py-4 font-medium text-right">Tap Backs</th>
                      <th className="px-6 py-4 font-medium text-right">Exits</th>
                      <th className="px-6 py-4 font-medium text-right">Replies</th>
                    </>
                  ) : (
                    <>
                      <th className="px-6 py-4 font-medium text-right">Likes</th>
                      <th className="px-6 py-4 font-medium text-right">Comments</th>
                      <th className="px-6 py-4 font-medium text-right">Eng. Rate</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {data.map((item, i) => (
                  <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4 truncate max-w-[150px]">
                      <div className="flex items-center gap-3">
                        <img src={item.image} alt="thumbnail" className="w-10 h-10 rounded object-cover" />
                        <div className="flex flex-col">
                          <span className="font-medium text-slate-200 whitespace-nowrap overflow-hidden text-ellipsis max-w-[200px] lg:max-w-[250px]">{item.title}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-400 whitespace-nowrap">{item.date}</td>
                    
                    {isReels ? (
                      <>
                        <td className="px-6 py-4 text-slate-200 text-right font-medium">{item.plays}</td>
                        <td className="px-6 py-4 text-slate-200 text-right font-medium">{item.watchTime}</td>
                      </>
                    ) : (
                      <>
                        <td className="px-6 py-4 text-slate-200 text-right font-medium">{item.reach}</td>
                        <td className="px-6 py-4 text-slate-200 text-right font-medium">{isStories ? item.tapForwards : item.impressions}</td>
                      </>
                    )}

                    {isStories ? (
                      <>
                        <td className="px-6 py-4 text-slate-200 text-right">{item.tapBacks}</td>
                        <td className="px-6 py-4 text-slate-200 text-right">{item.exits}</td>
                        <td className="px-6 py-4 text-emerald-400 text-right font-medium">{item.replies}</td>
                      </>
                    ) : (
                      <>
                        <td className="px-6 py-4 text-slate-200 text-right">{item.likes}</td>
                        <td className="px-6 py-4 text-slate-200 text-right">{item.comments}</td>
                        <td className="px-6 py-4 text-emerald-400 text-right font-medium">{item.rate}</td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function ProgressBar({ label, value, max, color = FB_BLUE, formatValue }) {
  // Width is derived from `max`; the label reports the raw value rather than
  // assuming it is a percentage.
  const w = max > 0 ? Math.min(Math.round((value / max) * 100), 100) : 0;
  const shown = typeof formatValue === "function" ? formatValue(value) : compact(value);
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-slate-300">{label}</span>
        <span className="text-slate-400 tabular-nums">{shown}</span>
      </div>
      <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden flex-shrink-0">
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${w}%`, background: color }} />
      </div>
    </div>
  );
}

/** Formats a share only when a real denominator exists. */
export const shareLabel = (value, total) => (total > 0 ? percent((value / total) * 100) : "—");