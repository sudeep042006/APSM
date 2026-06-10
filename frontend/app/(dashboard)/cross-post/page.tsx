// Cross-Post Workspace — Multi-platform scheduling dashboard
// Wireframe with calendar view skeleton and post composer
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/* ─── Mock Scheduled Posts ────────────────────────────────────────── */
const scheduledPosts = [
  { title: "Weekly Product Update", platforms: ["YouTube", "LinkedIn"], time: "Tomorrow, 9:00 AM", status: "Scheduled" },
  { title: "Industry Report Insights", platforms: ["LinkedIn", "Meta"], time: "Jun 13, 2:00 PM", status: "Scheduled" },
  { title: "Behind the Scenes", platforms: ["YouTube", "Meta"], time: "Jun 15, 11:00 AM", status: "Draft" },
];

/* ─── Platform Badge Colors ───────────────────────────────────────── */
const platformColors: Record<string, string> = {
  YouTube: "bg-red-500/10 text-red-500",
  LinkedIn: "bg-blue-500/10 text-blue-500",
  Meta: "bg-indigo-500/10 text-indigo-500",
};

/* ─── Cross-Post Page Component ───────────────────────────────────── */
export default function CrossPostPage() {
  return (
    <div className="space-y-6">
      {/* ── Page Header ──────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Cross-Post Scheduler</h1>
          <p className="text-muted-foreground mt-1">
            Schedule and publish content across all platforms
          </p>
        </div>
        <Button id="new-post-btn">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          New Post
        </Button>
      </div>

      {/* ── Content Grid ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Post Composer Card ──────────────────────────────── */}
        <Card className="lg:col-span-2 glass border-border/30">
          <CardHeader>
            <CardTitle className="text-lg">Compose Post</CardTitle>
            <CardDescription>Create content for multiple platforms</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Title input */}
            <Input id="post-title" placeholder="Post title..." className="bg-background/50" />
            {/* Content textarea placeholder */}
            <div className="min-h-[160px] rounded-md border border-input bg-background/50 p-3 text-sm text-muted-foreground">
              Write your content here...
            </div>
            {/* Platform selection */}
            <div className="space-y-2">
              <p className="text-sm font-medium">Publish to:</p>
              <div className="flex gap-2">
                {["YouTube", "LinkedIn", "Meta"].map((p) => (
                  <Button key={p} variant="outline" size="sm" className="gap-2">
                    <div className={`w-2 h-2 rounded-full ${p === "YouTube" ? "bg-red-500" : p === "LinkedIn" ? "bg-blue-500" : "bg-indigo-500"}`} />
                    {p}
                  </Button>
                ))}
              </div>
            </div>
            {/* Action buttons */}
            <div className="flex gap-3 pt-2">
              <Button>Schedule Post</Button>
              <Button variant="outline">Save Draft</Button>
            </div>
          </CardContent>
        </Card>

        {/* ── Calendar Skeleton ───────────────────────────────── */}
        <Card className="glass border-border/30">
          <CardHeader>
            <CardTitle className="text-lg">Calendar</CardTitle>
            <CardDescription>June 2026</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Calendar grid placeholder */}
            <div className="grid grid-cols-7 gap-1 text-center text-xs mb-2 text-muted-foreground">
              {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
                <span key={d} className="py-1 font-medium">{d}</span>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: 30 }).map((_, i) => (
                <div
                  key={i}
                  className={`aspect-square rounded-md flex items-center justify-center text-xs cursor-pointer transition-colors hover:bg-muted/50 ${
                    i === 9 ? "bg-primary text-primary-foreground" : ""
                  } ${[4, 12, 14].includes(i) ? "ring-1 ring-emerald-500/50" : ""}`}
                >
                  {i + 1}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Scheduled Posts List ──────────────────────────────── */}
      <Card className="glass border-border/30">
        <CardHeader>
          <CardTitle className="text-lg">Scheduled Posts</CardTitle>
          <CardDescription>Upcoming content across platforms</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {scheduledPosts.map((post) => (
              <div
                key={post.title}
                className="flex items-center justify-between p-4 rounded-lg border border-border/30 hover:bg-muted/20 transition-colors"
              >
                <div className="space-y-1">
                  <p className="font-medium text-sm">{post.title}</p>
                  <div className="flex gap-1.5">
                    {post.platforms.map((p) => (
                      <span key={p} className={`px-2 py-0.5 rounded-full text-xs font-medium ${platformColors[p]}`}>
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">{post.time}</p>
                  <span className={`text-xs font-medium ${post.status === "Scheduled" ? "text-emerald-500" : "text-amber-500"}`}>
                    {post.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
