// ── Incoming Requests (Admin Review Inbox) ───────────────────────────
// The other half of the creator flow. A creator drafts a post or reel in
// Creator Studio and submits it with POST /creator-posts/submit; the server
// stamps it PENDING and routes it to that creator's adminId. This page is the
// admin's side of that hand-off: every submission addressed to this admin,
// with the content laid out for review and the two actions the API supports.
//
// Data source: GET /creator-posts/incoming — all statuses, newest first, each
// post populated with creatorId { _id, name, email }.
// Actions:     POST /creator-posts/:id/approve → creates the Automation job on
//              the admin's own social accounts.
//              POST /creator-posts/:id/reject  → stores feedback for the creator.
// Both are admin-only on the server, so a 403 renders as an explanation rather
// than a silent empty list.

import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCrossPost } from "./CrossPostContext";
import {
  CROSS_POST_PLATFORMS,
  findPlatform,
  requestStatus,
} from "./crossPostPlatforms";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertTriangle,
  Ban,
  Check,
  Clock,
  FileText,
  Image as ImageIcon,
  Inbox,
  Link2,
  Loader2,
  RefreshCw,
  ShieldAlert,
  User,
  X,
} from "lucide-react";

const STATUS_FILTERS = [
  { id: "ALL", label: "All" },
  { id: "PENDING", label: "Awaiting review" },
  { id: "APPROVED", label: "Approved" },
  { id: "REJECTED", label: "Rejected" },
];

const relativeTime = (iso) => {
  if (!iso) return "—";
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "—";
  const diff = Date.now() - then;
  const mins = Math.round(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
};

const absoluteTime = (iso) => {
  if (!iso) return "—";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleString();
};

/** Small labelled platform chip row used on cards and in the drawer. */
const PlatformChips = ({ platforms, size = "sm" }) => {
  const list = (Array.isArray(platforms) ? platforms : []).map(findPlatform).filter(Boolean);
  if (list.length === 0) return null;
  const dim = size === "sm" ? "h-6 w-6" : "h-7 w-7";
  const icon = size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4";
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {list.map((p) => (
        <span
          key={p.id}
          title={p.name}
          className={`inline-flex ${dim} items-center justify-center rounded-lg ring-1 ring-inset ring-white/10`}
          style={{ backgroundColor: `${p.accent}1f` }}
        >
          <p.icon className={icon} style={{ color: p.accent }} />
        </span>
      ))}
    </div>
  );
};

