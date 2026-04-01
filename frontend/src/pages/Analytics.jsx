import { useState, useEffect } from 'react';
import { analyticsAPI } from '../services/api';
import { BarChart3, TrendingUp, Download, Calendar } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function Analytics() {
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState('7d');
    const [analytics, setAnalytics] = useState(null);

    useEffect(() => {
        fetchAnalytics();
    }, [timeRange]);

    const fetchAnalytics = async () => {
        try {
            const response = await analyticsAPI.getUsage({ timeRange });
            setAnalytics(response.data.data);
        } catch (error) {
            console.error('Failed to fetch analytics:', error);
            // Set empty/zero data on error instead of fake data
            setAnalytics({
                summary: {
                    totalRequests: 0,
                    successfulRequests: 0,
                    failedRequests: 0,
                    successRate: 0,
                    bandwidthUsed: 0,
                    apiKeysCount: 0
                },
                dailyBreakdown: {},
                apiKeys: []
            });
        } finally {
            setLoading(false);
        }
    };

    const handleExport = async (format) => {
        try {
            const response = await analyticsAPI.exportReport({ format, timeRange });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `analytics-report.${format}`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            alert('Failed to export report: ' + (error.response?.data?.message || error.message));
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    const COLORS = ['#0ea5e9', '#a855f7', '#10b981', '#f59e0b'];

    // Convert dailyBreakdown object to array for charts
    const dailyData = Object.entries(analytics?.dailyBreakdown || {}).map(([date, stats]) => ({
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        requests: stats.requests,
        success: stats.success,
        failed: stats.failed
    }));

    // Calculate average response time from real data (mock for now until we track it)
    const avgResponseTime = 145; // This should come from backend when implemented

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Analytics</h2>
                    <p className="text-gray-600 mt-1">Detailed insights into your API usage</p>
                </div>
                <div className="flex items-center space-x-3">
                    <select
                        value={timeRange}
                        onChange={(e) => setTimeRange(e.target.value)}
                        className="input-field"
                    >
                        <option value="1d">Last 24 Hours</option>
                        <option value="7d">Last 7 Days</option>
                        <option value="30d">Last 30 Days</option>
                        <option value="90d">Last 90 Days</option>
                    </select>
                    <button
                        onClick={() => handleExport('csv')}
                        className="btn-secondary flex items-center space-x-2"
                    >
                        <Download className="w-4 h-4" />
                        <span>Export</span>
                    </button>
                </div>
            </div>

            {/* Stats Overview - REAL DATA ONLY */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="card">
                    <p className="text-sm text-gray-600 mb-1">Total Requests</p>
                    <p className="text-3xl font-bold text-gray-900">
                        {analytics?.summary?.totalRequests?.toLocaleString() || 0}
                    </p>
                    <p className="text-sm text-gray-500 mt-2">All API calls</p>
                </div>
                <div className="card">
                    <p className="text-sm text-gray-600 mb-1">Success Rate</p>
                    <p className="text-3xl font-bold text-gray-900">
                        {analytics?.summary?.successRate?.toFixed(1) || 0}%
                    </p>
                    <p className="text-sm text-gray-500 mt-2">Successful requests</p>
                </div>
                <div className="card">
                    <p className="text-sm text-gray-600 mb-1">API Keys</p>
                    <p className="text-3xl font-bold text-gray-900">
                        {analytics?.summary?.apiKeysCount || 0}
                    </p>
                    <p className="text-sm text-gray-500 mt-2">Active keys</p>
                </div>
                <div className="card">
                    <p className="text-sm text-gray-600 mb-1">Bandwidth Used</p>
                    <p className="text-3xl font-bold text-gray-900">
                        {((analytics?.summary?.bandwidthUsed || 0) / 1024 / 1024).toFixed(2)}MB
                    </p>
                    <p className="text-sm text-gray-500 mt-2">This period</p>
                </div>
            </div>

            {/* Charts - REAL DATA ONLY */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Requests Over Time */}
                <div className="card">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Requests Over Time</h3>
                    {dailyData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={dailyData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="requests" stroke="#0ea5e9" strokeWidth={2} name="Total Requests" />
                                <Line type="monotone" dataKey="success" stroke="#10b981" strokeWidth={2} name="Successful" />
                                <Line type="monotone" dataKey="failed" stroke="#ef4444" strokeWidth={2} name="Failed" />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-[300px] flex items-center justify-center text-gray-500">
                            No data available for this time period
                        </div>
                    )}
                </div>

                {/* Status Distribution */}
                <div className="card">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Status Distribution</h3>
                    {(analytics?.summary?.totalRequests || 0) > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={[
                                        { name: 'Success', value: analytics?.summary?.successfulRequests || 0 },
                                        { name: 'Failed', value: analytics?.summary?.failedRequests || 0 },
                                    ]}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {[0, 1].map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-[300px] flex items-center justify-center text-gray-500">
                            No requests recorded yet
                        </div>
                    )}
                </div>

                {/* API Keys Performance */}
                <div className="card lg:col-span-2">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">API Keys Performance</h3>
                    {(analytics?.apiKeys?.length || 0) > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={analytics.apiKeys.slice(0, 10)}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="totalRequests" fill="#a855f7" name="Total Requests" />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-[300px] flex items-center justify-center text-gray-500">
                            No API keys created yet
                        </div>
                    )}
                </div>
            </div>

            {/* API Keys List */}
            {(analytics?.apiKeys?.length || 0) > 0 && (
                <div className="card">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Your API Keys</h3>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead>
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Name
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Total Requests
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Success Rate
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Last Used
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {analytics.apiKeys.map((key) => (
                                    <tr key={key.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {key.name}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {key.totalRequests?.toLocaleString() || 0}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            <span className={`badge ${parseFloat(key.successRate) >= 95 ? 'badge-success' : parseFloat(key.successRate) >= 80 ? 'badge-warning' : 'badge-danger'}`}>
                                                {key.successRate}%
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {key.lastUsed ? new Date(key.lastUsed).toLocaleString() : 'Never'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* No Data Message */}
            {(analytics?.summary?.totalRequests || 0) === 0 && (
                <div className="card text-center py-12">
                    <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Analytics Data Yet</h3>
                    <p className="text-gray-600 mb-4">
                        Create an API key and start making requests to see analytics data here.
                    </p>
                    <a href="/api-keys" className="btn-primary inline-block">
                        Create Your First API Key
                    </a>
                </div>
            )}
        </div>
    );
}
