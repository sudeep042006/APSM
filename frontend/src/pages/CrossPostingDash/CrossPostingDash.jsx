// ── Cross-Posting Overview ───────────────────────────────────────────
// The landing page for /dashboard/crosspost. Three jobs:
//
//   1. Show which social accounts are actually linked (GET /auth/status).
//      Cross-posting can only target a connected account, so this is the first
//      thing that needs to be true before anything else matters.
//   2. Point an admin at the review queue, since that is where creator
//      submissions land and it is easy to forget they exist.
//   3. Give one clear path into composing a post.
//
// Every count on this page is derived from data the layout already loaded, so
// nothing here can drift from the inbox or the history list.

import { useNavigate } from "react-router-dom";
import { useCrossPost } from "./CrossPostContext";
import { CROSS_POST_PLATFORMS, jobStatus } from "./crossPostPlatforms";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import ConfirmDisconnectModal from "@/components/ConfirmDisconnectModal";
import crosspostApi from "@/services/crosspostApi";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  Inbox,
  Link2,
  PenSquare,
  RefreshCw,
  Unlink,
} from "lucide-react";

// OAuth return targets, one per platform.
const RETURN_PATHS = {
  facebook: "/dashboard/facebook",
  instagram: "/dashboard/instagram",
  youtube: "/dashboard/youtube",
  linkedin: "/dashboard/linkedin",
};

const connectPlatform = (platformId) => {
  const token = localStorage.getItem("incubein_token");
  if (!token) {
    console.error("No auth token found.");
    return;
  }
  localStorage.setItem("returnPath", RETURN_PATHS[platformId] ?? "/dashboard/youtube");
  window.location.href = `http://localhost:5000/auth/${platformId}?token=${token}`;
};

// ── Connection card ──────────────────────────────────────────────────
const ConnectionCard = ({ platform, connected, onConnect, onDisconnect }) => (
  <Card
    className={`surface-card flex flex-col overflow-hidden transition-colors ${
      connected ? "hover:border-emerald-500/25" : "border-dashed hover:border-[#22D3EE]/30"
    }`}
  >
    <CardContent className="flex flex-1 flex-col gap-4 p-5">
      <div className="flex items-start gap-3">
        <span
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
          style={{ backgroundColor: connected ? `${platform.accent}1f` : "rgba(148,163,184,0.08)" }}
        >
          <platform.icon className="h-5 w-5" style={{ color: connected ? platform.accent : "#64748B" }} />
        </span>
        {/* In a 4-column grid this column is the narrowest, so the name and
            hint ellipsize instead of running under the status badge. */}
        <div className="min-w-0 flex-1 overflow-hidden">
          <p className="truncate text-sm font-semibold text-slate-100">{platform.name}</p>
          <p className="mt-0.5 truncate text-[11px] text-muted-foreground">{platform.mediaHint}</p>
        </div>
        {connected && (
          <span
            title={`${platform.name} account connected`}
            className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400 ring-1 ring-inset ring-emerald-500/20"
          >
            <CheckCircle2 className="h-3 w-3" />
            Connected
          </span>
        )}
      </div>

      <p className="flex-1 text-xs leading-relaxed text-slate-400">{platform.description}</p>

      {connected ? (
        <Button
          variant="ghost"
          size="sm"
          className="h-8 self-start text-xs text-muted-foreground hover:bg-rose-500/10 hover:text-rose-400"
          onClick={() => onDisconnect(platform.id)}
        >
          <Unlink className="mr-1.5 h-3.5 w-3.5" />
          Disconnect
        </Button>
      ) : (
        <Button
          variant="outline"
          size="sm"
          className="h-8 self-start text-xs"
          onClick={() => onConnect(platform.id)}
        >
          <Link2 className="mr-1.5 h-3.5 w-3.5" />
          Connect account
        </Button>
      )}
    </CardContent>
  </Card>
);

