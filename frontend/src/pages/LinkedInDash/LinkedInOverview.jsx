// ── LinkedIn Overview Component ─────────────────────────────────────────
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ResponsiveContainer, AreaChart, Area, LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { Users, Search, Eye, MousePointerClick, AlertCircle, Loader2, TrendingUp, Filter, RefreshCw } from "lucide-react";
import { useOutletContext } from "react-router-dom";

const formatNumber = (num) => {
  if (!num) return "0";
  if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
  if (num >= 1000) return (num / 1000).toFixed(1) + "K";
  return num.toString();
};

const COLORS = ["#2563eb", "#0ea5e9", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899"];

export default function LinkedInOverview() {
  const { analyticsData } = useOutletContext();
  
  // Safe Data Extraction
  const metrics = analyticsData?.metrics || {};
  const rawData = analyticsData?.rawPlatformData || {};
  const demographics = analyticsData?.demographics || {};
  const content = analyticsData?.content || {};

  // Custom Chart Tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#1e293b] border border-white/10 rounded-lg p-3 shadow-xl">
          <p className="text-sm font-medium text-white mb-1">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: <span className="font-bold">{formatNumber(entry.value)}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const getChartData = (dataArray, defaultData) => {
    if (!dataArray || dataArray.length === 0) return defaultData;
    return dataArray;
  };

  const defaultLineChart = [{ day: "Mon", value: 0 }, { day: "Tue", value: 0 }, { day: "Wed", value: 0 }];
  const defaultPieChart = [{ name: "No Data", value: 1 }];

  return (
    <div className="animate-fade-in p-4 md:p-6">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="bg-white/5 border border-white/10 mb-6 flex-wrap h-auto">
              <TabsTrigger value="overview" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-gray-400">Overview</TabsTrigger>
              <TabsTrigger value="content" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-gray-400">Content</TabsTrigger>
              <TabsTrigger value="audience" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-gray-400">Audience</TabsTrigger>
              <TabsTrigger value="engagement" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-gray-400">Engagement</TabsTrigger>
            </TabsList>

            {/* ── Overview Tab ─────────────────────────────────────────── */}
            <TabsContent value="overview" className="space-y-6 animate-fade-in">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  { label: "Follower Count", value: formatNumber(metrics.followers || rawData.followers || 0), inc: "+1.2%", icon: Users, color: "text-blue-400" },
                  { label: "Search Appearances", value: formatNumber(metrics.searchAppearances || rawData.searchAppearances || 0), inc: "+5.4%", icon: Search, color: "text-emerald-400" },
                  { label: "Profile Visitors", value: formatNumber(metrics.profileViews || rawData.profileViews || 0), inc: "+2.1%", icon: Eye, color: "text-violet-400" },
                  { label: "Custom Button Clicks", value: formatNumber(metrics.clicks || rawData.clicks || 0), inc: "+0.8%", icon: MousePointerClick, color: "text-pink-400" }
                ].map((kpi, idx) => (
                  <Card key={idx} className="bg-white/5 backdrop-blur-lg border-white/10 text-white hover:border-blue-500/50 transition-colors">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-400">{kpi.label}</p>
                          <p className="mt-1 text-3xl font-bold">{kpi.value}</p>
                        </div>
                        <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-white/5`}>
                          <kpi.icon className={`h-5 w-5 ${kpi.color}`} />
                        </div>
                      </div>
                      <div className="mt-4 flex items-center gap-1">
                        <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
                        <span className="text-sm font-medium text-emerald-400">{kpi.inc} this month</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Impressions Chart */}
              <Card className="bg-white/5 backdrop-blur-lg border-white/10 text-white">
                <CardHeader>
                  <CardTitle className="text-base font-semibold text-gray-200">Total Impressions</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={getChartData(metrics.impressionsTrend, defaultLineChart)}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                      <XAxis dataKey="day" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Area type="monotone" dataKey="value" stroke="#2563eb" fill="#2563eb33" strokeWidth={3} />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ── Content Tab ──────────────────────────────────────────── */}
            <TabsContent value="content" className="space-y-6 animate-fade-in">
              <Card className="bg-white/5 backdrop-blur-lg border-white/10 text-white">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-base font-semibold text-gray-200">Content Performance</CardTitle>
                  <Button variant="ghost" size="sm" className="h-8 border border-white/10 text-gray-300 hover:text-white">
                    <Filter className="h-4 w-4 mr-2" /> Filter
                  </Button>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="posts" className="w-full">
                    <TabsList className="bg-[#1e293b] border border-white/5 mb-4">
                      <TabsTrigger value="posts" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">Posts</TabsTrigger>
                      <TabsTrigger value="articles" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">Articles</TabsTrigger>
                      <TabsTrigger value="documents" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">Documents</TabsTrigger>
                    </TabsList>
                    
                    {["posts", "articles", "documents"].map(type => {
                      const items = content[type] || [];
                      return (
                        <TabsContent key={type} value={type} className="space-y-4">
                          {items.length === 0 ? (
                            <div className="flex h-32 items-center justify-center rounded-lg border border-white/5 bg-white/5">
                              <p className="text-sm text-gray-400">No {type} analytics available.</p>
                            </div>
                          ) : (
                            <div className="overflow-x-auto">
                              <table className="w-full text-sm text-left">
                                <thead className="text-xs text-gray-400 bg-white/5 rounded-t-lg">
                                  <tr>
                                    <th className="px-4 py-3 rounded-tl-lg">Content</th>
                                    <th className="px-4 py-3">Impressions</th>
                                    <th className="px-4 py-3">Clicks</th>
                                    <th className="px-4 py-3">CTR</th>
                                    <th className="px-4 py-3">Reactions</th>
                                    <th className="px-4 py-3">Comments</th>
                                    <th className="px-4 py-3 rounded-tr-lg">Date</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {items.map((item, i) => (
                                    <tr key={i} className="border-b border-white/5 hover:bg-white/5">
                                      <td className="px-4 py-3 font-medium text-white truncate max-w-[200px]">{item.title || "Untitled"}</td>
                                      <td className="px-4 py-3">{formatNumber(item.impressions)}</td>
                                      <td className="px-4 py-3">{formatNumber(item.clicks)}</td>
                                      <td className="px-4 py-3">{item.ctr || "0"}%</td>
                                      <td className="px-4 py-3">{formatNumber(item.reactions)}</td>
                                      <td className="px-4 py-3">{formatNumber(item.comments)}</td>
                                      <td className="px-4 py-3 text-gray-400">{item.date || "N/A"}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </TabsContent>
                      );
                    })}
                  </Tabs>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ── Audience Tab ─────────────────────────────────────────── */}
            <TabsContent value="audience" className="space-y-6 animate-fade-in">
              <div className="grid gap-6 md:grid-cols-2">
                {/* Job Titles */}
                <Card className="bg-white/5 backdrop-blur-lg border-white/10 text-white">
                  <CardHeader>
                    <CardTitle className="text-base font-semibold text-gray-200">Viewer Job Titles</CardTitle>
                  </CardHeader>
                  <CardContent className="flex justify-center">
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={getChartData(demographics.jobTitles, defaultPieChart)}
                          cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5}
                          dataKey="value"
                        >
                          {getChartData(demographics.jobTitles, defaultPieChart).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.name === "No Data" ? "#334155" : COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Industries */}
                <Card className="bg-white/5 backdrop-blur-lg border-white/10 text-white">
                  <CardHeader>
                    <CardTitle className="text-base font-semibold text-gray-200">Viewer Industries</CardTitle>
                  </CardHeader>
                  <CardContent className="flex justify-center">
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={getChartData(demographics.industries, defaultPieChart)}
                          cx="50%" cy="50%" outerRadius={80}
                          dataKey="value"
                        >
                          {getChartData(demographics.industries, defaultPieChart).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.name === "No Data" ? "#334155" : COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Company Sizes */}
                <Card className="bg-white/5 backdrop-blur-lg border-white/10 text-white md:col-span-2">
                  <CardHeader>
                    <CardTitle className="text-base font-semibold text-gray-200">Company Sizes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={getChartData(demographics.companySizes, [{ name: "No Data", value: 0 }])}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                        <XAxis dataKey="name" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: "#ffffff05" }} />
                        <Bar dataKey="value" fill="#0ea5e9" radius={[4, 4, 0, 0]}>
                          {getChartData(demographics.companySizes, []).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* ── Engagement Tab ───────────────────────────────────────── */}
            <TabsContent value="engagement" className="space-y-6 animate-fade-in">
              <div className="grid gap-6 md:grid-cols-2">
                {/* Engagement Trend */}
                <Card className="bg-white/5 backdrop-blur-lg border-white/10 text-white col-span-1 md:col-span-2">
                  <CardHeader>
                    <CardTitle className="text-base font-semibold text-gray-200">Engagement Rate Trend</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={getChartData(metrics.engagementTrend, defaultLineChart)}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                        <XAxis dataKey="day" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                        <Tooltip content={<CustomTooltip />} />
                        <Line type="monotone" dataKey="value" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 4, fill: "#8b5cf6", strokeWidth: 0 }} activeDot={{ r: 6 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Network Growth */}
                <Card className="bg-white/5 backdrop-blur-lg border-white/10 text-white col-span-1 md:col-span-2">
                  <CardHeader>
                    <CardTitle className="text-base font-semibold text-gray-200">Network Growth</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={getChartData(metrics.growthTrend, defaultLineChart)}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                        <XAxis dataKey="day" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                        <Tooltip content={<CustomTooltip />} />
                        <Area type="monotone" dataKey="value" stroke="#10b981" fill="#10b98133" strokeWidth={3} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
    </div>
  );
}
