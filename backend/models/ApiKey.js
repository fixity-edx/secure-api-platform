import mongoose from 'mongoose';

const apiKeySchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: [true, 'Please provide a name for this API key'],
        trim: true
    },
    key: {
        type: String,
        required: true,
        unique: true,
        select: false // Don't return the actual key in queries by default
    },
    hashedKey: {
        type: String,
        required: true,
        unique: true
    },
    prefix: {
        type: String,
        required: true
    },
    environment: {
        type: String,
        enum: ['development', 'staging', 'production'],
        default: 'development'
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'revoked', 'expired', 'compromised'],
        default: 'active'
    },
    permissions: [{
        resource: String,
        actions: [String] // ['read', 'write', 'delete']
    }],
    rateLimit: {
        requestsPerMinute: {
            type: Number,
            default: 60
        },
        requestsPerHour: {
            type: Number,
            default: 1000
        },
        requestsPerDay: {
            type: Number,
            default: 10000
        }
    },
    ipWhitelist: [{
        type: String
    }],
    allowedDomains: [{
        type: String
    }],
    expiresAt: {
        type: Date,
        required: true
    },
    lastUsedAt: {
        type: Date
    },
    lastRotatedAt: {
        type: Date,
        default: Date.now
    },
    rotationSchedule: {
        enabled: {
            type: Boolean,
            default: true
        },
        intervalDays: {
            type: Number,
            default: 90
        },
        nextRotation: {
            type: Date
        }
    },
    usageStats: {
        totalRequests: {
            type: Number,
            default: 0
        },
        successfulRequests: {
            type: Number,
            default: 0
        },
        failedRequests: {
            type: Number,
            default: 0
        },
        lastRequestAt: {
            type: Date
        },
        bandwidthUsed: {
            type: Number,
            default: 0 // in bytes
        }
    },
    securityMetrics: {
        riskScore: {
            type: Number,
            default: 0,
            min: 0,
            max: 100
        },
        threatLevel: {
            type: String,
            enum: ['low', 'medium', 'high', 'critical'],
            default: 'low'
        },
        anomalyDetected: {
            type: Boolean,
            default: false
        },
        lastSecurityScan: {
            type: Date
        },
        suspiciousActivityCount: {
            type: Number,
            default: 0
        }
    },
    metadata: {
        description: String,
        tags: [String],
        createdBy: String,
        revokedBy: String,
        revokedAt: Date,
        revokeReason: String,
        notes: String
    }
}, {
    timestamps: true
});

// Index for faster queries
apiKeySchema.index({ user: 1, status: 1 });
apiKeySchema.index({ hashedKey: 1 });
apiKeySchema.index({ expiresAt: 1 });
apiKeySchema.index({ 'securityMetrics.riskScore': -1 });

// Virtual for checking if key is expired
apiKeySchema.virtual('isExpired').get(function () {
    return this.expiresAt < new Date();
});

// Virtual for checking if key needs rotation
apiKeySchema.virtual('needsRotation').get(function () {
    if (!this.rotationSchedule.enabled) return false;
    return this.rotationSchedule.nextRotation && this.rotationSchedule.nextRotation < new Date();
});

// Method to check if key is valid
apiKeySchema.methods.isValid = function () {
    return this.status === 'active' && !this.isExpired;
};

// Method to increment usage stats
apiKeySchema.methods.incrementUsage = async function (success = true, bandwidth = 0) {
    this.usageStats.totalRequests += 1;
    if (success) {
        this.usageStats.successfulRequests += 1;
    } else {
        this.usageStats.failedRequests += 1;
    }
    this.usageStats.bandwidthUsed += bandwidth;
    this.usageStats.lastRequestAt = new Date();
    this.lastUsedAt = new Date();

    await this.save();
};

// Method to update security metrics
apiKeySchema.methods.updateSecurityMetrics = async function (metrics) {
    if (metrics.riskScore !== undefined) {
        this.securityMetrics.riskScore = metrics.riskScore;
    }
    if (metrics.threatLevel) {
        this.securityMetrics.threatLevel = metrics.threatLevel;
    }
    if (metrics.anomalyDetected !== undefined) {
        this.securityMetrics.anomalyDetected = metrics.anomalyDetected;
    }
    this.securityMetrics.lastSecurityScan = new Date();

    await this.save();
};

// Method to revoke key
apiKeySchema.methods.revoke = async function (reason, revokedBy) {
    this.status = 'revoked';
    this.metadata.revokedAt = new Date();
    this.metadata.revokeReason = reason;
    this.metadata.revokedBy = revokedBy;

    await this.save();
};

// Pre-save middleware to set next rotation date
apiKeySchema.pre('save', function (next) {
    if (this.isNew && this.rotationSchedule.enabled) {
        const nextRotation = new Date();
        nextRotation.setDate(nextRotation.getDate() + this.rotationSchedule.intervalDays);
        this.rotationSchedule.nextRotation = nextRotation;
    }
    next();
});

export default mongoose.model('ApiKey', apiKeySchema);
