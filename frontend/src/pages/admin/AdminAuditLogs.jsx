import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import { FileText, Search, Download, Filter, User, Key, Shield } from 'lucide-react';
import { format } from 'date-fns';

export default function AdminAuditLogs() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [actionFilter, setActionFilter] = useState('all');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        fetchLogs();
    }, [page, actionFilter]);

    const fetchLogs = async () => {
        try {
            const response = await adminAPI.getAuditLogs({ page, limit: 20, action: actionFilter !== 'all' ? actionFilter : undefined });
            setLogs(response.data.data || []);
            setTotalPages(response.data.pagination?.totalPages || 1);
        } catch (error) {
            console.error('Failed to fetch audit logs:', error);
            setLogs([]);
        } finally {
            setLoading(false);
        }
    };

    const handleExport = async () => {
        try {
            const response = await adminAPI.exportAuditLogs({ format: 'csv' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `audit-logs-${new Date().toISOString()}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            alert('Failed to export logs: ' + (error.response?.data?.message || error.message));
        }
    };

    const getActionColor = (action) => {
        if (action.includes('create') || action.includes('register')) return 'badge-success';
        if (action.includes('delete') || action.includes('revoke')) return 'badge-danger';
        if (action.includes('update') || action.includes('rotate')) return 'badge-warning';
        if (action.includes('login')) return 'badge-info';
        return 'badge';
    };

    const getActionIcon = (action) => {
        if (action.includes('user') || action.includes('login')) return <User className="w-4 h-4" />;
        if (action.includes('key') || action.includes('api')) return <Key className="w-4 h-4" />;
        if (action.includes('security') || action.includes('alert')) return <Shield className="w-4 h-4" />;
        return <FileText className="w-4 h-4" />;
    };

    const filteredLogs = logs.filter(log => {
        const matchesSearch = log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.user?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.ipAddress?.includes(searchTerm);
        return matchesSearch;
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Audit Logs</h2>
                    <p className="text-gray-600 mt-1">Complete system activity audit trail</p>
                </div>
                <button
                    onClick={handleExport}
                    className="btn-primary flex items-center space-x-2"
                >
                    <Download className="w-4 h-4" />
                    <span>Export Logs</span>
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="card">
                    <p className="text-sm text-gray-600 mb-1">Total Events</p>
                    <p className="text-2xl font-bold text-gray-900">{logs.length}</p>
                </div>
                <div className="card bg-blue-50 border-blue-200">
                    <p className="text-sm text-blue-600 mb-1">Logins</p>
                    <p className="text-2xl font-bold text-blue-700">
                        {logs.filter(l => l.action.includes('login')).length}
                    </p>
                </div>
                <div className="card bg-green-50 border-green-200">
                    <p className="text-sm text-green-600 mb-1">API Key Actions</p>
                    <p className="text-2xl font-bold text-green-700">
                        {logs.filter(l => l.action.includes('key') || l.action.includes('api')).length}
                    </p>
                </div>
                <div className="card bg-purple-50 border-purple-200">
                    <p className="text-sm text-purple-600 mb-1">Security Events</p>
                    <p className="text-2xl font-bold text-purple-700">
                        {logs.filter(l => l.action.includes('security') || l.action.includes('alert')).length}
                    </p>
                </div>
            </div>

            {/* Filters */}
            <div className="card">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search by action, user, or IP address..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="input-field pl-10"
                        />
                    </div>
                    <select
                        value={actionFilter}
                        onChange={(e) => setActionFilter(e.target.value)}
                        className="input-field"
                    >
                        <option value="all">All Actions</option>
                        <option value="login">Login Events</option>
                        <option value="api_key">API Key Events</option>
                        <option value="user">User Events</option>
                        <option value="security">Security Events</option>
                    </select>
                </div>
            </div>

            {/* Audit Logs Table */}
            {filteredLogs.length === 0 ? (
                <div className="card text-center py-12">
                    <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Audit Logs Found</h3>
                    <p className="text-gray-600">
                        {searchTerm || actionFilter !== 'all' ? 'Try adjusting your filters' : 'No activity has been logged yet'}
                    </p>
                </div>
            ) : (
                <>
                    <div className="card overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Timestamp
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Action
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            User
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            IP Address
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Details
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredLogs.map((log) => (
                                        <tr key={log._id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {log.timestamp ? format(new Date(log.timestamp), 'MMM dd, HH:mm:ss') : '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center space-x-2">
                                                    {getActionIcon(log.action)}
                                                    <span className={`badge ${getActionColor(log.action)}`}>
                                                        {log.action}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{log.user?.name || 'System'}</div>
                                                <div className="text-xs text-gray-500">{log.user?.email || '-'}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                                                {log.ipAddress || '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`badge ${log.success ? 'badge-success' : 'badge-danger'}`}>
                                                    {log.success ? 'SUCCESS' : 'FAILED'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                {log.metadata && Object.keys(log.metadata).length > 0 ? (
                                                    <details className="cursor-pointer">
                                                        <summary className="text-primary-600 hover:text-primary-700">View Details</summary>
                                                        <pre className="mt-2 text-xs bg-gray-50 p-2 rounded overflow-x-auto">
                                                            {JSON.stringify(log.metadata, null, 2)}
                                                        </pre>
                                                    </details>
                                                ) : (
                                                    '-'
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex justify-center items-center space-x-4">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Previous
                            </button>
                            <span className="text-gray-700">
                                Page {page} of {totalPages}
                            </span>
                            <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
