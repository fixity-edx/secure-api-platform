import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api/v1';

// Colors for console output
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m'
};

let userToken = '';
let adminToken = '';
let apiKeyId = '';
let generatedApiKey = '';

// Test results
const results = {
    passed: 0,
    failed: 0,
    total: 0
};

// Helper function to log test results
function logTest(name, success, message = '') {
    results.total++;
    if (success) {
        results.passed++;
        console.log(`${colors.green}✓${colors.reset} ${name}`);
    } else {
        results.failed++;
        console.log(`${colors.red}✗${colors.reset} ${name}`);
        if (message) console.log(`  ${colors.yellow}${message}${colors.reset}`);
    }
}

// Helper function to make API calls
async function apiCall(method, endpoint, data = null, token = null) {
    try {
        const config = {
            method,
            url: `${BASE_URL}${endpoint}`,
            headers: {}
        };

        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }

        if (data) {
            config.headers['Content-Type'] = 'application/json';
            config.data = data;
        }

        const response = await axios(config);
        return { success: true, data: response.data };
    } catch (error) {
        return {
            success: false,
            error: error.response?.data?.message || error.message
        };
    }
}

// Test functions
async function testHealthCheck() {
    console.log(`\n${colors.cyan}=== Health Check ===${colors.reset}`);

    const result = await apiCall('GET', '/health');
    logTest('Server health check', result.success);
}

async function testUserRegistration() {
    console.log(`\n${colors.cyan}=== User Registration ===${colors.reset}`);

    const userData = {
        name: 'Test User',
        email: `testuser${Date.now()}@example.com`,
        password: 'password123',
        role: 'user',
        organization: 'Test Corp'
    };

    const result = await apiCall('POST', '/auth/register', userData);
    logTest('User registration', result.success);

    if (result.success && result.data.data.token) {
        userToken = result.data.data.token;
        logTest('JWT token received', true);
    } else {
        logTest('JWT token received', false, 'No token in response');
    }
}

async function testUserLogin() {
    console.log(`\n${colors.cyan}=== User Login ===${colors.reset}`);

    const loginData = {
        email: 'testuser@example.com',
        password: 'password123'
    };

    const result = await apiCall('POST', '/auth/login', loginData);

    if (result.success && result.data.data.token) {
        userToken = result.data.data.token;
        logTest('User login', true);
    } else {
        logTest('User login', false, result.error);
    }
}

async function testAdminLogin() {
    console.log(`\n${colors.cyan}=== Admin Login ===${colors.reset}`);

    const adminData = {
        email: 'admin@gmail.com',
        password: 'admin123'
    };

    const result = await apiCall('POST', '/auth/admin/login', adminData);

    if (result.success && result.data.data.token) {
        adminToken = result.data.data.token;
        logTest('Admin login', true);
    } else {
        logTest('Admin login', false, result.error);
    }
}

async function testGetCurrentUser() {
    console.log(`\n${colors.cyan}=== Get Current User ===${colors.reset}`);

    const result = await apiCall('GET', '/auth/me', null, userToken);
    logTest('Get current user', result.success);
}

async function testGenerateApiKey() {
    console.log(`\n${colors.cyan}=== API Key Generation ===${colors.reset}`);

    const keyData = {
        name: 'Test API Key',
        environment: 'development',
        permissions: [
            { resource: 'users', actions: ['read'] }
        ],
        expiresInDays: 365,
        description: 'Test key for automated testing'
    };

    const result = await apiCall('POST', '/api-keys', keyData, userToken);

    if (result.success && result.data.data._id) {
        apiKeyId = result.data.data._id;
        generatedApiKey = result.data.data.key;
        logTest('API key generation', true);
        logTest('API key ID received', true);
        console.log(`  ${colors.blue}API Key:${colors.reset} ${generatedApiKey.substring(0, 20)}...`);
    } else {
        logTest('API key generation', false, result.error);
    }
}

async function testGetApiKeys() {
    console.log(`\n${colors.cyan}=== Get API Keys ===${colors.reset}`);

    const result = await apiCall('GET', '/api-keys', null, userToken);
    logTest('Get all API keys', result.success);

    if (result.success) {
        console.log(`  ${colors.blue}Total keys:${colors.reset} ${result.data.count}`);
    }
}

async function testGetSingleApiKey() {
    console.log(`\n${colors.cyan}=== Get Single API Key ===${colors.reset}`);

    if (!apiKeyId) {
        logTest('Get single API key', false, 'No API key ID available');
        return;
    }

    const result = await apiCall('GET', `/api-keys/${apiKeyId}`, null, userToken);
    logTest('Get single API key', result.success);
}

async function testUpdateApiKey() {
    console.log(`\n${colors.cyan}=== Update API Key ===${colors.reset}`);

    if (!apiKeyId) {
        logTest('Update API key', false, 'No API key ID available');
        return;
    }

    const updateData = {
        name: 'Updated Test API Key'
    };

    const result = await apiCall('PUT', `/api-keys/${apiKeyId}`, updateData, userToken);
    logTest('Update API key', result.success);
}

async function testGetApiKeyUsage() {
    console.log(`\n${colors.cyan}=== Get API Key Usage ===${colors.reset}`);

    if (!apiKeyId) {
        logTest('Get API key usage', false, 'No API key ID available');
        return;
    }

    const result = await apiCall('GET', `/api-keys/${apiKeyId}/usage`, null, userToken);
    logTest('Get API key usage', result.success);
}

