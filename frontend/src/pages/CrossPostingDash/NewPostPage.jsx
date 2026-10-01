// ── Compose Post ─────────────────────────────────────────────────────
// The publish form for /dashboard/crosspost/new.
//
// The flow is one universal draft, then N platform posts:
//
//   1. The admin writes the content once — title, body, hashtags, link, media.
//   2. "Enhance with AI" at the top turns that one draft into a caption written
//      for each target platform.
//   3. Each row in the target box has its own Review (see what that platform
//      gets) and Select (whether it goes out).
//   4. Post sends one job carrying every selected platform and its own copy.
//
// Per-platform rewrites travel as `platformVariants` on the job, and the worker
// substitutes the matching variant when it builds that platform's payload. A
// platform with no variant publishes the universal draft unchanged — which is
// stated in the UI rather than implied to be tailored.

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useCrossPost } from "./CrossPostContext";
import { PLATFORM_BY_ID } from "./crossPostPlatforms";
import PlatformTargetList from "./PlatformTargetList";
import PlatformReviewModal from "./PlatformReviewModal";
import { enhanceForPlatforms } from "@/services/aiEnhance";
import crosspostApi from "@/services/crosspostApi";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  AlertTriangle,
  Image as ImageIcon,
  Info,
  Link2,
  Loader2,
  Send,
  Sparkles,
  X,
} from "lucide-react";

const MAX_MEDIA_BYTES = 50 * 1024 * 1024;

