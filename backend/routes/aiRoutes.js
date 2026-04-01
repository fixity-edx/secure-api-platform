import express from 'express';
import { protect } from '../middleware/auth.js';
import {
    analyzeUsagePatterns,
    detectCredentialLeakage,
    generateSecurityRecommendations,
    analyzeOptimization,
    predictSecurityBreach
} from '../services/aiService.js';

const router = express.Router();

router.use(protect);

/**
 * @desc    Get AI security recommendations
 * @route   GET /api/v1/ai/recommendations
 * @access  Private
 */
router.get('/recommendations', async (req, res) => {
    try {
        const securityData = {
            activeKeys: 5,
            expiredKeys: 2,
            highRiskKeys: 1,
            recentIncidents: 3,
            complianceScore: 85,
            lastAudit: new Date().toISOString()
        };

        const recommendations = await generateSecurityRecommendations(securityData);

        res.status(200).json({
            success: true,
            data: recommendations
        });
    } catch (error) {
        // Return fallback if AI not configured
        if (error.message && error.message.includes('not configured')) {
            return res.status(200).json({
                success: true,
                data: {
                    priorityRecommendations: [
                        'Rotate API keys regularly (every 90 days)',
                        'Enable rate limiting on all API keys',
                        'Monitor for unusual access patterns',
                        'Implement IP whitelisting where possible',
                        'Review and revoke unused API keys'
                    ],
                    quickWins: [
                        'Enable two-factor authentication',
                        'Set up alert notifications'
                    ],
                    longTermImprovements: [
                        'Implement automated key rotation',
                        'Deploy advanced threat detection'
                    ],
                    complianceGaps: [],
                    securityPosture: 'Good',
                    note: 'AI service not configured - showing default recommendations'
                }
            });
        }

        res.status(500).json({
            success: false,
            message: 'Error generating recommendations',
            error: error.message
        });
    }
});

/**
 * @desc    Analyze usage patterns
 * @route   POST /api/v1/ai/analyze-usage
 * @access  Private
 */
router.post('/analyze-usage', async (req, res) => {
    try {
        const { usageData } = req.body;

        if (!usageData) {
            return res.status(400).json({
                success: false,
                message: 'Usage data is required'
            });
        }

        const analysis = await analyzeUsagePatterns(usageData);

        res.status(200).json({
            success: true,
            data: analysis
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error analyzing usage patterns',
            error: error.message
        });
    }
});

/**
 * @desc    Detect credential leakage
 * @route   POST /api/v1/ai/detect-leakage
 * @access  Private
 */
router.post('/detect-leakage', async (req, res) => {
    try {
        const { keyData } = req.body;

        if (!keyData) {
            return res.status(400).json({
                success: false,
                message: 'Key data is required'
            });
        }

        const analysis = await detectCredentialLeakage(keyData);

        res.status(200).json({
            success: true,
            data: analysis
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error detecting credential leakage',
            error: error.message
        });
    }
});

/**
 * @desc    Get optimization suggestions
 * @route   POST /api/v1/ai/optimize
 * @access  Private
 */
router.post('/optimize', async (req, res) => {
    try {
        const { performanceData } = req.body;

        if (!performanceData) {
            return res.status(400).json({
                success: false,
                message: 'Performance data is required'
            });
        }

        const suggestions = await analyzeOptimization(performanceData);

        res.status(200).json({
            success: true,
            data: suggestions
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error generating optimization suggestions',
            error: error.message
        });
    }
});

/**
 * @desc    Predict security breach
 * @route   POST /api/v1/ai/predict-breach
 * @access  Private
 */
router.post('/predict-breach', async (req, res) => {
    try {
        const { threatData } = req.body;

        if (!threatData) {
            return res.status(400).json({
                success: false,
                message: 'Threat data is required'
            });
        }

        const prediction = await predictSecurityBreach(threatData);

        res.status(200).json({
            success: true,
            data: prediction
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error predicting security breach',
            error: error.message
        });
    }
});

export default router;
