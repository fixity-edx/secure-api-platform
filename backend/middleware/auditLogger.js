import AuditLog from '../models/AuditLog.js';

/**
 * Audit logging middleware
 */
export const auditLog = (action, resource) => {
    return async (req, res, next) => {
        const originalSend = res.send;
        const startTime = Date.now();

        res.send = function (data) {
            const responseTime = Date.now() - startTime;

            // Create audit log entry
            const logEntry = {
                user: req.user?._id,
                apiKey: req.apiKey?._id,
                action: action || 'unknown',
                resource: resource || 'unknown',
                resourceId: req.params.id || req.body?.id,
                details: {
                    method: req.method,
                    path: req.path,
                    query: req.query,
                    body: sanitizeBody(req.body),
                    params: req.params
                },
                severity: res.statusCode >= 400 ? 'error' : 'info',
                ipAddress: req.ip || req.connection.remoteAddress,
                userAgent: req.headers['user-agent'],
                requestMetadata: {
                    method: req.method,
                    endpoint: req.originalUrl,
                    statusCode: res.statusCode,
                    responseTime: responseTime,
                    requestSize: req.headers['content-length'] || 0,
                    responseSize: data ? Buffer.byteLength(data) : 0
                },
                success: res.statusCode < 400,
                errorMessage: res.statusCode >= 400 ? data : undefined
            };

            // Save audit log asynchronously (don't wait)
            AuditLog.create(logEntry).catch(err => {
                console.error('Audit log error:', err);
            });

            originalSend.call(this, data);
        };

        next();
    };
};

/**
 * Sanitize sensitive data from request body
 */
const sanitizeBody = (body) => {
    if (!body) return {};

    const sanitized = { ...body };
    const sensitiveFields = ['password', 'token', 'secret', 'apiKey', 'key'];

    sensitiveFields.forEach(field => {
        if (sanitized[field]) {
            sanitized[field] = '[REDACTED]';
        }
    });

    return sanitized;
};

/**
 * Log specific action manually
 */
export const logAction = async (data) => {
    try {
        await AuditLog.create(data);
    } catch (error) {
        console.error('Manual audit log error:', error);
    }
};

export default {
    auditLog,
    logAction
};
