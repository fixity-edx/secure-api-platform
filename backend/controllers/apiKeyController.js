import ApiKey from '../models/ApiKey.js';
import Alert from '../models/Alert.js';
import { generateApiKey, hashApiKey, encrypt } from '../utils/encryption.js';
import { logAction } from '../middleware/auditLogger.js';
import { detectCredentialLeakage } from '../services/aiService.js';

/**
 * @desc    Generate new API key
 * @route   POST /api/v1/api-keys
 * @access  Private
 */
export const generateKey = async (req, res) => {
    try {
        const {
            name,
            environment,
            permissions,
            rateLimit,
            ipWhitelist,
            allowedDomains,
            expiresInDays,
            rotationIntervalDays
        } = req.body;

        // Generate API key
        const apiKey = generateApiKey();
        const hashedKey = hashApiKey(apiKey);
        const prefix = apiKey.substring(0, 5);

        // Calculate expiration date
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + (expiresInDays || 365));

        // Create API key document
        const keyDoc = await ApiKey.create({
            user: req.user._id,
            name,
            key: apiKey, // Store temporarily for response
            hashedKey,
            prefix,
            environment: environment || 'development',
            permissions: permissions || [],
            rateLimit: rateLimit || {
                requestsPerMinute: 60,
                requestsPerHour: 1000,
                requestsPerDay: 10000
            },
            ipWhitelist: ipWhitelist || [],
            allowedDomains: allowedDomains || [],
            expiresAt,
            rotationSchedule: {
                enabled: true,
                intervalDays: rotationIntervalDays || 90
            },
            metadata: {
                description: req.body.description,
                tags: req.body.tags || [],
                createdBy: req.user.email
            }
        });

        // Log action
        await logAction({
            user: req.user._id,
            apiKey: keyDoc._id,
            action: 'api_key_created',
            resource: 'api_key',
            resourceId: keyDoc._id.toString(),
            severity: 'info',
            details: { name, environment, prefix }
        });

        // Return the key (only time it's shown in plain text)
        const response = keyDoc.toObject();
        response.key = apiKey; // Include plain key in response
        delete response.hashedKey; // Remove hashed version

        res.status(201).json({
            success: true,
            message: 'API key generated successfully. Save this key securely - it will not be shown again.',
            data: response
        });
    } catch (error) {
        console.error('Generate key error:', error);
        res.status(500).json({
            success: false,
            message: 'Error generating API key',
            error: error.message
        });
    }
};

/**
 * @desc    Get all API keys for user
 * @route   GET /api/v1/api-keys
 * @access  Private
 */
export const getMyKeys = async (req, res) => {
    try {
        const { status, environment } = req.query;

        const filter = { user: req.user._id };
        if (status) filter.status = status;
        if (environment) filter.environment = environment;

        const keys = await ApiKey.find(filter).select('-key -hashedKey').sort('-createdAt');

        res.status(200).json({
            success: true,
            count: keys.length,
            data: keys
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching API keys',
            error: error.message
        });
    }
};

/**
 * @desc    Get single API key
 * @route   GET /api/v1/api-keys/:id
 * @access  Private
 */
export const getKey = async (req, res) => {
    try {
        const key = await ApiKey.findOne({
            _id: req.params.id,
            user: req.user._id
        }).select('-key -hashedKey');

        if (!key) {
            return res.status(404).json({
                success: false,
                message: 'API key not found'
            });
        }

        res.status(200).json({
            success: true,
            data: key
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching API key',
            error: error.message
        });
    }
};

/**
 * @desc    Update API key
 * @route   PUT /api/v1/api-keys/:id
 * @access  Private
 */
export const updateKey = async (req, res) => {
    try {
        const allowedUpdates = [
            'name',
            'status',
            'permissions',
            'rateLimit',
            'ipWhitelist',
            'allowedDomains',
            'rotationSchedule',
            'metadata'
        ];

        const updates = {};
        Object.keys(req.body).forEach(key => {
            if (allowedUpdates.includes(key)) {
                updates[key] = req.body[key];
            }
        });

        const key = await ApiKey.findOneAndUpdate(
            { _id: req.params.id, user: req.user._id },
            updates,
            { new: true, runValidators: true }
        ).select('-key -hashedKey');

        if (!key) {
            return res.status(404).json({
                success: false,
                message: 'API key not found'
            });
        }

        // Log action
        await logAction({
            user: req.user._id,
            apiKey: key._id,
            action: 'permission_changed',
            resource: 'api_key',
            resourceId: key._id.toString(),
            severity: 'info',
            details: { updates }
        });

        res.status(200).json({
            success: true,
            message: 'API key updated successfully',
            data: key
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating API key',
            error: error.message
        });
    }
};

/**
 * @desc    Revoke API key
 * @route   DELETE /api/v1/api-keys/:id
 * @access  Private
 */
export const revokeKey = async (req, res) => {
    try {
        const { reason } = req.body;

        const key = await ApiKey.findOne({
            _id: req.params.id,
            user: req.user._id
        });

        if (!key) {
            return res.status(404).json({
                success: false,
                message: 'API key not found'
            });
        }

        await key.revoke(reason || 'User revoked', req.user.email);

        // Log action
        await logAction({
            user: req.user._id,
            apiKey: key._id,
            action: 'api_key_revoked',
            resource: 'api_key',
            resourceId: key._id.toString(),
            severity: 'warning',
            details: { reason, name: key.name }
        });

        res.status(200).json({
            success: true,
            message: 'API key revoked successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error revoking API key',
            error: error.message
        });
    }
};

