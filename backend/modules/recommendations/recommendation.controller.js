import { PostPerformance } from './postPerformance.model.js';
import crypto from 'crypto';
import { RecommendationRun } from './recommendationRun.model.js';
import { buildRecommendations, extractHashtags, normaliseHashtag, RECOMMENDATION_MODEL_VERSION } from './recommendation.engine.js';
import { validateDraft, validateIngest } from './recommendation.validation.js';
import { evaluateDraftQuality } from './contentQuality.engine.js';

function fingerprint(draft) {
  return crypto.createHash('sha256').update(JSON.stringify(draft)).digest('hex');
}

export async function optimiseDraft(req, res, next) {
  try {
    const draft = validateDraft(req.body);
    const since = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000);
    const posts = await PostPerformance.find({ userId: req.user.id, publishedAt: { $gte: since } }).lean().limit(2000);
    const contentQuality = evaluateDraftQuality(draft);
    const recommendations = buildRecommendations(draft, posts, Date.now(), contentQuality);
    const run = await RecommendationRun.create({
      userId: req.user.id, modelVersion: RECOMMENDATION_MODEL_VERSION, draftFingerprint: fingerprint(draft),
      dataSnapshot: recommendations.dataQuality,
      recommendation: { status: recommendations.status, confidence: recommendations.confidence, hashtags: recommendations.hashtags.map(item => item.tag), postingWindows: recommendations.postingWindows.map(item => item.window) },
    });
    res.json({ runId: run.id, draft: { ...draft, hashtags: extractHashtags(`${draft.title} ${draft.caption}`) }, recommendations });
  } catch (error) { if (error.message && !error.name?.includes('Mongo')) return res.status(400).json({ error: error.message }); next(error); }
}

export async function recordFeedback(req, res, next) {
  try {
    const helpful = req.body?.helpful;
    if (typeof helpful !== 'boolean') return res.status(400).json({ error: 'helpful must be true or false.' });
    const note = req.body?.note === undefined ? '' : String(req.body.note).trim();
    if (note.length > 500) return res.status(400).json({ error: 'Feedback note must be at most 500 characters.' });
    const run = await RecommendationRun.findOne({ _id: req.params.runId, userId: req.user.id });
    if (!run) return res.status(404).json({ error: 'Recommendation run not found.' });
    run.feedback = { helpful, note, recordedAt: new Date() };
    await run.save();
    res.json({ runId: run.id, message: 'Feedback recorded. Thank you.' });
  } catch (error) { next(error); }
}

export async function ingestPostPerformance(req, res, next) {
  try {
    const data = validateIngest(req.body);
    const hashtags = [...new Set([...(data.hashtags || []), ...extractHashtags(`${data.title || ''} ${data.caption || ''}`)].map(normaliseHashtag).filter(Boolean))];
    const post = await PostPerformance.findOneAndUpdate({ userId: req.user.id, platform: data.platform, externalPostId: data.externalPostId }, { ...data, userId: req.user.id, hashtags }, { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true });
    res.status(201).json({ post });
  } catch (error) { if (error.message && !error.name?.includes('Mongo')) return res.status(400).json({ error: error.message }); next(error); }
}

export async function recordOutcome(req, res, next) {
  try {
    const metrics = validateIngest({ ...req.body, platform: 'linkedin', externalPostId: 'outcome', title: 'outcome', publishedAt: req.body?.publishedAt || new Date().toISOString() }).metrics;
    const run = await RecommendationRun.findOne({ _id: req.params.runId, userId: req.user.id });
    if (!run) return res.status(404).json({ error: 'Recommendation run not found.' });
    if (run.outcome?.recordedAt) return res.status(409).json({ error: 'Outcome was already recorded for this run.' });
    run.outcome = { ...metrics, publishedAt: new Date(req.body?.publishedAt || Date.now()), selectedRecommendations: Array.isArray(req.body?.selectedRecommendations) ? req.body.selectedRecommendations.slice(0, 20).map(value => String(value).slice(0, 120)) : [], recordedAt: new Date() };
    await run.save();
    res.json({ runId: run.id, message: 'Outcome recorded for future calibration.' });
  } catch (error) { if (error.message && !error.name?.includes('Mongo')) return res.status(400).json({ error: error.message }); next(error); }
}
