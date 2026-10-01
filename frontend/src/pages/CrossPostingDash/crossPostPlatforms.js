// ── Cross-Post Platform Registry ──────────────────────────────────────
// Single source of truth for the four publish targets. Three pages used to
// carry their own copy of this list with slightly different colours, so the
// same platform rendered blue in one view and sky-blue in another.
//
// The brand hex values come from PLATFORM_ACCENT, the same source the charts
// use, so a platform keeps one colour across the whole product.

import { PLATFORM_ACCENT } from "@/components/charts/platformTheme";
import { Youtube, Linkedin, Facebook, Instagram } from "@/components/icons/BrandIcons";

export const CROSS_POST_PLATFORMS = [
  {
    id: "youtube",
    name: "YouTube",
    icon: Youtube,
    accent: PLATFORM_ACCENT.youtube,
    // Reels/Shorts are the vertical formats YouTube accepts; text-only posts
    // are not a YouTube publishing surface.
    mediaHint: "Video upload",
    description: "Publish videos and Shorts to your channel.",
  },
  {
    id: "instagram",
    name: "Instagram",
    icon: Instagram,
    accent: PLATFORM_ACCENT.instagram,
    mediaHint: "Image, carousel or reel",
    description: "Post to your feed and share reels.",
  },
  {
    id: "facebook",
    name: "Facebook",
    icon: Facebook,
    accent: PLATFORM_ACCENT.facebook,
    mediaHint: "Image or video",
    description: "Publish to your page and communities.",
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    icon: Linkedin,
    accent: PLATFORM_ACCENT.linkedin,
    mediaHint: "Image or document",
    description: "Share professional updates with your network.",
  },
];

export const PLATFORM_BY_ID = CROSS_POST_PLATFORMS.reduce((acc, p) => {
  acc[p.id] = p;
  return acc;
}, {});

/** Case-insensitive lookup, because platform ids arrive from a form payload. */
export const findPlatform = (id) =>
  PLATFORM_BY_ID[String(id || "").toLowerCase()] || null;

// ── Creator submission statuses ──────────────────────────────────────
// Mirrors the enum on the CreatorPost model:
// ['PENDING', 'APPROVED', 'REJECTED']
export const REQUEST_STATUS = {
  PENDING: {
    label: "Awaiting review",
    chip: "bg-amber-500/10 text-amber-400 ring-1 ring-inset ring-amber-500/20",
    dot: "bg-amber-400",
  },
  APPROVED: {
    label: "Approved",
    chip: "bg-emerald-500/10 text-emerald-400 ring-1 ring-inset ring-emerald-500/20",
    dot: "bg-emerald-400",
  },
  REJECTED: {
    label: "Rejected",
    chip: "bg-rose-500/10 text-rose-400 ring-1 ring-inset ring-rose-500/20",
    dot: "bg-rose-400",
  },
};

export const requestStatus = (status) =>
  REQUEST_STATUS[String(status || "").toUpperCase()] || null;

// ── Publishing job statuses ──────────────────────────────────────────
// Labels come from GET /automation/jobs, which maps the Automation enum
// (PENDING / PROCESSING / COMPLETED / PARTIAL_SUCCESS / FAILED) to these.
export const JOB_STATUS = {
  Published: { chip: "bg-emerald-500/10 text-emerald-400 ring-1 ring-inset ring-emerald-500/20", dot: "bg-emerald-400" },
  Scheduled: { chip: "bg-sky-500/10 text-sky-400 ring-1 ring-inset ring-sky-500/20", dot: "bg-sky-400" },
  Processing: { chip: "bg-amber-500/10 text-amber-400 ring-1 ring-inset ring-amber-500/20", dot: "bg-amber-400" },
  Partial: { chip: "bg-orange-500/10 text-orange-400 ring-1 ring-inset ring-orange-500/20", dot: "bg-orange-400" },
  Failed: { chip: "bg-rose-500/10 text-rose-400 ring-1 ring-inset ring-rose-500/20", dot: "bg-rose-400" },
};

export const jobStatus = (status) =>
  JOB_STATUS[String(status || "")] || {
    chip: "bg-white/5 text-muted-foreground ring-1 ring-inset ring-white/10",
    dot: "bg-slate-500",
  };

/** Absolute timestamp for a job, preferring the scheduled time over creation. */
export const jobTimestamp = (job) => job?.scheduledFor || job?.createdAt || null;