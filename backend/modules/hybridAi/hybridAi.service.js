import axios from 'axios';

const PLATFORM_NAMES = { instagram: 'Instagram', linkedin: 'LinkedIn', youtube: 'YouTube', facebook: 'Facebook' };
const SAFE_PLATFORMS = Object.keys(PLATFORM_NAMES);
const ML_URL = process.env.ML_INFERENCE_URL || 'http://127.0.0.1:8010';

function parseJson(content) {
  const text = String(content || '').trim();
  const candidate = text.match(/\{[\s\S]*\}/)?.[0];
  if (!candidate) throw new Error('LLM did not return JSON.');
  return JSON.parse(candidate);
}

function fallbackCaption(platform, caption) {
  const endings = {
    instagram: 'Save this and share your takeaway below. ✨',
    linkedin: 'What practical step would you add?',
    youtube: 'Watch, subscribe, and share your takeaway.',
    facebook: 'What has worked for you? Share it in the comments.',
  };
  return { caption: `${caption}\n\n${endings[platform]}`.trim(), hashtags: [] };
}

function validateVariant(value, platform, fallback) {
  if (!value || typeof value !== 'object') return fallback;
  const caption = typeof value.caption === 'string' && value.caption.trim().length <= 5000 ? value.caption.trim() : fallback.caption;
  const hashtags = Array.isArray(value.hashtags)
    ? value.hashtags.filter(tag => typeof tag === 'string' && /^#[\p{L}0-9_]{2,80}$/u.test(tag)).slice(0, 12)
    : [];
  return { caption, hashtags };
}

export async function generatePlatformVariants({ caption, category, platforms }) {
  const fallback = Object.fromEntries(platforms.map(platform => [platform, fallbackCaption(platform, caption)]));
  const key = process.env.GROQ_API_KEY?.trim();
  if (!key) return { variants: fallback, source: 'rules_fallback', warning: 'LLM is not configured; safe platform rules were used.' };

  const prompt = `Return only JSON. Rewrite this social-media draft for each target platform. Keep facts intact; do not invent claims, prices, statistics, links, or guarantees. Category: ${category}. Draft: ${caption}. JSON shape: {"instagram":{"caption":"","hashtags":["#tag"]},"linkedin":{"caption":"","hashtags":[]},"youtube":{"caption":"","hashtags":[]},"facebook":{"caption":"","hashtags":[]}}. Include only these target keys: ${platforms.join(', ')}.`;
  try {
    const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
      // Resolve this against the account's /models endpoint. The older
      // llama-3.3-70b-versatile default has been retired and returns 404.
      model: process.env.GROQ_MODEL || 'openai/gpt-oss-20b',
      temperature: 0.55,
      max_tokens: 1400,
      response_format: { type: 'json_object' },
      messages: [{ role: 'system', content: 'You produce safe, valid JSON only.' }, { role: 'user', content: prompt }],
    }, { headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' }, timeout: 8000 });
    const generated = parseJson(response.data?.choices?.[0]?.message?.content);
    return {
      variants: Object.fromEntries(platforms.map(platform => [platform, validateVariant(generated[platform], platform, fallback[platform])])),
      source: 'groq_llm',
      warning: null,
    };
  } catch (error) {
    console.warn('Hybrid AI LLM fallback:', error.response?.status || error.message);
    return { variants: fallback, source: 'rules_fallback', warning: 'The LLM was unavailable, so safe platform rules were used.' };
  }
}

export async function estimateVariant({ platform, caption, hashtags, mediaType, postingHour, followerCount }) {
  try {
    const response = await axios.post(`${ML_URL}/predict`, {
      platform,
      caption_length: caption.length,
      hashtag_count: hashtags.length,
      media_type: mediaType,
      posting_hour: postingHour,
      follower_count: followerCount,
    }, { timeout: 2500 });
    return response.data;
  } catch {
    return {
      estimated_reach: null,
      estimated_engagement: null,
      model_mode: 'UNAVAILABLE',
      warning: 'Numerical estimate unavailable. Start the private Python inference service to enable it.',
    };
  }
}

export function validateHybridRequest(body = {}) {
  const baseCaption = String(body.base_caption || '').trim();
  if (!baseCaption || baseCaption.length > 5000) throw new Error('base_caption is required and must be at most 5000 characters.');
  const platforms = Array.isArray(body.target_platforms) ? [...new Set(body.target_platforms.map(value => String(value).toLowerCase()))] : SAFE_PLATFORMS;
  if (!platforms.length || platforms.length > 4 || platforms.some(platform => !SAFE_PLATFORMS.includes(platform))) throw new Error('target_platforms must contain supported platforms.');
  const postingHour = Number(body.posting_hour ?? new Date().getHours());
  const followerCount = Number(body.follower_count ?? 0);
  if (!Number.isInteger(postingHour) || postingHour < 0 || postingHour > 23) throw new Error('posting_hour must be between 0 and 23.');
  if (!Number.isFinite(followerCount) || followerCount < 0 || followerCount > 1_000_000_000) throw new Error('follower_count is invalid.');
  return { baseCaption, category: String(body.category || 'general').slice(0, 64), mediaType: String(body.media_type || 'post').toLowerCase(), platforms, postingHour, followerCount };
}
