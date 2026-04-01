import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import { Key, Search, Trash2, RotateCw, Shield, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';

export default function AdminApiKeys() {
    const [apiKeys, setApiKeys] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        fetchApiKeys();
    }, []);

    const fetchApiKeys = async () => {
        try {
            const response = await adminAPI.getApiKeys();
            setApiKeys(response.data.data || []);
        } catch (error) {
            console.error('Failed to fetch API keys:', error);
            setApiKeys([]);
        } finally {
            setLoading(false);
        }
    };

    const handleRevoke = async (id, name) => {
        if (window.confirm(`Are you sure you want to revoke "${name}"? This action cannot be undone.`)) {
            try {
                await adminAPI.revokeApiKey(id);
                alert('API key revoked successfully');
                fetchApiKeys();
            } catch (error) {
                alert('Failed to revoke API key: ' + (error.response?.data?.message || error.message));
            }
        }
    };

    const handleForceRotate = async (id, name) => {
        if (window.confirm(`Force rotate API key "${name}"?`)) {
            try {
                await adminAPI.forceRotateApiKey(id);
                alert('API key rotated successfully');
                fetchApiKeys();
            } catch (error) {
                alert('Failed to rotate API key: ' + (error.response?.data?.message || error.message));
            }
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'active': return 'badge-success';
            case 'revoked': return 'badge-danger';
            case 'expired': return 'badge-warning';
            default: return 'badge-info';
        }
    };

    const filteredKeys = apiKeys.filter(key => {
        const matchesSearch = key.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            key.keyPrefix.toLowerCase().includes(searchTerm.toLowerCase()) ||
            key.user?.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filter === 'all' || key.status === filter;
        return matchesSearch && matchesFilter;
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
            <div>
                <h2 className="text-2xl font-bold text-gray-900">All API Keys</h2>
                <p className="text-gray-600 mt-1">System-wide API key management and monitoring</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="card">
                    <p className="text-sm text-gray-600 mb-1">Total Keys</p>
                    <p className="text-2xl font-bold text-gray-900">{apiKeys.length}</p>
                </div>
                <div className="card bg-green-50 border-green-200">
                    <p className="text-sm text-green-600 mb-1">Active</p>
                    <p className="text-2xl font-bold text-green-700">
                        {apiKeys.filter(k => k.status === 'active').length}
                    </p>
                </div>
                <div className="card bg-red-50 border-red-200">
                    <p className="text-sm text-red-600 mb-1">Revoked</p>
                    <p className="text-2xl font-bold text-red-700">
                        {apiKeys.filter(k => k.status === 'revoked').length}
                    </p>
                </div>
                <div className="card bg-yellow-50 border-yellow-200">
                    <p className="text-sm text-yellow-600 mb-1">Expired</p>
                    <p className="text-2xl font-bold text-yellow-700">
                        {apiKeys.filter(k => k.status === 'expired').length}
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
                            placeholder="Search by name, prefix, or user..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="input-field pl-10"
                        />
                    </div>
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="input-field"
                    >
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="revoked">Revoked</option>
                        <option value="expired">Expired</option>
                    </select>
                </div>
            </div>

            {/* API Keys Table */}
            {filteredKeys.length === 0 ? (
                <div className="card text-center py-12">
                    <Key className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No API Keys Found</h3>
                    <p className="text-gray-600">
                        {searchTerm || filter !== 'all' ? 'Try adjusting your filters' : 'No API keys have been created yet'}
                    </p>
                </div>
            ) : (
                <div className="card overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Key Details
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Owner
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Environment
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Usage
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Expires
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredKeys.map((key) => (
                                    <tr key={key._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">{key.name}</div>
                                                <div className="text-sm text-gray-500 font-mono">{key.keyPrefix}***</div>
                                                {key.description && (
                                                    <div className="text-xs text-gray-400 mt-1">{key.description}</div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{key.user?.name || 'Unknown'}</div>
                                            <div className="text-sm text-gray-500">{key.user?.email || '-'}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`badge ${key.environment === 'production' ? 'badge-danger' :
                                                    key.environment === 'staging' ? 'badge-warning' :
                                                        'badge-info'
                                                }`}>
                                                {key.environment?.toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                {key.usageStats?.totalRequests?.toLocaleString() || 0} requests
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {((key.usageStats?.successfulRequests / key.usageStats?.totalRequests) * 100 || 0).toFixed(1)}% success
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`badge ${getStatusColor(key.status)}`}>
                                                {key.status?.toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {key.expiresAt ? format(new Date(key.expiresAt), 'MMM dd, yyyy') : 'Never'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <div className="flex space-x-2">
                                                {key.status === 'active' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleForceRotate(key._id, key.name)}
                                                            className="text-blue-600 hover:text-blue-900"
                                                            title="Force Rotate"
                                                        >
                                                            <RotateCw className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleRevoke(key._id, key.name)}
                                                            className="text-red-600 hover:text-red-900"
                                                            title="Revoke"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
