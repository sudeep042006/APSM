const DAY_MS = 24 * 60 * 60 * 1000;
export const RECOMMENDATION_MODEL_VERSION = 'rules-v1.1';
const STOP_WORDS = new Set(['the', 'and', 'for', 'with', 'that', 'this', 'your', 'from', 'into', 'about', 'have', 'will', 'are', 'our', 'you', 'how', 'why', 'what']);

export function normaliseHashtag(value = '') {
  const clean = String(value).trim().toLowerCase().replace(/^#/, '').replace(/[^a-z0-9_]/g, '');
  return clean ? `#${clean}` : null;
}

export function extractHashtags(text = '') {
  return [...new Set((String(text).match(/#[\p{L}0-9_]+/gu) || []).map(normaliseHashtag).filter(Boolean))];
}

export function keywords(text = '') {
  return [...new Set((String(text).toLowerCase().match(/[a-z0-9]{3,}/g) || []).filter(word => !STOP_WORDS.has(word)))];
}

export function engagementRate(post) {
  const m = post.metrics || {};
  const engagement = (m.likes || 0) + 2 * (m.comments || 0) + 3 * (m.shares || 0) + 2 * (m.saves || 0);
  const denominator = m.reach || m.impressions || 0;
  return denominator > 0 ? engagement / denominator : 0;
}

function median(values) {
  if (!values.length) return 0;
  const ordered = [...values].sort((a, b) => a - b);
  const middle = Math.floor(ordered.length / 2);
  return ordered.length % 2 ? ordered[middle] : (ordered[middle - 1] + ordered[middle]) / 2;
}

function jaccard(left, right) {
  if (!left.length || !right.length) return 0;
  const rightSet = new Set(right);
  const shared = left.filter(item => rightSet.has(item)).length;
  return shared / new Set([...left, ...right]).size;
}

function postText(post) { return `${post.title || ''} ${post.caption || ''}`; }

function scorePost(post, draft, now) {
  const samePlatform = !draft.platform || post.platform === draft.platform ? 0.2 : 0;
  const sameType = !draft.contentType || post.contentType === draft.contentType ? 0.1 : 0;
  const sameIndustry = !draft.industry || post.industry === draft.industry ? 0.15 : 0;
  const contentSimilarity = jaccard(keywords(postText(post)), keywords(`${draft.title || ''} ${draft.caption || ''}`));
  const age = Math.max(0, (now - new Date(post.publishedAt).getTime()) / DAY_MS);
  return samePlatform + sameType + sameIndustry + contentSimilarity * 0.55 + Math.exp(-age / 120) * 0.1;
}

function formatWindow(day, hour) {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const start = `${String(hour).padStart(2, '0')}:00`;
  const end = `${String((hour + 2) % 24).padStart(2, '0')}:00`;
  return `${days[day]} ${start}–${end}`;
}

function timeParts(date, timezone) {
  const parts = new Intl.DateTimeFormat('en-US', { timeZone: timezone || 'UTC', weekday: 'short', hour: '2-digit', hourCycle: 'h23' }).formatToParts(date);
  const values = Object.fromEntries(parts.map(part => [part.type, part.value]));
  return { day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(values.weekday), hour: Number(values.hour) };
}

function validPost(post, now) {
  const exposure = post.metrics?.reach || post.metrics?.impressions || 0;
  const publishedAt = new Date(post.publishedAt).getTime();
  // Exclude corrupt, future, and implausible-rate data before it can influence a recommendation.
  return Number.isFinite(exposure) && exposure > 0 && Number.isFinite(publishedAt) && publishedAt <= now + 5 * 60 * 1000 && engagementRate(post) <= 3;
}

function confidence(similar, allPosts) {
  // Evidence quantity (70%) plus relevance (30%), capped so no sample can claim certainty.
  const quantity = Math.min(similar.length / 30, 1);
  const relevance = similar.length ? similar.reduce((sum, item) => sum + item.match, 0) / similar.length : 0;
  return Math.round(Math.min(0.95, 0.15 + quantity * 0.55 + relevance * 0.3) * 100);
}

function fallback(draft, allPosts, contentQuality) {
  const tags = extractHashtags(`${draft.title || ''} ${draft.caption || ''}`).slice(0, 5);
  return {
    status: 'insufficient_data',
    modelVersion: RECOMMENDATION_MODEL_VERSION,
    confidence: 15,
    dataQuality: { sampleSize: allPosts.length, minimumRecommended: 12, lookbackDays: 180, timezone: draft.timezone || 'UTC' },
    recommendationSource: 'platform_content_rules',
    hashtags: tags.map(tag => ({ tag, score: 0, source: 'draft', rationale: 'Already present in your draft; no historical uplift is claimed.' })),
    postingWindows: [],
    hookPhrases: (contentQuality?.fallbackHooks || []).map(phrase => ({ phrase, score: contentQuality?.score || 0, source: 'platform_content_rules', rationale: 'Content-quality alternative based on your draft and platform guidance, not historical reach.' })),
    contentQuality,
    guardrail: 'At least 12 comparable posts with reach or impressions are required before APSM makes performance claims. Content-quality suggestions are still available.',
  };
}

export function buildRecommendations(draft, posts, now = Date.now(), contentQuality = null) {
  const usable = posts.filter(post => validPost(post, now));
  if (usable.length < 12) return fallback(draft, usable, contentQuality);

  const ranked = usable.map(post => ({ post, match: scorePost(post, draft, now), rate: engagementRate(post) }))
    .sort((a, b) => b.match - a.match);
  const similar = ranked.filter(item => item.match >= 0.3).slice(0, 60);
  if (similar.length < 5) return fallback(draft, usable, contentQuality);

  const baseline = median(usable.map(engagementRate));
  const tagStats = new Map();
  for (const item of similar) {
    const tags = [...new Set([...(item.post.hashtags || []).map(normaliseHashtag), ...extractHashtags(postText(item.post))].filter(Boolean))];
    for (const tag of tags) {
      const stat = tagStats.get(tag) || { weightedRate: 0, weight: 0, count: 0 };
      const weight = item.match * Math.exp(-Math.max(0, (now - new Date(item.post.publishedAt).getTime()) / DAY_MS) / 120);
      stat.weightedRate += item.rate * weight;
      stat.weight += weight;
      stat.count += 1;
      tagStats.set(tag, stat);
    }
  }
  const hashtags = [...tagStats.entries()].map(([tag, stat]) => {
    const avgRate = stat.weightedRate / stat.weight;
    const uplift = baseline ? ((avgRate - baseline) / baseline) * 100 : 0;
    return { tag, score: Math.round(Math.max(0, uplift)), source: 'historical_performance', sampleSize: stat.count, rationale: `Used in ${stat.count} comparable posts; their median-adjusted engagement was ${uplift >= 0 ? '+' : ''}${uplift.toFixed(1)}% versus your ${usable.length}-post baseline.` };
  }).filter(item => item.sampleSize >= 2).sort((a, b) => b.score - a.score || b.sampleSize - a.sampleSize).slice(0, 8);

  const windows = new Map();
  for (const item of similar) {
    const local = timeParts(new Date(item.post.publishedAt), draft.timezone);
    const hour = Math.floor(local.hour / 2) * 2;
    const key = `${local.day}-${hour}`;
    const group = windows.get(key) || { day: local.day, hour, rates: [], count: 0 };
    group.rates.push(item.rate); group.count += 1; windows.set(key, group);
  }
  const postingWindows = [...windows.values()].filter(window => window.count >= 2).map(window => {
    const rate = median(window.rates);
    const uplift = baseline ? ((rate - baseline) / baseline) * 100 : 0;
    return { window: formatWindow(window.day, window.hour), score: Math.round(Math.max(0, uplift)), source: 'historical_performance', sampleSize: window.count, rationale: `${window.count} comparable posts in this window produced ${uplift >= 0 ? '+' : ''}${uplift.toFixed(1)}% engagement versus baseline.` };
  }).sort((a, b) => b.score - a.score).slice(0, 3);

  const topic = keywords(`${draft.title || ''} ${draft.caption || ''}`).slice(0, 3).join(' ') || 'your topic';
  const topPost = similar.sort((a, b) => b.rate - a.rate)[0]?.post;
  const exampleHook = (topPost?.caption || topPost?.title || '').split(/[.!?]/)[0].trim();
  const hookPhrases = [
    `What most people miss about ${topic}`,
    `${topic}: the practical takeaway in 30 seconds`,
    `Before you try ${topic}, consider this`,
  ].map((phrase, index) => ({ phrase, score: Math.max(45, confidence(similar, usable) - index * 5), source: exampleHook ? 'historical_performance' : 'platform_content_rules', rationale: exampleHook ? `Pattern informed by a comparable high-performing opening: “${exampleHook.slice(0, 100)}”.` : 'Built from the draft topic; validate with your audience.' }));

  return {
    status: 'ready', confidence: confidence(similar, usable),
    modelVersion: RECOMMENDATION_MODEL_VERSION,
    recommendationSource: 'historical_performance',
    dataQuality: { sampleSize: usable.length, comparablePosts: similar.length, baselineEngagementRate: Number((baseline * 100).toFixed(2)), lookbackDays: 180, timezone: draft.timezone || 'UTC' },
    hashtags, postingWindows, hookPhrases, contentQuality,
    guardrail: 'Recommendations describe historical association, not a guarantee of future reach.',
  };
}
