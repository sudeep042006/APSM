// ── YouTube Analytics API Service ───────────────────────────────────
// Centralised service for all YouTube analytics data fetching.
// Uses the shared Axios instance from lib/api.js (with JWT + proxy).
// All YouTube API integrations MUST go through this file.

// ── Imports ──────────────────────────────────────────────────────────
import api from "@/services/api";
// ── Connection Status ───────────────────────────────────────────────
// Check whether the user's YouTube account is connected via OAuth.
export const fetchYouTubeStatus = async () => {
  const res = await api.get("/auth/status");
  const status = res.data.status?.find((p) => p.platform === "youtube");
  return {
    connected: status?.connected ?? false,
    username: status?.username ?? "",
    expiresAt: status?.expiresAt ?? null,
    isExpired: status?.isExpired ?? false,
  };
};

let snapshotCache = null;
let cacheTime = null;
let cacheKey = null;

const CACHE_TTL_MS = 5000;

// The range is part of the cache identity: picking a different window on the
// dashboard must never be served the previous window's snapshot.
const buildCacheKey = (force, range) =>
  JSON.stringify({
    force: !!force,
    start: range?.startDate ?? null,
    end: range?.endDate ?? null,
  });

const getCachedSnapshot = async (force = false, range = null) => {
  const key = buildCacheKey(force, range);

  if (!force && snapshotCache && cacheKey === key && cacheTime && Date.now() - cacheTime < CACHE_TTL_MS) {
    return snapshotCache;
  }

  const params = {};
  if (force) params.forceRefresh = "true";
  if (range?.startDate) params.startDate = range.startDate;
  if (range?.endDate) params.endDate = range.endDate;

  const response = await api.get("/analytics/youtube", { params });

  snapshotCache = response.data?.data || null;
  cacheTime = Date.now();
  cacheKey = key;
  return snapshotCache;
};

export const clearYouTubeAnalyticsCache = () => {
  snapshotCache = null;
  cacheTime = null;
  cacheKey = null;
};

// ── Fetch Full YouTube Analytics Snapshot ────────────────────────────
// Calls GET /analytics/youtube which triggers a fresh YouTube API fetch
// on the backend, or returns the latest cached snapshot.
// `options` MUST be forwarded: it carries the dashboard's selected date window,
// which the backend uses to build the YouTube Reporting API query.
export const fetchYouTubeAnalytics = async (force = false, options = null) => {
  try {
    return await getCachedSnapshot(force, options);
  } catch (err) {
    console.error("Failed to fetch YouTube analytics:", err);
    throw err;
  }
};

// ── Connect YouTube (OAuth redirect) ────────────────────────────────
// Redirects the browser to the backend OAuth initiation endpoint.
export const connectYouTube = () => {
  const token = localStorage.getItem("incubein_token");
  const baseUrl = import.meta.env.VITE_BASE_URL || "http://localhost:5000";
  // Save current path to localStorage so Settings trampoline can route back
  localStorage.setItem("returnPath", window.location.pathname);
  window.location.href = `${baseUrl}/auth/youtube?token=${token}`;
};

// ── Revoke YouTube Access ───────────────────────────────────────────
// Disconnects the YouTube account from the user's profile.
export const revokeYouTube = async () => {
  await api.delete("/auth/youtube/revoke");
};

// ─────────────────────────────────────────────────────────────────────
// DATA PARSERS — Transform raw API snapshot into UI-ready structures
// ─────────────────────────────────────────────────────────────────────

/**
 * Builds a column-name → index map for a YouTube Reporting API result.
 * Returns null when the report is missing or malformed, so callers can bail out
 * instead of indexing with `undefined` (which silently yields all-zero rows
 * that still satisfy a `length > 0` guard and render as a blank chart).
 */
const buildColumnMap = (report) => {
  if (!report || !Array.isArray(report.rows) || !Array.isArray(report.columnHeaders)) return null;
  const map = {};
  report.columnHeaders.forEach((h, i) => {
    if (h && h.name) map[h.name] = i;
  });
  return map;
};

/**
 * The backend records why each report failed. Surfacing this lets the UI show
 * "the API returned no rows for this period" instead of an unexplained blank chart.
 */
