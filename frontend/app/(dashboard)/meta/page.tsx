// Meta Analytics Workspace — Facebook & Instagram unified view
// Wireframe with skeleton loading states and mock data
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

/* ─── Mock Metrics ────────────────────────────────────────────────── */
const metrics = [
  { title: "Total Reach", value: "892K", change: "+22.1%", positive: true },
  { title: "Page Likes", value: "67.4K", change: "+4.3%", positive: true },
  { title: "Engagement Rate", value: "6.2%", change: "+1.1%", positive: true },
  { title: "Story Views", value: "15.8K", change: "-3.4%", positive: false },
];

/* ─── Mock Posts ───────────────────────────────────────────────────── */
const posts = [
  { title: "Product Launch", platform: "Instagram", reach: "156K", date: "12 hrs ago" },
  { title: "BTS Reel", platform: "Instagram", reach: "98K", date: "1 day ago" },
  { title: "Q&A Session", platform: "Facebook", reach: "74K", date: "3 days ago" },
];

/* ─── Meta Page Component ─────────────────────────────────────────── */
export default function MetaPage() {
  return (
    <div className="space-y-6">
      {/* ── Page Header ──────────────────────────────────────── */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Meta Analytics</h1>
        <p className="text-muted-foreground mt-1">
          Unified Facebook & Instagram insights
        </p>
      </div>

      {/* ── Metrics Cards ────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m) => (
          <Card key={m.title} className="glass border-border/30">
            <CardHeader className="pb-2">
              <CardDescription className="text-xs font-medium uppercase tracking-wider">{m.title}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{m.value}</div>
              <p className={`text-xs mt-1 ${m.positive ? "text-emerald-500" : "text-red-500"}`}>{m.change} from last month</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── Platform Tabs ────────────────────────────────────── */}
      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="facebook">Facebook</TabsTrigger>
          <TabsTrigger value="instagram">Instagram</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="space-y-6 mt-4">
          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="glass border-border/30">
              <CardHeader>
                <CardTitle className="text-lg">Reach Over Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-end gap-1 h-52">
                  {Array.from({ length: 28 }).map((_, i) => (
                    <Skeleton key={i} className="flex-1 rounded-t-sm bg-indigo-500/20" style={{ height: `${Math.random() * 70 + 30}%` }} />
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card className="glass border-border/30">
              <CardHeader>
                <CardTitle className="text-lg">Content Performance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {["Reels", "Carousels", "Stories", "Images"].map((t, i) => (
                  <div key={t} className="space-y-1.5">
                    <div className="flex justify-between text-sm"><span>{t}</span><span className="text-muted-foreground">{[42, 28, 18, 12][i]}%</span></div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden"><div className="h-full bg-indigo-500/60 rounded-full" style={{ width: `${[42, 28, 18, 12][i]}%` }} /></div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
          {/* Posts Table */}
          <Card className="glass border-border/30">
            <CardHeader><CardTitle className="text-lg">Recent Posts</CardTitle></CardHeader>
            <CardContent>
              <table className="w-full text-sm">
                <thead><tr className="border-b border-border/50 text-muted-foreground"><th className="text-left py-3 px-2 font-medium">Title</th><th className="text-left py-3 px-2 font-medium">Platform</th><th className="text-right py-3 px-2 font-medium">Reach</th><th className="text-right py-3 px-2 font-medium">Date</th></tr></thead>
                <tbody>
                  {posts.map((p) => (
                    <tr key={p.title} className="border-b border-border/30 hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-2 font-medium">{p.title}</td>
                      <td className="py-3 px-2"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${p.platform === "Instagram" ? "bg-pink-500/10 text-pink-500" : "bg-blue-500/10 text-blue-500"}`}>{p.platform}</span></td>
                      <td className="py-3 px-2 text-right text-muted-foreground">{p.reach}</td>
                      <td className="py-3 px-2 text-right text-muted-foreground">{p.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="facebook"><Card className="glass border-border/30"><CardHeader><CardTitle>Facebook</CardTitle></CardHeader><CardContent><Skeleton className="h-64 w-full" /></CardContent></Card></TabsContent>
        <TabsContent value="instagram"><Card className="glass border-border/30"><CardHeader><CardTitle>Instagram</CardTitle></CardHeader><CardContent><Skeleton className="h-64 w-full" /></CardContent></Card></TabsContent>
      </Tabs>
    </div>
  );
}
