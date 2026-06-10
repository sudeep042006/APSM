// LinkedIn Analytics Workspace — Wireframe with skeleton loading states
// Displays professional engagement metrics, post performance, and audience data
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

/* ─── Mock Metric Data ────────────────────────────────────────────── */
const metrics = [
  { title: "Post Impressions", value: "328K", change: "+18.4%", positive: true },
  { title: "Followers", value: "12.3K", change: "+5.7%", positive: true },
  { title: "Engagement Rate", value: "4.8%", change: "+0.6%", positive: true },
  { title: "Profile Views", value: "2,145", change: "+11.2%", positive: true },
];

/* ─── Mock Recent Posts Data ──────────────────────────────────────── */
const recentPosts = [
  { title: "5 Lessons from Scaling a Startup", impressions: "42K", reactions: "1.2K", comments: "89", date: "1 day ago" },
  { title: "The Future of Remote Work", impressions: "38K", reactions: "987", comments: "124", date: "3 days ago" },
  { title: "Why TypeScript is Worth the Effort", impressions: "29K", reactions: "756", comments: "67", date: "1 week ago" },
  { title: "My Journey into Product Management", impressions: "21K", reactions: "543", comments: "45", date: "2 weeks ago" },
];

/* ─── LinkedIn Page Component ─────────────────────────────────────── */
export default function LinkedInPage() {
  return (
    <div className="space-y-6">
      {/* ── Page Header ────────────────────────────────────────── */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">LinkedIn Analytics</h1>
        <p className="text-muted-foreground mt-1">
          Monitor your professional reach, engagement, and follower growth
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

      {/* ── Engagement Chart (Skeleton Wireframe) ──────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glass border-border/30">
          <CardHeader>
            <CardTitle className="text-lg">Impression Trends</CardTitle>
            <CardDescription>Post impressions over the last 30 days</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Chart placeholder — replaced by Recharts in Phase 3 */}
            <div className="flex items-end gap-1 h-52">
              {Array.from({ length: 30 }).map((_, i) => (
                <Skeleton
                  key={i}
                  className="flex-1 rounded-t-sm bg-blue-500/20"
                  style={{ height: `${Math.random() * 80 + 20}%` }}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-border/30">
          <CardHeader>
            <CardTitle className="text-lg">Audience Demographics</CardTitle>
            <CardDescription>Follower breakdown by industry</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Demographics placeholder bars */}
            {["Technology", "Finance", "Marketing", "Healthcare", "Education"].map(
              (industry, i) => (
                <div key={industry} className="space-y-1.5">
                  <div className="flex justify-between text-sm">
                    <span>{industry}</span>
                    <span className="text-muted-foreground">
                      {[34, 22, 18, 14, 12][i]}%
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500/60 rounded-full transition-all duration-500"
                      style={{ width: `${[34, 22, 18, 14, 12][i]}%` }}
                    />
                  </div>
                </div>
              )
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Recent Posts Table ─────────────────────────────────── */}
      <Card className="glass border-border/30">
        <CardHeader>
          <CardTitle className="text-lg">Recent Posts</CardTitle>
          <CardDescription>Your latest LinkedIn posts and their performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50 text-muted-foreground">
                  <th className="text-left py-3 px-2 font-medium">Title</th>
                  <th className="text-right py-3 px-2 font-medium">Impressions</th>
                  <th className="text-right py-3 px-2 font-medium">Reactions</th>
                  <th className="text-right py-3 px-2 font-medium">Comments</th>
                  <th className="text-right py-3 px-2 font-medium">Published</th>
                </tr>
              </thead>
              <tbody>
                {recentPosts.map((post) => (
                  <tr
                    key={post.title}
                    className="border-b border-border/30 hover:bg-muted/30 transition-colors"
                  >
                    <td className="py-3 px-2 font-medium">{post.title}</td>
                    <td className="py-3 px-2 text-right text-muted-foreground">{post.impressions}</td>
                    <td className="py-3 px-2 text-right text-muted-foreground">{post.reactions}</td>
                    <td className="py-3 px-2 text-right text-muted-foreground">{post.comments}</td>
                    <td className="py-3 px-2 text-right text-muted-foreground">{post.date}</td>
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
