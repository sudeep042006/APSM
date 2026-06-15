// ── LinkedIn Dashboard Page ─────────────────────────────────────────
// LinkedIn analytics with metric cards, charts, and skeleton placeholders.

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar } from "recharts";
import { Users, Eye, TrendingUp, ThumbsUp } from "lucide-react";
import { Linkedin } from "@/components/icons/BrandIcons";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";

// ── Mock chart data ─────────────────────────────────────────────────
const impressionsData = [
  { day: "Mon", impressions: 3200 }, { day: "Tue", impressions: 4100 },
  { day: "Wed", impressions: 3800 }, { day: "Thu", impressions: 5200 },
  { day: "Fri", impressions: 6100 }, { day: "Sat", impressions: 4300 },
  { day: "Sun", impressions: 3900 },
];

const engagementData = [
  { month: "Jan", rate: 3.1 }, { month: "Feb", rate: 3.5 },
  { month: "Mar", rate: 3.8 }, { month: "Apr", rate: 4.0 },
  { month: "May", rate: 4.1 }, { month: "Jun", rate: 4.2 },
];

// ── Metric cards ────────────────────────────────────────────────────
const metrics = [
  { title: "Followers", value: "3,240", change: "+1.8%", icon: Users, color: "text-blue-600", bg: "bg-blue-600/10" },
  { title: "Impressions", value: "45.2K", change: "+12.3%", icon: Eye, color: "text-sky-500", bg: "bg-sky-500/10" },
  { title: "Engagement Rate", value: "4.2%", change: "+0.3%", icon: ThumbsUp, color: "text-emerald-500", bg: "bg-emerald-500/10" },
  { title: "Growth", value: "+6.3%", change: "monthly", icon: TrendingUp, color: "text-violet-500", bg: "bg-violet-500/10" },
];

export default function LinkedInDash() {
  const [loading, setLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [username, setUsername] = useState("");
  const [revokeLoading, setRevokeLoading] = useState(false);

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const res = await api.get("/auth/status");
        const status = res.data.status?.find((p) => p.platform === "linkedin");
        if (status && status.connected) {
          setIsConnected(true);
          setUsername(status.username);
        }
      } catch (err) {
        console.error("Error checking LinkedIn connection:", err);
      } finally {
        setLoading(false);
      }
    };
    checkConnection();
  }, []);

  const handleConnect = () => {
    const token = localStorage.getItem("incubein_token");
    window.location.href = `/api/auth/linkedin?token=${token}`;
  };

  const handleRevoke = async () => {
    setRevokeLoading(true);
    try {
      await api.delete("/auth/linkedin/revoke");
      setIsConnected(false);
      setUsername("");
    } catch (err) {
      console.error("Error revoking LinkedIn access:", err);
    } finally {
      setRevokeLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="relative w-12 h-12">
          <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-600/20 rounded-full"></div>
          <div className="absolute top-0 left-0 w-full h-full border-4 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center animate-fade-in">
        <Card className="w-full max-w-md border-border/50 shadow-sm dark:shadow-none bg-white dark:bg-zinc-900/50 p-6 text-center">
          <CardHeader className="flex flex-col items-center gap-2">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600/10">
              <Linkedin className="h-8 w-8 text-blue-600" />
            </div>
            <CardTitle className="text-xl mt-4">Connect LinkedIn Profile</CardTitle>
            <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
              Connect your LinkedIn account to view followers, post impressions, engagement rates, and detailed profile metrics.
            </p>
          </CardHeader>
          <CardContent className="mt-6">
            <Button onClick={handleConnect} className="w-full gap-2 bg-blue-600 hover:bg-blue-500 text-white" size="lg" id="connect-linkedin-btn">
              Connect LinkedIn Account
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
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600/10">
            <Linkedin className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">LinkedIn Analytics</h2>
            <p className="text-sm text-muted-foreground">Profile: {username || "Connected"}</p>
          </div>
        </div>
        <Button
          variant="destructive"
          onClick={handleRevoke}
          disabled={revokeLoading}
          id="revoke-linkedin-btn"
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
          <CardHeader><CardTitle className="text-base">Weekly Impressions</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={impressionsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip />
                <Line type="monotone" dataKey="impressions" stroke="#2563eb" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Engagement Rate Trend</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={engagementData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip />
                <Bar dataKey="rate" fill="#2563eb" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* ── Recent Posts Skeleton ─────────────────────────────────────── */}
      <Card>
        <CardHeader><CardTitle className="text-base">Recent Posts</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-4/5" />
                <Skeleton className="h-3 w-2/5" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
