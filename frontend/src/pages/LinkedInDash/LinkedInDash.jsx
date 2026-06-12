// ── LinkedIn Dashboard Page ─────────────────────────────────────────
// LinkedIn analytics with metric cards, charts, and skeleton placeholders.

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { getLinkedInAnalytics } from "@/services/linkedin.service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar } from "recharts";
import { Users, Eye, TrendingUp, ThumbsUp, Loader2 } from "lucide-react";
import { Linkedin } from "@/components/icons/BrandIcons";

// Default Mock Fallback if API returns null
const fallbackImpressionsData = [
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

export default function LinkedInDash() {
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [analyticsData, setAnalyticsData] = useState(null);

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const res = await api.get("/auth/status");
        const status = res.data.status || [];
        const li = status.find((s) => s.platform === "linkedin");
        
        if (li && li.connected) {
          setIsConnected(true);
          try {
            const data = await getLinkedInAnalytics();
            setAnalyticsData(data);
          } catch (e) {
            console.error("Failed to fetch LinkedIn analytics", e);
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

  const handleConnect = () => {
    // Redirect to the backend OAuth initiation route
    const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
    window.location.href = `${baseUrl}/auth/linkedin`;
  };

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center space-y-4 animate-fade-in">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-600/10">
          <Linkedin className="h-8 w-8 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold">Connect your LinkedIn Account</h2>
        <p className="text-muted-foreground text-center max-w-md">
          To view your LinkedIn analytics, you first need to securely connect your LinkedIn account.
        </p>
        <Button onClick={handleConnect} className="mt-4 bg-[#0A66C2] hover:bg-[#0A66C2]/90 text-white">
          <Linkedin className="mr-2 h-4 w-4" />
          Connect with LinkedIn
        </Button>
      </div>
    );
  }

  const metrics = [
    { title: "Followers", value: analyticsData?.metrics?.followers || "0", change: "+0%", icon: Users, color: "text-blue-600", bg: "bg-blue-600/10" },
    { title: "Impressions", value: analyticsData?.metrics?.impressions || "0", change: "+0%", icon: Eye, color: "text-sky-500", bg: "bg-sky-500/10" },
    { title: "Engagement Rate", value: analyticsData?.metrics?.engagementRate || "0%", change: "+0%", icon: ThumbsUp, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { title: "Growth", value: analyticsData?.metrics?.growth || "0%", change: "monthly", icon: TrendingUp, color: "text-violet-500", bg: "bg-violet-500/10" },
  ];

  const impressionsDataToUse = analyticsData?.charts?.impressionsData || fallbackImpressionsData;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600/10">
          <Linkedin className="h-5 w-5 text-blue-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">LinkedIn Analytics</h2>
          <p className="text-sm text-muted-foreground">Profile and post performance</p>
        </div>
      </div>

      {analyticsData?.notice && (
        <div className="p-4 bg-amber-500/10 text-amber-600 rounded-md text-sm border border-amber-500/20">
          {analyticsData.notice}
        </div>
      )}

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
              <LineChart data={impressionsDataToUse}>
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
