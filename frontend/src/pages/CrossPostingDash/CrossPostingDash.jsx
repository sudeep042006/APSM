// ── Cross-Posting Dashboard ─────────────────────────────────────────
// Scheduling and post publishing panel for multi-platform cross-posting.

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Send, Calendar, Plus, Clock } from "lucide-react";
import { Youtube, Linkedin, Facebook, Instagram } from "@/components/icons/BrandIcons";

// ── Mock scheduled posts ────────────────────────────────────────────
const mockPosts = [
  { id: 1, content: "Exciting new analytics features coming soon! 🚀", platforms: ["linkedin", "facebook"], time: "Jun 15, 10:00 AM", status: "scheduled" },
  { id: 2, content: "Check out our latest video breakdown 📊", platforms: ["youtube", "instagram"], time: "Jun 16, 2:30 PM", status: "scheduled" },
  { id: 3, content: "Behind the scenes of our dashboard development 🛠️", platforms: ["linkedin", "instagram", "facebook"], time: "Jun 18, 9:00 AM", status: "draft" },
];

// ── Platform icon map ───────────────────────────────────────────────
const platformIcons = {
  youtube: <Youtube className="h-3.5 w-3.5 text-red-500" />,
  linkedin: <Linkedin className="h-3.5 w-3.5 text-blue-600" />,
  facebook: <Facebook className="h-3.5 w-3.5 text-blue-500" />,
  instagram: <Instagram className="h-3.5 w-3.5 text-pink-500" />,
};

export default function CrossPostingDash() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
            <Send className="h-5 w-5 text-emerald-500" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Cross-Posting</h2>
            <p className="text-sm text-muted-foreground">Schedule and publish across platforms</p>
          </div>
        </div>
        <Button className="gap-2" id="crosspost-new-btn">
          <Plus className="h-4 w-4" /> New Post
        </Button>
      </div>

      {/* ── Quick Stats ──────────────────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card><CardContent className="p-6">
          <p className="text-sm text-muted-foreground">Scheduled</p>
          <p className="mt-1 text-2xl font-bold">2</p>
          <div className="mt-2 flex items-center gap-1 text-sm text-muted-foreground">
            <Calendar className="h-3.5 w-3.5" /> Upcoming posts
          </div>
        </CardContent></Card>
        <Card><CardContent className="p-6">
          <p className="text-sm text-muted-foreground">Drafts</p>
          <p className="mt-1 text-2xl font-bold">1</p>
          <div className="mt-2 flex items-center gap-1 text-sm text-muted-foreground">
            <Clock className="h-3.5 w-3.5" /> Ready to schedule
          </div>
        </CardContent></Card>
        <Card><CardContent className="p-6">
          <p className="text-sm text-muted-foreground">Published</p>
          <p className="mt-1 text-2xl font-bold">24</p>
          <div className="mt-2 flex items-center gap-1 text-sm text-muted-foreground">
            <Send className="h-3.5 w-3.5" /> This month
          </div>
        </CardContent></Card>
      </div>

      {/* ── Scheduled Posts List ──────────────────────────────────────── */}
      <Card>
        <CardHeader><CardTitle className="text-base">Upcoming Posts</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {mockPosts.map((post) => (
            <div key={post.id} className="flex items-start gap-4 rounded-lg border p-4 transition-all hover:bg-accent/50">
              <div className="flex-1">
                <p className="text-sm font-medium">{post.content}</p>
                <div className="mt-2 flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    {post.platforms.map((p) => (
                      <span key={p}>{platformIcons[p]}</span>
                    ))}
                  </div>
                  <span className="text-xs text-muted-foreground">{post.time}</span>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${post.status === "scheduled" ? "bg-emerald-500/10 text-emerald-500" : "bg-amber-500/10 text-amber-500"}`}>
                    {post.status}
                  </span>
                </div>
              </div>
              <Button variant="ghost" size="sm">Edit</Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
