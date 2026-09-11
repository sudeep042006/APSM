const buckets = new Map();

// A zero-dependency protection for the single-node deployment. Replace this
// store with Redis when horizontally scaling so limits remain shared.
export function recommendationRateLimit({ limit, windowMs }) {
  return (req, res, next) => {
    const key = `${req.user?.id || req.ip}:${req.path}`;
    const now = Date.now();
    const bucket = buckets.get(key);
    if (!bucket || bucket.resetAt <= now) {
      buckets.set(key, { count: 1, resetAt: now + windowMs });
      res.set('RateLimit-Limit', String(limit));
      res.set('RateLimit-Remaining', String(limit - 1));
      return next();
    }
    if (bucket.count >= limit) {
      const retryAfter = Math.max(1, Math.ceil((bucket.resetAt - now) / 1000));
      res.set('Retry-After', String(retryAfter));
      return res.status(429).json({ error: 'Too many recommendation requests. Please try again shortly.' });
    }
    bucket.count += 1;
    res.set('RateLimit-Limit', String(limit));
    res.set('RateLimit-Remaining', String(limit - bucket.count));
    return next();
  };
}
