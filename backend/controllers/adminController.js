import User from '../models/User.js';
import ApiKey from '../models/ApiKey.js';
import Alert from '../models/Alert.js';
import AuditLog from '../models/AuditLog.js';
import { logAction } from '../middleware/auditLogger.js';
import { analyzeUsagePatterns, generateSecurityRecommendations, predictSecurityBreach } from '../services/aiService.js';

/**
 * @desc    Get dashboard statistics
 * @route   GET /api/v1/admin/dashboard
 * @access  Private/Admin
 */
export const getDashboard = async (req, res) => {
    try {
        const [
            totalUsers,
            totalApiKeys,
            activeApiKeys,
            expiredKeys,
            totalAlerts,
            criticalAlerts,
            recentLogs
        ] = await Promise.all([
            User.countDocuments({ role: { $ne: 'admin' } }),
            ApiKey.countDocuments(),
            ApiKey.countDocuments({ status: 'active' }),
            ApiKey.countDocuments({ status: 'expired' }),
            Alert.countDocuments(),
            Alert.countDocuments({ severity: 'critical', status: { $ne: 'resolved' } }),
            AuditLog.find().sort('-createdAt').limit(10)
        ]);

        // Calculate total requests
        const usageAggregation = await ApiKey.aggregate([
            {
                $group: {
                    _id: null,
                    totalRequests: { $sum: '$usageStats.totalRequests' },
                    successfulRequests: { $sum: '$usageStats.successfulRequests' },
                    failedRequests: { $sum: '$usageStats.failedRequests' }
                }
            }
        ]);

        const usage = usageAggregation[0] || {
            totalRequests: 0,
            successfulRequests: 0,
            failedRequests: 0
        };

        res.status(200).json({
            success: true,
            data: {
                overview: {
                    totalUsers,
                    totalApiKeys,
                    activeApiKeys,
                    expiredKeys,
                    totalAlerts,
                    criticalAlerts
                },
                usage: {
                    totalRequests: usage.totalRequests,
                    successfulRequests: usage.successfulRequests,
                    failedRequests: usage.failedRequests,
                    successRate: usage.totalRequests > 0
                        ? ((usage.successfulRequests / usage.totalRequests) * 100).toFixed(2)
                        : 0
                },
                recentActivity: recentLogs
            }
        });
    } catch (error) {
        console.error('Dashboard error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching dashboard data',
            error: error.message
        });
    }
};

/**
 * @desc    Get all users
 * @route   GET /api/v1/admin/users
 * @access  Private/Admin
 */
export const getAllUsers = async (req, res) => {
    try {
        const { role, isActive, page = 1, limit = 20 } = req.query;

        const filter = { role: { $ne: 'admin' } };
        if (role) filter.role = role;
        if (isActive !== undefined) filter.isActive = isActive === 'true';

        const users = await User.find(filter)
            .select('-password -refreshToken')
            .sort('-createdAt')
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const count = await User.countDocuments(filter);

        res.status(200).json({
            success: true,
            count,
            totalPages: Math.ceil(count / limit),
            currentPage: parseInt(page),
            data: users
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching users',
            error: error.message
        });
    }
};

/**
 * @desc    Get all API keys (global)
 * @route   GET /api/v1/admin/api-keys
 * @access  Private/Admin
 */
