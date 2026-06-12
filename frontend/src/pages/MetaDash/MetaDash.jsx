// ── Meta Dashboard Page (Facebook + Instagram) ─────────────────────
// Consolidated view with tabs switching between FB and IG analytics.

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { getFacebookAnalytics } from "@/services/facebook.service";
import { getInstagramAnalytics } from "@/services/instagram.service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { Share2, TrendingUp, Loader2 } from "lucide-react";
import { Facebook, Instagram } from "@/components/icons/BrandIcons";

// Default Mock Fallback if API returns null
const fallbackFbReach = [
  { day: "Mon", reach: 4500 }, { day: "Tue", reach: 5200 },
  { day: "Wed", reach: 4800 }, { day: "Thu", reach: 6100 },
  { day: "Fri", reach: 7200 }, { day: "Sat", reach: 5800 },
  { day: "Sun", reach: 5100 },
];

const fallbackIgReach = [
  { day: "Mon", reach: 6800 }, { day: "Tue", reach: 7500 },
  { day: "Wed", reach: 7100 }, { day: "Thu", reach: 8900 },
  { day: "Fri", reach: 9200 }, { day: "Sat", reach: 8100 },
  { day: "Sun", reach: 7400 },
];

export default function MetaDash() {
  const [isLoading, setIsLoading] = useState(true);
  const [fbConnected, setFbConnected] = useState(false);
  const [igConnected, setIgConnected] = useState(false);
  const [fbAnalyticsData, setFbAnalyticsData] = useState(null);
  const [igAnalyticsData, setIgAnalyticsData] = useState(null);

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const res = await api.get("/auth/status");
        const status = res.data.status || [];
        
        const fb = status.find((s) => s.platform === "facebook");
        if (fb?.connected) {
          setFbConnected(true);
          try {
            const data = await getFacebookAnalytics();
            setFbAnalyticsData(data);
          } catch (e) {
            console.error("Failed to fetch Facebook analytics", e);
          }
        }
        
        const ig = status.find((s) => s.platform === "instagram");
        if (ig?.connected) {
          setIgConnected(true);
          try {
            const data = await getInstagramAnalytics();
            setIgAnalyticsData(data);
          } catch (e) {
            console.error("Failed to fetch Instagram analytics", e);
          }
        }
      } catch (err) {
        console.error("Failed to check connection status", err);
      } finally {
        setIsLoading(false);
      }
    };
    checkConnection();
  }, []);

  const handleConnect = (platform) => {
    const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
    window.location.href = `${baseUrl}/auth/${platform}`;
  };

  const fbReachToUse = fbAnalyticsData?.charts?.reachData || fallbackFbReach;
  const igReachToUse = igAnalyticsData?.charts?.reachData || fallbackIgReach;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500/10">
          <Share2 className="h-5 w-5 text-indigo-500" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Meta Analytics</h2>
          <p className="text-sm text-muted-foreground">Facebook + Instagram overview</p>
        </div>
      </div>

      {/* ── Platform Tabs ────────────────────────────────────────────── */}
      <Tabs defaultValue="facebook">
        <TabsList>
          <TabsTrigger value="facebook" className="gap-2">
            <Facebook className="h-4 w-4" /> Facebook
          </TabsTrigger>
          <TabsTrigger value="instagram" className="gap-2">
            <Instagram className="h-4 w-4" /> Instagram
          </TabsTrigger>
        </TabsList>

        {/* ── Facebook Tab ───────────────────────────────────────────── */}
        <TabsContent value="facebook" className="space-y-6">
          {isLoading ? (
            <div className="flex h-64 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : !fbConnected ? (
            <div className="flex flex-col items-center justify-center space-y-4 py-16 animate-fade-in rounded-lg border border-dashed">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-500/10">
                <Facebook className="h-8 w-8 text-blue-500" />
              </div>
              <h2 className="text-xl font-bold">Connect your Facebook Page</h2>
              <p className="text-muted-foreground text-center max-w-sm">
                Connect your Facebook account to view Page analytics and engagement.
              </p>
              <Button onClick={() => handleConnect('facebook')} className="mt-4 bg-[#1877F2] hover:bg-[#1877F2]/90 text-white">
                <Facebook className="mr-2 h-4 w-4" />
                Connect with Facebook
              </Button>
            </div>
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-3">
                <Card><CardContent className="p-6">
                  <p className="text-sm text-muted-foreground">Page Likes</p>
                  <p className="mt-1 text-2xl font-bold">{fbAnalyticsData?.metrics?.pageLikes || "0"}</p>
                  <div className="mt-2 flex items-center gap-1">
                    <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
                    <span className="text-sm text-emerald-500">+0%</span>
                  </div>
                </CardContent></Card>
                <Card><CardContent className="p-6">
                  <p className="text-sm text-muted-foreground">Reach</p>
                  <p className="mt-1 text-2xl font-bold">{fbAnalyticsData?.metrics?.reach || "0"}</p>
                  <div className="mt-2 flex items-center gap-1">
                    <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
                    <span className="text-sm text-emerald-500">+0%</span>
                  </div>
                </CardContent></Card>
                <Card><CardContent className="p-6">
                  <p className="text-sm text-muted-foreground">Engagement</p>
                  <p className="mt-1 text-2xl font-bold">{fbAnalyticsData?.metrics?.engagement || "0"}</p>
                  <div className="mt-2 flex items-center gap-1">
                    <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
                    <span className="text-sm text-emerald-500">+0%</span>
                  </div>
                </CardContent></Card>
              </div>
              <Card>
                <CardHeader><CardTitle className="text-base">Facebook Reach</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={fbReachToUse}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <Tooltip />
                      <Area type="monotone" dataKey="reach" stroke="#3b82f6" fill="#3b82f633" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* ── Instagram Tab ──────────────────────────────────────────── */}
        <TabsContent value="instagram" className="space-y-6">
          {isLoading ? (
            <div className="flex h-64 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : !igConnected ? (
            <div className="flex flex-col items-center justify-center space-y-4 py-16 animate-fade-in rounded-lg border border-dashed">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-rose-500/10">
                <Instagram className="h-8 w-8 text-rose-500" />
              </div>
              <h2 className="text-xl font-bold">Connect your Instagram Account</h2>
              <p className="text-muted-foreground text-center max-w-sm">
                Connect your Instagram Business account to track followers and reach.
              </p>
              <Button onClick={() => handleConnect('instagram')} className="mt-4 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 hover:opacity-90 text-white">
                <Instagram className="mr-2 h-4 w-4" />
                Connect with Instagram
              </Button>
            </div>
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-3">
                <Card><CardContent className="p-6">
                  <p className="text-sm text-muted-foreground">Followers</p>
                  <p className="mt-1 text-2xl font-bold">{igAnalyticsData?.metrics?.followers || "0"}</p>
                  <div className="mt-2 flex items-center gap-1">
                    <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
                    <span className="text-sm text-emerald-500">+0%</span>
                  </div>
                </CardContent></Card>
                <Card><CardContent className="p-6">
                  <p className="text-sm text-muted-foreground">Reach</p>
                  <p className="mt-1 text-2xl font-bold">{igAnalyticsData?.metrics?.reach || "0"}</p>
                  <div className="mt-2 flex items-center gap-1">
                    <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
                    <span className="text-sm text-emerald-500">+0%</span>
                  </div>
                </CardContent></Card>
                <Card><CardContent className="p-6">
                  <p className="text-sm text-muted-foreground">Impressions</p>
                  <p className="mt-1 text-2xl font-bold">{igAnalyticsData?.metrics?.impressions || "0"}</p>
                  <div className="mt-2 flex items-center gap-1">
                    <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
                    <span className="text-sm text-emerald-500">+0%</span>
                  </div>
                </CardContent></Card>
              </div>
              <Card>
                <CardHeader><CardTitle className="text-base">Instagram Reach</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={igReachToUse}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <Tooltip />
                      <Area type="monotone" dataKey="reach" stroke="#e11d48" fill="#e11d4833" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
