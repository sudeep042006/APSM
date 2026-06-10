// YouTube Analytics Workspace — Wireframe with skeleton loading states
// Displays mock metrics, chart placeholders, and recent videos table
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

/* ─── Mock Metric Data ────────────────────────────────────────────── */
const metrics = [
  { title: "Total Views", value: "1.2M", change: "+12.5%", positive: true },
  { title: "Subscribers", value: "45.8K", change: "+3.2%", positive: true },
  { title: "Watch Time (hrs)", value: "8,432", change: "+8.1%", positive: true },
  { title: "Revenue", value: "$2,847", change: "-2.3%", positive: false },
];

/* ─── Mock Recent Videos Data ─────────────────────────────────────── */
const recentVideos = [
  { title: "How to Build a Dashboard in React", views: "124K", likes: "5.2K", date: "2 days ago" },
  { title: "Next.js 15 Full Tutorial", views: "89K", likes: "3.8K", date: "5 days ago" },
  { title: "TypeScript Tips & Tricks", views: "67K", likes: "2.9K", date: "1 week ago" },
  { title: "Tailwind CSS Deep Dive", views: "45K", likes: "1.7K", date: "2 weeks ago" },
];

/* ─── YouTube Page Component ──────────────────────────────────────── */
export default function YouTubePage() {
  return (
    <div className="space-y-6">
      {/* ── Page Header ────────────────────────────────────────── */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">YouTube Analytics</h1>
        <p className="text-muted-foreground mt-1">
          Track your channel performance, views, and revenue
        </p>
      </div>

      {/* ── Metrics Cards Grid ─────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric) => (
          <Card key={metric.title} className="glass border-border/30">
            <CardHeader className="pb-2">
              <CardDescription className="text-xs font-medium uppercase tracking-wider">
                {metric.title}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <p
                className={`text-xs mt-1 ${
                  metric.positive ? "text-emerald-500" : "text-red-500"
                }`}
              >
                {metric.change} from last month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── Chart Section (Skeleton Wireframe) ─────────────────── */}
      <Tabs defaultValue="views" className="w-full">
        <TabsList>
          <TabsTrigger value="views">Views</TabsTrigger>
          <TabsTrigger value="watchtime">Watch Time</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
        </TabsList>

        <TabsContent value="views">
          <Card className="glass border-border/30">
            <CardHeader>
              <CardTitle className="text-lg">Views Over Time</CardTitle>
              <CardDescription>Daily views for the last 30 days</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Chart placeholder — will be replaced by Recharts in Phase 3 */}
              <div className="flex items-end gap-1 h-64">
                {Array.from({ length: 30 }).map((_, i) => (
                  <Skeleton
                    key={i}
                    className="flex-1 rounded-t-sm bg-red-500/20"
                    style={{ height: `${Math.random() * 80 + 20}%` }}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="watchtime">
          <Card className="glass border-border/30">
            <CardHeader>
              <CardTitle className="text-lg">Watch Time</CardTitle>
              <CardDescription>Hours watched per day</CardDescription>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full rounded-lg" />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="revenue">
          <Card className="glass border-border/30">
            <CardHeader>
              <CardTitle className="text-lg">Revenue</CardTitle>
              <CardDescription>Estimated revenue breakdown</CardDescription>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full rounded-lg" />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ── Recent Videos Table ────────────────────────────────── */}
      <Card className="glass border-border/30">
        <CardHeader>
          <CardTitle className="text-lg">Recent Videos</CardTitle>
          <CardDescription>Your latest uploads and their performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50 text-muted-foreground">
                  <th className="text-left py-3 px-2 font-medium">Title</th>
                  <th className="text-right py-3 px-2 font-medium">Views</th>
                  <th className="text-right py-3 px-2 font-medium">Likes</th>
                  <th className="text-right py-3 px-2 font-medium">Published</th>
                </tr>
              </thead>
              <tbody>
                {recentVideos.map((video) => (
                  <tr
                    key={video.title}
                    className="border-b border-border/30 hover:bg-muted/30 transition-colors"
                  >
                    <td className="py-3 px-2 font-medium">{video.title}</td>
                    <td className="py-3 px-2 text-right text-muted-foreground">{video.views}</td>
                    <td className="py-3 px-2 text-right text-muted-foreground">{video.likes}</td>
                    <td className="py-3 px-2 text-right text-muted-foreground">{video.date}</td>
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
