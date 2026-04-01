import ApiKey from '../models/ApiKey.js';
import AuditLog from '../models/AuditLog.js';
import { analyzeUsagePatterns, analyzeOptimization } from '../services/aiService.js';

/**
 * @desc    Get usage analytics for user's API keys
 * @route   GET /api/v1/analytics/usage
 * @access  Private
 */
export const getUsageAnalytics = async (req, res) => {
    try {
        const { timeRange = '7d', apiKeyId } = req.query;

        // Calculate date range
        const now = new Date();
        const daysMap = { '1d': 1, '7d': 7, '30d': 30, '90d': 90 };
        const days = daysMap[timeRange] || 7;
        const startDate = new Date(now - days * 24 * 60 * 60 * 1000);

        // Build filter
        const filter = { user: req.user._id };
        if (apiKeyId) filter._id = apiKeyId;

        // Get API keys
        const apiKeys = await ApiKey.find(filter);

        if (apiKeys.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No API keys found'
            });
        }

        // Aggregate usage data
        const totalStats = apiKeys.reduce((acc, key) => {
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

        // Get request logs for time-based analytics
        const requestLogs = await AuditLog.find({
            user: req.user._id,
            action: 'api_key_accessed',
            createdAt: { $gte: startDate }
        }).sort('createdAt');

        // Group by date
        const dailyStats = {};
        requestLogs.forEach(log => {
            const date = log.createdAt.toISOString().split('T')[0];
            if (!dailyStats[date]) {
                dailyStats[date] = { requests: 0, success: 0, failed: 0 };
            }
            dailyStats[date].requests++;
            if (log.success) {
                dailyStats[date].success++;
            } else {
                dailyStats[date].failed++;
            }
        });

        // Calculate success rate
        const successRate = totalStats.totalRequests > 0
            ? ((totalStats.successfulRequests / totalStats.totalRequests) * 100).toFixed(2)
            : 0;

        res.status(200).json({
            success: true,
            data: {
                summary: {
                    ...totalStats,
                    successRate: parseFloat(successRate),
                    timeRange,
                    apiKeysCount: apiKeys.length
                },
                dailyBreakdown: dailyStats,
                apiKeys: apiKeys.map(key => ({
                    id: key._id,
                    name: key.name,
                    totalRequests: key.usageStats.totalRequests,
                    successRate: key.usageStats.totalRequests > 0
                        ? ((key.usageStats.successfulRequests / key.usageStats.totalRequests) * 100).toFixed(2)
                        : 0,
                    lastUsed: key.lastUsedAt
                }))
            }
        });
    } catch (error) {
        console.error('Usage analytics error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching usage analytics',
            error: error.message
        });
    }
};

/**
 * @desc    Get request history
 * @route   GET /api/v1/analytics/request-history
 * @access  Private
 */
export const getRequestHistory = async (req, res) => {
    try {
        const { apiKeyId, page = 1, limit = 50, status } = req.query;

        const filter = {
            user: req.user._id,
            action: 'api_key_accessed'
        };

        if (apiKeyId) filter.apiKey = apiKeyId;
        if (status === 'success') filter.success = true;
        if (status === 'failed') filter.success = false;

        const logs = await AuditLog.find(filter)
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
            message: 'Error fetching request history',
            error: error.message
        });
    }
};

/**
 * @desc    Get AI-powered usage insights
 * @route   GET /api/v1/analytics/ai-insights
 * @access  Private
 */
export const getAIInsights = async (req, res) => {
    try {
        const { apiKeyId } = req.query;

        const filter = { user: req.user._id };
        if (apiKeyId) filter._id = apiKeyId;

        const apiKeys = await ApiKey.find(filter);

        if (apiKeys.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No API keys found'
            });
        }

        // Aggregate usage data
        const totalStats = apiKeys.reduce((acc, key) => {
            acc.totalRequests += key.usageStats.totalRequests || 0;
            acc.successfulRequests += key.usageStats.successfulRequests || 0;
            acc.failedRequests += key.usageStats.failedRequests || 0;
            return acc;
        }, {
            totalRequests: 0,
            successfulRequests: 0,
            failedRequests: 0
        });

        // Get unique IPs from recent logs
        const recentLogs = await AuditLog.find({
            user: req.user._id,
            action: 'api_key_accessed',
            createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
        });

        const uniqueIPs = [...new Set(recentLogs.map(log => log.ipAddress))].length;

        // Prepare data for AI analysis
        const usageData = {
            totalRequests: totalStats.totalRequests,
            failedRequests: totalStats.failedRequests,
            successRate: totalStats.totalRequests > 0
                ? ((totalStats.successfulRequests / totalStats.totalRequests) * 100).toFixed(2)
                : 0,
            avgResponseTime: 150, // Mock data - would come from actual metrics
            uniqueIPs,
            requestDistribution: {}, // Mock data
            timeRange: '7 days'
        };

        // Get AI analysis
        const aiAnalysis = await analyzeUsagePatterns(usageData);

        res.status(200).json({
            success: true,
            data: {
                usageData,
                aiAnalysis,
                generatedAt: new Date()
            }
        });
    } catch (error) {
        console.error('AI Insights error:', error);
        res.status(500).json({
            success: false,
            message: 'Error generating AI insights',
            error: error.message
        });
    }
};

