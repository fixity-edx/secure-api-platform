import express from 'express';
import {
    getUsageAnalytics,
    getRequestHistory,
    getAIInsights,
    getPerformanceMetrics,
    exportReport
} from '../controllers/analyticsController.js';
import { protect } from '../middleware/auth.js';
import { auditLog } from '../middleware/auditLogger.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

router.get('/usage', auditLog('analytics_usage_view', 'analytics'), getUsageAnalytics);
router.get('/request-history', auditLog('analytics_history_view', 'analytics'), getRequestHistory);
router.get('/ai-insights', auditLog('analytics_ai_insights', 'analytics'), getAIInsights);
router.get('/performance', auditLog('analytics_performance_view', 'analytics'), getPerformanceMetrics);
router.get('/export', auditLog('analytics_export', 'analytics'), exportReport);

export default router;
