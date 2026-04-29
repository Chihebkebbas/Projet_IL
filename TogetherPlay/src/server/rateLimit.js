// Tiny token-bucket / fixed-window limiter (no external dep).

const buckets = new Map();

function prune(now) {
    if (buckets.size < 5000) return;
    for (const [key, b] of buckets) {
        if (now - b.start > 10 * 60 * 1000) buckets.delete(key);
    }
}

export function rateLimit({ key, windowMs, max }) {
    const now = Date.now();
    prune(now);
    const b = buckets.get(key);
    if (!b || now - b.start > windowMs) {
        buckets.set(key, { start: now, count: 1 });
        return { allowed: true, remaining: max - 1 };
    }
    if (b.count >= max) {
        return { allowed: false, retryAfterMs: windowMs - (now - b.start) };
    }
    b.count += 1;
    return { allowed: true, remaining: max - b.count };
}

export function expressLimiter({ windowMs, max, keyFn }) {
    return (req, res, next) => {
        const key = keyFn ? keyFn(req) : req.ip;
        const result = rateLimit({ key: `http:${key}`, windowMs, max });
        if (!result.allowed) {
            res.set('Retry-After', Math.ceil(result.retryAfterMs / 1000));
            return res.status(429).json({ error: 'Trop de requêtes, réessayez plus tard.' });
        }
        next();
    };
}
