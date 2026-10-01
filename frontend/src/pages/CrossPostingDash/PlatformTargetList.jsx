// ── Platform Target List ─────────────────────────────────────────────
// The target box under the universal draft: one row per linked platform with
// a Review button that shows what that platform will receive, and a Select
// button that decides whether it goes out.
//
// Rows are always shown for every linked platform, before and after the AI
// pass, because selecting is a decision the admin makes and not a consequence
// of enhancing. An unenhanced row is selectable too — it just publishes the
// universal draft unchanged.

import { CROSS_POST_PLATFORMS } from "./crossPostPlatforms";
import { Check, Eye, Loader2, Sparkles, Settings } from "lucide-react";
import { Link } from "react-router-dom";

/**
 * @param {object} props
 * @param {string[]} props.connectedPlatforms
 * @param {string[]} props.selectedPlatforms
 * @param {(id: string) => void} props.onToggle
 * @param {(id: string) => void} props.onReview
 * @param {boolean} props.isEnhancing
 * @param {boolean} props.hasEnhancement   whether any AI rewrite exists yet
 * @param {Set<string>} props.enhancedIds   platforms with an AI rewrite
 */
export default function PlatformTargetList({
  connectedPlatforms = [],
  selectedPlatforms = [],
  onToggle,
  onReview,
  isEnhancing = false,
  hasEnhancement = false,
  enhancedIds = new Set(),
  isLoading = false,
}) {
  const targets = CROSS_POST_PLATFORMS.filter((p) => connectedPlatforms.includes(p.id));

  if (isLoading) {
    return (
      <div className="surface-card p-5">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          Checking linked accounts…
        </div>
      </div>
    );
  }

  if (targets.length === 0) {
    return (
      <div className="surface-card border-dashed p-6 text-center">
        <p className="text-xs font-medium text-slate-300">No platforms linked</p>
        <p className="mt-1 text-[11px] text-muted-foreground">
          Connect an account before composing. Targets appear here once a platform is linked.
        </p>
        <Link to="/dashboard/crosspost" className="mt-3 inline-flex items-center justify-center rounded-lg bg-indigo-500/10 px-3 py-1.5 text-[11px] font-medium text-indigo-400 hover:bg-indigo-500/20 transition-colors">
          Manage Accounts
        </Link>
      </div>
    );
  }

  return (
    <div className="surface-card overflow-hidden">
      <div className="flex items-center justify-between gap-3 border-b border-white/[0.06] px-4 py-3">
        <div>
          <div className="flex items-center gap-2">
            <p className="text-xs font-medium text-slate-300">Targets</p>
            <Link to="/dashboard/crosspost" className="flex items-center gap-1 text-[10px] font-medium text-indigo-400 hover:text-indigo-300">
              <Settings className="w-3 h-3" /> Manage Accounts
            </Link>
          </div>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            Review what each platform receives, then select the ones to post.
          </p>
        </div>
        <span className="shrink-0 text-[11px] tabular-nums text-muted-foreground">
          {selectedPlatforms.length}/{targets.length} selected
        </span>
      </div>

      <div className="divide-y divide-white/[0.05]">
        {targets.map((platform) => {
          const isSelected = selectedPlatforms.includes(platform.id);
          const isEnhanced = hasEnhancement && enhancedIds.has(platform.id);

          return (
            <div
              key={platform.id}
              className={`flex items-center gap-3 px-4 py-3 transition-colors ${
                isSelected ? "bg-[#22D3EE]/[0.04]" : ""
              }`}
            >
              <span
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                style={{ backgroundColor: `${platform.accent}1f` }}
              >
                <platform.icon className="h-4 w-4" style={{ color: platform.accent }} />
              </span>

              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-1.5">
                  <span className="truncate text-[13px] font-semibold text-slate-200">
                    {platform.name}
                  </span>
                  {isEnhanced && (
                    <span
                      title="AI rewrite ready"
                      className="flex shrink-0 items-center gap-0.5 rounded-full bg-[#22D3EE]/10 px-1.5 py-0.5 text-[10px] font-medium text-[#22D3EE] ring-1 ring-inset ring-[#22D3EE]/25"
                    >
                      <Sparkles className="h-2.5 w-2.5" />
                      AI
                    </span>
                  )}
                </span>
                <span className="block truncate text-[11px] text-muted-foreground">
                  {isEnhanced
                    ? "Platform-specific version ready"
                    : hasEnhancement
                      ? "No rewrite for this platform"
                      : platform.mediaHint}
                </span>
              </span>

              <div className="flex shrink-0 items-center gap-1.5">
                {/* Review is available at any time — it reads whatever this
                    platform would publish right now. */}
                <button
                  type="button"
                  onClick={() => onReview(platform.id)}
                  className="flex h-8 items-center gap-1.5 rounded-lg border border-white/[0.09] bg-white/[0.03] px-2.5 text-[11px] font-medium text-slate-300 transition-colors hover:border-white/20 hover:bg-white/[0.07] hover:text-slate-100"
                >
                  <Eye className="h-3.5 w-3.5" />
                  Review
                </button>

                <button
                  type="button"
                  onClick={() => onToggle(platform.id)}
                  aria-pressed={isSelected}
                  className={`flex h-8 items-center gap-1.5 rounded-lg px-3 text-[11px] font-semibold transition-colors ${
                    isSelected
                      ? "bg-[#22D3EE] text-[#0A0A14] hover:bg-[#67E8F9]"
                      : "border border-white/[0.09] bg-white/[0.03] text-slate-400 hover:border-white/20 hover:text-slate-100"
                  }`}
                >
                  {isSelected ? (
                    <>
                      <Check className="h-3.5 w-3.5" />
                      Selected
                    </>
                  ) : (
                    "Select"
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

