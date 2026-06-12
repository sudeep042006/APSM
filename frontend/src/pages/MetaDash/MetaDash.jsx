// ── Meta Dashboard Page (Facebook + Instagram) ─────────────────────
// Consolidated view with tabs switching between FB and IG analytics.

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { Share2, TrendingUp } from "lucide-react";
import { Facebook, Instagram } from "@/components/icons/BrandIcons";
import { useState, useEffect } from "react";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";

// ── Mock data ───────────────────────────────────────────────────────
const fbReach = [
  { day: "Mon", reach: 4500 }, { day: "Tue", reach: 5200 },
  { day: "Wed", reach: 4800 }, { day: "Thu", reach: 6100 },
  { day: "Fri", reach: 7200 }, { day: "Sat", reach: 5800 },
  { day: "Sun", reach: 5100 },
];

const igReach = [
  { day: "Mon", reach: 6800 }, { day: "Tue", reach: 7500 },
  { day: "Wed", reach: 7100 }, { day: "Thu", reach: 8900 },
  { day: "Fri", reach: 9200 }, { day: "Sat", reach: 8100 },
  { day: "Sun", reach: 7400 },
];

export default function MetaDash() {
  const [loading, setLoading] = useState(true);
  const [fbConnected, setFbConnected] = useState(false);
  const [fbUsername, setFbUsername] = useState("");
  const [igConnected, setIgConnected] = useState(false);
  const [igUsername, setIgUsername] = useState("");
  const [fbRevokeLoading, setFbRevokeLoading] = useState(false);
  const [igRevokeLoading, setIgRevokeLoading] = useState(false);

  const fetchStatus = async () => {
    try {
      const res = await api.get("/auth/status");
      const fbStatus = res.data.status?.find((p) => p.platform === "facebook");
      const igStatus = res.data.status?.find((p) => p.platform === "instagram");
      if (fbStatus && fbStatus.connected) {
        setFbConnected(true);
        setFbUsername(fbStatus.username);
      } else {
        setFbConnected(false);
        setFbUsername("");
      }
      if (igStatus && igStatus.connected) {
        setIgConnected(true);
        setIgUsername(igStatus.username);
      } else {
        setIgConnected(false);
        setIgUsername("");
      }
    } catch (err) {
      console.error("Error fetching Meta connection status:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleConnectFb = () => {
    const token = localStorage.getItem("incubein_token");
    window.location.href = `/api/auth/facebook?token=${token}`;
  };

  const handleConnectIg = () => {
    const token = localStorage.getItem("incubein_token");
    window.location.href = `/api/auth/instagram?token=${token}`;
  };

  const handleRevokeFb = async () => {
    setFbRevokeLoading(true);
    try {
      await api.delete("/auth/facebook/revoke");
      setFbConnected(false);
      setFbUsername("");
    } catch (err) {
      console.error("Error revoking Facebook access:", err);
    } finally {
      setFbRevokeLoading(false);
    }
  };

  const handleRevokeIg = async () => {
    setIgRevokeLoading(true);
    try {
      await api.delete("/auth/instagram/revoke");
      setIgConnected(false);
      setIgUsername("");
    } catch (err) {
      console.error("Error revoking Instagram access:", err);
    } finally {
      setIgRevokeLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="relative w-12 h-12">
          <div className="absolute top-0 left-0 w-full h-full border-4 border-indigo-500/20 rounded-full"></div>
          <div className="absolute top-0 left-0 w-full h-full border-4 border-t-indigo-500 rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

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
          {!fbConnected ? (
            <div className="flex min-h-[40vh] items-center justify-center pt-4 animate-fade-in">
              <Card className="w-full max-w-md border-border/50 shadow-2xl p-6 text-center">
                <CardHeader className="flex flex-col items-center gap-2">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500/10">
                    <Facebook className="h-8 w-8 text-blue-500" />
                  </div>
                  <CardTitle className="text-xl mt-4">Connect Facebook Page</CardTitle>
                  <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                    Connect your Facebook Page to view post engagements, reach trends, and key audience insights.
                  </p>
                </CardHeader>
                <CardContent className="mt-6">
                  <Button onClick={handleConnectFb} className="w-full gap-2 bg-blue-600 hover:bg-blue-500 text-white" size="lg" id="connect-facebook-btn">
                    Connect Facebook Page
                  </Button>
                </CardContent>
              </Card>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between pb-2">
                <p className="text-sm text-muted-foreground">Profile: {fbUsername || "Connected"}</p>
                <Button variant="destructive" size="sm" onClick={handleRevokeFb} disabled={fbRevokeLoading} id="revoke-facebook-btn">
                  {fbRevokeLoading ? "Revoking..." : "Revoke Facebook"}
                </Button>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <Card><CardContent className="p-6">
                  <p className="text-sm text-muted-foreground">Page Likes</p>
                  <p className="mt-1 text-2xl font-bold">8,720</p>
                  <div className="mt-2 flex items-center gap-1">
                    <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
                    <span className="text-sm text-emerald-500">+3.1%</span>
                  </div>
                </CardContent></Card>
                <Card><CardContent className="p-6">
                  <p className="text-sm text-muted-foreground">Reach</p>
                  <p className="mt-1 text-2xl font-bold">34.5K</p>
                  <div className="mt-2 flex items-center gap-1">
                    <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
                    <span className="text-sm text-emerald-500">+7.2%</span>
                  </div>
                </CardContent></Card>
                <Card><CardContent className="p-6">
                  <p className="text-sm text-muted-foreground">Engagement</p>
                  <p className="mt-1 text-2xl font-bold">1,240</p>
                  <div className="mt-2 flex items-center gap-1">
                    <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
                    <span className="text-sm text-emerald-500">+5.8%</span>
                  </div>
                </CardContent></Card>
              </div>
              <Card>
                <CardHeader><CardTitle className="text-base">Facebook Reach</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={fbReach}>
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
          {!igConnected ? (
            <div className="flex min-h-[40vh] items-center justify-center pt-4 animate-fade-in">
              <Card className="w-full max-w-md border-border/50 shadow-2xl p-6 text-center">
                <CardHeader className="flex flex-col items-center gap-2">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-pink-500/10">
                    <Instagram className="h-8 w-8 text-pink-500" />
                  </div>
                  <CardTitle className="text-xl mt-4">Connect Instagram Profile</CardTitle>
                  <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                    Connect your Instagram Business or Creator account to view followers count, daily reach, and media impressions.
                  </p>
                </CardHeader>
                <CardContent className="mt-6">
                  <Button onClick={handleConnectIg} className="w-full gap-2 bg-pink-600 hover:bg-pink-500 text-white" size="lg" id="connect-instagram-btn">
                    Connect Instagram Profile
                  </Button>
                </CardContent>
              </Card>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between pb-2">
                <p className="text-sm text-muted-foreground">Profile: {igUsername || "Connected"}</p>
                <Button variant="destructive" size="sm" onClick={handleRevokeIg} disabled={igRevokeLoading} id="revoke-instagram-btn">
                  {igRevokeLoading ? "Revoking..." : "Revoke Instagram"}
                </Button>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <Card><CardContent className="p-6">
                  <p className="text-sm text-muted-foreground">Followers</p>
                  <p className="mt-1 text-2xl font-bold">15,600</p>
                  <div className="mt-2 flex items-center gap-1">
                    <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
                    <span className="text-sm text-emerald-500">+4.5%</span>
                  </div>
                </CardContent></Card>
                <Card><CardContent className="p-6">
                  <p className="text-sm text-muted-foreground">Reach</p>
                  <p className="mt-1 text-2xl font-bold">52.3K</p>
                  <div className="mt-2 flex items-center gap-1">
                    <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
                    <span className="text-sm text-emerald-500">+9.1%</span>
                  </div>
                </CardContent></Card>
                <Card><CardContent className="p-6">
                  <p className="text-sm text-muted-foreground">Impressions</p>
                  <p className="mt-1 text-2xl font-bold">78.4K</p>
                  <div className="mt-2 flex items-center gap-1">
                    <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
                    <span className="text-sm text-emerald-500">+11.2%</span>
                  </div>
                </CardContent></Card>
              </div>
              <Card>
                <CardHeader><CardTitle className="text-base">Instagram Reach</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={igReach}>
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
