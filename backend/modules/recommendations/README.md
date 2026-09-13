# AI Reach Predictor

The predictor is intentionally evidence-led. It uses the authenticated user's
last 180 days of normalized post-performance records; it never claims a result
when fewer than 12 usable posts are available.

## Ingest historical posts

Platform sync services should upsert one record per published post:

`POST /api/recommendations/posts`

```json
{
  "platform": "linkedin",
  "externalPostId": "platform-post-id",
  "industry": "saas",
  "contentType": "post",
  "title": "Product analytics lesson",
  "caption": "How we improved activation #productanalytics",
  "publishedAt": "2026-08-16T10:00:00Z",
  "metrics": { "reach": 2200, "likes": 84, "comments": 12, "shares": 9, "saves": 7 }
}
```

This endpoint is idempotent by `platform + externalPostId`, so periodic official
API synchronization is safe. Connect each existing platform analytics sync to
this endpoint/service after it fetches post-level metrics.

## Optimise a draft

`POST /api/recommendations/optimise` (or `/optimize`)

The response contains ranked tags, two-hour posting windows, hook alternatives,
confidence, sample sizes, baseline engagement, and an explicit guardrail. The
scores are historical associations rather than predictions or guarantees.

Even before history is available, the same endpoint returns labeled
`platform_content_rules`: draft quality, platform-specific hashtag/caption
guidance, CTA/hook checks, and safe hook alternatives. These are explicitly not
shown as reach predictions.

## Production safeguards

- Requests are authenticated, bounded to 256 KB, strictly validated, and rate limited.
- Future, corrupt, and implausible engagement-rate records are excluded before scoring.
- Timing recommendations use the draft's IANA `timezone` (default `UTC`).
- Every response is assigned a `runId`; the draft itself is not stored. Send actual
  post metrics to `POST /api/recommendations/runs/:runId/outcome` after the post has
  matured. These privacy-conscious audit records allow offline calibration before
  any real-world accuracy number is reported.
- `POST /api/recommendations/runs/:runId/feedback` stores useful/not-useful
  feedback, which helps prioritize future calibration work.
- The supplied in-memory limiter is appropriate for one API process. For multiple
  backend instances, replace its store with Redis so limits are shared.
