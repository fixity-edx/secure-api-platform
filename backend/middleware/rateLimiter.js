import rateLimit from 'express-rate-limit';
import 'dotenv/config'; // Ensure env vars are loaded before creating limiters
import ApiKey from '../models/ApiKey.js';
import AuditLog from '../models/AuditLog.js';

/**
 * General API rate limiter
 */
export const apiLimiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
    message: {
        success: false,
        message: 'Too many requests from this IP, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

/**
 * Strict rate limiter for authentication routes
 */
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_AUTH_MAX_REQUESTS) || 5, // Configurable limit
    message: {
        success: false,
        message: 'Too many authentication attempts, please try again later.'
    },
    skipSuccessfulRequests: true,
});

/**
 * Custom API key rate limiter
 */
export const apiKeyRateLimiter = async (req, res, next) => {
    if (!req.apiKey) {
        return next();
    }

    const apiKey = req.apiKey;
    const now = new Date();
    const oneMinuteAgo = new Date(now - 60 * 1000);
    const oneHourAgo = new Date(now - 60 * 60 * 1000);
    const oneDayAgo = new Date(now - 24 * 60 * 60 * 1000);

    try {
        // Count requests in different time windows
        const [minuteCount, hourCount, dayCount] = await Promise.all([
            AuditLog.countDocuments({
                apiKey: apiKey._id,
                createdAt: { $gte: oneMinuteAgo }
            }),
            AuditLog.countDocuments({
                apiKey: apiKey._id,
                createdAt: { $gte: oneHourAgo }
            }),
            AuditLog.countDocuments({
                apiKey: apiKey._id,
                createdAt: { $gte: oneDayAgo }
            })
        ]);

        // Check against limits
        if (minuteCount >= apiKey.rateLimit.requestsPerMinute) {
            // Log rate limit exceeded
            await AuditLog.create({
                user: apiKey.user,
                apiKey: apiKey._id,
                action: 'rate_limit_exceeded',
                resource: 'api_key',
                resourceId: apiKey._id.toString(),
                severity: 'warning',
                details: {
                    limit: 'per_minute',
                    allowed: apiKey.rateLimit.requestsPerMinute,
                    current: minuteCount
                },
                ipAddress: req.ip,
                userAgent: req.headers['user-agent']
            });

            return res.status(429).json({
                success: false,
                message: 'Rate limit exceeded: Too many requests per minute',
                limit: apiKey.rateLimit.requestsPerMinute,
                retryAfter: 60
            });
        }

        if (hourCount >= apiKey.rateLimit.requestsPerHour) {
            await AuditLog.create({
                user: apiKey.user,
                apiKey: apiKey._id,
                action: 'rate_limit_exceeded',
                resource: 'api_key',
                resourceId: apiKey._id.toString(),
                severity: 'warning',
                details: {
                    limit: 'per_hour',
                    allowed: apiKey.rateLimit.requestsPerHour,
                    current: hourCount
                },
                ipAddress: req.ip,
                userAgent: req.headers['user-agent']
            });

            return res.status(429).json({
                success: false,
                message: 'Rate limit exceeded: Too many requests per hour',
                limit: apiKey.rateLimit.requestsPerHour,
                retryAfter: 3600
            });
        }

        if (dayCount >= apiKey.rateLimit.requestsPerDay) {
            await AuditLog.create({
                user: apiKey.user,
                apiKey: apiKey._id,
                action: 'rate_limit_exceeded',
                resource: 'api_key',
                resourceId: apiKey._id.toString(),
                severity: 'warning',
                details: {
                    limit: 'per_day',
                    allowed: apiKey.rateLimit.requestsPerDay,
                    current: dayCount
                },
                ipAddress: req.ip,
                userAgent: req.headers['user-agent']
            });

            return res.status(429).json({
                success: false,
                message: 'Rate limit exceeded: Too many requests per day',
                limit: apiKey.rateLimit.requestsPerDay,
                retryAfter: 86400
            });
        }

        // Add rate limit info to response headers
        res.setHeader('X-RateLimit-Limit-Minute', apiKey.rateLimit.requestsPerMinute);
        res.setHeader('X-RateLimit-Remaining-Minute', apiKey.rateLimit.requestsPerMinute - minuteCount);
        res.setHeader('X-RateLimit-Limit-Hour', apiKey.rateLimit.requestsPerHour);
        res.setHeader('X-RateLimit-Remaining-Hour', apiKey.rateLimit.requestsPerHour - hourCount);
        res.setHeader('X-RateLimit-Limit-Day', apiKey.rateLimit.requestsPerDay);
        res.setHeader('X-RateLimit-Remaining-Day', apiKey.rateLimit.requestsPerDay - dayCount);

        next();
    } catch (error) {
        console.error('Rate limiter error:', error);
        next();
    }
};

export default {
    apiLimiter,
    authLimiter,
    apiKeyRateLimiter
};
