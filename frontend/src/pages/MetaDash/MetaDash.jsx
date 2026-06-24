// ── Meta Dashboard Page (Facebook + Instagram) ─────────────────────
// Consolidated view with tabs switching between FB and IG analytics.

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ResponsiveContainer, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { Share2, TrendingUp, AlertCircle, Loader2 } from "lucide-react";
import { Facebook, Instagram } from "@/components/icons/BrandIcons";
import { Button } from "@/components/ui/button";
import metaApi from "@/services/metaApi";

// Helper for formatting large numbers
const formatNumber = (num) => {
  if (!num) return "0";
  if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
  if (num >= 1000) return (num / 1000).toFixed(1) + "K";
  return num.toString();
};

const COLORS = ["#3b82f6", "#e11d48", "#10b981", "#f59e0b", "#6366f1"];

export default function MetaDash() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [analyticsData, setAnalyticsData] = useState(null);

  const [fbConnected, setFbConnected] = useState(false);
  const [fbUsername, setFbUsername] = useState("");
  const [igConnected, setIgConnected] = useState(false);
  const [igUsername, setIgUsername] = useState("");
  
  const [fbRevokeLoading, setFbRevokeLoading] = useState(false);
  const [igRevokeLoading, setIgRevokeLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Fetch connection status
      const statusRes = await metaApi.getAuthStatus();
      
      const statusArray = Array.isArray(statusRes) ? statusRes : (statusRes?.data || statusRes?.status || statusRes?.connections || []);
      
      const fbStatus = statusArray.find((p) => String(p.platform).toLowerCase() === "facebook");
      const igStatus = statusArray.find((p) => String(p.platform).toLowerCase() === "instagram");

      setFbConnected(!!fbStatus?.connected);
      setFbUsername(fbStatus?.username || "");
      
      setIgConnected(!!igStatus?.connected);
      setIgUsername(igStatus?.username || "");

      // 2. Fetch Analytics Snapshot if connected
      if (fbStatus?.connected || igStatus?.connected) {
        const analyticsRes = await metaApi.getMetaAnalytics();
        
        // Find latest snapshot
        const dataArray = Array.isArray(analyticsRes?.data) ? analyticsRes.data : [];
        const latestSnapshot = dataArray[0];
        
        setAnalyticsData(latestSnapshot || null);
      } else {
        setAnalyticsData(null);
      }
    } catch (err) {
      console.error("Error fetching Meta data:", err);
      setError("Failed to load Meta analytics. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleConnectFb = () => {
    const token = localStorage.getItem("incubein_token");
    window.location.href = `http://localhost:5000/auth/facebook?token=${token}`;
  };

  const handleConnectIg = () => {
    const token = localStorage.getItem("incubein_token");
    window.location.href = `http://localhost:5000/auth/instagram?token=${token}`;
  };

  const handleRevokeFb = async () => {
    setFbRevokeLoading(true);
    try {
      await metaApi.revokeFacebook();
      setFbConnected(false);
      setFbUsername("");
      fetchData(); // Refresh to clear analytics
    } catch (err) {
      console.error("Error revoking Facebook access:", err);
    } finally {
      setFbRevokeLoading(false);
    }
  };

  const handleRevokeIg = async () => {
    setIgRevokeLoading(true);
    try {
      await metaApi.revokeInstagram();
      setIgConnected(false);
      setIgUsername("");
      fetchData(); // Refresh to clear analytics
    } catch (err) {
      console.error("Error revoking Instagram access:", err);
    } finally {
      setIgRevokeLoading(false);
    }
  };

  // Safe Extraction
  const fbData = analyticsData?.rawPlatformData?.facebook || null;
  const igData = analyticsData?.rawPlatformData?.instagram || null;

  // Chart Mappers
  const getFbInsightsChart = () => {
    if (!fbData?.insights) return [];
    const metric = fbData.insights.find(m => m.name === 'page_impressions');
    if (!metric?.values || metric.values.length === 0) return [];
    return metric.values.map((v, i) => ({
      day: `Day ${i + 1}`,
      reach: v.value || 0
    }));
  };

  const getIgInsightsChart = () => {
    if (!igData?.insights) return [];
    const metric = igData.insights.find(m => m.name === 'impressions');
    if (!metric?.values || metric.values.length === 0) return [];
    return metric.values.map((v, i) => ({
      day: `Day ${i + 1}`,
      impressions: v.value || 0
    }));
  };

  const getIgDemographicsChart = () => {
    if (!analyticsData?.demographics?.ageAndGender) return [];
    return analyticsData.demographics.ageAndGender.map(item => ({
      name: item.group,
      count: item.count || 0
    })).slice(0, 5); // Top 5
  };

  const fbChartData = getFbInsightsChart();
  const igChartData = getIgInsightsChart();
  const igDemoData = getIgDemographicsChart();

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

  // Render Functions
  const renderLoading = () => (
    <div className="flex min-h-[60vh] flex-col items-center justify-center space-y-4">
      <Loader2 className="h-10 w-10 animate-spin text-indigo-500" />
      <p className="text-muted-foreground animate-pulse">Fetching Meta Analytics...</p>
    </div>
  );

  const renderError = () => (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Card className="w-full max-w-md bg-white/5 backdrop-blur-lg border-red-500/30">
        <CardContent className="flex flex-col items-center text-center p-8">
          <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
          <h3 className="text-lg font-bold text-white mb-2">Data Load Failed</h3>
          <p className="text-sm text-gray-400 mb-6">{error}</p>
          <Button onClick={fetchData} variant="outline" className="border-white/10 text-white hover:bg-white/10">
            Try Again
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  const renderEmptyState = (platform, onConnect) => {
    const isFb = platform === "facebook";
    const Icon = isFb ? Facebook : Instagram;
    const color = isFb ? "text-blue-500" : "text-pink-500";
    const bgClass = isFb ? "bg-blue-500/10" : "bg-pink-500/10";
    const btnClass = isFb ? "bg-blue-600 hover:bg-blue-500 text-white" : "bg-pink-600 hover:bg-pink-500 text-white";

    return (
      <div className="flex min-h-[50vh] items-center justify-center pt-4 animate-fade-in">
        <Card className="w-full max-w-md bg-white/5 backdrop-blur-lg border-white/10 shadow-2xl p-6 text-center text-white">
          <CardHeader className="flex flex-col items-center gap-2">
            <div className={`flex h-16 w-16 items-center justify-center rounded-2xl ${bgClass}`}>
              <Icon className={`h-8 w-8 ${color}`} />
            </div>
            <CardTitle className="text-xl mt-4">Connect {isFb ? "Facebook Page" : "Instagram Profile"}</CardTitle>
            <p className="text-sm text-gray-400 mt-2 leading-relaxed">
              Connect your {isFb ? "Facebook Page" : "Instagram Business Account"} to view detailed analytics, reach trends, and audience insights.
            </p>
          </CardHeader>
          <CardContent className="mt-6">
            <Button onClick={onConnect} className={`w-full gap-2 ${btnClass}`} size="lg">
              Connect {isFb ? "Facebook" : "Instagram"}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  };

  // Main Render
  return (
    <div className="min-h-screen bg-[#0B1121] text-white p-2 md:p-6 space-y-6 animate-fade-in -m-6 sm:-m-8">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 pt-6 px-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500/20">
          <Share2 className="h-5 w-5 text-indigo-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">Meta Analytics</h2>
          <p className="text-sm text-indigo-200/60">Facebook + Instagram overview</p>
        </div>
      </div>

      <div className="px-4 pb-6">
        {loading ? renderLoading() : error ? renderError() : (
          <Tabs defaultValue="facebook">
            <TabsList className="bg-white/5 border border-white/10">
              <TabsTrigger value="facebook" className="gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white text-gray-400">
                <Facebook className="h-4 w-4" /> Facebook
              </TabsTrigger>
              <TabsTrigger value="instagram" className="gap-2 data-[state=active]:bg-pink-600 data-[state=active]:text-white text-gray-400">
                <Instagram className="h-4 w-4" /> Instagram
              </TabsTrigger>
            </TabsList>

            {/* ── Facebook Tab ───────────────────────────────────────────── */}
            <TabsContent value="facebook" className="space-y-6 mt-6">
              {!fbConnected ? renderEmptyState("facebook", handleConnectFb) : (
                <>
                  <div className="flex items-center justify-between pb-2">
                    <p className="text-sm text-gray-400">Page: <span className="text-white font-medium">{fbUsername || fbData?.pageName || "Connected"}</span></p>
                    <Button variant="outline" size="sm" onClick={handleRevokeFb} disabled={fbRevokeLoading} className="border-red-500/30 text-red-400 hover:bg-red-500/10">
                      {fbRevokeLoading ? "Revoking..." : "Revoke Access"}
                    </Button>
                  </div>

                  {!fbData ? (
                    <div className="flex h-40 items-center justify-center bg-white/5 rounded-xl border border-white/10">
                      <p className="text-gray-400">Not enough data available yet.</p>
                    </div>
                  ) : (
                    <>
                      {/* KPI Cards */}
                      <div className="grid gap-4 sm:grid-cols-3">
                        {[
                          { label: "Page Likes", value: formatNumber(fbData?.fanCount || 0), inc: "+2.1%" },
                          { label: "Total Reach", value: formatNumber(analyticsData?.metrics?.reach || 0), inc: "+5.4%" },
                          { label: "Post Engagement", value: formatNumber(analyticsData?.metrics?.totalEngagement || 0), inc: "+3.2%" }
                        ].map((kpi, idx) => (
                          <Card key={idx} className="bg-white/5 backdrop-blur-lg border-white/10 text-white hover:border-blue-500/50 transition-colors">
                            <CardContent className="p-6">
                              <p className="text-sm text-gray-400">{kpi.label}</p>
                              <p className="mt-1 text-3xl font-bold">{kpi.value}</p>
                              <div className="mt-2 flex items-center gap-1">
                                <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
                                <span className="text-sm text-emerald-400">{kpi.inc}</span>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>

                      {/* Reach Chart */}
                      <Card className="bg-white/5 backdrop-blur-lg border-white/10 text-white">
                        <CardHeader>
                          <CardTitle className="text-base font-semibold text-gray-200">Facebook Reach (Last 30 Days)</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ResponsiveContainer width="100%" height={300}>
                            {fbChartData.length === 0 ? (
                              <AreaChart data={[{ day: "Mon", reach: 0 }, { day: "Tue", reach: 0 }, { day: "Wed", reach: 0 }]}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                                <XAxis dataKey="day" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip content={<CustomTooltip />} />
                                <Area type="monotone" dataKey="reach" stroke="#3b82f6" fill="#3b82f633" strokeWidth={2} />
                              </AreaChart>
                            ) : (
                              <AreaChart data={fbChartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                                <XAxis dataKey="day" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip content={<CustomTooltip />} />
                                <Area type="monotone" dataKey="reach" stroke="#3b82f6" fill="#3b82f633" strokeWidth={3} />
                              </AreaChart>
                            )}
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>
                    </>
                  )}
                </>
              )}
            </TabsContent>

            {/* ── Instagram Tab ──────────────────────────────────────────── */}
            <TabsContent value="instagram" className="space-y-6 mt-6">
              {!igConnected ? renderEmptyState("instagram", handleConnectIg) : (
                <>
                  <div className="flex items-center justify-between pb-2">
                    <p className="text-sm text-gray-400">Profile: <span className="text-white font-medium">{igUsername || igData?.username || "Connected"}</span></p>
                    <Button variant="outline" size="sm" onClick={handleRevokeIg} disabled={igRevokeLoading} className="border-red-500/30 text-red-400 hover:bg-red-500/10">
                      {igRevokeLoading ? "Revoking..." : "Revoke Access"}
                    </Button>
                  </div>

                  {!igData ? (
                    <div className="flex h-40 items-center justify-center bg-white/5 rounded-xl border border-white/10">
                      <p className="text-gray-400">Not enough data available yet.</p>
                    </div>
                  ) : (
                    <>
                      {/* KPI Cards */}
                      <div className="grid gap-4 sm:grid-cols-3">
                        {[
                          { label: "Followers", value: formatNumber(igData?.followers || 0), inc: "+4.1%" },
                          { label: "Reach", value: formatNumber(analyticsData?.metrics?.reach || 0), inc: "+8.7%" },
                          { label: "Impressions", value: formatNumber(analyticsData?.metrics?.impressions || 0), inc: "+12.3%" }
                        ].map((kpi, idx) => (
                          <Card key={idx} className="bg-white/5 backdrop-blur-lg border-white/10 text-white hover:border-pink-500/50 transition-colors">
                            <CardContent className="p-6">
                              <p className="text-sm text-gray-400">{kpi.label}</p>
                              <p className="mt-1 text-3xl font-bold">{kpi.value}</p>
                              <div className="mt-2 flex items-center gap-1">
                                <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
                                <span className="text-sm text-emerald-400">{kpi.inc}</span>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>

                      <div className="grid gap-6 md:grid-cols-2">
                        {/* Impressions Chart */}
                        <Card className="bg-white/5 backdrop-blur-lg border-white/10 text-white col-span-1 md:col-span-2">
                          <CardHeader>
                            <CardTitle className="text-base font-semibold text-gray-200">Instagram Impressions</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                              {igChartData.length === 0 ? (
                                <AreaChart data={[{ day: "Mon", impressions: 0 }, { day: "Tue", impressions: 0 }]}>
                                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                                  <XAxis dataKey="day" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                                  <YAxis stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                                  <Tooltip content={<CustomTooltip />} />
                                  <Area type="monotone" dataKey="impressions" stroke="#e11d48" fill="#e11d4833" strokeWidth={2} />
                                </AreaChart>
                              ) : (
                                <AreaChart data={igChartData}>
                                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                                  <XAxis dataKey="day" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                                  <YAxis stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                                  <Tooltip content={<CustomTooltip />} />
                                  <Area type="monotone" dataKey="impressions" stroke="#e11d48" fill="#e11d4833" strokeWidth={3} />
                                </AreaChart>
                              )}
                            </ResponsiveContainer>
                          </CardContent>
                        </Card>

                        {/* Demographics Bar Chart */}
                        <Card className="bg-white/5 backdrop-blur-lg border-white/10 text-white">
                          <CardHeader>
                            <CardTitle className="text-base font-semibold text-gray-200">Audience Demographics</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <ResponsiveContainer width="100%" height={250}>
                              {igDemoData.length === 0 ? (
                                <BarChart data={[{ name: "Unknown", count: 0 }]}>
                                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                                  <XAxis dataKey="name" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                                  <YAxis stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                                  <Tooltip content={<CustomTooltip />} cursor={{ fill: "#ffffff05" }} />
                                  <Bar dataKey="count" fill="#e11d48" radius={[4, 4, 0, 0]} />
                                </BarChart>
                              ) : (
                                <BarChart data={igDemoData}>
                                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                                  <XAxis dataKey="name" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                                  <YAxis stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                                  <Tooltip content={<CustomTooltip />} cursor={{ fill: "#ffffff05" }} />
                                  <Bar dataKey="count" fill="#e11d48" radius={[4, 4, 0, 0]}>
                                    {igDemoData.map((entry, index) => (
                                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                  </Bar>
                                </BarChart>
                              )}
                            </ResponsiveContainer>
                          </CardContent>
                        </Card>

                        {/* Top Countries Pie Chart */}
                        <Card className="bg-white/5 backdrop-blur-lg border-white/10 text-white">
                          <CardHeader>
                            <CardTitle className="text-base font-semibold text-gray-200">Top Countries</CardTitle>
                          </CardHeader>
                          <CardContent className="flex justify-center">
                            <ResponsiveContainer width="100%" height={250}>
                              {!analyticsData?.demographics?.topCountries || analyticsData.demographics.topCountries.length === 0 ? (
                                <PieChart>
                                  <Pie data={[{ name: "No Data", value: 1 }]} cx="50%" cy="50%" innerRadius={60} outerRadius={80} fill="#334155" dataKey="value" />
                                  <Tooltip content={<CustomTooltip />} />
                                </PieChart>
                              ) : (
                                <PieChart>
                                  <Pie
                                    data={analyticsData.demographics.topCountries}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="count"
                                  >
                                    {analyticsData.demographics.topCountries.map((entry, index) => (
                                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                  </Pie>
                                  <Tooltip content={<CustomTooltip />} />
                                </PieChart>
                              )}
                            </ResponsiveContainer>
                          </CardContent>
                        </Card>
                      </div>
                    </>
                  )}
                </>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}
