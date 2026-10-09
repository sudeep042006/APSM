import api from './api';
// ── AI Enhancement (service seam) ─────────────────────────────────────
// "Enhance with AI" rewrites one draft into a version tailored to each selected
// platform — different length, tone and hashtag conventions per network.
//
// ── Status: NOT CONNECTED ────────────────────────────────────────────
// No model provider is wired up yet. Rather than pretend, `enhanceForPlatforms`
// reports `connected: false` with a reason, and the UI shows that plainly.
// It deliberately returns no rewritten text: a caption that looks AI-generated
// but came from a stub would be indistinguishable from a real one on the
// platform, which is worse than no button at all.
//
// To connect a provider, implement the single `requestEnhancement` function
// below (or replace `enhanceForPlatforms` wholesale). Its contract:
//
//   requestEnhancement({ title, body, hashtags, link, platforms })
//     → Promise<Array<{ platform: string, text: string }>>
//
// One entry per requested platform id, where `text` is the full caption for
// that platform. Everything else in this file — validation, caching, error
// handling and the shape the UI consumes — stays as it is.

/**
 * Per-platform guidance shown in the UI and sent to the model as context.
 * These are editorial conventions, not measured limits, so they are labelled as
 * guidance rather than enforced platform caps.
 */
export const PLATFORM_GUIDANCE = {
  youtube: {
    label: "YouTube",
    // Video titles are the discoverable surface; description carries the detail.
    shape: "Short punchy title, detailed description, tags as keywords",
  },
  instagram: {
    label: "Instagram",
    // Instagram truncates captions around 125 characters in the feed.
    shape: "Hook first line, caption under ~125 visible characters, 3-5 hashtags",
  },
  facebook: {
    label: "Facebook",
    shape: "Conversational opening, short paragraphs, link at the end",
  },
  linkedin: {
    label: "LinkedIn",
    // LinkedIn cuts off around 140 characters before "see more".
    shape: "Professional hook in first 140 characters, no emoji spam, 3 hashtags",
  },
};

/**
 * Whether a provider is configured. Kept as a function so a provider can be
 * attached at runtime (env var, feature flag) without touching the UI.
 */
export const isEnhancementAvailable = () => true;

/** Validation performed before anything is sent to a provider. */
export const validateEnhancementRequest = ({ platforms, text }) => {
  const list = Array.isArray(platforms) ? platforms : [];
  if (list.length === 0) {
    return { ok: false, reason: "Select at least one platform to target." };
  }
  if (!String(text || "").trim()) {
    return { ok: false, reason: "Add a title or body before running the enhancement." };
  }
  return { ok: true };
};

/**
 * The universal draft, joined the way every platform task assembles it.
 *
 * This is what a platform shows before an AI rewrite exists, and what it
 * publishes if enhancement never runs. Labelled as the original draft
 * everywhere it appears — it is not AI output.
 */
export const universalCaption = ({ title, body, hashtags, link }) =>
  [title, body, hashtags, link].filter(Boolean).join("\n\n");

/**
 * The provider call. This is the one function to replace when connecting a
 * real model. Until then it throws, which `enhanceForPlatforms` converts into
 * an explicit `connected: false` result.
 */


async function requestEnhancement({ title, body, hashtags, platforms }) {
  const response = await api.post("/automation/enhance", {
    title,
    body,
    hashtags,
    platforms,
  });

  const data = response.data;
  
  // The backend returns { facebook: "...", linkedin: "..." }
  // We need to map it to [{ platform: "facebook", text: "..." }]
  return Object.entries(data).map(([platform, text]) => ({
    platform,
    text,
  }));
}

/**
 * Produces one tailored caption per selected platform.
 *
 * @returns {Promise<
 *   | { connected: true,  variants: Array<{ platform: string, text: string }> }
 *   | { connected: false, reason: string }
 * >}
 */
export const enhanceForPlatforms = async ({ title, body, hashtags, link, platforms }) => {
  const validation = validateEnhancementRequest({
    platforms,
    text: `${title || ""} ${body || ""}`,
  });
  if (!validation.ok) {
    return { connected: false, reason: validation.reason };
  }

  if (!isEnhancementAvailable()) {
    return {
      connected: false,
      reason:
        "AI enhancement is not connected yet. Once a provider is wired up, this rewrites your draft into a version tuned for each selected platform.",
    };
  }

  try {
    const variants = await requestEnhancement({
      title: title || "",
      body: body || "",
      hashtags: hashtags || "",
      link: link || "",
      platforms,
      guidance: platforms.map((id) => ({
        platform: id,
        ...(PLATFORM_GUIDANCE[id] || {}),
      })),
    });

    if (!Array.isArray(variants) || variants.length === 0) {
      return { connected: false, reason: "The provider returned no variants for the selected platforms." };
    }

    return { connected: true, variants };
  } catch (error) {
    return {
      connected: false,
      reason: error?.response?.data?.error || error.message || "The enhancement request failed.",
    };
  }
};

export default enhanceForPlatforms;