/**
 * @desc    Get performance metrics
 * @route   GET /api/v1/analytics/performance
 * @access  Private
 */
export const getPerformanceMetrics = async (req, res) => {
    try {
        const { apiKeyId } = req.query;

        // Get recent request logs
        const filter = {
            user: req.user._id,
            action: 'api_key_accessed',
            createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
        };

        if (apiKeyId) filter.apiKey = apiKeyId;

        const logs = await AuditLog.find(filter);

        // Calculate metrics
        const responseTimes = logs
            .filter(log => log.requestMetadata?.responseTime)
            .map(log => log.requestMetadata.responseTime);

        const avgResponseTime = responseTimes.length > 0
            ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
            : 0;

        const peakResponseTime = responseTimes.length > 0
            ? Math.max(...responseTimes)
            : 0;

        const errorRate = logs.length > 0
            ? ((logs.filter(log => !log.success).length / logs.length) * 100).toFixed(2)
            : 0;

        const performanceData = {
            avgResponseTime: avgResponseTime.toFixed(2),
            peakResponseTime,
            requestVolume: logs.length,
            errorRate: parseFloat(errorRate),
            cacheHitRate: 0, // Mock data
            dbQueryTime: 0 // Mock data
        };

        // Get AI optimization suggestions
        const aiSuggestions = await analyzeOptimization(performanceData);

        res.status(200).json({
            success: true,
            data: {
                metrics: performanceData,
                aiOptimizations: aiSuggestions,
                period: '24 hours',
                generatedAt: new Date()
            }
        });
    } catch (error) {
        console.error('Performance metrics error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching performance metrics',
            error: error.message
        });
    }
};

/**
 * @desc    Export usage report
 * @route   GET /api/v1/analytics/export
 * @access  Private
 */
export const exportReport = async (req, res) => {
    try {
        const { format = 'json', timeRange = '30d' } = req.query;

        // Calculate date range
        const now = new Date();
        const daysMap = { '7d': 7, '30d': 30, '90d': 90 };
        const days = daysMap[timeRange] || 30;
        const startDate = new Date(now - days * 24 * 60 * 60 * 1000);

        // Get all user's API keys
        const apiKeys = await ApiKey.find({ user: req.user._id });

        // Get request logs
        const logs = await AuditLog.find({
            user: req.user._id,
            action: 'api_key_accessed',
            createdAt: { $gte: startDate }
        }).populate('apiKey', 'name prefix');

        const reportData = {
            generatedAt: new Date(),
            timeRange,
            user: {
                id: req.user._id,
                name: req.user.name,
                email: req.user.email
            },
            summary: {
                totalApiKeys: apiKeys.length,
                totalRequests: logs.length,
                successfulRequests: logs.filter(log => log.success).length,
                failedRequests: logs.filter(log => !log.success).length
            },
            apiKeys: apiKeys.map(key => ({
                id: key._id,
                name: key.name,
                status: key.status,
                totalRequests: key.usageStats.totalRequests,
                bandwidthUsed: key.usageStats.bandwidthUsed,
                lastUsed: key.lastUsedAt
            })),
            requestLogs: logs.map(log => ({
                timestamp: log.createdAt,
                apiKey: log.apiKey?.name,
                success: log.success,
                ipAddress: log.ipAddress,
                endpoint: log.requestMetadata?.endpoint,
                statusCode: log.requestMetadata?.statusCode,
                responseTime: log.requestMetadata?.responseTime
            }))
        };

        if (format === 'csv') {
            // Convert to CSV format
            let csv = 'Timestamp,API Key,Success,IP Address,Endpoint,Status Code,Response Time\n';
            reportData.requestLogs.forEach(log => {
                csv += `${log.timestamp},${log.apiKey},${log.success},${log.ipAddress},${log.endpoint},${log.statusCode},${log.responseTime}\n`;
            });

            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', `attachment; filename=usage-report-${Date.now()}.csv`);
            return res.send(csv);
        }

        // Default JSON format
        res.status(200).json({
            success: true,
            data: reportData
        });
    } catch (error) {
        console.error('Export report error:', error);
        res.status(500).json({
            success: false,
            message: 'Error exporting report',
            error: error.message
        });
    }
};

export default {
    getUsageAnalytics,
    getRequestHistory,
    getAIInsights,
    getPerformanceMetrics,
    exportReport
};
