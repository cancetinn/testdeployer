type RateLimitStore = Map<string, { count: number; resetTime: number }>;

const store: RateLimitStore = new Map();

interface RateLimitConfig {
    interval: number; // ms
    limit: number;
}

export function rateLimit(
    identifier: string,
    config: RateLimitConfig = { interval: 60000, limit: 10 }
): { success: boolean; limit: number; remaining: number; reset: number } {
    const now = Date.now();
    const record = store.get(identifier);

    if (!record || now > record.resetTime) {
        store.set(identifier, {
            count: 1,
            resetTime: now + config.interval
        });
        return {
            success: true,
            limit: config.limit,
            remaining: config.limit - 1,
            reset: now + config.interval
        };
    }

    if (record.count >= config.limit) {
        return {
            success: false,
            limit: config.limit,
            remaining: 0,
            reset: record.resetTime
        };
    }

    record.count++;
    return {
        success: true,
        limit: config.limit,
        remaining: config.limit - record.count,
        reset: record.resetTime
    };
}

// Clean up old entries periodically (every 5 minutes)
if (global.setInterval) {
    setInterval(() => {
        const now = Date.now();
        for (const [key, val] of store.entries()) {
            if (now > val.resetTime) {
                store.delete(key);
            }
        }
    }, 5 * 60 * 1000);
}
