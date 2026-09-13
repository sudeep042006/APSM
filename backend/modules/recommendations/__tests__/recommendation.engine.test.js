import test from 'node:test';
import assert from 'node:assert/strict';
import { buildRecommendations, engagementRate, extractHashtags } from '../recommendation.engine.js';
import { validateDraft, validateIngest } from '../recommendation.validation.js';
import { evaluateDraftQuality } from '../contentQuality.engine.js';

function post(index, { tag = '#analytics', day = 2, hour = 10, high = true } = {}) {
  const date = new Date(Date.UTC(2026, 8, 1 + (index % 24), hour));
  date.setUTCDate(date.getUTCDate() + ((day - date.getUTCDay() + 7) % 7));
  return {
    platform: 'linkedin', industry: 'saas', contentType: 'post', title: `Analytics growth ${index}`,
    caption: `Learn analytics growth tactics ${tag}`, hashtags: [tag], publishedAt: date,
    metrics: high ? { reach: 1000, likes: 70, comments: 15, shares: 10, saves: 10 } : { reach: 1000, likes: 8, comments: 1, shares: 0, saves: 0 },
  };
}

const draft = { platform: 'linkedin', industry: 'saas', contentType: 'post', title: 'Analytics growth', caption: 'Practical analytics growth ideas' };

test('extractHashtags de-duplicates and normalises tags', () => {
  assert.deepEqual(extractHashtags('Try #AI and #ai! plus #Data_Growth'), ['#ai', '#data_growth']);
});

test('small datasets use the conservative guardrail', () => {
  const result = buildRecommendations(draft, Array.from({ length: 11 }, (_, index) => post(index)));
  assert.equal(result.status, 'insufficient_data');
  assert.equal(result.confidence, 15);
});

test('large controlled dataset ranks the known high-performing tag and time', () => {
  const records = [];
  for (let index = 0; index < 90; index += 1) records.push(post(index, index % 3 === 0 ? { tag: '#analytics', day: 2, hour: 10, high: true } : { tag: '#random', day: 5, hour: 18, high: false }));
  const result = buildRecommendations(draft, records, Date.UTC(2026, 8, 30));
  assert.equal(result.status, 'ready');
  assert.equal(result.hashtags[0].tag, '#analytics');
  assert.match(result.postingWindows[0].window, /Tuesday 10:00/);
  assert.ok(result.confidence >= 70);
  assert.ok(engagementRate(records[0]) > engagementRate(records[1]));
});

test('controlled large-data recovery accuracy is 25/25 (100%)', () => {
  let correct = 0;
  for (let trial = 0; trial < 25; trial += 1) {
    const winningTag = `#topic${trial}`;
    const records = Array.from({ length: 240 }, (_, index) => (
      index % 4 === 0
        ? post(index, { tag: winningTag, day: (trial % 6) + 1, hour: 8 + (trial % 5) * 2, high: true })
        : post(index, { tag: `#noise${index % 7}`, day: (trial + 3) % 7, hour: 18, high: false })
    ));
    const result = buildRecommendations(draft, records, Date.UTC(2026, 8, 30));
    if (result.hashtags[0]?.tag === winningTag) correct += 1;
  }
  assert.equal(correct, 25, `Expected 25/25 correct tag recoveries; got ${correct}/25.`);
});

test('validation rejects unsafe future dates and accepts a valid IANA timezone', () => {
  assert.equal(validateDraft({ title: 'Hello', timezone: 'Asia/Kolkata' }).timezone, 'Asia/Kolkata');
  assert.throws(() => validateIngest({ platform: 'linkedin', externalPostId: '1', title: 'Hello', publishedAt: '2099-01-01T00:00:00Z' }), /non-future date/);
});

test('future and implausible engagement records cannot influence recommendations', () => {
  const safe = Array.from({ length: 15 }, (_, index) => post(index, { tag: '#analytics', high: true }));
  safe.push({ ...post(99, { tag: '#poison', high: true }), publishedAt: '2099-01-01T00:00:00Z' });
  safe.push({ ...post(98, { tag: '#poison', high: true }), metrics: { reach: 1, likes: 50 } });
  const result = buildRecommendations(draft, safe, Date.UTC(2026, 8, 30));
  assert.ok(!result.hashtags.some(item => item.tag === '#poison'));
});

test('platform draft-quality checks remain useful without historical data', () => {
  const quality = evaluateDraftQuality({ platform: 'instagram', title: 'Hi', caption: 'Buy now!!!' });
  assert.ok(quality.score < 100);
  assert.ok(quality.checks.some(check => check.code === 'cta'));
  const result = buildRecommendations({ ...draft, platform: 'instagram' }, [], Date.now(), quality);
  assert.equal(result.status, 'insufficient_data');
  assert.equal(result.recommendationSource, 'platform_content_rules');
  assert.equal(result.hookPhrases.length, 3);
  assert.equal(result.contentQuality.score, quality.score);
});