export const parseReportHealth = (snapshot) => {
  const raw = snapshot?.rawPlatformData;
  const reports = raw?.analyticsReports || {};
  const errors = raw?.reportErrors || null;

  const health = {};
  for (const key of ["daily", "country", "device", "ageGender"]) {
    const report = reports[key];
    const colMap = buildColumnMap(report);
    health[key] = {
      ok: !!colMap && report.rows.length > 0,
      rowCount: Array.isArray(report?.rows) ? report.rows.length : 0,
      reason: errors?.[key] || null,
    };
  }
  return health;
};

/**
 * The window the snapshot was actually built for. YouTube Reporting data lags
 * ~2 days, so the backend clamps the requested range; the UI must label charts
 * with the effective window rather than the requested one.
 */
export const parseEffectiveRange = (snapshot) => {
  const range = snapshot?.rawPlatformData?.range;
  if (!range || !range.startDate || !range.endDate) return null;
  return {
    startDate: range.startDate,
    endDate: range.endDate,
    requestedStartDate: range.requestedStartDate || null,
    requestedEndDate: range.requestedEndDate || null,
    clampedByLagDays: range.clampedByLagDays || 0,
    days: Math.max(
      1,
      Math.round((new Date(range.endDate) - new Date(range.startDate)) / 86_400_000) + 1
    ),
  };
};

// ── Parse Channel Information ───────────────────────────────────────
// Extracts channel name, thumbnail, and description from rawPlatformData.
export const parseChannelInfo = (snapshot) => {
  const channel = snapshot?.rawPlatformData?.channelDetails;
  const snippet = channel?.snippet || {};
  const statistics = channel?.statistics || {};

  return {
    title: snippet.title || "YouTube Channel",
    description: snippet.description || "",
    thumbnail: snippet.thumbnails?.default?.url || snippet.thumbnails?.medium?.url || "",
    customUrl: snippet.customUrl || "",
    publishedAt: snippet.publishedAt || "",
    country: snippet.country || "",
    subscriberCount: parseInt(statistics.subscriberCount) || 0,
    viewCount: parseInt(statistics.viewCount) || 0,
    videoCount: parseInt(statistics.videoCount) || 0,
    hiddenSubscriberCount: statistics.hiddenSubscriberCount || false,
  };
};

// ── Parse Core KPI Metrics ──────────────────────────────────────────
// Returns the main KPI values: subscribers, views, watch time, engagement.
export const parseCoreMetrics = (snapshot) => {
  const metrics = snapshot?.metrics || {};
  const channelStats = snapshot?.rawPlatformData?.channelDetails?.statistics || {};
  const totals = snapshot?.rawPlatformData?.totals || {};

  // Prefer the backend's pre-aggregated, period-scoped totals; fall back to
  // summing the daily report only when a column actually exists.
  const daily = snapshot?.rawPlatformData?.analyticsReports?.daily;
  const colMap = buildColumnMap(daily);
  let totalWatchTimeMinutes = parseInt(totals.watchTimeMinutes) || 0;
  let periodViews = parseInt(totals.totalViews30Days) || 0;

  if (colMap && colMap.estimatedMinutesWatched !== undefined && !totalWatchTimeMinutes) {
    for (const row of daily.rows) {
      if (Array.isArray(row)) totalWatchTimeMinutes += parseInt(row[colMap.estimatedMinutesWatched]) || 0;
    }
  }
  if (!periodViews && colMap && colMap.views !== undefined) {
    for (const row of daily.rows) {
      if (Array.isArray(row)) periodViews += parseInt(row[colMap.views]) || 0;
    }
  }

  const totalEngagement = parseFloat(metrics.totalEngagement) || 0;

  // Engagement rate is measured against VIEWS for the period. The previous code
  // divided by `metrics.impressions`, which YouTube does not expose — it stored
  // the view count there, so the rate was always 0 whenever the report failed.
  const engagementRate = periodViews > 0 ? (totalEngagement / periodViews) * 100 : 0;

  // `impressions` / `reach` are not part of the YouTube Reporting API. They are
  // reported as null (not 0) so the UI can hide those cards rather than showing
  // a duplicated view count under a misleading label.
  const impressions = parseInt(metrics.impressions) || 0;
  const reach = parseInt(metrics.reach) || 0;

  return {
    subscribers: parseInt(channelStats.subscriberCount) || parseInt(metrics.followers) || 0,
    lifetimeViews: parseInt(channelStats.viewCount) || 0,
    periodViews,
    impressions: impressions > 0 ? impressions : null,
    reach: reach > 0 ? reach : null,
    totalEngagement,
    watchTimeHours: totalWatchTimeMinutes / 60,
    watchTimeMinutes: totalWatchTimeMinutes,
    engagementRate,
    videoCount: parseInt(channelStats.videoCount) || parseInt(metrics.videoCount) || 0,
    likes: parseInt(totals.totalLikes) || 0,
    comments: parseInt(totals.totalComments) || 0,
    shares: parseInt(totals.totalShares) || 0,
  };
};