async function testUsageAnalytics() {
    console.log(`\n${colors.cyan}=== Usage Analytics ===${colors.reset}`);

    const result = await apiCall('GET', '/analytics/usage?timeRange=7d', null, userToken);
    logTest('Get usage analytics', result.success);
}

async function testRequestHistory() {
    console.log(`\n${colors.cyan}=== Request History ===${colors.reset}`);

    const result = await apiCall('GET', '/analytics/request-history?page=1&limit=10', null, userToken);
    logTest('Get request history', result.success);
}

async function testAIRecommendations() {
    console.log(`\n${colors.cyan}=== AI Features ===${colors.reset}`);

    const result = await apiCall('GET', '/ai/recommendations', null, userToken);
    logTest('Get AI recommendations', result.success);
}

async function testGetAlerts() {
    console.log(`\n${colors.cyan}=== Monitoring ===${colors.reset}`);

    const result = await apiCall('GET', '/monitoring/alerts', null, userToken);
    logTest('Get alerts', result.success);
}

async function testGetWebhooks() {
    console.log(`\n${colors.cyan}=== Webhooks ===${colors.reset}`);

    const result = await apiCall('GET', '/webhooks', null, userToken);
    logTest('Get webhooks', result.success);
}

async function testGetAuditLogs() {
    console.log(`\n${colors.cyan}=== Audit Logs ===${colors.reset}`);

    const result = await apiCall('GET', '/audit?page=1&limit=10', null, userToken);
    logTest('Get audit logs', result.success);
}

async function testAdminDashboard() {
    console.log(`\n${colors.cyan}=== Admin Dashboard ===${colors.reset}`);

    if (!adminToken) {
        logTest('Admin dashboard', false, 'No admin token available');
        return;
    }

    const result = await apiCall('GET', '/admin/dashboard', null, adminToken);
    logTest('Get admin dashboard', result.success);
}

async function testAdminGetUsers() {
    console.log(`\n${colors.cyan}=== Admin - Get Users ===${colors.reset}`);

    if (!adminToken) {
        logTest('Admin get users', false, 'No admin token available');
        return;
    }

    const result = await apiCall('GET', '/admin/users', null, adminToken);
    logTest('Get all users (admin)', result.success);
}

async function testAdminGetApiKeys() {
    console.log(`\n${colors.cyan}=== Admin - Get API Keys ===${colors.reset}`);

    if (!adminToken) {
        logTest('Admin get API keys', false, 'No admin token available');
        return;
    }

    const result = await apiCall('GET', '/admin/api-keys', null, adminToken);
    logTest('Get all API keys (admin)', result.success);
}

async function testAdminAISecurityAudit() {
    console.log(`\n${colors.cyan}=== Admin - AI Security Audit ===${colors.reset}`);

    if (!adminToken) {
        logTest('AI security audit', false, 'No admin token available');
        return;
    }

    const result = await apiCall('GET', '/admin/ai-security-audit', null, adminToken);
    logTest('Get AI security audit', result.success);
}

async function testAdminThreatIntelligence() {
    console.log(`\n${colors.cyan}=== Admin - Threat Intelligence ===${colors.reset}`);

    if (!adminToken) {
        logTest('Threat intelligence', false, 'No admin token available');
        return;
    }

    const result = await apiCall('GET', '/admin/threat-intelligence', null, adminToken);
    logTest('Get threat intelligence', result.success);
}

// Main test runner
async function runTests() {
    console.log(`\n${colors.cyan}╔════════════════════════════════════════════════════════╗${colors.reset}`);
    console.log(`${colors.cyan}║   Secure API Platform - Automated API Testing         ║${colors.reset}`);
    console.log(`${colors.cyan}╚════════════════════════════════════════════════════════╝${colors.reset}\n`);

    try {
        // Basic tests
        await testHealthCheck();

        // Authentication tests
        await testUserRegistration();
        await testAdminLogin();
        await testGetCurrentUser();

        // API Key tests
        await testGenerateApiKey();
        await testGetApiKeys();
        await testGetSingleApiKey();
        await testUpdateApiKey();
        await testGetApiKeyUsage();

        // Analytics tests
        await testUsageAnalytics();
        await testRequestHistory();

        // AI tests
        await testAIRecommendations();

        // Monitoring tests
        await testGetAlerts();

        // Webhook tests
        await testGetWebhooks();

        // Audit tests
        await testGetAuditLogs();

        // Admin tests
        await testAdminDashboard();
        await testAdminGetUsers();
        await testAdminGetApiKeys();
        await testAdminAISecurityAudit();
        await testAdminThreatIntelligence();

        // Print summary
        console.log(`\n${colors.cyan}╔════════════════════════════════════════════════════════╗${colors.reset}`);
        console.log(`${colors.cyan}║                    Test Summary                        ║${colors.reset}`);
        console.log(`${colors.cyan}╚════════════════════════════════════════════════════════╝${colors.reset}\n`);

        console.log(`  Total Tests:  ${results.total}`);
        console.log(`  ${colors.green}Passed:       ${results.passed}${colors.reset}`);
        console.log(`  ${colors.red}Failed:       ${results.failed}${colors.reset}`);

        const successRate = ((results.passed / results.total) * 100).toFixed(2);
        console.log(`  Success Rate: ${successRate}%\n`);

        if (results.failed === 0) {
            console.log(`${colors.green}🎉 All tests passed!${colors.reset}\n`);
        } else {
            console.log(`${colors.yellow}⚠️  Some tests failed. Please review the output above.${colors.reset}\n`);
        }

    } catch (error) {
        console.error(`${colors.red}Fatal error during testing:${colors.reset}`, error.message);
    }
}

// Run the tests
runTests();
