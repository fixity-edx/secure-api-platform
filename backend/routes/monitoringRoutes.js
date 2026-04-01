import express from 'express';
import { protect } from '../middleware/auth.js';
import Alert from '../models/Alert.js';

const router = express.Router();

router.use(protect);

/**
 * @desc    Get user's alerts
 * @route   GET /api/v1/monitoring/alerts
 * @access  Private
 */
router.get('/alerts', async (req, res) => {
    try {
        const { status, severity, page = 1, limit = 20 } = req.query;

        const filter = { user: req.user._id };
        if (status) filter.status = status;
        if (severity) filter.severity = severity;

        const alerts = await Alert.find(filter)
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
});

/**
 * @desc    Acknowledge alert
 * @route   PUT /api/v1/monitoring/alerts/:id/acknowledge
 * @access  Private
 */
router.put('/alerts/:id/acknowledge', async (req, res) => {
    try {
        const alert = await Alert.findOneAndUpdate(
            { _id: req.params.id, user: req.user._id },
            {
                status: 'acknowledged',
                acknowledgedBy: req.user._id,
                acknowledgedAt: new Date()
            },
            { new: true }
        );

        if (!alert) {
            return res.status(404).json({
                success: false,
                message: 'Alert not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Alert acknowledged',
            data: alert
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error acknowledging alert',
            error: error.message
        });
    }
});

/**
 * @desc    Resolve alert
 * @route   PUT /api/v1/monitoring/alerts/:id/resolve
 * @access  Private
 */
router.put('/alerts/:id/resolve', async (req, res) => {
    try {
        const { resolution } = req.body;

        const alert = await Alert.findOneAndUpdate(
            { _id: req.params.id, user: req.user._id },
            {
                status: 'resolved',
                resolvedBy: req.user._id,
                resolvedAt: new Date(),
                resolution
            },
            { new: true }
        );

        if (!alert) {
            return res.status(404).json({
                success: false,
                message: 'Alert not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Alert resolved',
            data: alert
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error resolving alert',
            error: error.message
        });
    }
});

export default router;
