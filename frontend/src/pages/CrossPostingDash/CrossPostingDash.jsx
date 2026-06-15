// ── Cross-Posting Dashboard ─────────────────────────────────────────
// Scheduling and post publishing panel for multi-platform cross-posting.

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Send, Plus, CheckCircle2, Link2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Youtube, Linkedin, Facebook, Instagram } from "@/components/icons/BrandIcons";

const MOCK_PLATFORMS = [
  { id: "facebook", name: "Facebook", connected: true, icon: Facebook, color: "text-blue-500", bg: "bg-blue-500/10", description: "Connect to cross-post to your pages and communities." },
  { id: "instagram", name: "Instagram", connected: false, icon: Instagram, color: "text-pink-500", bg: "bg-pink-500/10", description: "Connect to schedule posts and reels." },
  { id: "youtube", name: "YouTube", connected: false, icon: Youtube, color: "text-red-500", bg: "bg-red-500/10", description: "Connect to publish videos and track views." },
  { id: "linkedin", name: "LinkedIn", connected: false, icon: Linkedin, color: "text-blue-600", bg: "bg-blue-600/10", description: "Connect to share professional updates." },
];

export default function CrossPostingDash() {
  const navigate = useNavigate();

  const activeConnections = MOCK_PLATFORMS.filter(p => p.connected);
  const unconnectedPlatforms = MOCK_PLATFORMS.filter(p => !p.connected);

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
        <Button className="gap-2" id="crosspost-new-btn" onClick={() => navigate("/dashboard/crosspost/new")}>
          <Plus className="h-4 w-4" /> New Post
        </Button>
      </div>

      {/* ── Conditional Active Connections & Empty State ─────────────── */}
      {activeConnections.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <Link2 className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="mb-2 text-lg font-semibold">No social media applications connected yet.</h3>
            <p className="mb-6 max-w-sm text-sm text-muted-foreground">
              Connect a platform to unlock cross-posting capabilities.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              {MOCK_PLATFORMS.map(platform => (
                <Button key={platform.id} variant="outline" className="gap-2">
                  <platform.icon className={`h-4 w-4 ${platform.color}`} />
                  Connect {platform.name}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-10">
          {/* Active Workspaces */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Active Workspaces</h3>
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
              {activeConnections.map(platform => (
                <Card key={platform.id} className="relative overflow-hidden transition-all hover:border-primary/50">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${platform.bg}`}>
                          <platform.icon className={`h-6 w-6 ${platform.color}`} />
                        </div>
                        <div>
                          <h4 className="font-semibold">{platform.name}</h4>
                          <p className="text-sm text-muted-foreground">Workspace active</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-500">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Connected
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Available to Connect */}
          {unconnectedPlatforms.length > 0 && (
            <div className="mt-10">
              <h3 className="text-lg font-medium text-gray-300 mb-4">Available to Connect</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {unconnectedPlatforms.map(platform => (
                  <Card key={platform.id} className="opacity-80 border-dashed border-gray-700 bg-zinc-900/40 transition-all hover:opacity-100 hover:border-primary/50">
                    <CardContent className="p-6 flex flex-col gap-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                          <platform.icon className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <h4 className="font-semibold text-muted-foreground">{platform.name}</h4>
                      </div>
                      <p className="text-sm text-muted-foreground flex-1">{platform.description}</p>
                      <Button variant="secondary" className="w-full">
                        Connect Account
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
