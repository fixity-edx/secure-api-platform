import express from 'express';
import { protect, vendorOnly } from '../middleware/auth.js';
import ApiKey from '../models/ApiKey.js';
import AuditLog from '../models/AuditLog.js';

const router = express.Router();

router.use(protect);
router.use(vendorOnly);

/**
 * @desc    Get vendor dashboard
 * @route   GET /api/v1/vendor/dashboard
 * @access  Private/Vendor
 */
router.get('/dashboard', async (req, res) => {
    try {
        const apiKeys = await ApiKey.find({ user: req.user._id });

        const stats = apiKeys.reduce((acc, key) => {
            acc.totalRequests += key.usageStats.totalRequests || 0;
            acc.successfulRequests += key.usageStats.successfulRequests || 0;
            acc.failedRequests += key.usageStats.failedRequests || 0;
            acc.bandwidthUsed += key.usageStats.bandwidthUsed || 0;
            return acc;
        }, {
            totalRequests: 0,
            successfulRequests: 0,
            failedRequests: 0,
            bandwidthUsed: 0
        });

        res.status(200).json({
            success: true,
            data: {
                totalApiKeys: apiKeys.length,
                activeKeys: apiKeys.filter(k => k.status === 'active').length,
                stats,
                successRate: stats.totalRequests > 0
                    ? ((stats.successfulRequests / stats.totalRequests) * 100).toFixed(2)
                    : 0
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching vendor dashboard',
            error: error.message
        });
    }
});

/**
 * @desc    Get API consumption analytics
 * @route   GET /api/v1/vendor/consumption
 * @access  Private/Vendor
 */
router.get('/consumption', async (req, res) => {
    try {
        const { timeRange = '7d' } = req.query;

        const daysMap = { '1d': 1, '7d': 7, '30d': 30 };
        const days = daysMap[timeRange] || 7;
        const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

        const logs = await AuditLog.find({
            user: req.user._id,
            action: 'api_key_accessed',
            createdAt: { $gte: startDate }
        }).sort('createdAt');

        // Group by date
        const dailyConsumption = {};
        logs.forEach(log => {
            const date = log.createdAt.toISOString().split('T')[0];
            if (!dailyConsumption[date]) {
                dailyConsumption[date] = { requests: 0, bandwidth: 0 };
            }
            dailyConsumption[date].requests++;
            dailyConsumption[date].bandwidth += log.requestMetadata?.requestSize || 0;
        });

        res.status(200).json({
            success: true,
            data: {
                timeRange,
                dailyConsumption,
                totalRequests: logs.length
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching consumption analytics',
            error: error.message
        });
    }
});

/**
 * @desc    Get rate limit status
 * @route   GET /api/v1/vendor/rate-limits
 * @access  Private/Vendor
 */
router.get('/rate-limits', async (req, res) => {
    try {
        const apiKeys = await ApiKey.find({
            user: req.user._id,
            status: 'active'
        });

        const rateLimitStatus = apiKeys.map(key => ({
            keyId: key._id,
            keyName: key.name,
            limits: key.rateLimit,
            currentUsage: {
                totalRequests: key.usageStats.totalRequests,
                lastRequest: key.lastUsedAt
            }
        }));

        res.status(200).json({
            success: true,
            data: rateLimitStatus
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching rate limit status',
            error: error.message
        });
    }
});

export default router;
