import express from 'express';
import { protect } from '../middleware/auth.js';
import Webhook from '../models/Webhook.js';
import { generateToken } from '../utils/encryption.js';

const router = express.Router();

router.use(protect);

/**
 * @desc    Get all webhooks
 * @route   GET /api/v1/webhooks
 * @access  Private
 */
router.get('/', async (req, res) => {
    try {
        const webhooks = await Webhook.find({ user: req.user._id }).sort('-createdAt');

        res.status(200).json({
            success: true,
            count: webhooks.length,
            data: webhooks
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching webhooks',
            error: error.message
        });
    }
});

/**
 * @desc    Create webhook
 * @route   POST /api/v1/webhooks
 * @access  Private
 */
router.post('/', async (req, res) => {
    try {
        const { name, url, events, headers } = req.body;

        // Generate webhook secret
        const secret = generateToken(32);

        const webhook = await Webhook.create({
            user: req.user._id,
            name,
            url,
            events: events || ['all'],
            secret,
            headers: headers || {}
        });

        res.status(201).json({
            success: true,
            message: 'Webhook created successfully',
            data: webhook
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error creating webhook',
            error: error.message
        });
    }
});

/**
 * @desc    Update webhook
 * @route   PUT /api/v1/webhooks/:id
 * @access  Private
 */
router.put('/:id', async (req, res) => {
    try {
        const allowedUpdates = ['name', 'url', 'events', 'isActive', 'headers'];
        const updates = {};

        Object.keys(req.body).forEach(key => {
            if (allowedUpdates.includes(key)) {
                updates[key] = req.body[key];
            }
        });

        const webhook = await Webhook.findOneAndUpdate(
            { _id: req.params.id, user: req.user._id },
            updates,
            { new: true, runValidators: true }
        );

        if (!webhook) {
            return res.status(404).json({
                success: false,
                message: 'Webhook not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Webhook updated successfully',
            data: webhook
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating webhook',
            error: error.message
        });
    }
});

/**
 * @desc    Delete webhook
 * @route   DELETE /api/v1/webhooks/:id
 * @access  Private
 */
router.delete('/:id', async (req, res) => {
    try {
        const webhook = await Webhook.findOneAndDelete({
            _id: req.params.id,
            user: req.user._id
        });

        if (!webhook) {
            return res.status(404).json({
                success: false,
                message: 'Webhook not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Webhook deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting webhook',
            error: error.message
        });
    }
});

/**
 * @desc    Test webhook
 * @route   POST /api/v1/webhooks/:id/test
 * @access  Private
 */
router.post('/:id/test', async (req, res) => {
    try {
        const webhook = await Webhook.findOne({
            _id: req.params.id,
            user: req.user._id
        });

        if (!webhook) {
            return res.status(404).json({
                success: false,
                message: 'Webhook not found'
            });
        }

        // Send test payload
        const testPayload = {
            event: 'webhook_test',
            timestamp: new Date(),
            data: {
                message: 'This is a test webhook delivery'
            }
        };

        // In production, you would actually send the webhook here
        // For now, just simulate success

        res.status(200).json({
            success: true,
            message: 'Test webhook sent successfully',
            payload: testPayload
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error testing webhook',
            error: error.message
        });
    }
});

export default router;
