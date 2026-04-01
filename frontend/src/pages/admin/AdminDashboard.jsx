import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import { Users, Key, AlertTriangle, Activity, TrendingUp, Shield } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function AdminDashboard() {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(null);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const response = await adminAPI.getDashboard();
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
            {/* Admin Header */}
            <div className="bg-gradient-to-r from-red-600 to-red-800 rounded-xl p-8 text-white">
                <div className="flex items-center space-x-3 mb-2">
                    <Shield className="w-10 h-10" />
                    <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                </div>
                <p className="text-red-100">System-wide monitoring and management</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="card hover:shadow-lg transition-shadow duration-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Total Users</p>
                            <p className="text-3xl font-bold text-gray-900">{stats?.totalUsers || 0}</p>
                            <p className="text-sm text-green-600 mt-2">↑ {stats?.activeUsers || 0} active</p>
                        </div>
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Users className="w-6 h-6 text-blue-600" />
                        </div>
                    </div>
                </div>

                <div className="card hover:shadow-lg transition-shadow duration-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Total API Keys</p>
                            <p className="text-3xl font-bold text-gray-900">{stats?.totalApiKeys || 0}</p>
                            <p className="text-sm text-green-600 mt-2">↑ {stats?.activeApiKeys || 0} active</p>
                        </div>
                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                            <Key className="w-6 h-6 text-purple-600" />
                        </div>
                    </div>
                </div>

                <div className="card hover:shadow-lg transition-shadow duration-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Active Alerts</p>
                            <p className="text-3xl font-bold text-gray-900">{stats?.activeAlerts || 0}</p>
                            <p className="text-sm text-red-600 mt-2">{stats?.criticalAlerts || 0} critical</p>
                        </div>
                        <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                            <AlertTriangle className="w-6 h-6 text-red-600" />
                        </div>
                    </div>
                </div>

                <div className="card hover:shadow-lg transition-shadow duration-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Total Requests</p>
                            <p className="text-3xl font-bold text-gray-900">{stats?.totalRequests?.toLocaleString() || 0}</p>
                            <p className="text-sm text-green-600 mt-2">↑ 15.3% this week</p>
                        </div>
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                            <Activity className="w-6 h-6 text-green-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="card">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">User Growth</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={stats?.userGrowth || [
                            { month: 'Jan', users: 45 },
                            { month: 'Feb', users: 52 },
                            { month: 'Mar', users: 61 },
                            { month: 'Apr', users: 70 },
                            { month: 'May', users: 85 },
                            { month: 'Jun', users: 95 },
                        ]}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip />
                            <Line type="monotone" dataKey="users" stroke="#0ea5e9" strokeWidth={2} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                <div className="card">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">API Usage by Environment</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={[
                            { env: 'Production', requests: 12500 },
                            { env: 'Staging', requests: 3200 },
                            { env: 'Development', requests: 1800 },
                        ]}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="env" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="requests" fill="#a855f7" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="card">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Users</h3>
                    <div className="space-y-3">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center text-white font-semibold">
                                        U{i}
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900">User {i}</p>
                                        <p className="text-sm text-gray-600">user{i}@example.com</p>
                                    </div>
                                </div>
                                <span className="badge badge-success">Active</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="card">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Alerts</h3>
                    <div className="space-y-3">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center space-x-3">
                                    <AlertTriangle className="w-5 h-5 text-orange-600" />
                                    <div>
                                        <p className="font-medium text-gray-900">Unusual activity detected</p>
                                        <p className="text-sm text-gray-600">{i} minutes ago</p>
                                    </div>
                                </div>
                                <span className="badge badge-warning">Medium</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <button
                        onClick={() => window.location.href = '/admin/users'}
                        className="p-4 border-2 border-blue-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 text-left"
                    >
                        <Users className="w-8 h-8 text-blue-600 mb-2" />
                        <h4 className="font-semibold text-gray-900">Manage Users</h4>
                    </button>

                    <button
                        onClick={() => window.location.href = '/admin/api-keys'}
                        className="p-4 border-2 border-purple-200 rounded-lg hover:border-purple-400 hover:bg-purple-50 transition-all duration-200 text-left"
                    >
                        <Key className="w-8 h-8 text-purple-600 mb-2" />
                        <h4 className="font-semibold text-gray-900">View API Keys</h4>
                    </button>

                    <button
                        onClick={() => window.location.href = '/admin/alerts'}
                        className="p-4 border-2 border-red-200 rounded-lg hover:border-red-400 hover:bg-red-50 transition-all duration-200 text-left"
                    >
                        <AlertTriangle className="w-8 h-8 text-red-600 mb-2" />
                        <h4 className="font-semibold text-gray-900">Review Alerts</h4>
                    </button>

                    <button
                        onClick={() => window.location.href = '/admin/threat-intel'}
                        className="p-4 border-2 border-orange-200 rounded-lg hover:border-orange-400 hover:bg-orange-50 transition-all duration-200 text-left"
                    >
                        <Shield className="w-8 h-8 text-orange-600 mb-2" />
                        <h4 className="font-semibold text-gray-900">Threat Intel</h4>
                    </button>
                </div>
            </div>
        </div>
    );
}
