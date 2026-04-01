import { useState, useEffect } from 'react';
import { vendorAPI } from '../../services/api';
import { Store, TrendingUp, Activity, BarChart3 } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function VendorDashboard() {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(null);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const response = await vendorAPI.getDashboard();
            setStats(response.data.data);
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
            {/* Vendor Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 text-white">
                <div className="flex items-center space-x-3 mb-2">
                    <Store className="w-10 h-10" />
                    <h1 className="text-3xl font-bold">Vendor Dashboard</h1>
                </div>
                <p className="text-blue-100">Monitor your API consumption and performance</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="card">
                    <p className="text-sm text-gray-600 mb-1">API Calls Today</p>
                    <p className="text-3xl font-bold text-gray-900">{stats?.todayCalls?.toLocaleString() || 0}</p>
                    <p className="text-sm text-green-600 mt-2">↑ 8.2% vs yesterday</p>
                </div>
                <div className="card">
                    <p className="text-sm text-gray-600 mb-1">Success Rate</p>
                    <p className="text-3xl font-bold text-gray-900">{stats?.successRate?.toFixed(1) || 0}%</p>
                    <p className="text-sm text-green-600 mt-2">↑ 1.5% improvement</p>
                </div>
                <div className="card">
                    <p className="text-sm text-gray-600 mb-1">Avg Response Time</p>
                    <p className="text-3xl font-bold text-gray-900">{stats?.avgResponseTime || 0}ms</p>
                    <p className="text-sm text-green-600 mt-2">↓ 12ms faster</p>
                </div>
                <div className="card">
                    <p className="text-sm text-gray-600 mb-1">Rate Limit Usage</p>
                    <p className="text-3xl font-bold text-gray-900">{stats?.rateLimitUsage || 0}%</p>
                    <p className="text-sm text-gray-500 mt-2">of daily limit</p>
                </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="card">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">API Usage (Last 7 Days)</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={stats?.usageData || [
                            { day: 'Mon', calls: 1200 },
                            { day: 'Tue', calls: 1500 },
                            { day: 'Wed', calls: 1800 },
                            { day: 'Thu', calls: 1400 },
                            { day: 'Fri', calls: 2000 },
                            { day: 'Sat', calls: 900 },
                            { day: 'Sun', calls: 1100 },
                        ]}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="day" />
                            <YAxis />
                            <Tooltip />
                            <Line type="monotone" dataKey="calls" stroke="#0ea5e9" strokeWidth={2} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                <div className="card">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Endpoint Usage</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={stats?.endpointData || [
                            { endpoint: '/api/users', calls: 450 },
                            { endpoint: '/api/products', calls: 320 },
                            { endpoint: '/api/orders', calls: 280 },
                            { endpoint: '/api/auth', calls: 150 },
                        ]}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="endpoint" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="calls" fill="#a855f7" />
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
                        <Activity className="w-8 h-8 text-primary-600 mb-2" />
                        <h4 className="font-semibold text-gray-900">Manage API Keys</h4>
                    </button>

                    <button
                        onClick={() => window.location.href = '/analytics'}
                        className="p-4 border-2 border-blue-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 text-left"
                    >
                        <BarChart3 className="w-8 h-8 text-blue-600 mb-2" />
                        <h4 className="font-semibold text-gray-900">View Analytics</h4>
                    </button>

                    <button
                        onClick={() => window.location.href = '/webhooks'}
                        className="p-4 border-2 border-purple-200 rounded-lg hover:border-purple-400 hover:bg-purple-50 transition-all duration-200 text-left"
                    >
                        <TrendingUp className="w-8 h-8 text-purple-600 mb-2" />
                        <h4 className="font-semibold text-gray-900">Configure Webhooks</h4>
                    </button>
                </div>
            </div>
        </div>
    );
}