export const getAllApiKeys = async (req, res) => {
    try {
        const { status, environment, page = 1, limit = 20 } = req.query;

        const filter = {};
        if (status) filter.status = status;
        if (environment) filter.environment = environment;

        const keys = await ApiKey.find(filter)
            .populate('user', 'name email role')
            .select('-key -hashedKey')
            .sort('-createdAt')
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const count = await ApiKey.countDocuments(filter);

        res.status(200).json({
            success: true,
            count,
            totalPages: Math.ceil(count / limit),
            currentPage: parseInt(page),
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
 * @desc    Revoke any API key (admin)
 * @route   DELETE /api/v1/admin/api-keys/:id
 * @access  Private/Admin
 */
export const revokeApiKey = async (req, res) => {
    try {
        const { reason } = req.body;

        const key = await ApiKey.findById(req.params.id);

        if (!key) {
            return res.status(404).json({
                success: false,
                message: 'API key not found'
            });
        }

        await key.revoke(reason || 'Admin revoked', req.user.email);

        // Log action
        await logAction({
            user: req.user._id,
            apiKey: key._id,
            action: 'admin_action',
            resource: 'api_key',
            resourceId: key._id.toString(),
            severity: 'warning',
            details: { action: 'revoke', reason }
        });

        // Create alert for the key owner
        await Alert.create({
            user: key.user,
            apiKey: key._id,
            type: 'key_compromised',
            severity: 'high',
            title: 'API Key Revoked by Admin',
            message: `Your API key "${key.name}" has been revoked by an administrator.`,
            details: { reason, revokedBy: req.user.email }
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
 * @desc    Force rotate API key
 * @route   POST /api/v1/admin/api-keys/:id/force-rotate
 * @access  Private/Admin
 */
export const forceRotateKey = async (req, res) => {
    try {
        const key = await ApiKey.findById(req.params.id);

        if (!key) {
            return res.status(404).json({
                success: false,
                message: 'API key not found'
            });
        }

        // Mark for rotation by setting next rotation to now
        key.rotationSchedule.nextRotation = new Date();
        await key.save();

        // Log action
        await logAction({
            user: req.user._id,
            apiKey: key._id,
            action: 'admin_action',
            resource: 'api_key',
            resourceId: key._id.toString(),
            severity: 'warning',
            details: { action: 'force_rotation' }
        });

        // Create alert for the key owner
        await Alert.create({
            user: key.user,
            apiKey: key._id,
            type: 'key_expiring',
            severity: 'medium',
            title: 'API Key Rotation Required',
            message: `Your API key "${key.name}" requires immediate rotation as mandated by administrator.`,
            details: { forcedBy: req.user.email }
        });

        res.status(200).json({
            success: true,
            message: 'API key marked for immediate rotation'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error forcing key rotation',
            error: error.message
        });
    }
};

/**
 * @desc    Get all alerts
 * @route   GET /api/v1/admin/alerts
 * @access  Private/Admin
 */
export const getAllAlerts = async (req, res) => {
    try {
        const { severity, status, type, page = 1, limit = 20 } = req.query;

        const filter = {};
        if (severity) filter.severity = severity;
        if (status) filter.status = status;
        if (type) filter.type = type;

        const alerts = await Alert.find(filter)
            .populate('user', 'name email')
            .populate('apiKey', 'name prefix')
            .sort('-createdAt')
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const count = await Alert.countDocuments(filter);

        res.status(200).json({
            success: true,
            count,
            totalPages: Math.ceil(count / limit),
            currentPage: parseInt(page),
            data: alerts
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching alerts',
            error: error.message
        });
    }
};

/**
 * @desc    Get audit logs
 * @route   GET /api/v1/admin/audit-logs
 * @access  Private/Admin
 */
export const getAuditLogs = async (req, res) => {
    try {
        const { action, severity, userId, page = 1, limit = 50 } = req.query;

        const filter = {};
        if (action) filter.action = action;
        if (severity) filter.severity = severity;
        if (userId) filter.user = userId;

        const logs = await AuditLog.find(filter)
            .populate('user', 'name email')
            .populate('apiKey', 'name prefix')
            .sort('-createdAt')
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const count = await AuditLog.countDocuments(filter);

        res.status(200).json({
            success: true,
            count,
            totalPages: Math.ceil(count / limit),
            currentPage: parseInt(page),
            data: logs
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching audit logs',
            error: error.message
        });
    }
};

/**
 * @desc    Get AI security audit report
 * @route   GET /api/v1/admin/ai-security-audit
 * @access  Private/Admin
 */
export const getAISecurityAudit = async (req, res) => {
    try {
        // Gather security metrics
        const [
            activeKeys,
            expiredKeys,
            highRiskKeys,
            recentIncidents,
            totalAlerts
        ] = await Promise.all([
            ApiKey.countDocuments({ status: 'active' }),
            ApiKey.countDocuments({ status: 'expired' }),
            ApiKey.countDocuments({ 'securityMetrics.threatLevel': { $in: ['high', 'critical'] } }),
            Alert.countDocuments({
                createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
                severity: { $in: ['high', 'critical'] }
            }),
            Alert.countDocuments()
        ]);

        const securityData = {
            activeKeys,
            expiredKeys,
            highRiskKeys,
            recentIncidents,
            complianceScore: Math.max(0, 100 - (highRiskKeys * 5) - (expiredKeys * 2)),
            lastAudit: new Date().toISOString()
        };

        // Get AI recommendations with fallback
        let aiRecommendations;
        try {
            aiRecommendations = await generateSecurityRecommendations(securityData);
        } catch (error) {
            // Fallback recommendations if AI not configured
            aiRecommendations = {
                priorityRecommendations: ['Rotate API keys regularly', 'Enable rate limiting', 'Monitor for unusual access patterns'],
                quickWins: ['Enable two-factor authentication', 'Set up alert notifications'],
                longTermImprovements: ['Implement automated key rotation', 'Deploy advanced threat detection'],
                complianceGaps: [],
                securityPosture: 'Good',
                note: 'AI service not configured - showing default recommendations'
            };
        }

        res.status(200).json({
            success: true,
            data: {
                securityMetrics: securityData,
                aiAnalysis: aiRecommendations,
                generatedAt: new Date()
            }
        });
    } catch (error) {
        console.error('AI Security Audit error:', error);
        res.status(500).json({
            success: false,
            message: 'Error generating AI security audit',
            error: error.message
        });
    }
};

/**
 * @desc    Get threat intelligence dashboard
 * @route   GET /api/v1/admin/threat-intelligence
 * @access  Private/Admin
 */
export const getThreatIntelligence = async (req, res) => {
    try {
        // Gather threat data
        const [
            suspiciousActivity,
            failedLogins,
            rateLimitViolations,
            compromisedKeys
        ] = await Promise.all([
            AuditLog.countDocuments({
                action: 'anomaly_detected',
                createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
            }),
            AuditLog.countDocuments({
                action: 'user_login',
                success: false,
                createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
            }),
            AuditLog.countDocuments({
                action: 'rate_limit_exceeded',
                createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
            }),
            ApiKey.countDocuments({ status: 'compromised' })
        ]);

        // Get recent security events
        const recentEvents = await AuditLog.find({
            severity: { $in: ['error', 'critical'] },
            createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
        }).sort('-createdAt').limit(10);

        const threatData = {
            suspiciousActivityCount: suspiciousActivity,
            failedLoginAttempts: failedLogins,
            unusualAccessPatterns: rateLimitViolations,
            knownThreatIPs: 0,
            vulnerabilityScore: Math.min(100, suspiciousActivity + failedLogins + compromisedKeys),
            recentEvents: recentEvents.map(e => ({
                action: e.action,
                severity: e.severity,
                timestamp: e.createdAt
            }))
        };

        // Get AI breach prediction with fallback
        let aiPrediction;
        try {
            aiPrediction = await predictSecurityBreach(threatData);
        } catch (error) {
            // Fallback prediction if AI not configured
            aiPrediction = {
                breachProbability: threatData.vulnerabilityScore,
                timeToBreach: 'Unknown - AI service not configured',
                attackVectors: ['Brute force attacks', 'Credential stuffing', 'API abuse'],
                preventiveMeasures: ['Enable rate limiting', 'Implement IP whitelisting', 'Monitor failed login attempts'],
                monitoringFocus: ['Failed authentication attempts', 'Unusual traffic patterns', 'Geographic anomalies'],
                note: 'AI service not configured - showing basic threat assessment'
            };
        }

        res.status(200).json({
            success: true,
            data: {
                threatMetrics: threatData,
                aiPrediction,
                generatedAt: new Date()
            }
        });
    } catch (error) {
        console.error('Threat Intelligence error:', error);
        res.status(500).json({
            success: false,
            message: 'Error generating threat intelligence',
            error: error.message
        });
    }
};

/**
 * @desc    Update user status
 * @route   PUT /api/v1/admin/users/:id/status
 * @access  Private/Admin
 */
export const updateUserStatus = async (req, res) => {
    try {
        const { isActive } = req.body;

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { isActive },
            { new: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Log action
        await logAction({
            user: req.user._id,
            action: 'admin_action',
            resource: 'user',
            resourceId: user._id.toString(),
            severity: 'warning',
            details: { action: 'status_update', isActive }
        });

        res.status(200).json({
            success: true,
            message: 'User status updated successfully',
            data: user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating user status',
            error: error.message
        });
    }
};

export default {
    getDashboard,
    getAllUsers,
    getAllApiKeys,
    revokeApiKey,
    forceRotateKey,
    getAllAlerts,
    getAuditLogs,
    getAISecurityAudit,
    getThreatIntelligence,
    updateUserStatus
};
