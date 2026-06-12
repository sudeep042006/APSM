// ── YouTube Dashboard Page ──────────────────────────────────────────
// YouTube analytics with metric cards, charts, and skeleton placeholders.

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar } from "recharts";
import { Users, Eye, Clock, TrendingUp } from "lucide-react";
import { Youtube } from "@/components/icons/BrandIcons";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";

// ── Mock chart data ─────────────────────────────────────────────────
const viewsData = [
  { day: "Mon", views: 1200 }, { day: "Tue", views: 1800 },
  { day: "Wed", views: 1400 }, { day: "Thu", views: 2200 },
  { day: "Fri", views: 2800 }, { day: "Sat", views: 3200 },
  { day: "Sun", views: 2600 },
];

const subGrowth = [
  { month: "Jan", subs: 8200 }, { month: "Feb", subs: 8900 },
  { month: "Mar", subs: 9400 }, { month: "Apr", subs: 10100 },
  { month: "May", subs: 11300 }, { month: "Jun", subs: 12450 },
];

// ── Metric cards ────────────────────────────────────────────────────
const metrics = [
  { title: "Subscribers", value: "12,450", change: "+2.4%", icon: Users, color: "text-red-500", bg: "bg-red-500/10" },
  { title: "Total Views", value: "1.82M", change: "+8.7%", icon: Eye, color: "text-blue-500", bg: "bg-blue-500/10" },
  { title: "Watch Time", value: "54,320h", change: "+5.2%", icon: Clock, color: "text-emerald-500", bg: "bg-emerald-500/10" },
  { title: "Videos", value: "87", change: "+3", icon: Youtube, color: "text-violet-500", bg: "bg-violet-500/10" },
];

export default function YoutubeDash() {
  const [loading, setLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [username, setUsername] = useState("");
  const [revokeLoading, setRevokeLoading] = useState(false);

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const res = await api.get("/auth/status");
        const status = res.data.status?.find((p) => p.platform === "youtube");
        if (status && status.connected) {
          setIsConnected(true);
          setUsername(status.username);
        }
      } catch (err) {
        console.error("Error checking YouTube connection:", err);
      } finally {
        setLoading(false);
      }
    };
    checkConnection();
  }, []);

  const handleConnect = () => {
    const token = localStorage.getItem("incubein_token");
    window.location.href = `/api/auth/youtube?token=${token}`;
  };

  const handleRevoke = async () => {
    setRevokeLoading(true);
    try {
      await api.delete("/auth/youtube/revoke");
      setIsConnected(false);
      setUsername("");
    } catch (err) {
      console.error("Error revoking YouTube access:", err);
    } finally {
      setRevokeLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="relative w-12 h-12">
          <div className="absolute top-0 left-0 w-full h-full border-4 border-red-500/20 rounded-full"></div>
          <div className="absolute top-0 left-0 w-full h-full border-4 border-t-red-500 rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center animate-fade-in">
        <Card className="w-full max-w-md border-border/50 shadow-2xl p-6 text-center">
          <CardHeader className="flex flex-col items-center gap-2">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10">
              <Youtube className="h-8 w-8 text-red-500" />
            </div>
            <CardTitle className="text-xl mt-4">Connect YouTube Channel</CardTitle>
            <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
              Connect your YouTube account to view sub counts, channel views, watch time, and detailed visual performance graphs.
            </p>
          </CardHeader>
          <CardContent className="mt-6">
            <Button onClick={handleConnect} className="w-full gap-2 bg-red-600 hover:bg-red-500 text-white" size="lg" id="connect-youtube-btn">
              Connect YouTube Channel
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/10">
            <Youtube className="h-5 w-5 text-red-500" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">YouTube Analytics</h2>
            <p className="text-sm text-muted-foreground">Channel: {username || "Connected"}</p>
          </div>
        </div>
        <Button
          variant="destructive"
          onClick={handleRevoke}
          disabled={revokeLoading}
          id="revoke-youtube-btn"
        >
          {revokeLoading ? "Revoking..." : "Revoke Access"}
        </Button>
      </div>

      {/* ── Metric Cards ─────────────────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((m) => (
          <Card key={m.title} className="hover:shadow-md transition-all">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{m.title}</p>
                  <p className="mt-1 text-2xl font-bold">{m.value}</p>
                </div>
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${m.bg}`}>
                  <m.icon className={`h-5 w-5 ${m.color}`} />
                </div>
              </div>
              <div className="mt-3 flex items-center gap-1">
                <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
                <span className="text-sm font-medium text-emerald-500">{m.change}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── Charts ───────────────────────────────────────────────────── */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">Daily Views</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={viewsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip />
                <Area type="monotone" dataKey="views" stroke="#ef4444" fill="#ef444433" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Subscriber Growth</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={subGrowth}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip />
                <Bar dataKey="subs" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* ── Recent Videos Skeleton ───────────────────────────────────── */}
      <Card>
        <CardHeader><CardTitle className="text-base">Recent Videos</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="h-16 w-28 rounded-lg" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
