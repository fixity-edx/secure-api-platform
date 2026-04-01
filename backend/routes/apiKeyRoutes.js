import express from 'express';
import {
    generateKey,
    getMyKeys,
    getKey,
    updateKey,
    revokeKey,
    rotateKey,
    getKeyUsage,
    runSecurityScan
} from '../controllers/apiKeyController.js';
import { protect } from '../middleware/auth.js';
import { auditLog } from '../middleware/auditLogger.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

router.route('/')
    .get(auditLog('api_key_list', 'api_key'), getMyKeys)
    .post(auditLog('api_key_created', 'api_key'), generateKey);

router.route('/:id')
    .get(auditLog('api_key_view', 'api_key'), getKey)
    .put(auditLog('api_key_updated', 'api_key'), updateKey)
    .delete(auditLog('api_key_revoked', 'api_key'), revokeKey);

router.post('/:id/rotate', auditLog('api_key_rotated', 'api_key'), rotateKey);
router.get('/:id/usage', auditLog('api_key_usage_view', 'api_key'), getKeyUsage);
router.post('/:id/security-scan', auditLog('security_scan', 'api_key'), runSecurityScan);

export default router;
