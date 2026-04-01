import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiKeysAPI, analyticsAPI, monitoringAPI } from '../services/api';
import { Key, TrendingUp, AlertTriangle, Activity, ArrowUp, ArrowDown } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalKeys: 0,
        activeKeys: 0,
        totalRequests: 0,
        alerts: 0,
    });
    const [recentActivity, setRecentActivity] = useState([]);
    const [usageData, setUsageData] = useState([]);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            // Fetch API keys
            const keysResponse = await apiKeysAPI.getAll();
            const keys = keysResponse.data.data;

            // Fetch analytics
            const analyticsResponse = await analyticsAPI.getUsage({ timeRange: '7d' });
            const analytics = analyticsResponse.data.data;

            // Fetch alerts
            const alertsResponse = await monitoringAPI.getAlerts({ status: 'new' });
            const alerts = alertsResponse.data.data;

            setStats({
                totalKeys: keys.length,
                activeKeys: keys.filter(k => k.status === 'active').length,
                totalRequests: analytics.totalRequests || 0,
                alerts: alerts.length,
            });

            // Mock usage data for chart
            setUsageData(analytics.dailyBreakdown || [
                { date: 'Mon', requests: 120 },
                { date: 'Tue', requests: 150 },
                { date: 'Wed', requests: 180 },
                { date: 'Thu', requests: 140 },
                { date: 'Fri', requests: 200 },
                { date: 'Sat', requests: 90 },
                { date: 'Sun', requests: 110 },
            ]);

        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Welcome Section */}
            <div className="bg-gradient-to-r from-primary-600 to-secondary-600 rounded-xl p-8 text-white">
                <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.name}!</h1>
                <p className="text-primary-100">Here's what's happening with your API keys today.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Total API Keys */}
                <div className="card hover:shadow-lg transition-shadow duration-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Total API Keys</p>
                            <p className="text-3xl font-bold text-gray-900">{stats.totalKeys}</p>
                            <p className="text-sm text-green-600 mt-2 flex items-center">
                                <ArrowUp className="w-4 h-4 mr-1" />
                                {stats.activeKeys} active
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                            <Key className="w-6 h-6 text-primary-600" />
                        </div>
                    </div>
                </div>

                {/* Total Requests */}
                <div className="card hover:shadow-lg transition-shadow duration-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Total Requests</p>
                            <p className="text-3xl font-bold text-gray-900">{stats.totalRequests.toLocaleString()}</p>
                            <p className="text-sm text-green-600 mt-2 flex items-center">
                                <TrendingUp className="w-4 h-4 mr-1" />
                                +12% this week
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Activity className="w-6 h-6 text-blue-600" />
                        </div>
                    </div>
                </div>

                {/* Active Alerts */}
                <div className="card hover:shadow-lg transition-shadow duration-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Active Alerts</p>
                            <p className="text-3xl font-bold text-gray-900">{stats.alerts}</p>
                            <p className="text-sm text-gray-500 mt-2">Needs attention</p>
                        </div>
                        <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                            <AlertTriangle className="w-6 h-6 text-red-600" />
                        </div>
                    </div>
                </div>

                {/* Success Rate */}
                <div className="card hover:shadow-lg transition-shadow duration-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Success Rate</p>
                            <p className="text-3xl font-bold text-gray-900">98.5%</p>
                            <p className="text-sm text-green-600 mt-2 flex items-center">
                                <ArrowUp className="w-4 h-4 mr-1" />
                                +2.1% improvement
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                            <TrendingUp className="w-6 h-6 text-green-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Usage Chart */}
                <div className="card">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">API Usage (Last 7 Days)</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={usageData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip />
                            <Line type="monotone" dataKey="requests" stroke="#0ea5e9" strokeWidth={2} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Requests by Status */}
                <div className="card">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Requests by Status</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={[
                            { status: 'Success', count: 850 },
                            { status: 'Failed', count: 45 },
                            { status: 'Pending', count: 12 },
                        ]}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="status" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="count" fill="#0ea5e9" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button
                        onClick={() => window.location.href = '/api-keys'}
                        className="p-4 border-2 border-primary-200 rounded-lg hover:border-primary-400 hover:bg-primary-50 transition-all duration-200 text-left"
                    >
                        <Key className="w-8 h-8 text-primary-600 mb-2" />
                        <h4 className="font-semibold text-gray-900">Generate API Key</h4>
                        <p className="text-sm text-gray-600 mt-1">Create a new API key for your application</p>
                    </button>

                    <button
                        onClick={() => window.location.href = '/analytics'}
                        className="p-4 border-2 border-blue-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 text-left"
                    >
                        <BarChart className="w-8 h-8 text-blue-600 mb-2" />
                        <h4 className="font-semibold text-gray-900">View Analytics</h4>
                        <p className="text-sm text-gray-600 mt-1">Detailed insights into your API usage</p>
                    </button>

                    <button
                        onClick={() => window.location.href = '/alerts'}
                        className="p-4 border-2 border-red-200 rounded-lg hover:border-red-400 hover:bg-red-50 transition-all duration-200 text-left"
                    >
                        <AlertTriangle className="w-8 h-8 text-red-600 mb-2" />
                        <h4 className="font-semibold text-gray-900">Check Alerts</h4>
                        <p className="text-sm text-gray-600 mt-1">Review security alerts and notifications</p>
                    </button>
                </div>
            </div>
        </div>
    );
}
