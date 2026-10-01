// ── Publishing History ───────────────────────────────────────────────
// Everything this account has queued through POST /automation/jobs, newest
// first. The server maps the Automation status enum (PENDING, PROCESSING,
// COMPLETED, PARTIAL_SUCCESS, FAILED) onto display labels before sending, so
// the labels rendered here are exactly what the API returned.
//
// The data comes from the CrossPost context, which loads it once for the whole
// section — switching between the overview, the inbox and this page never
// refetches the same list twice.

import { useState } from "react";
import { useCrossPost } from "./CrossPostContext";
import { findPlatform, jobStatus, jobTimestamp } from "./crossPostPlatforms";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ExternalLink,
  FileText,
  Image as ImageIcon,
  Link2,
  RefreshCw,
  X,
} from "lucide-react";

const absoluteTime = (value) => {
  if (!value) return "—";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleString();
};

/** Status pill. Falls back to a neutral chip so an unmapped label is visible
 *  rather than silently rendered as success or failure. */
const StatusPill = ({ status }) => {
  const meta = jobStatus(status);
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider ${meta.chip}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
      {status || "Unknown"}
    </span>
  );
};

const PlatformIcons = ({ platforms }) => {
  const list = (Array.isArray(platforms) ? platforms : []).map(findPlatform).filter(Boolean);
  if (list.length === 0) {
    return <span className="text-[11px] text-muted-foreground">—</span>;
  }
  return (
    <div className="flex items-center gap-1.5">
      {list.map((p) => (
        <span
          key={p.id}
          title={p.name}
          className="inline-flex h-6 w-6 items-center justify-center rounded-lg ring-1 ring-inset ring-white/10"
          style={{ backgroundColor: `${p.accent}1f` }}
        >
          <p.icon className="h-3.5 w-3.5" style={{ color: p.accent }} />
        </span>
      ))}
    </div>
  );
};

// ── Detail drawer ────────────────────────────────────────────────────
const JobDrawer = ({ job, onClose }) => {
  if (!job) return null;
  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <aside className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md animate-fade-in flex-col overflow-y-auto border-l border-white/10 bg-surface">
        <header className="flex items-center justify-between gap-3 border-b border-white/[0.07] p-4">
          <div>
            <h3 className="text-sm font-semibold text-white">Publishing job</h3>
            <p className="mt-0.5 text-[11px] text-muted-foreground">{absoluteTime(jobTimestamp(job))}</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-white/5 hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="flex-1 space-y-5 p-5">
          <div className="flex flex-wrap items-center gap-2">
            <StatusPill status={job.status} />
            <PlatformIcons platforms={job.platforms} />
          </div>

          {job.thumbnail && (
            <div className="overflow-hidden rounded-xl border border-white/[0.07]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={job.thumbnail} alt="Attached media" className="max-h-56 w-full bg-surface-sunken object-cover" />
            </div>
          )}

          {job.title && (
            <section>
              <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Title</p>
              <p className="rounded-xl border border-white/[0.07] bg-surface-sunken/60 p-3 text-sm font-medium text-slate-200">
                {job.title}
              </p>
            </section>
          )}

          {job.body && (
            <section>
              <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Body</p>
              <p className="whitespace-pre-wrap rounded-xl border border-white/[0.07] bg-surface-sunken/60 p-3 text-sm leading-relaxed text-slate-300">
                {job.body}
              </p>
            </section>
          )}

          {job.hashtags && (
            <section>
              <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Hashtags</p>
              <p className="text-sm font-medium text-[#22D3EE]">{job.hashtags}</p>
            </section>
          )}

          {job.link && (
            <section>
              <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Link</p>
              <a
                href={job.link}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 break-all text-sm text-blue-400 transition-colors hover:text-blue-300"
              >
                <Link2 className="h-3.5 w-3.5 shrink-0" />
                {job.link}
              </a>
            </section>
          )}

          <dl className="grid grid-cols-2 gap-3 text-[11px]">
            <div className="rounded-xl border border-white/[0.07] bg-surface-sunken/60 p-3">
              <dt className="text-muted-foreground">Queued</dt>
              <dd className="mt-1 text-slate-200">{absoluteTime(job.createdAt)}</dd>
            </div>
            <div className="rounded-xl border border-white/[0.07] bg-surface-sunken/60 p-3">
              <dt className="text-muted-foreground">Scheduled for</dt>
              <dd className="mt-1 text-slate-200">{job.scheduledFor ? absoluteTime(job.scheduledFor) : "Immediate"}</dd>
            </div>
          </dl>
        </div>
      </aside>
    </>
  );
};

