import { extractHashtags, keywords } from './recommendation.engine.js';

const PLATFORM_RULES = {
  instagram: { idealHashtags: [3, 8], caption: [80, 1500], label: 'Instagram' },
  linkedin: { idealHashtags: [3, 5], caption: [120, 2200], label: 'LinkedIn' },
  facebook: { idealHashtags: [0, 3], caption: [40, 1200], label: 'Facebook' },
  youtube: { idealHashtags: [0, 3], caption: [100, 3000], label: 'YouTube' },
};

function sentenceStart(text) { return String(text).trim().split(/(?<=[.!?])\s+/)[0] || ''; }
function clamp(value) { return Math.max(0, Math.min(100, Math.round(value))); }

export function evaluateDraftQuality(draft) {
  const platform = PLATFORM_RULES[draft.platform] || PLATFORM_RULES.linkedin;
  const text = `${draft.title || ''} ${draft.caption || ''}`.trim();
  const tags = extractHashtags(text);
  const words = keywords(text);
  const opening = sentenceStart(draft.caption || draft.title);
  const checks = [];
  let score = 100;

  if (opening.length < 18) { score -= 18; checks.push({ level: 'improve', code: 'hook', message: 'Open with a specific benefit, question, result, or contrarian insight; the first line is too short to create context.' }); }
  else if (opening.length > 150) { score -= 10; checks.push({ level: 'improve', code: 'hook', message: 'Shorten the opening to one clear idea so it is easy to scan.' }); }
  else checks.push({ level: 'good', code: 'hook', message: 'Your opening has enough context for a reader to understand the topic.' });

  if (text.length < platform.caption[0]) { score -= 14; checks.push({ level: 'improve', code: 'length', message: `${platform.label} drafts usually benefit from a little more context; aim for at least ${platform.caption[0]} characters.` }); }
  else if (text.length > platform.caption[1]) { score -= 12; checks.push({ level: 'improve', code: 'length', message: `This is long for ${platform.label}; lead with the key point and move supporting detail below it.` }); }
  else checks.push({ level: 'good', code: 'length', message: `Caption length fits the suggested ${platform.label} range.` });

  const hasCta = /\b(comment|share|save|follow|tell us|let me know|try|learn more|link in|download|watch)\b/i.test(text);
  if (!hasCta) { score -= 12; checks.push({ level: 'improve', code: 'cta', message: 'Add one natural next step, such as a question, “save this,” or “share your experience.”' }); }
  else checks.push({ level: 'good', code: 'cta', message: 'A reader can see a clear next step.' });

  if (tags.length < platform.idealHashtags[0]) { score -= 8; checks.push({ level: 'improve', code: 'hashtags', message: `Consider ${platform.idealHashtags[0]}–${platform.idealHashtags[1]} specific hashtags for ${platform.label}.` }); }
  else if (tags.length > platform.idealHashtags[1]) { score -= 10; checks.push({ level: 'improve', code: 'hashtags', message: `Reduce to ${platform.idealHashtags[0]}–${platform.idealHashtags[1]} focused hashtags; extra tags can dilute relevance.` }); }
  else checks.push({ level: 'good', code: 'hashtags', message: 'Hashtag count fits the platform guidance.' });

  if (/(buy now|guaranteed|act now|limited time|!!!|\$\$\$)/i.test(text)) { score -= 10; checks.push({ level: 'improve', code: 'tone', message: 'Tone contains high-pressure promotional language; replace it with a concrete, audience-focused benefit.' }); }
  if (words.length < 5) { score -= 8; checks.push({ level: 'improve', code: 'specificity', message: 'Add a concrete detail, example, result, or audience problem to make the post more specific.' }); }

  const topic = words.slice(0, 3).join(' ') || 'your topic';
  return {
    score: clamp(score), source: 'platform_content_rules',
    checks,
    suggestedHashtags: tags,
    fallbackHooks: [
      `The overlooked part of ${topic}`,
      `A practical way to improve ${topic}`,
      `Before you act on ${topic}, consider this`,
    ],
  };
}
