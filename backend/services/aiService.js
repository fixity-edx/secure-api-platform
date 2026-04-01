import axios from 'axios';

const GROK_API_KEY = process.env.GROQ_API_KEY || process.env.GROK_API_KEY;
const GROK_MODEL = process.env.GROK_MODEL || 'llama-3.1-8b-instant';
const GROK_ENDPOINT = process.env.GROK_ENDPOINT || 'https://api.groq.com/openai/v1/chat/completions';

/**
 * Check if AI service is configured
 */
const isAIConfigured = () => {
    return !!GROK_API_KEY;
};

/**
 * Call Grok AI API
 * @param {string} prompt - The prompt to send to AI
 * @param {object} options - Additional options
 * @returns {Promise<string>} - AI response
 */
export const callGrokAI = async (prompt, options = {}) => {
    // Return fallback if AI not configured
    if (!isAIConfigured()) {
        throw new Error('AI service not configured. Please set GROQ_API_KEY in environment variables.');
    }

    try {
        const response = await axios.post(
            GROK_ENDPOINT,
            {
                model: GROK_MODEL,
                messages: [
                    {
                        role: 'system',
                        content: options.systemPrompt || 'You are a security expert AI assistant specializing in API security, threat detection, and usage pattern analysis.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                temperature: options.temperature || 0.7,
                max_tokens: options.maxTokens || 1000
            },
            {
                headers: {
                    'Authorization': `Bearer ${GROK_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        return response.data.choices[0].message.content;
    } catch (error) {
        console.error('Grok AI Error:', error.response?.data || error.message);
        throw new Error('AI service unavailable');
    }
};

/**
 * Analyze API usage patterns for anomalies
 * @param {object} usageData - Usage statistics
 * @returns {Promise<object>} - Analysis result
 */
export const analyzeUsagePatterns = async (usageData) => {
    const prompt = `Analyze the following API usage data and identify any anomalies, suspicious patterns, or security concerns:

Usage Data:
- Total Requests: ${usageData.totalRequests}
- Failed Requests: ${usageData.failedRequests}
- Success Rate: ${usageData.successRate}%
- Average Response Time: ${usageData.avgResponseTime}ms
- Unique IPs: ${usageData.uniqueIPs}
- Request Distribution: ${JSON.stringify(usageData.requestDistribution)}
- Time Range: ${usageData.timeRange}

Provide a detailed analysis including:
1. Anomaly Detection (Yes/No and details)
2. Risk Level (Low/Medium/High/Critical)
3. Suspicious Patterns (if any)
4. Recommendations
5. Threat Score (0-100)

Format your response as JSON.`;

    try {
        const aiResponse = await callGrokAI(prompt, {
            systemPrompt: 'You are a cybersecurity AI expert. Analyze API usage patterns and respond ONLY with valid JSON format.',
            temperature: 0.3
        });

        // Parse AI response
        const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }

        // Fallback response if JSON parsing fails
        return {
            anomalyDetected: false,
            riskLevel: 'Low',
            suspiciousPatterns: [],
            recommendations: ['Continue monitoring'],
            threatScore: 0,
            rawAnalysis: aiResponse
        };
    } catch (error) {
        console.error('AI Analysis Error:', error);
        throw error;
    }
};

/**
 * Detect potential credential leakage
 * @param {object} keyData - API key usage data
 * @returns {Promise<object>} - Leakage analysis
 */
export const detectCredentialLeakage = async (keyData) => {
    const prompt = `Analyze the following API key usage pattern for potential credential leakage:

Key Information:
- Key Age: ${keyData.keyAge} days
- Total Requests: ${keyData.totalRequests}
- Unique IPs: ${keyData.uniqueIPs}
- Geographic Locations: ${JSON.stringify(keyData.locations)}
- Request Sources: ${JSON.stringify(keyData.sources)}
- Unusual Activity: ${keyData.unusualActivity}
- Failed Auth Attempts: ${keyData.failedAuthAttempts}

Assess the probability of credential leakage and provide:
1. Leakage Probability (0-100%)
2. Risk Indicators (list)
3. Confidence Level (Low/Medium/High)
4. Immediate Actions Required
5. Evidence Summary

Respond in JSON format.`;

    try {
        const aiResponse = await callGrokAI(prompt, {
            systemPrompt: 'You are a security analyst AI. Detect credential leakage patterns and respond in JSON format only.',
            temperature: 0.2
        });

        const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }

        return {
            leakageProbability: 0,
            riskIndicators: [],
            confidenceLevel: 'Low',
            immediateActions: [],
            evidenceSummary: aiResponse
        };
    } catch (error) {
        console.error('Leakage Detection Error:', error);
        throw error;
    }
};

/**
 * Generate security recommendations
 * @param {object} securityData - Security metrics
 * @returns {Promise<object>} - Recommendations
 */
export const generateSecurityRecommendations = async (securityData) => {
    const prompt = `Based on the following security metrics, provide actionable security recommendations:

Security Metrics:
- Active API Keys: ${securityData.activeKeys}
- Expired Keys: ${securityData.expiredKeys}
- High-Risk Keys: ${securityData.highRiskKeys}
- Recent Incidents: ${securityData.recentIncidents}
- Compliance Score: ${securityData.complianceScore}%
- Last Security Audit: ${securityData.lastAudit}

Provide:
1. Top 5 Priority Recommendations
2. Quick Wins (easy to implement)
3. Long-term Improvements
4. Compliance Gaps
5. Overall Security Posture (Poor/Fair/Good/Excellent)

Respond in JSON format.`;

    try {
        const aiResponse = await callGrokAI(prompt, {
            systemPrompt: 'You are a security consultant AI. Provide practical security recommendations in JSON format.',
            temperature: 0.5
        });

        const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }

        return {
            priorityRecommendations: [],
            quickWins: [],
            longTermImprovements: [],
            complianceGaps: [],
            securityPosture: 'Fair',
            rawRecommendations: aiResponse
        };
    } catch (error) {
        console.error('Recommendations Error:', error);
        throw error;
    }
};

/**
 * Analyze API optimization opportunities
 * @param {object} performanceData - Performance metrics
 * @returns {Promise<object>} - Optimization suggestions
 */
export const analyzeOptimization = async (performanceData) => {
    const prompt = `Analyze the following API performance data and suggest optimizations:

Performance Metrics:
- Average Response Time: ${performanceData.avgResponseTime}ms
- Peak Response Time: ${performanceData.peakResponseTime}ms
- Request Volume: ${performanceData.requestVolume}
- Error Rate: ${performanceData.errorRate}%
- Cache Hit Rate: ${performanceData.cacheHitRate}%
- Database Query Time: ${performanceData.dbQueryTime}ms

Provide optimization suggestions for:
1. Performance Improvements
2. Cost Reduction
3. Scalability Enhancements
4. Efficiency Gains
5. Priority Level for each suggestion

Respond in JSON format.`;

    try {
        const aiResponse = await callGrokAI(prompt, {
            systemPrompt: 'You are a performance optimization AI expert. Provide technical optimization suggestions in JSON format.',
            temperature: 0.4
        });

        const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }

        return {
            performanceImprovements: [],
            costReduction: [],
            scalabilityEnhancements: [],
            efficiencyGains: [],
            rawSuggestions: aiResponse
        };
    } catch (error) {
        console.error('Optimization Analysis Error:', error);
        throw error;
    }
};

/**
 * Predict potential security breaches
 * @param {object} threatData - Threat indicators
 * @returns {Promise<object>} - Breach prediction
 */
export const predictSecurityBreach = async (threatData) => {
    const prompt = `Analyze the following threat indicators and predict potential security breach likelihood:

Threat Indicators:
- Suspicious Activity Count: ${threatData.suspiciousActivityCount}
- Failed Login Attempts: ${threatData.failedLoginAttempts}
- Unusual Access Patterns: ${threatData.unusualAccessPatterns}
- Known Threat IPs: ${threatData.knownThreatIPs}
- Vulnerability Score: ${threatData.vulnerabilityScore}
- Recent Security Events: ${JSON.stringify(threatData.recentEvents)}

Provide:
1. Breach Probability (0-100%)
2. Time to Potential Breach (estimate)
3. Attack Vectors (likely methods)
4. Preventive Measures (immediate)
5. Monitoring Focus Areas

Respond in JSON format.`;

    try {
        const aiResponse = await callGrokAI(prompt, {
            systemPrompt: 'You are a threat intelligence AI. Predict security breaches and respond in JSON format.',
            temperature: 0.3
        });

        const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }

        return {
            breachProbability: 0,
            timeToBreach: 'Unknown',
            attackVectors: [],
            preventiveMeasures: [],
            monitoringFocus: [],
            rawPrediction: aiResponse
        };
    } catch (error) {
        console.error('Breach Prediction Error:', error);
        throw error;
    }
};

export default {
    callGrokAI,
    analyzeUsagePatterns,
    detectCredentialLeakage,
    generateSecurityRecommendations,
    analyzeOptimization,
    predictSecurityBreach
};
