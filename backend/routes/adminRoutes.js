import express from 'express';
import {
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
} from '../controllers/adminController.js';
import { protect, adminOnly } from '../middleware/auth.js';
import { auditLog } from '../middleware/auditLogger.js';

const router = express.Router();

// All routes require authentication and admin role
router.use(protect);
router.use(adminOnly);

router.get('/dashboard', auditLog('admin_dashboard_view', 'admin'), getDashboard);
router.get('/users', auditLog('admin_users_view', 'admin'), getAllUsers);
router.put('/users/:id/status', auditLog('admin_user_status_update', 'admin'), updateUserStatus);
router.get('/api-keys', auditLog('admin_api_keys_view', 'admin'), getAllApiKeys);
router.delete('/api-keys/:id', auditLog('admin_api_key_revoke', 'admin'), revokeApiKey);
router.post('/api-keys/:id/force-rotate', auditLog('admin_force_rotation', 'admin'), forceRotateKey);
router.get('/alerts', auditLog('admin_alerts_view', 'admin'), getAllAlerts);
router.get('/audit-logs', auditLog('admin_audit_logs_view', 'admin'), getAuditLogs);
router.get('/ai-security-audit', auditLog('admin_ai_audit', 'admin'), getAISecurityAudit);
router.get('/threat-intelligence', auditLog('admin_threat_intel', 'admin'), getThreatIntelligence);

export default router;