// ── Pipeline card ────────────────────────────────────────────────────
const PipelineCard = ({ icon: Icon, label, value, hint, accent, to, cta }) => {
  const navigate = useNavigate();
  return (
    <Card className="surface-card flex flex-col">
      <CardContent className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">{label}</p>
          <Icon className="h-3.5 w-3.5 shrink-0" style={{ color: accent }} />
        </div>
        <p className="text-2xl font-bold tabular-nums text-white">{value}</p>
        <p className="flex-1 text-[11px] leading-relaxed text-muted-foreground">{hint}</p>
        <Button variant="ghost" size="sm" className="h-8 self-start text-xs" onClick={() => navigate(to)}>
          {cta}
          <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
        </Button>
      </CardContent>
    </Card>
  );
};

export default function CrossPostingDash() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const {
    connectedPlatforms,
    isLoadingAuth,
    requests,
    pendingCount,
    isLoadingRequests,
    isAdmin,
    postHistory,
    isLoadingHistory,
    refreshRequests,
    refreshHistory,
  } = useCrossPost();

  const [disconnectTarget, setDisconnectTarget] = useState(null);

  const connected = CROSS_POST_PLATFORMS.filter((p) => connectedPlatforms.includes(p.id));
  const available = CROSS_POST_PLATFORMS.filter((p) => !connectedPlatforms.includes(p.id));

  // Job counts come straight from the automation history the layout loaded.
  const jobCounts = postHistory.reduce((acc, job) => {
    const key = job.status;
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  const approvedCount = requests.filter((r) => r.status === "APPROVED").length;
  const rejectedCount = requests.filter((r) => r.status === "REJECTED").length;
  const lastJob = postHistory[0];

  const handleDisconnect = async () => {
    if (!disconnectTarget) return;
    try {
      await crosspostApi.revokeAccess(disconnectTarget);
      toast({ title: "Disconnected", description: "The account has been unlinked." });
      // The context owns the connection list, so a reload is the honest way to
      // re-read GET /auth/status rather than patching it locally.
      window.location.reload();
    } catch (err) {
      console.error("Failed to disconnect", err);
      toast({
        title: "Could not disconnect",
        description: err.response?.data?.error || "The platform did not accept the revoke request.",
        variant: "destructive",
      });
      setDisconnectTarget(null);
    }
  };

  const nothingConnected = !isLoadingAuth && connected.length === 0;
  const canPublish = connected.length > 0;

  return (
    <div className="space-y-6">
      <ConfirmDisconnectModal
        isOpen={!!disconnectTarget}
        onClose={() => setDisconnectTarget(null)}
        onConfirm={handleDisconnect}
      />

      {/* ── Primary action ──────────────────────────────────────────── */}
      <Card className="surface-card overflow-hidden">
        <CardContent className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h2 className="text-lg font-bold tracking-tight text-white">
              {canPublish ? "Ready to publish" : "Connect an account to begin"}
            </h2>
            <p className="mt-1 max-w-xl text-sm leading-relaxed text-muted-foreground">
              {canPublish
                ? `Publishing is available on ${connected.map((p) => p.name).join(", ")}. Compose once and choose the targets per post.`
                : "Cross-posting publishes through your own connected social accounts. Link one below, then every post you compose can target it."}
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            <Button onClick={() => navigate("/dashboard/crosspost/new")} disabled={!canPublish}>
              <PenSquare className="mr-2 h-4 w-4" />
              Compose post
            </Button>
            {isAdmin && (
              <Button variant="outline" onClick={() => navigate("/dashboard/crosspost/requests")}>
                <Inbox className="mr-2 h-4 w-4" />
                Review requests
                {pendingCount > 0 && (
                  <span className="ml-1.5 rounded-full bg-amber-500/20 px-1.5 py-0.5 text-[10px] font-bold text-amber-300">
                    {pendingCount}
                  </span>
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ── Pipeline ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <PipelineCard
          icon={Inbox}
          label="Awaiting review"
          value={isLoadingRequests ? "—" : isAdmin ? pendingCount : "Admin only"}
          accent="#FBBF24"
          hint={
            isAdmin
              ? "Creator submissions routed to you that still need a decision."
              : "Creator submissions are reviewed by an admin."
          }
          to="/dashboard/crosspost/requests"
          cta="Open inbox"
        />
        <PipelineCard
          icon={CheckCircle2}
          label="Approved"
          value={isLoadingRequests ? "—" : isAdmin ? approvedCount : "Admin only"}
          accent="#34D399"
          hint={
            isAdmin
              ? "Submissions approved and turned into publishing jobs."
              : "Approved submissions become publishing jobs."
          }
          to="/dashboard/crosspost/requests"
          cta="View approved"
        />
        <PipelineCard
          icon={AlertTriangle}
          label="Sent back"
          value={isLoadingRequests ? "—" : isAdmin ? rejectedCount : "Admin only"}
          accent="#FB7185"
          hint={
            isAdmin
              ? "Rejected with feedback the creator can read and act on."
              : "Rejected submissions carry your feedback."
          }
          to="/dashboard/crosspost/requests"
          cta="View feedback"
        />
        <Card className="surface-card flex flex-col">
          <CardContent className="flex flex-1 flex-col gap-3 p-5">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Publishing jobs</p>
              <Clock className="h-3.5 w-3.5" style={{ color: "#22D3EE" }} />
            </div>
            <p className="text-2xl font-bold tabular-nums text-white">
              {isLoadingHistory ? "—" : postHistory.length}
            </p>
            <div className="flex-1">
              {isLoadingHistory ? (
                <Skeleton className="h-8 w-full bg-white/5" />
              ) : lastJob ? (
                <>
                  <p className="text-[11px] leading-relaxed text-muted-foreground">
                    Last job: <span className="text-slate-300">{lastJob.caption || "Untitled"}</span>
                  </p>
                  <span
                    className={`mt-2 inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-semibold ${jobStatus(lastJob.status).chip}`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${jobStatus(lastJob.status).dot}`} />
                    {lastJob.status}
                  </span>
                  {Object.keys(jobCounts).length > 1 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {Object.entries(jobCounts).map(([status, n]) => (
                        <span
                          key={status}
                          className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${jobStatus(status).chip}`}
                        >
                          {n} {status.toLowerCase()}
                        </span>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <p className="text-[11px] leading-relaxed text-muted-foreground">
                  Nothing queued yet. Your publishing jobs appear here once you compose your first post.
                </p>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 self-start text-xs"
              onClick={() => navigate("/dashboard/crosspost/history")}
            >
              View history
              <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* ── Connections ─────────────────────────────────────────────── */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-white">Connected accounts</h3>
            <p className="mt-0.5 text-xs text-muted-foreground">
              A post can only target an account you have linked here.
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-xs text-muted-foreground"
            onClick={() => {
              refreshRequests();
              refreshHistory();
            }}
          >
            <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
            Refresh
          </Button>
        </div>

        {isLoadingAuth ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[0, 1, 2, 3].map((i) => (
              <Card key={i} className="surface-card">
                <CardContent className="space-y-3 p-5">
                  <div className="flex gap-3">
                    <Skeleton className="h-11 w-11 rounded-xl bg-white/5" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-3.5 w-1/2 bg-white/5" />
                      <Skeleton className="h-3 w-2/3 bg-white/5" />
                    </div>
                  </div>
                  <Skeleton className="h-8 w-24 bg-white/5" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <>
            {connected.length > 0 && (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {connected.map((platform) => (
                  <ConnectionCard
                    key={platform.id}
                    platform={platform}
                    connected
                    onConnect={connectPlatform}
                    onDisconnect={setDisconnectTarget}
                  />
                ))}
              </div>
            )}

            {available.length > 0 && (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {available.map((platform) => (
                  <ConnectionCard
                    key={platform.id}
                    platform={platform}
                    connected={false}
                    onConnect={connectPlatform}
                    onDisconnect={setDisconnectTarget}
                  />
                ))}
              </div>
            )}

            {nothingConnected && (
              <Card className="surface-card">
                <CardContent className="flex flex-col items-center justify-center py-10 text-center">
                  <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.04]">
                    <Link2 className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-medium text-slate-300">No accounts linked</p>
                  <p className="mt-1 max-w-sm text-xs text-muted-foreground">
                    Connect a platform above to unlock composing and publishing.
                  </p>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </section>
    </div>
  );
}