/**
 * @desc    Rotate API key
 * @route   POST /api/v1/api-keys/:id/rotate
 * @access  Private
 */
export const rotateKey = async (req, res) => {
    try {
        const oldKey = await ApiKey.findOne({
            _id: req.params.id,
            user: req.user._id
        });

        if (!oldKey) {
            return res.status(404).json({
                success: false,
                message: 'API key not found'
            });
        }

        // Generate new key
        const newApiKey = generateApiKey();
        const newHashedKey = hashApiKey(newApiKey);

        // Update key
        oldKey.key = newApiKey;
        oldKey.hashedKey = newHashedKey;
        oldKey.lastRotatedAt = new Date();

        // Update next rotation date
        if (oldKey.rotationSchedule.enabled) {
            const nextRotation = new Date();
            nextRotation.setDate(nextRotation.getDate() + oldKey.rotationSchedule.intervalDays);
            oldKey.rotationSchedule.nextRotation = nextRotation;
        }

        await oldKey.save();

        // Log action
        await logAction({
            user: req.user._id,
            apiKey: oldKey._id,
            action: 'api_key_rotated',
            resource: 'api_key',
            resourceId: oldKey._id.toString(),
            severity: 'info',
            details: { name: oldKey.name }
        });

        const response = oldKey.toObject();
        response.key = newApiKey;
        delete response.hashedKey;

        res.status(200).json({
            success: true,
            message: 'API key rotated successfully. Save this new key securely.',
            data: response
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error rotating API key',
            error: error.message
        });
    }
};

/**
 * @desc    Get API key usage statistics
 * @route   GET /api/v1/api-keys/:id/usage
 * @access  Private
 */
export const getKeyUsage = async (req, res) => {
    try {
        const key = await ApiKey.findOne({
            _id: req.params.id,
            user: req.user._id
        });

        if (!key) {
            return res.status(404).json({
                success: false,
                message: 'API key not found'
            });
        }

        const usageStats = {
            totalRequests: key.usageStats.totalRequests,
            successfulRequests: key.usageStats.successfulRequests,
            failedRequests: key.usageStats.failedRequests,
            successRate: key.usageStats.totalRequests > 0
                ? ((key.usageStats.successfulRequests / key.usageStats.totalRequests) * 100).toFixed(2)
                : 0,
            bandwidthUsed: key.usageStats.bandwidthUsed,
            lastRequestAt: key.usageStats.lastRequestAt,
            lastUsedAt: key.lastUsedAt,
            securityMetrics: key.securityMetrics
        };

        res.status(200).json({
            success: true,
            data: usageStats
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching usage statistics',
            error: error.message
        });
    }
};

/**
 * @desc    Run AI security scan on API key
 * @route   POST /api/v1/api-keys/:id/security-scan
 * @access  Private
 */
export const runSecurityScan = async (req, res) => {
    try {
        const key = await ApiKey.findOne({
            _id: req.params.id,
            user: req.user._id
        });

        if (!key) {
            return res.status(404).json({
                success: false,
                message: 'API key not found'
            });
        }

        // Prepare data for AI analysis
        const keyAge = Math.floor((new Date() - key.createdAt) / (1000 * 60 * 60 * 24));

        const analysisData = {
            keyAge,
            totalRequests: key.usageStats.totalRequests,
            uniqueIPs: key.ipWhitelist.length || 0,
            locations: [],
            sources: [],
            unusualActivity: key.securityMetrics.anomalyDetected,
            failedAuthAttempts: key.usageStats.failedRequests
        };

        // Run AI analysis
        const aiResult = await detectCredentialLeakage(analysisData);

        // Update security metrics
        await key.updateSecurityMetrics({
            riskScore: aiResult.leakageProbability || 0,
            threatLevel: aiResult.leakageProbability > 70 ? 'critical' :
                aiResult.leakageProbability > 50 ? 'high' :
                    aiResult.leakageProbability > 30 ? 'medium' : 'low',
            anomalyDetected: aiResult.leakageProbability > 50
        });

        // Create alert if high risk
        if (aiResult.leakageProbability > 50) {
            await Alert.create({
                user: req.user._id,
                apiKey: key._id,
                type: 'key_compromised',
                severity: aiResult.leakageProbability > 70 ? 'critical' : 'high',
                title: 'Potential API Key Compromise Detected',
                message: `AI analysis detected potential compromise of API key "${key.name}"`,
                details: aiResult,
                aiAnalysis: {
                    riskScore: aiResult.leakageProbability,
                    recommendations: aiResult.immediateActions || [],
                    confidence: aiResult.confidenceLevel === 'High' ? 90 :
                        aiResult.confidenceLevel === 'Medium' ? 60 : 30
                }
            });
        }

        res.status(200).json({
            success: true,
            message: 'Security scan completed',
            data: {
                keyId: key._id,
                keyName: key.name,
                scanResults: aiResult,
                updatedSecurityMetrics: key.securityMetrics
            }
        });
    } catch (error) {
        console.error('Security scan error:', error);
        res.status(500).json({
            success: false,
            message: 'Error running security scan',
            error: error.message
        });
    }
};

export default {
    generateKey,
    getMyKeys,
    getKey,
    updateKey,
    revokeKey,
    rotateKey,
    getKeyUsage,
    runSecurityScan
};