export default function CrossPostHistory() {
  const { postHistory, isLoadingHistory, refreshHistory } = useCrossPost();
  const [selected, setSelected] = useState(null);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-white">Publishing history</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {isLoadingHistory
              ? "Loading jobs…"
              : `${postHistory.length} job${postHistory.length === 1 ? "" : "s"} queued from this account.`}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="h-9 self-start text-xs sm:self-auto"
          onClick={refreshHistory}
          disabled={isLoadingHistory}
        >
          <RefreshCw className={`mr-1.5 h-3.5 w-3.5 ${isLoadingHistory ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <Card className="surface-card overflow-hidden">
        {isLoadingHistory ? (
          <CardContent className="space-y-3 p-5">
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-lg bg-white/5" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-3 w-1/3 bg-white/5" />
                  <Skeleton className="h-2.5 w-1/4 bg-white/5" />
                </div>
                <Skeleton className="h-6 w-20 rounded-full bg-white/5" />
              </div>
            ))}
          </CardContent>
        ) : postHistory.length === 0 ? (
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.04]">
              <FileText className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-base font-semibold text-white">No publishing jobs yet</h3>
            <p className="mt-2 max-w-sm text-sm text-muted-foreground">
              Posts you compose, and posts you approve from creators, both land here with their publishing status.
            </p>
          </CardContent>
        ) : (
          <>
            {/* Table on wide screens, stacked rows on narrow ones */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-white/[0.07] text-[10px] uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="px-5 py-3 font-semibold">Content</th>
                    <th className="px-5 py-3 font-semibold">Platforms</th>
                    <th className="px-5 py-3 font-semibold">Status</th>
                    <th className="px-5 py-3 font-semibold">Date</th>
                    <th className="px-5 py-3 text-right font-semibold">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.05]">
                  {postHistory.map((job) => (
                    <tr
                      key={job.id}
                      onClick={() => setSelected(job)}
                      className="cursor-pointer transition-colors hover:bg-white/[0.03]"
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          {job.thumbnail ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={job.thumbnail}
                              alt=""
                              className="h-10 w-10 shrink-0 rounded-lg border border-white/10 object-cover"
                            />
                          ) : (
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/[0.07] bg-surface-sunken">
                              <ImageIcon className="h-4 w-4 text-muted-foreground" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="max-w-[320px] truncate text-[13px] font-medium text-slate-200">
                              {job.caption || job.title || job.body || "Untitled post"}
                            </p>
                            {job.body && job.body !== job.caption && (
                              <p className="max-w-[320px] truncate text-[11px] text-muted-foreground">{job.body}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <PlatformIcons platforms={job.platforms} />
                      </td>
                      <td className="px-5 py-3.5">
                        <StatusPill status={job.status} />
                      </td>
                      <td className="whitespace-nowrap px-5 py-3.5 text-[11px] text-muted-foreground">
                        {absoluteTime(jobTimestamp(job))}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={() => setSelected(job)}>
                          Open
                          <ExternalLink className="ml-1.5 h-3 w-3" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="divide-y divide-white/[0.05] md:hidden">
              {postHistory.map((job) => (
                <button
                  key={job.id}
                  onClick={() => setSelected(job)}
                  className="flex w-full items-start gap-3 p-4 text-left transition-colors hover:bg-white/[0.03]"
                >
                  {job.thumbnail ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={job.thumbnail} alt="" className="h-11 w-11 shrink-0 rounded-lg border border-white/10 object-cover" />
                  ) : (
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-white/[0.07] bg-surface-sunken">
                      <ImageIcon className="h-4 w-4 text-muted-foreground" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <p className="line-clamp-2 text-[13px] font-medium text-slate-200">
                      {job.caption || job.title || job.body || "Untitled post"}
                    </p>
                    <div className="flex items-center justify-between gap-2">
                      <PlatformIcons platforms={job.platforms} />
                      <StatusPill status={job.status} />
                    </div>
                    <p className="text-[11px] text-muted-foreground">{absoluteTime(jobTimestamp(job))}</p>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}
      </Card>

      {selected && <JobDrawer job={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}