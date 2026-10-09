// ── Platform Review Modal ────────────────────────────────────────────
// Opens from a target row's Review button and shows exactly what that one
// platform will receive.
//
// It is deliberately per-platform rather than an all-platform summary: the
// whole point of the AI pass is that each target gets different wording, so the
// admin reads each version before deciding to select it.

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { PLATFORM_GUIDANCE } from "@/services/aiEnhance";
import { Check, Copy, Sparkles, X } from "lucide-react";

export default function PlatformReviewModal({
  platform,
  draft,
  variant = null,
  open,
  isSelected,
  onToggleSelect,
  onSaveVariant,
  onClose,
}) {
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState("");

  const guidance = platform ? PLATFORM_GUIDANCE[platform.id] : null;
  const text = variant?.text || "";

  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previous;
    };
  }, [open, onClose]);

  useEffect(() => {
    setCopied(false);
    setIsEditing(false);
    setEditText(variant?.text || "");
  }, [platform?.id, variant?.text]);

  if (!open || !platform) return null;

  const isAiVersion = Boolean(variant?.text);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // Clipboard access can be denied; the text stays selectable on screen.
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/75 p-4 backdrop-blur-sm sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="platform-review-title"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="my-auto w-full max-w-2xl animate-fade-in overflow-hidden rounded-2xl border border-white/10 bg-[#0E0E18] shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-white/[0.07] px-5 py-4">
          <div className="flex min-w-0 items-start gap-3">
            <span
              className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
              style={{ backgroundColor: `${platform.accent}1f` }}
            >
              <platform.icon className="h-4 w-4" style={{ color: platform.accent }} />
            </span>
            <div className="min-w-0">
              <h2 id="platform-review-title" className="flex items-center gap-2 text-sm font-semibold text-slate-100">
                {platform.name}
                {isAiVersion && (
                  <span className="flex items-center gap-1 rounded-full bg-[#22D3EE]/10 px-2 py-0.5 text-[10px] font-medium text-[#22D3EE] ring-1 ring-inset ring-[#22D3EE]/25">
                    <Sparkles className="h-2.5 w-2.5" />
                    AI version
                  </span>
                )}
              </h2>
              {guidance?.shape && (
                <p className="mt-0.5 text-[11px] text-muted-foreground">{guidance.shape}</p>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close review"
            className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-white/[0.06] hover:text-slate-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="max-h-[58vh] space-y-4 overflow-y-auto px-5 py-4">
          {text ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-medium text-slate-300">
                  What {platform.name} will receive
                </p>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="flex items-center gap-1 text-[11px] text-muted-foreground transition-colors hover:text-slate-200"
                >
                  {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
              <p className="whitespace-pre-wrap break-words rounded-xl border border-white/[0.07] bg-surface-sunken px-4 py-3 text-xs leading-relaxed text-slate-200">
                {text}
              </p>
              {isEditing ? (
                <div className="space-y-2">
                  <textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="w-full whitespace-pre-wrap break-words rounded-xl border border-white/[0.2] bg-transparent px-4 py-3 text-xs leading-relaxed text-slate-200 focus:outline-none focus:border-indigo-500"
                    rows={8}
                  />
                  <div className="flex justify-end gap-2">
                    <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)}>Cancel</Button>
                    <Button size="sm" onClick={() => { onSaveVariant(editText); setIsEditing(false); }}>Save Changes</Button>
                  </div>
                </div>
              ) : (
                <div className="group relative">
                  <p className="whitespace-pre-wrap break-words rounded-xl border border-white/[0.07] bg-surface-sunken px-4 py-3 text-xs leading-relaxed text-slate-200">
                    {text}
                  </p>
                  <Button size="sm" variant="secondary" className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => setIsEditing(true)}>
                    Edit
                  </Button>
                </div>
              )}
              <p className="text-[11px] tabular-nums text-muted-foreground">
                {text.length} characters
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="rounded-xl border border-white/[0.07] bg-surface-sunken px-4 py-3">
                <p className="text-[11px] font-medium text-slate-300">
                  No AI version for {platform.name}
                </p>
                <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
                  AI enhancement is not connected, so this platform has no rewritten
                  version. It will publish the universal draft below exactly as you
                  wrote it.
                </p>
              </div>
              <UniversalDraft draft={draft} />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex flex-col-reverse items-stretch gap-2 border-t border-white/[0.07] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[11px] text-muted-foreground">
            {isSelected
              ? `${platform.name} is selected and will be posted.`
              : `${platform.name} will not be posted.`}
          </p>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button type="button" onClick={onToggleSelect} variant={isSelected ? "outline" : "default"}>
              {isSelected ? "Remove from post" : "Select for post"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

/** The universal draft, broken into the fields it was composed from. */
function UniversalDraft({ draft }) {
  const { title, body, hashtags, link } = draft || {};
  const hasAnything = [title, body, hashtags, link].some((v) => String(v || "").trim());

  if (!hasAnything) {
    return (
      <p className="rounded-xl border border-dashed border-white/10 px-4 py-6 text-center text-xs text-muted-foreground">
        The draft is empty. Add a title or body above.
      </p>
    );
  }

  return (
    <div className="space-y-2 rounded-xl border border-white/[0.07] bg-surface-sunken px-4 py-3">
      <p className="text-[11px] font-medium text-slate-300">Universal draft</p>
      {title?.trim() && (
        <p className="break-words text-xs font-semibold text-slate-200">{title}</p>
      )}
      {body?.trim() && (
        <p className="whitespace-pre-wrap break-words text-xs leading-relaxed text-slate-300">
          {body}
        </p>
      )}
      {hashtags?.trim() && <p className="break-words text-[11px] text-[#22D3EE]/80">{hashtags}</p>}
      {link?.trim() && <p className="break-all text-[11px] text-sky-400">{link}</p>}
    </div>
  );
}