// ── Parse Daily Analytics (for line/area charts) ────────────────────
// Converts the daily analytics report rows into chart-friendly objects.
export const parseDailyAnalytics = (snapshot) => {
  const colMap = buildColumnMap(snapshot?.rawPlatformData?.analyticsReports?.daily);
  // `day` and `views` are the minimum needed for a time series. If YouTube
  // omitted them the rows are meaningless, so return [] and let the UI explain.
  if (!colMap || colMap.day === undefined || colMap.views === undefined) return [];

  const at = (row, name) => (colMap[name] === undefined ? 0 : parseFloat(row[colMap[name]]) || 0);

  return snapshot.rawPlatformData.analyticsReports.daily.rows
    .map((row) => {
      if (!Array.isArray(row)) return null;
      const dateStr = row[colMap.day];
      if (!dateStr) return null;
      // Parse as a local date: `new Date("2024-06-15")` is UTC midnight, which
      // renders as the previous day for anyone west of Greenwich.
      const [y, m, d] = String(dateStr).split("-").map(Number);
      const date = new Date(y, (m || 1) - 1, d || 1);
      if (Number.isNaN(date.getTime())) return null;

      return {
        date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        rawDate: String(dateStr),
        timestamp: date.getTime(),
        views: at(row, "views"),
        likes: at(row, "likes"),
        comments: at(row, "comments"),
        shares: at(row, "shares"),
        watchTime: at(row, "estimatedMinutesWatched"),
        avgViewDuration: at(row, "averageViewDuration"),
        avgViewPercentage: at(row, "averageViewPercentage"),
        subscribersGained: at(row, "subscribersGained"),
        subscribersLost: at(row, "subscribersLost"),
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.timestamp - b.timestamp);
};

// Helper: parse ISO 8601 duration to seconds (e.g. PT1M15S)
const parseIsoDuration = (duration) => {
  if (!duration) return 0;
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  const hours = parseInt(match[1]) || 0;
  const minutes = parseInt(match[2]) || 0;
  const seconds = parseInt(match[3]) || 0;
  return hours * 3600 + minutes * 60 + seconds;
};

// ── Parse Recent Videos ─────────────────────────────────────────────
// Extracts video list with thumbnails and per-video statistics.
export const parseRecentVideos = (snapshot) => {
  const videos = snapshot?.rawPlatformData?.recentVideos;
  if (!videos || !Array.isArray(videos)) return [];

  return videos
    .map((video) => {
      if (!video) return null;
      const snippet = video.snippet || {};
      const stats = video.statistics || {};
      const contentDetails = video.contentDetails || {};

      return {
        id: video.id || "",
        title: snippet.title || "Untitled Video",
        description: snippet.description || "",
        thumbnail:
          snippet.thumbnails?.medium?.url ||
          snippet.thumbnails?.default?.url ||
          "",
        publishedAt: snippet.publishedAt || "",
        duration: contentDetails.duration || "",
        isShort: parseIsoDuration(contentDetails.duration) > 0 && parseIsoDuration(contentDetails.duration) <= 61,
        viewCount: parseInt(stats.viewCount) || 0,
        likeCount: parseInt(stats.likeCount) || 0,
        commentCount: parseInt(stats.commentCount) || 0,
        tags: Array.isArray(snippet.tags) ? snippet.tags : [],
        categoryId: snippet.categoryId || "",
        liveBroadcastContent: snippet.liveBroadcastContent || "none",
        privacyStatus: video.status?.privacyStatus || "public",
      };
    })
    .filter(Boolean);
};

// ── Parse Playlists ─────────────────────────────────────────────────
export const parsePlaylists = (snapshot) => {
  const playlists = snapshot?.rawPlatformData?.playlists;
  if (!playlists || !Array.isArray(playlists)) return [];

  return playlists
    .map((playlist) => {
      if (!playlist) return null;
      const snippet = playlist.snippet || {};
      const contentDetails = playlist.contentDetails || {};

      return {
        id: playlist.id || "",
        title: snippet.title || "Untitled Playlist",
        description: snippet.description || "",
        thumbnail:
          snippet.thumbnails?.medium?.url ||
          snippet.thumbnails?.default?.url ||
          "",
        publishedAt: snippet.publishedAt || "",
        itemCount: parseInt(contentDetails.itemCount) || 0,
      };
    })
    .filter(Boolean);
};

// ── Parse Country Data (for geographic charts) ──────────────────────
// Extracts top countries with view counts from the raw country report.
export const parseCountryData = (snapshot) => {
  const regionNames = new Intl.DisplayNames(["en"], { type: "region" });
  const formatCountryName = (code) => {
    try {
      if (code && code.length === 2) return regionNames.of(code) || code;
    } catch {
      /* invalid region code — fall through */
    }
    return code || "Unknown";
  };

  // The raw report is the source of truth: it is measured by YouTube and always
  // carries a `views` column. The demographics mirror is only a fallback.
  const colMap = buildColumnMap(snapshot?.rawPlatformData?.analyticsReports?.country);
  if (colMap && colMap.country !== undefined && colMap.views !== undefined) {
    return snapshot.rawPlatformData.analyticsReports.country.rows
      .map((row) => {
        if (!Array.isArray(row)) return null;
        return {
          code: row[colMap.country] || "",
          country: formatCountryName(row[colMap.country]),
          views: parseInt(row[colMap.views]) || 0,
          likes: colMap.likes !== undefined ? parseInt(row[colMap.likes]) || 0 : 0,
          comments: colMap.comments !== undefined ? parseInt(row[colMap.comments]) || 0 : 0,
          shares: colMap.shares !== undefined ? parseInt(row[colMap.shares]) || 0 : 0,
          watchTime:
            colMap.estimatedMinutesWatched !== undefined
              ? parseInt(row[colMap.estimatedMinutesWatched]) || 0
              : 0,
        };
      })
      .filter((r) => r && r.views > 0)
      .sort((a, b) => b.views - a.views);
  }

  // Fallback: demographics mirror written by the backend
  const topCountries = snapshot?.demographics?.topCountries;
  if (Array.isArray(topCountries) && topCountries.length > 0) {
    return topCountries
      .map((c) => {
        if (!c) return null;
        return { code: c.name, country: formatCountryName(c.name), views: parseInt(c.count) || 0 };
      })
      .filter((r) => r && r.views > 0)
      .sort((a, b) => b.views - a.views);
  }

  return [];
};

// ── Parse Device Data (for donut/pie charts) ────────────────────────
// Extracts device type breakdown from the device analytics report.
export const parseDeviceData = (snapshot) => {
  const report = snapshot?.rawPlatformData?.analyticsReports?.device;
  const colMap = buildColumnMap(report);
  if (!colMap || colMap.deviceType === undefined || colMap.views === undefined) return [];

  // Device type label mapping for cleaner UI
  const deviceLabels = {
    MOBILE: "Mobile",
    DESKTOP: "Desktop",
    TABLET: "Tablet",
    TV: "Smart TV",
    GAME_CONSOLE: "Game Console",
    UNKNOWN: "Other",
  };

  return report.rows
    .map((row) => {
      if (!Array.isArray(row)) return null;
      const raw = row[colMap.deviceType] || "UNKNOWN";
      return {
        device: deviceLabels[raw] || raw,
        views: parseInt(row[colMap.views]) || 0,
        watchTime:
          colMap.estimatedMinutesWatched !== undefined
            ? parseInt(row[colMap.estimatedMinutesWatched]) || 0
            : 0,
      };
    })
    .filter((r) => r && r.views > 0)
    .sort((a, b) => b.views - a.views);
};

// ── Parse Age & Gender Data (for demographics charts) ───────────────
// Uses the REAL `viewerPercentage` measured by the YouTube Reporting API.
// The previous implementation summed a view-weighted ESTIMATE
// (`percentage x totalViews`), which collapsed to 0 whenever the daily report
// failed — producing a non-empty array of zeros that rendered as a blank chart.
export const parseAgeGenderData = (snapshot) => {
  const ageAndGender = snapshot?.demographics?.ageAndGender;
  if (!Array.isArray(ageAndGender) || ageAndGender.length === 0) return { age: [], gender: [] };

  const formatAgeGroup = (raw) => {
    // YouTube returns 'age13-17', 'age18-24', 'age25-34', ... 'age65+'
    const value = String(raw || "").replace(/^age/, "");
    if (!value) return "Unknown";
    if (value.includes("-") || value.includes("+")) return value;
    if (value.length === 4) return `${value.slice(0, 2)}-${value.slice(2)}`;
    if (value.length === 2) return `${value}-${value}`;
    return value;
  };

  const ageMap = new Map();
  const genderMap = new Map();

  for (const item of ageAndGender) {
    if (!item) continue;

    // `percentage` is measured; `count` is the derived estimate. Prefer measured.
    const hasMeasured = item.percentage !== undefined && item.percentage !== null;
    const value = hasMeasured ? parseFloat(item.percentage) || 0 : parseInt(item.count) || 0;
    if (value <= 0) continue;

    const parts = String(item.group || "").split("_");
    const ageGroup = formatAgeGroup(item.ageGroup || parts[0]);
    const genderKey = String(item.gender || parts[1] || "unknown").toLowerCase();
    const genderLabel =
      genderKey === "male" ? "Male" : genderKey === "female" ? "Female" : "Other";

    ageMap.set(ageGroup, (ageMap.get(ageGroup) || 0) + value);
    genderMap.set(genderLabel, (genderMap.get(genderLabel) || 0) + value);
  }

  if (ageMap.size === 0 && genderMap.size === 0) return { age: [], gender: [] };

  // Natural age ordering: numeric sort on the leading digits.
  const age = [...ageMap.entries()]
    .map(([group, percentage]) => ({ group, percentage: Math.round(percentage * 100) / 100 }))
    .sort((a, b) => (parseInt(a.group) || 0) - (parseInt(b.group) || 0));

  const gender = [...genderMap.entries()]
    .map(([label, percentage]) => ({ label, percentage: Math.round(percentage * 100) / 100 }))
    .sort((a, b) => b.percentage - a.percentage);

  return { age, gender };
};

// ── Parse Subscriber Growth (from daily report) ────────────────────
// Computes cumulative subscriber trend from daily gained/lost data.
export const parseSubscriberGrowth = (snapshot) => {
  const dailyData = parseDailyAnalytics(snapshot);
  if (!Array.isArray(dailyData) || dailyData.length === 0) return [];

  let cumulative = 0;
  return dailyData.map((day) => {
    if (!day) return { date: "", gained: 0, lost: 0, lostNeg: 0, net: 0, cumulative };
    const gained = day.subscribersGained || 0;
    const lost = day.subscribersLost || 0;
    const net = gained - lost;
    cumulative += net;
    return {
      date: day.date || "",
      gained,
      lost,
      // Plotted as a negative bar so gains and losses diverge around a zero line
      // instead of two positive series being visually compared.
      lostNeg: -lost,
      net,
      cumulative,
    };
  });
};

// ── Format Number Helpers ───────────────────────────────────────────
// Utility formatters for displaying large numbers in a compact form.

// Format to compact: 1200 → "1.2K", 1500000 → "1.5M"
export const formatCompactNumber = (num) => {
  const n = parseFloat(num);
  if (num === null || num === undefined || isNaN(n)) return "0";
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
  return n.toLocaleString();
};

// Format watch time: minutes → "1,234h" or "45m"
export const formatWatchTime = (minutes) => {
  const m = parseInt(minutes);
  if (minutes === null || minutes === undefined || isNaN(m)) return "0h";
  if (m < 60) return `${m}m`;
  const hours = Math.round(m / 60);
  return `${hours.toLocaleString()}h`;
};

// Format duration ISO 8601: "PT1H2M30S" → "1:02:30"
export const formatDuration = (isoDuration) => {
  if (!isoDuration || typeof isoDuration !== "string") return "--:--";
  const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return "--:--";

  const h = parseInt(match[1]) || 0;
  const m = parseInt(match[2]) || 0;
  const s = parseInt(match[3]) || 0;

  if (h > 0) {
    return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }
  return `${m}:${String(s).padStart(2, "0")}`;
};

// Format relative time: "2024-01-15T..." → "6 months ago"
export const formatRelativeTime = (dateString) => {
  if (!dateString) return "Unknown";
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
};
