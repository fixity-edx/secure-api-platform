import mongoose from 'mongoose';

const webhookSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    url: {
        type: String,
        required: true,
        match: [/^https?:\/\/.+/, 'Please provide a valid URL']
    },
    events: [{
        type: String,
        enum: [
            'api_key_created',
            'api_key_revoked',
            'api_key_expired',
            'api_key_rotated',
            'security_alert',
            'anomaly_detected',
            'rate_limit_exceeded',
            'threshold_exceeded',
            'usage_spike',
            'all'
        ]
    }],
    isActive: {
        type: Boolean,
        default: true
    },
    secret: {
        type: String,
        required: true
    },
    headers: {
        type: Map,
        of: String
    },
    retryPolicy: {
        maxRetries: {
            type: Number,
            default: 3
        },
        retryDelay: {
            type: Number,
            default: 1000 // milliseconds
        }
    },
    statistics: {
        totalDeliveries: {
            type: Number,
            default: 0
        },
        successfulDeliveries: {
            type: Number,
            default: 0
        },
        failedDeliveries: {
            type: Number,
            default: 0
        },
        lastDeliveryAt: {
            type: Date
        },
        lastDeliveryStatus: {
            type: String,
            enum: ['success', 'failed', 'pending']
        }
    }
}, {
    timestamps: true
});

webhookSchema.index({ user: 1, isActive: 1 });

export default mongoose.model('Webhook', webhookSchema);
