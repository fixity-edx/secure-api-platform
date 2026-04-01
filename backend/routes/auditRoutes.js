import express from 'express';
import { protect } from '../middleware/auth.js';
import AuditLog from '../models/AuditLog.js';

const router = express.Router();

router.use(protect);

/**
 * @desc    Get user's audit logs
 * @route   GET /api/v1/audit
 * @access  Private
 */
router.get('/', async (req, res) => {
    try {
        const { action, severity, page = 1, limit = 50 } = req.query;

        const filter = { user: req.user._id };
        if (action) filter.action = action;
        if (severity) filter.severity = severity;

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
            message: 'Error fetching audit logs',
            error: error.message
        });
    }
});

/**
 * @desc    Get single audit log
 * @route   GET /api/v1/audit/:id
 * @access  Private
 */
router.get('/:id', async (req, res) => {
    try {
        const log = await AuditLog.findOne({
            _id: req.params.id,
            user: req.user._id
        }).populate('apiKey', 'name prefix');

        if (!log) {
            return res.status(404).json({
                success: false,
                message: 'Audit log not found'
            });
        }

        res.status(200).json({
            success: true,
            data: log
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching audit log',
            error: error.message
        });
    }
});

export default router;
