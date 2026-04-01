import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    apiKey: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ApiKey'
    },
    action: {
        type: String,
        required: true,
        enum: [
            'api_key_created',
            'api_key_deleted',
            'api_key_revoked',
            'api_key_rotated',
            'api_key_accessed',
            'user_login',
            'user_logout',
            'user_registered',
            'user_updated',
            'permission_changed',
            'security_alert',
            'anomaly_detected',
            'rate_limit_exceeded',
            'unauthorized_access',
            'ip_blocked',
            'webhook_triggered',
            'admin_action',
            'policy_violation',
            'other'
        ]
    },
    resource: {
        type: String,
        required: true
    },
    resourceId: {
        type: String
    },
    details: {
        type: mongoose.Schema.Types.Mixed
    },
    severity: {
        type: String,
        enum: ['info', 'warning', 'error', 'critical'],
        default: 'info'
    },
    ipAddress: {
        type: String
    },
    userAgent: {
        type: String
    },
    location: {
        country: String,
        city: String,
        coordinates: {
            latitude: Number,
            longitude: Number
        }
    },
    requestMetadata: {
        method: String,
        endpoint: String,
        statusCode: Number,
        responseTime: Number,
        requestSize: Number,
        responseSize: Number
    },
    success: {
        type: Boolean,
        default: true
    },
    errorMessage: {
        type: String
    },
    tags: [{
        type: String
    }]
}, {
    timestamps: true
});

// Indexes for efficient querying
auditLogSchema.index({ user: 1, createdAt: -1 });
auditLogSchema.index({ apiKey: 1, createdAt: -1 });
auditLogSchema.index({ action: 1, createdAt: -1 });
auditLogSchema.index({ severity: 1, createdAt: -1 });
auditLogSchema.index({ ipAddress: 1 });
auditLogSchema.index({ createdAt: -1 });

// TTL index to auto-delete old logs after 90 days
auditLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7776000 });

export default mongoose.model('AuditLog', auditLogSchema);
