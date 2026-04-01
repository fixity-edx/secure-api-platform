import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

// Create axios instance
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle errors
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // If token expired, try to refresh
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = localStorage.getItem('refreshToken');
                const response = await axios.post(`${API_URL}/auth/refresh`, {
                    refreshToken,
                });

                const { token } = response.data.data;
                localStorage.setItem('token', token);

                originalRequest.headers.Authorization = `Bearer ${token}`;
                return api(originalRequest);
            } catch (refreshError) {
                // Refresh failed, logout user
                localStorage.removeItem('token');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('user');
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

// Auth API
export const authAPI = {
    register: (data) => api.post('/auth/register', data),
    login: (data) => api.post('/auth/login', data),
    adminLogin: (data) => api.post('/auth/admin/login', data),
    getMe: () => api.get('/auth/me'),
    logout: () => api.post('/auth/logout'),
    refreshToken: (refreshToken) => api.post('/auth/refresh', { refreshToken }),
};

// API Keys API
export const apiKeysAPI = {
    getAll: (params) => api.get('/api-keys', { params }),
    getOne: (id) => api.get(`/api-keys/${id}`),
    create: (data) => api.post('/api-keys', data),
    update: (id, data) => api.put(`/api-keys/${id}`, data),
    revoke: (id, reason) => api.delete(`/api-keys/${id}`, { data: { reason } }),
    rotate: (id) => api.post(`/api-keys/${id}/rotate`),
    getUsage: (id, params) => api.get(`/api-keys/${id}/usage`, { params }),
    securityScan: (id) => api.post(`/api-keys/${id}/security-scan`),
};

// Analytics API
export const analyticsAPI = {
    getUsage: (params) => api.get('/analytics/usage', { params }),
    getRequestHistory: (params) => api.get('/analytics/request-history', { params }),
    getAIInsights: (params) => api.get('/analytics/ai-insights', { params }),
    getPerformance: (params) => api.get('/analytics/performance', { params }),
    exportReport: (params) => api.get('/analytics/export', { params, responseType: 'blob' }),
};

// Admin API
export const adminAPI = {
    getDashboard: () => api.get('/admin/dashboard'),
    getUsers: (params) => api.get('/admin/users', { params }),
    updateUserStatus: (id, isActive) => api.put(`/admin/users/${id}/status`, { isActive }),
    getApiKeys: (params) => api.get('/admin/api-keys', { params }),
    revokeApiKey: (id, reason) => api.delete(`/admin/api-keys/${id}`, { data: { reason } }),
    forceRotateApiKey: (id) => api.post(`/admin/api-keys/${id}/force-rotate`),
    getAlerts: (params) => api.get('/admin/alerts', { params }),
    acknowledgeAlert: (id) => api.put(`/admin/alerts/${id}/acknowledge`),
    resolveAlert: (id, resolution) => api.put(`/admin/alerts/${id}/resolve`, { resolution }),
    getAuditLogs: (params) => api.get('/admin/audit-logs', { params }),
    exportAuditLogs: (params) => api.get('/admin/audit-logs/export', { params, responseType: 'blob' }),
    getAISecurityAudit: () => api.get('/admin/ai-security-audit'),
    getThreatIntelligence: () => api.get('/admin/threat-intelligence'),
};

// Monitoring API
export const monitoringAPI = {
    getAlerts: (params) => api.get('/monitoring/alerts', { params }),
    acknowledgeAlert: (id) => api.put(`/monitoring/alerts/${id}/acknowledge`),
    resolveAlert: (id, resolution) => api.put(`/monitoring/alerts/${id}/resolve`, { resolution }),
};

// Webhooks API
export const webhooksAPI = {
    getAll: () => api.get('/webhooks'),
    create: (data) => api.post('/webhooks', data),
    update: (id, data) => api.put(`/webhooks/${id}`, data),
    delete: (id) => api.delete(`/webhooks/${id}`),
    test: (id) => api.post(`/webhooks/${id}/test`),
};

// AI API
export const aiAPI = {
    getRecommendations: () => api.get('/ai/recommendations'),
    analyzeUsage: (data) => api.post('/ai/analyze-usage', data),
    detectLeakage: (data) => api.post('/ai/detect-leakage', data),
    optimize: (data) => api.post('/ai/optimize', data),
    predictBreach: (data) => api.post('/ai/predict-breach', data),
};


// Audit API
export const auditAPI = {
    getLogs: (params) => api.get('/audit', { params }),
    getLog: (id) => api.get(`/audit/${id}`),
};

export default api;