/** Header count tiles, derived from the loaded list — never hard-coded. */
const StatTile = ({ label, value, hint, tone = "default", icon: Icon }) => {
  const tones = {
    default: "text-white",
    pending: "text-amber-400",
    approved: "text-emerald-400",
    rejected: "text-rose-400",
  };
  return (
    <div className="surface-card p-4">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">{label}</p>
        {Icon && <Icon className={`h-3.5 w-3.5 ${tones[tone]}`} />}
      </div>
      <p className={`mt-1.5 text-2xl font-bold tabular-nums ${tones[tone]}`}>{value}</p>
      {hint && <p className="mt-0.5 text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  );
};

// ── Reject dialog ────────────────────────────────────────────────────
const RejectDialog = ({ request, onClose, onConfirm, isSubmitting }) => {
  const [feedback, setFeedback] = useState("");
  const canSubmit = feedback.trim().length > 0;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <Card className="relative z-10 w-full max-w-md border-white/10 bg-surface">
        <CardContent className="space-y-4 p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-base font-semibold text-white">Send back with feedback</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                The creator sees this message on their submission, so be specific about what to change.
              </p>
            </div>
            <button onClick={onClose} className="rounded-lg p-1 text-muted-foreground transition-colors hover:bg-white/5 hover:text-white">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="rounded-xl border border-white/[0.07] bg-surface-sunken/60 p-3">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Submission</p>
            <p className="mt-1 line-clamp-2 text-sm font-medium text-slate-200">
              {request?.title || request?.body || "Untitled post"}
            </p>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="reject-feedback" className="text-xs font-medium text-slate-300">
              Feedback <span className="text-rose-400">*</span>
            </label>
            <textarea
              id="reject-feedback"
              rows={4}
              autoFocus
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="e.g. Please retouch the thumbnail and add the product link to the caption."
              className="w-full resize-none rounded-xl border border-white/10 bg-surface-sunken p-3 text-sm text-slate-200 placeholder:text-slate-600 transition-colors focus:border-[#22D3EE] focus:outline-none"
            />
            <p className="text-[11px] text-muted-foreground">{feedback.trim().length} characters</p>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <Button variant="ghost" size="sm" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              disabled={!canSubmit || isSubmitting}
              onClick={() => onConfirm(feedback.trim())}
            >
              {isSubmitting ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Ban className="mr-1.5 h-3.5 w-3.5" />}
              Reject post
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// ── Detail drawer ────────────────────────────────────────────────────
const RequestDrawer = ({ request, onClose, onApprove, onReject, onImport, busyId }) => {
  if (!request) return null;
  const meta = requestStatus(request.status);
  const creator = request.creatorId || {};
  const isPending = request.status === "PENDING";
  const isBusy = busyId === request._id;

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <aside className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md animate-fade-in flex-col overflow-y-auto border-l border-white/10 bg-surface">
        <header className="flex items-center justify-between gap-3 border-b border-white/[0.07] p-4">
          <div>
            <h3 className="text-sm font-semibold text-white">Submission</h3>
            <p className="mt-0.5 text-[11px] text-muted-foreground">Submitted {relativeTime(request.createdAt)}</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-white/5 hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="flex-1 space-y-5 p-5">
          <div className="flex flex-wrap items-center gap-2">
            {meta && (
              <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${meta.chip}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
                {meta.label}
              </span>
            )}
            <PlatformChips platforms={request.platforms} size="md" />
          </div>

          {/* Creator — populated by the server on /incoming */}
          <section className="surface-card p-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Submitted by</p>
            <div className="mt-2 flex items-center gap-2.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#22D3EE]/10">
                <User className="h-4 w-4 text-[#22D3EE]" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-slate-200">{creator.name || "Unknown creator"}</p>
                <p className="truncate text-[11px] text-muted-foreground">{creator.email || "—"}</p>
              </div>
            </div>
          </section>

          {request.mediaUrl && (
            <section className="overflow-hidden rounded-xl border border-white/[0.07]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={request.mediaUrl} alt="Submitted media" className="max-h-64 w-full bg-surface-sunken object-cover" />
            </section>
          )}

          {request.title && (
            <section>
              <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Title</p>
              <p className="rounded-xl border border-white/[0.07] bg-surface-sunken/60 p-3 text-sm font-medium text-slate-200">
                {request.title}
              </p>
            </section>
          )}

          {request.body && (
            <section>
              <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Body</p>
              <p className="whitespace-pre-wrap rounded-xl border border-white/[0.07] bg-surface-sunken/60 p-3 text-sm leading-relaxed text-slate-300">
                {request.body}
              </p>
            </section>
          )}

          {request.hashtags && (
            <section>
              <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Hashtags</p>
              <p className="text-sm font-medium text-[#22D3EE]">{request.hashtags}</p>
            </section>
          )}

          {request.link && (
            <section>
              <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Link</p>
              <a
                href={request.link}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 break-all text-sm text-blue-400 transition-colors hover:text-blue-300"
              >
                <Link2 className="h-3.5 w-3.5 shrink-0" />
                {request.link}
              </a>
            </section>
          )}

          {request.status === "REJECTED" && request.adminFeedback && (
            <section className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-rose-400/80">Feedback sent</p>
              <p className="mt-1.5 text-sm text-rose-200">{request.adminFeedback}</p>
            </section>
          )}

          {request.status === "APPROVED" && (
            <section className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 text-xs text-emerald-200/90">
              Approved {absoluteTime(request.updatedAt)}. Ready to be imported and published.
            </section>
          )}

          <p className="text-[11px] leading-relaxed text-muted-foreground">
            Target platforms:{" "}
            {(request.platforms || []).map(findPlatform).filter(Boolean).map((p) => p.name).join(", ") || "none specified"}
          </p>
        </div>

        {isPending && (
          <footer className="sticky bottom-0 flex gap-2 border-t border-white/[0.07] bg-surface/95 p-4 backdrop-blur-xl">
            <Button
              variant="destructive"
              className="flex-1"
              disabled={isBusy}
              onClick={() => onReject(request)}
            >
              {isBusy ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Ban className="mr-1.5 h-4 w-4" />}
              Reject
            </Button>
            <Button className="flex-1" disabled={isBusy} onClick={() => onApprove(request)}>
              {isBusy ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Check className="mr-1.5 h-4 w-4" />}
              Approve
            </Button>
          </footer>
        )}
        {request.status === "APPROVED" && (
          <footer className="sticky bottom-0 border-t border-white/[0.07] bg-surface/95 p-4 backdrop-blur-xl">
            <Button className="w-full" onClick={() => onImport(request)}>
               Import to Compose
            </Button>
          </footer>
        )}
      </aside>
    </>
  );
};

// ── Page ─────────────────────────────────────────────────────────────
export default function CrossPostRequests() {
  const navigate = useNavigate();
  const {
    requests,
    isLoadingRequests,
    requestsError,
    refreshRequests,
    approveRequest,
    rejectRequest,
  } = useCrossPost();

  const [statusFilter, setStatusFilter] = useState("ALL");
  const [platformFilter, setPlatformFilter] = useState("ALL");
  const [drawerPost, setDrawerPost] = useState(null);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [busyId, setBusyId] = useState(null);

  // Counts come from the full loaded list so the tiles stay truthful even while
  // a filter is applied.
  const counts = useMemo(
    () => ({
      ALL: requests.length,
      PENDING: requests.filter((r) => r.status === "PENDING").length,
      APPROVED: requests.filter((r) => r.status === "APPROVED").length,
      REJECTED: requests.filter((r) => r.status === "REJECTED").length,
    }),
    [requests]
  );

  const platformsPresent = useMemo(() => {
    const ids = new Set();
    requests.forEach((r) => (r.platforms || []).forEach((p) => ids.add(String(p).toLowerCase())));
    return CROSS_POST_PLATFORMS.filter((p) => ids.has(p.id));
  }, [requests]);

  const visible = useMemo(
    () =>
      requests.filter((r) => {
        if (statusFilter !== "ALL" && r.status !== statusFilter) return false;
        if (platformFilter !== "ALL" && !(r.platforms || []).some((p) => String(p).toLowerCase() === platformFilter))
          return false;
        return true;
      }),
    [requests, statusFilter, platformFilter]
  );

  /**
   * Runs one review action and mirrors the server's response back into local
   * state. The API can refuse (for example "Post is already APPROVED"), so the
   * list is only updated with the document the server actually returned.
   */
  const runAction = async (post, action, feedback) => {
    setBusyId(post._id);
    try {
      const updated =
        action === "approve"
          ? await approveRequest(post._id)
          : await rejectRequest(post._id, feedback);

      // No local list write here. `approveRequest`/`rejectRequest` already
      // replaced the row in context state from the server's response, and the
      // page reads `requests` from that context — a second write would need a
      // setter this component does not have.
      setDrawerPost((current) => (current && current._id === post._id ? { ...current, ...updated } : current));
      return true;
    } catch (err) {
      console.error(`Failed to ${action} request`, err);
      return false;
    } finally {
      setBusyId(null);
    }
  };

  const handleApprove = async (post) => {
    const ok = await runAction(post, "approve");
    if (ok) setDrawerPost(null);
  };

  const handleImport = (post) => {
    navigate("/dashboard/crosspost/new", { state: { importedPost: post } });
  };

  const handleRejectConfirm = async (feedback) => {
    if (!rejectTarget) return;
    const ok = await runAction(rejectTarget, "reject", feedback);
    if (ok) {
      setRejectTarget(null);
      setDrawerPost(null);
    }
  };

  // ── Gate: the endpoint is admin-only on the server ────────────────
  if (requestsError === "forbidden") {
    return (
      <Card className="surface-card">
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10">
            <ShieldAlert className="h-6 w-6 text-amber-400" />
          </div>
          <h3 className="text-base font-semibold text-white">Admins only</h3>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">
            Incoming requests are the review queue for content your creators submit, and the backend restricts this
            view to admin accounts. Sign in with an admin account to review and approve submissions.
          </p>
          <Button variant="outline" className="mt-6" onClick={() => navigate("/dashboard/crosspost")}>
            Back to overview
          </Button>
        </CardContent>
      </Card>
    );
  }

  // ── Network failure is distinct from "nothing submitted yet" ──────
  if (requestsError === "network") {
    return (
      <Card className="surface-card">
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500/10">
            <AlertTriangle className="h-6 w-6 text-rose-400" />
          </div>
          <h3 className="text-base font-semibold text-white">Could not load requests</h3>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">
            The request to <code className="text-slate-400">/creator-posts/incoming</code> failed. Nothing was lost — retrying
            is safe.
          </p>
          <Button variant="outline" className="mt-6" onClick={refreshRequests}>
            <RefreshCw className="mr-1.5 h-4 w-4" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── Counts ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile label="Total submissions" value={counts.ALL} hint="All creators routed to you" icon={Inbox} />
        <StatTile label="Awaiting review" value={counts.PENDING} hint="Needs a decision" tone="pending" icon={Clock} />
        <StatTile label="Approved" value={counts.APPROVED} hint="Sent to publishing" tone="approved" icon={Check} />
        <StatTile label="Rejected" value={counts.REJECTED} hint="Sent back with feedback" tone="rejected" icon={Ban} />
      </div>

      {/* ── Filters ────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-1.5">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setStatusFilter(f.id)}
              className={`rounded-xl px-3 py-1.5 text-[13px] font-semibold transition-all duration-300 ${
                statusFilter === f.id
                  ? "bg-[#22D3EE]/10 text-[#22D3EE] ring-1 ring-inset ring-[#22D3EE]/25"
                  : "text-muted-foreground ring-1 ring-inset ring-white/[0.07] hover:bg-white/[0.05] hover:text-white"
              }`}
            >
              {f.label}
              <span className="ml-1.5 text-[11px] opacity-70">{counts[f.id]}</span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <select
            value={platformFilter}
            onChange={(e) => setPlatformFilter(e.target.value)}
            className="h-9 rounded-lg border border-white/10 bg-surface-sunken px-2.5 text-[13px] text-slate-200 transition-colors focus:border-[#22D3EE] focus:outline-none"
          >
            <option value="ALL">All platforms</option>
            {platformsPresent.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          <Button
            variant="outline"
            size="sm"
            onClick={refreshRequests}
            disabled={isLoadingRequests}
            className="h-9 text-xs"
            title="Reload from server"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoadingRequests ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {/* ── List ───────────────────────────────────────────────────── */}
      {isLoadingRequests ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {[0, 1, 2, 3].map((i) => (
            <Card key={i} className="surface-card">
              <CardContent className="space-y-3 p-5">
                <div className="flex gap-3">
                  <Skeleton className="h-12 w-12 rounded-xl bg-white/5" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-3.5 w-2/3 bg-white/5" />
                    <Skeleton className="h-3 w-1/3 bg-white/5" />
                  </div>
                </div>
                <Skeleton className="h-16 w-full bg-white/5" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : visible.length === 0 ? (
        <Card className="surface-card">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.04]">
              {requests.length === 0 ? (
                <FileText className="h-6 w-6 text-muted-foreground" />
              ) : (
                <Inbox className="h-6 w-6 text-muted-foreground" />
              )}
            </div>
            <h3 className="text-base font-semibold text-white">
              {requests.length === 0 ? "No submissions yet" : "Nothing matches this filter"}
            </h3>
            <p className="mt-2 max-w-sm text-sm text-muted-foreground">
              {requests.length === 0
                ? "When a creator drafts a post in Creator Studio and submits it for review, it lands here."
                : "No submission matches the selected status and platform. Try clearing a filter."}
            </p>
            {requests.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                className="mt-6"
                onClick={() => {
                  setStatusFilter("ALL");
                  setPlatformFilter("ALL");
                }}
              >
                Clear filters
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {visible.map((post) => {
            const meta = requestStatus(post.status);
            const isPending = post.status === "PENDING";
            const isBusy = busyId === post._id;
            const creator = post.creatorId || {};

            return (
              <Card key={post._id} className="surface-card flex flex-col transition-colors hover:border-white/15">
                <CardContent className="flex flex-1 flex-col gap-3 p-5">
                  <div className="flex items-start gap-3">
                    {post.mediaUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={post.mediaUrl}
                        alt=""
                        className="h-12 w-12 shrink-0 rounded-xl border border-white/10 object-cover"
                      />
                    ) : (
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-white/[0.07] bg-surface-sunken">
                        <ImageIcon className="h-4 w-4 text-muted-foreground" />
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="line-clamp-2 text-sm font-semibold text-slate-100">
                          {post.title || post.body || "Untitled post"}
                        </p>
                        {meta && (
                          <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${meta.chip}`}>
                            {meta.label}
                          </span>
                        )}
                      </div>
                      <p className="mt-1 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                        <User className="h-3 w-3" />
                        <span className="truncate">{creator.name || creator.email || "Unknown creator"}</span>
                        <span className="text-slate-700">•</span>
                        <span className="shrink-0">{relativeTime(post.createdAt)}</span>
                      </p>
                    </div>
                  </div>

                  <p className="line-clamp-3 text-[13px] leading-relaxed text-slate-400">{post.body}</p>

                  <div className="mt-auto flex items-center justify-between gap-2 pt-1">
                    <PlatformChips platforms={post.platforms} />
                    <div className="flex shrink-0 gap-1.5">
                      {isPending && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 text-xs text-rose-400 hover:bg-rose-500/10"
                            disabled={isBusy}
                            onClick={() => setRejectTarget(post)}
                          >
                            Reject
                          </Button>
                          <Button
                            size="sm"
                            className="h-8 text-xs"
                            disabled={isBusy}
                            onClick={() => handleApprove(post)}
                          >
                            {isBusy ? <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" /> : <Check className="mr-1 h-3.5 w-3.5" />}
                            Approve
                          </Button>
                        </>
                      )}
                      {post.status === "APPROVED" && (
                        <Button size="sm" className="h-8 text-xs bg-emerald-600 hover:bg-emerald-500 text-white" onClick={() => handleImport(post)}>Import to Compose</Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 text-xs text-muted-foreground"
                        onClick={() => setDrawerPost(post)}
                      >
                        Open
                      </Button>
                    </div>
                  </div>

                  {post.status === "REJECTED" && post.adminFeedback && (
                    <p className="line-clamp-2 rounded-lg border border-rose-500/15 bg-rose-500/5 px-2.5 py-1.5 text-[11px] text-rose-200/90">
                      Feedback: {post.adminFeedback}
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {drawerPost && (
        <RequestDrawer
          request={drawerPost}
          onClose={() => setDrawerPost(null)}
          onApprove={handleApprove}
          onReject={(post) => setRejectTarget(post)}
          busyId={busyId}
        />
      )}

      {rejectTarget && (
        <RejectDialog
          request={rejectTarget}
          onClose={() => setRejectTarget(null)}
          onConfirm={handleRejectConfirm}
          isSubmitting={busyId === rejectTarget._id}
        />
      )}
    </div>
  );
}


