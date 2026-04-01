import mongoose from 'mongoose';

const alertSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    apiKey: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ApiKey'
    },
    type: {
        type: String,
        required: true,
        enum: [
            'security_threat',
            'anomaly_detected',
            'rate_limit_exceeded',
            'key_expiring',
            'key_expired',
            'key_compromised',
            'unusual_activity',
            'threshold_exceeded',
            'failed_authentication',
            'ip_blocked',
            'policy_violation',
            'system_health',
            'other'
        ]
    },
    severity: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical'],
        required: true
    },
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    details: {
        type: mongoose.Schema.Types.Mixed
    },
    aiAnalysis: {
        riskScore: Number,
        recommendations: [String],
        predictedImpact: String,
        confidence: Number
    },
    status: {
        type: String,
        enum: ['new', 'acknowledged', 'investigating', 'resolved', 'dismissed'],
        default: 'new'
    },
    acknowledgedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    acknowledgedAt: {
        type: Date
    },
    resolvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    resolvedAt: {
        type: Date
    },
    resolution: {
        type: String
    },
    notificationsSent: {
        email: { type: Boolean, default: false },
        webhook: { type: Boolean, default: false },
        sms: { type: Boolean, default: false }
    },
    metadata: {
        source: String,
        triggeredBy: String,
        relatedAlerts: [mongoose.Schema.Types.ObjectId]
    }
}, {
    timestamps: true
});

// Indexes
alertSchema.index({ user: 1, status: 1, createdAt: -1 });
alertSchema.index({ apiKey: 1, createdAt: -1 });
alertSchema.index({ severity: 1, status: 1 });
alertSchema.index({ type: 1, createdAt: -1 });

export default mongoose.model('Alert', alertSchema);
