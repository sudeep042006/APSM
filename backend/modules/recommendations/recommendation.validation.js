const PLATFORMS = new Set(['youtube', 'facebook', 'instagram', 'linkedin']);
const MAX_METRIC = 1_000_000_000_000;

function text(value, name, maxLength, { required = false } = {}) {
  if (value === undefined || value === null) {
    if (required) throw new Error(`${name} is required.`);
    return '';
  }
  if (typeof value !== 'string') throw new Error(`${name} must be text.`);
  const clean = value.trim();
  if (required && !clean) throw new Error(`${name} is required.`);
  if (clean.length > maxLength) throw new Error(`${name} must be at most ${maxLength} characters.`);
  return clean;
}

export function assertTimeZone(value) {
  const zone = value || 'UTC';
  if (typeof zone !== 'string' || zone.length > 64) throw new Error('timezone is invalid.');
  try { Intl.DateTimeFormat('en-US', { timeZone: zone }).format(); } catch { throw new Error('timezone must be a valid IANA timezone, such as Asia/Kolkata.'); }
  return zone;
}

export function validateDraft(payload = {}) {
  const platform = payload.platform ? text(payload.platform, 'platform', 20).toLowerCase() : undefined;
  if (platform && !PLATFORMS.has(platform)) throw new Error('Unsupported platform.');
  const draft = {
    platform,
    title: text(payload.title, 'title', 200),
    caption: text(payload.caption, 'caption', 5000),
    industry: text(payload.industry, 'industry', 64).toLowerCase() || 'general',
    contentType: text(payload.contentType, 'contentType', 32).toLowerCase() || 'post',
    timezone: assertTimeZone(payload.timezone),
  };
  if (!draft.title && !draft.caption) throw new Error('Provide a title or caption to optimise.');
  return draft;
}

function metric(value, name) {
  if (value === undefined || value === null) return 0;
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0 || value > MAX_METRIC) throw new Error(`${name} must be a finite number between 0 and ${MAX_METRIC}.`);
  return value;
}

export function validateIngest(payload = {}) {
  const draft = validateDraft({ ...payload, title: payload.title || 'untitled', timezone: 'UTC' });
  const publishedAt = new Date(payload.publishedAt);
  if (Number.isNaN(publishedAt.getTime()) || publishedAt.getTime() > Date.now() + 5 * 60 * 1000) throw new Error('publishedAt must be a valid non-future date.');
  const hashtags = payload.hashtags === undefined ? [] : payload.hashtags;
  if (!Array.isArray(hashtags) || hashtags.length > 30 || hashtags.some(tag => typeof tag !== 'string' || tag.length > 100)) throw new Error('hashtags must contain at most 30 short text values.');
  return {
    ...draft,
    externalPostId: text(payload.externalPostId, 'externalPostId', 256, { required: true }),
    publishedAt,
    hashtags,
    metrics: Object.fromEntries(['reach', 'impressions', 'likes', 'comments', 'shares', 'saves'].map(name => [name, metric(payload.metrics?.[name], `metrics.${name}`)])),
  };
}