export default function NewPostPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { connectedPlatforms, isLoadingAuth, refreshHistory } = useCrossPost();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: "",
      body: "",
      hashtags: "",
      link: "",
      platforms: [],
      mediaFile: null,
    },
  });

  const titleVal = watch("title", "");
  const bodyVal = watch("body", "");
  const hashtagsVal = watch("hashtags", "");
  const linkVal = watch("link", "");
  const selectedPlatforms = watch("platforms", []);
  const mediaFile = watch("mediaFile", null);

  const [mediaPreview, setMediaPreview] = useState(null);
  const [mediaError, setMediaError] = useState(null);
  const fileInputRef = useRef(null);

  const [isScheduling, setIsScheduling] = useState(false);
  const [scheduleDate, setScheduleDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // AI pass state. `aiVariants` stays null until a provider returns something.
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [aiVariants, setAiVariants] = useState(null);
  const [reviewPlatformId, setReviewPlatformId] = useState(null);

  const draft = { title: titleVal, body: bodyVal, hashtags: hashtagsVal, link: linkVal };

  const reviewPlatform = reviewPlatformId ? PLATFORM_BY_ID[reviewPlatformId] : null;
  const reviewVariant = useMemo(
    () => aiVariants?.find((v) => v.platform === reviewPlatformId) || null,
    [aiVariants, reviewPlatformId]
  );

  const enhancedIds = useMemo(
    () => new Set((aiVariants || []).map((v) => v.platform)),
    [aiVariants]
  );

  useEffect(() => {
    // mediaFile is set imperatively through the drop zone, so it is registered
    // manually to keep react-hook-form aware of the field.
    register("mediaFile");
  }, [register]);

  // Object URLs are revoked when the preview changes or the form unmounts.
  useEffect(
    () => () => {
      if (mediaPreview) URL.revokeObjectURL(mediaPreview);
    },
    [mediaPreview]
  );

  // ── Targets ──────────────────────────────────────────────────────
  const togglePlatform = (platformId) => {
    if (!connectedPlatforms.includes(platformId)) return;
    setValue(
      "platforms",
      selectedPlatforms.includes(platformId)
        ? selectedPlatforms.filter((id) => id !== platformId)
        : [...selectedPlatforms, platformId],
      { shouldDirty: true }
    );
  };

  // ── Enhance with AI ──────────────────────────────────────────────
  // Rewrites the universal draft once, into a caption per selected platform.
  const handleEnhance = async () => {
    if (selectedPlatforms.length === 0) {
      toast({
        title: "Select a target first",
        description: "Choose the platforms this post should be written for.",
        variant: "destructive",
      });
      return;
    }

    setIsEnhancing(true);
    try {
      const result = await enhanceForPlatforms({
        ...draft,
        platforms: selectedPlatforms,
      });

      if (result.connected) {
        setAiVariants(result.variants);
        toast({
          title: "Created platform versions",
          description: `${result.variants.length} version${result.variants.length === 1 ? "" : "s"} ready. Open Review on any target to read it.`,
        });
      } else {
        // No provider yet, so nothing is written. The draft is untouched and
        // every target keeps publishing the original content.
        toast({ title: "AI enhancement is not connected", description: result.reason });
      }
    } catch (err) {
      console.error("Enhancement failed", err);
      toast({
        title: "Could not enhance",
        description: err.response?.data?.error || "The enhancement request failed.",
        variant: "destructive",
      });
    } finally {
      setIsEnhancing(false);
    }
  };

  // ── Media ────────────────────────────────────────────────────────
  const processFile = (file) => {
    if (!file) return;
    setMediaError(null);

    if (file.size > MAX_MEDIA_BYTES) {
      setMediaError(`"${file.name}" is ${(file.size / 1024 / 1024).toFixed(1)}MB. The limit is 50MB.`);
      return;
    }

    setValue("mediaFile", file, { shouldDirty: true });
    setMediaPreview(URL.createObjectURL(file));
  };

  const removeMedia = () => {
    setValue("mediaFile", null, { shouldDirty: true });
    setMediaPreview(null);
    setMediaError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const clearForm = () => {
    reset({ title: "", body: "", hashtags: "", link: "", platforms: [], mediaFile: null });
    removeMedia();
    setIsScheduling(false);
    setScheduleDate("");
    setAiVariants(null);
    setReviewPlatformId(null);
  };

  // Any edit to the universal draft invalidates the rewrites generated from the
  // previous version of it.
  const markDraftChanged = useCallback(() => setAiVariants(null), []);

  // ── Publish ──────────────────────────────────────────────────────
  const onSubmit = async (data) => {
    if (!data.title?.trim() && !data.body?.trim()) {
      toast({
        title: "Nothing to publish",
        description: "Add a title or a body before posting.",
        variant: "destructive",
      });
      return;
    }

    if (selectedPlatforms.length === 0) {
      toast({
        title: "No targets selected",
        description: "Select at least one platform in the target box.",
        variant: "destructive",
      });
      return;
    }

    // YouTube only accepts video uploads, so selecting it with an image would
    // fail at the API rather than here. Caught before the round trip.
    if (
      selectedPlatforms.includes("youtube") &&
      data.mediaFile &&
      !data.mediaFile.type.startsWith("video/")
    ) {
      toast({
        title: "YouTube needs a video",
        description: "YouTube posts must be a video file. Remove YouTube from the targets or upload a video.",
        variant: "destructive",
      });
      return;
    }

    if (isScheduling && !scheduleDate) {
      toast({
        title: "Pick a date",
        description: "Choose when this post should publish.",
        variant: "destructive",
      });
      return;
    }

    const formData = new FormData();
    if (data.title) formData.append("title", data.title);
    if (data.body) formData.append("body", data.body);
    if (data.hashtags) formData.append("hashtags", data.hashtags);
    if (data.link) formData.append("link", data.link);
    formData.append("platforms", JSON.stringify(selectedPlatforms));
    if (data.mediaFile) formData.append("mediaFile", data.mediaFile);

    // Only the selected targets that actually have a rewrite are sent.
    const selectedVariants = (aiVariants || []).filter((v) =>
      selectedPlatforms.includes(v.platform)
    );
    if (selectedVariants.length) {
      formData.append("platformVariants", JSON.stringify(selectedVariants));
    }

    if (isScheduling && scheduleDate) {
      const parsed = new Date(scheduleDate);
      if (Number.isNaN(parsed.getTime())) {
        toast({ title: "Invalid date", description: "That schedule date could not be read.", variant: "destructive" });
        return;
      }
      formData.append("scheduledDate", parsed.toISOString());
    }

    setIsSubmitting(true);
    try {
      await crosspostApi.submitJob(formData);

      toast({
        title: isScheduling ? "Scheduled" : "Posted",
        description: isScheduling
          ? `Publishing on ${new Date(scheduleDate).toLocaleString()}.`
          : `Queued for ${selectedPlatforms.length} platform${selectedPlatforms.length === 1 ? "" : "s"}. Track it in the history.`,
      });

      clearForm();
      // Re-read the list so the status shown is the one the server assigned.
      await refreshHistory();
    } catch (err) {
      console.error(err);
      toast({
        title: "Could not queue post",
        description:
          err.response?.data?.error || err.response?.data?.message || "The publishing service rejected the post.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedCount = selectedPlatforms.length;
  const postLabel =
    selectedCount === 0
      ? "Select targets"
      : isSubmitting
        ? "Posting…"
        : `Post to ${selectedCount} platform${selectedCount === 1 ? "" : "s"}`;

  return (
    <div className="space-y-6">
      {/* ── Top: the one universal draft + the AI pass ──────────────── */}
      <Card className="surface-card">
        <CardContent className="space-y-5 p-5">
          <div className="flex flex-col gap-3 border-b border-white/[0.06] pb-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-100">Universal content</h2>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                Write it once. Enhance with AI turns it into a separate post for each target.
              </p>
            </div>
            <Button
              type="button"
              onClick={handleEnhance}
              disabled={isEnhancing || selectedPlatforms.length === 0}
              title={
                selectedPlatforms.length === 0
                  ? "Select the target platforms below first"
                  : "Create a platform-specific version of this content"
              }
              className="h-9 shrink-0 whitespace-nowrap text-xs"
            >
              {isEnhancing ? (
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              ) : (
                <Sparkles className="mr-1.5 h-3.5 w-3.5" />
              )}
              {isEnhancing ? "Enhancing…" : "Enhance with AI"}
            </Button>
          </div>

          {/* Title */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="cp-title" className="text-xs font-medium text-slate-300">
                Title / headline
              </label>
              <span className={`text-[11px] tabular-nums ${titleVal.length > 100 ? "text-rose-400" : "text-muted-foreground"}`}>
                {titleVal.length} / 100
              </span>
            </div>
            <input
              id="cp-title"
              type="text"
              {...register("title", { maxLength: 100, onChange: markDraftChanged })}
              placeholder="Catchy headline for your post"
              className="w-full rounded-xl border border-white/10 bg-surface-sunken p-3 text-sm text-slate-200 placeholder:text-slate-600 transition-colors focus:border-[#22D3EE] focus:outline-none"
            />
            {errors.title && <p className="text-[11px] text-rose-400">{errors.title.message}</p>}
          </div>

          {/* Body */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="cp-body" className="text-xs font-medium text-slate-300">
                Body / description
              </label>
              <span className={`text-[11px] tabular-nums ${bodyVal.length > 2000 ? "text-rose-400" : "text-muted-foreground"}`}>
                {bodyVal.length} / 2000
              </span>
            </div>
            <textarea
              id="cp-body"
              rows={6}
              {...register("body", { maxLength: 2000, onChange: markDraftChanged })}
              placeholder="What do you want to share?"
              className="w-full resize-y rounded-xl border border-white/10 bg-surface-sunken p-3 text-sm leading-relaxed text-slate-200 placeholder:text-slate-600 transition-colors focus:border-[#22D3EE] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Hashtags */}
            <div className="space-y-1.5">
              <label htmlFor="cp-hashtags" className="text-xs font-medium text-slate-300">
                Hashtags
              </label>
              <input
                id="cp-hashtags"
                type="text"
                {...register("hashtags", { onChange: markDraftChanged })}
                placeholder="#launch #behindthescenes"
                className="w-full rounded-xl border border-white/10 bg-surface-sunken p-3 text-sm text-slate-200 placeholder:text-slate-600 transition-colors focus:border-[#22D3EE] focus:outline-none"
              />
            </div>

            {/* Link */}
            <div className="space-y-1.5">
              <label htmlFor="cp-link" className="text-xs font-medium text-slate-300">
                Link <span className="text-muted-foreground">(optional)</span>
              </label>
              <div className="relative">
                <Link2 className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="cp-link"
                  type="url"
                  {...register("link", { onChange: markDraftChanged })}
                  placeholder="https://example.com"
                  className="w-full rounded-xl border border-white/10 bg-surface-sunken py-3 pl-9 pr-3 text-sm text-slate-200 placeholder:text-slate-600 transition-colors focus:border-[#22D3EE] focus:outline-none"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Media ───────────────────────────────────────────────────── */}
      <Card className="surface-card">
        <CardContent className="space-y-3 p-5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-slate-300">Media</label>
            <span className="text-[11px] text-muted-foreground">Max 50MB · image or video</span>
          </div>

          {mediaPreview ? (
            <div className="relative overflow-hidden rounded-xl border border-white/10 bg-surface-sunken">
              <button
                type="button"
                onClick={removeMedia}
                className="absolute right-2 top-2 z-10 rounded-full bg-black/70 p-1.5 text-white transition-colors hover:bg-black"
                aria-label="Remove media"
              >
                <X className="h-4 w-4" />
              </button>
              {mediaFile?.type?.startsWith("video/") ? (
                <video src={mediaPreview} controls className="max-h-80 w-full object-contain" />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={mediaPreview} alt="Preview" className="max-h-80 w-full object-contain" />
              )}
              <p className="border-t border-white/[0.07] px-3 py-2 text-[11px] text-muted-foreground">
                {mediaFile?.name} · {(mediaFile?.size / 1024 / 1024).toFixed(1)}MB
              </p>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                processFile(e.dataTransfer?.files?.[0]);
              }}
              className="flex w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-white/10 bg-surface-sunken/50 px-6 py-10 text-center transition-colors hover:border-[#22D3EE]/40 hover:bg-white/[0.02]"
            >
              <ImageIcon className="mb-3 h-6 w-6 text-muted-foreground" />
              <p className="text-sm text-slate-300">Drag a file here or click to browse</p>
              <p className="mt-1 text-[11px] text-muted-foreground">
                Instagram takes images, carousels or reels · YouTube takes video only
              </p>
            </button>
          )}

          {mediaError && (
            <p className="flex items-start gap-2 rounded-lg border border-rose-500/20 bg-rose-500/5 px-3 py-2 text-[11px] text-rose-300">
              <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" />
              {mediaError}
            </p>
          )}

          <input
            ref={fileInputRef}
            type="file"
            onChange={(e) => processFile(e.target.files?.[0])}
            className="hidden"
            accept="image/*,video/*"
          />
        </CardContent>
      </Card>

      {/* ── Schedule ────────────────────────────────────────────────── */}
      <Card className="surface-card">
        <CardContent className="space-y-3 p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-medium text-slate-300">Schedule</p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                {isScheduling
                  ? "The job waits in the queue until this time."
                  : "Without a schedule the job publishes as soon as a worker picks it up."}
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={isScheduling}
              onClick={() => setIsScheduling((v) => !v)}
              className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
                isScheduling ? "bg-[#22D3EE]" : "bg-white/10"
              }`}
            >
              <span
                className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform duration-300 ${
                  isScheduling ? "translate-x-[22px]" : "translate-x-0.5"
                }`}
              />
            </button>
          </div>

          {isScheduling && (
            <div className="animate-fade-in space-y-1.5">
              <label htmlFor="cp-schedule" className="text-xs font-medium text-slate-300">
                Publish at
              </label>
              <input
                id="cp-schedule"
                type="datetime-local"
                value={scheduleDate}
                onChange={(e) => setScheduleDate(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-surface-sunken p-3 text-sm text-slate-200 transition-colors focus:border-[#22D3EE] focus:outline-none [color-scheme:dark]"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Targets: Review + Select per platform ───────────────────── */}
      <PlatformTargetList
        connectedPlatforms={connectedPlatforms}
        selectedPlatforms={selectedPlatforms}
        onToggle={togglePlatform}
        onReview={setReviewPlatformId}
        isEnhancing={isEnhancing}
        hasEnhancement={Boolean(aiVariants?.length)}
        enhancedIds={enhancedIds}
        isLoading={isLoadingAuth}
      />

      {/* Empty-accounts nudge, shown instead of the default /dashboard landing */}
      {!isLoadingAuth && connectedPlatforms.length === 0 && (
        <div className="surface-card flex flex-col items-center gap-3 p-6 text-center">
          <p className="text-xs text-muted-foreground">
            Connect a social account to start posting.
          </p>
          <Button type="button" variant="outline" onClick={() => navigate("/dashboard/crosspost")}>
            Go to overview
          </Button>
        </div>
      )}

      {/* ── Post ────────────────────────────────────────────────────── */}
      <Card className="surface-card sticky bottom-4">
        <CardContent className="flex flex-col items-stretch gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0 text-[11px] text-muted-foreground">
            {selectedCount === 0 ? (
              <span className="flex items-center gap-1.5">
                <Info className="h-3.5 w-3.5 shrink-0" />
                Select the platforms this post should go to.
              </span>
            ) : aiVariants?.length ? (
              <span className="flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 shrink-0 text-[#22D3EE]" />
                {enhancedIds.size} of {selectedCount} selected platforms have an AI version.
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                <Info className="h-3.5 w-3.5 shrink-0" />
                All selected platforms receive the same content you wrote above.
              </span>
            )}
          </div>

          <Button
            type="button"
            onClick={handleSubmit(onSubmit)}
            disabled={isSubmitting || selectedCount === 0 || connectedPlatforms.length === 0}
            className="shrink-0"
          >
            {isSubmitting ? (
              <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
            ) : (
              <Send className="mr-1.5 h-4 w-4" />
            )}
            {postLabel}
          </Button>
        </CardContent>
      </Card>

      {/* Review popup for a single target */}
      <PlatformReviewModal
        open={Boolean(reviewPlatform)}
        platform={reviewPlatform}
        variant={reviewVariant}
        draft={draft}
        isSelected={reviewPlatform ? selectedPlatforms.includes(reviewPlatform.id) : false}
        onToggleSelect={() => reviewPlatform && togglePlatform(reviewPlatform.id)}
        onClose={() => setReviewPlatformId(null)}
      />
    </div>
  );
}