import { Activity, BarChart3, Bookmark, Calendar, ChevronDown, Eye, FileText, Heart, HelpCircle, History, MessageCircle, MoreVertical, Settings, Share2, Target, ThumbsUp, TrendingDown, TrendingUp, Users, Video } from 'lucide-react';
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar, AreaChart, Area,
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const FB_BLUE = "#1877F2";
const PIE_COLORS = ["#1877F2", "#10b981", "#8b5cf6", "#64748b"];

export function EmptyState({ title, description, icon: Icon, actionLabel }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-[#161B22] rounded-xl border border-white/5">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-500/10 mb-6">
        <Icon className="h-8 w-8 text-blue-500" />
      </div>
      <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
      <p className="text-sm text-slate-400 max-w-md mb-6">{description}</p>
      {actionLabel && (
        <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors">
          {actionLabel}
        </button>
      )}
    </div>
  );
}

// ── Scaffolded Facebook Child Components ────────────────────────────────

export function KpiCard({ label, value, change, changeLabel, icon: Icon, color }) {
  const pos = change >= 0;
  return (
    <Card className="bg-[#161B22] border-white/5 text-white hover:border-white/10 transition-colors">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-4">
          <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${color}`}>
            <Icon className="h-5 w-5" />
          </div>
          <p className="text-sm font-medium text-slate-400">{label}</p>
        </div>
        <div>
          <p className="text-2xl font-bold">{value}</p>
          <div className="flex items-center gap-1 mt-1">
            {pos ? <TrendingUp className="h-3 w-3 text-emerald-400" /> : <TrendingDown className="h-3 w-3 text-red-400" />}
            <span className={`text-xs font-medium ${pos ? "text-emerald-400" : "text-red-400"}`}>
              {pos ? "+" : ""}{change}% <span className="text-slate-500 font-normal">{changeLabel}</span>
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function DarkTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1e293b] border border-white/10 rounded-lg p-3 shadow-xl text-xs">
      <p className="font-semibold text-white mb-1">{label}</p>
      {payload.map((e, i) => (
        <p key={i} style={{ color: e.color }}>
          {e.name}: <span className="font-bold text-white">{e.value}</span>
        </p>
      ))}
    </div>
  );
}

export function FacebookDataTable({ data, title, icon: Icon, kpis = [] }) {
  if (!data || data.length === 0) return <EmptyState title={`No ${title} Found`} description={`You haven't published any ${title.toLowerCase()} yet.`} icon={Icon} />;

  const isStories = title === "Stories";
  const isVideos = title === "Videos";

  return (
    <div className="space-y-6">
      {kpis.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {kpis.map((k, i) => (
            <Card key={i} className="bg-[#161B22] border-white/5 text-white">
              <CardContent className="p-4">
                <p className="text-xs font-medium text-slate-400 mb-1">{k.label}</p>
                <p className="text-xl font-bold text-slate-100">{k.value}</p>
              </CardContent>
            </Card>
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
            <Card key={i} className="bg-[#161B22] border-white/5 text-white">
              <CardContent className="p-4">
                <p className="text-xs font-medium text-slate-400 mb-1">{k.label}</p>
                <p className="text-xl font-bold text-slate-100">{k.value}</p>
              </CardContent>
            </Card>
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

export function ProgressBar({ label, value, max, color = FB_BLUE }) {
  const w = max > 0 ? Math.min(Math.round((value / max) * 100), 100) : 0;
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-slate-300">{label}</span>
        <span className="text-slate-400">{value}%</span>
      </div>
      <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden flex-shrink-0">
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${w}%`, background: color }} />
      </div>
    </div>
  );
}