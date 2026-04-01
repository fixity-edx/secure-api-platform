import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import { AlertTriangle, CheckCircle, XCircle, Clock, Search, Filter } from 'lucide-react';
import { format } from 'date-fns';

export default function AdminAlerts() {
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [severityFilter, setSeverityFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchAlerts();
    }, []);

    const fetchAlerts = async () => {
        try {
            const response = await adminAPI.getAlerts();
            setAlerts(response.data.data || []);
        } catch (error) {
            console.error('Failed to fetch alerts:', error);
            setAlerts([]);
        } finally {
            setLoading(false);
        }
    };

    const handleAcknowledge = async (id) => {
        try {
            await adminAPI.acknowledgeAlert(id);
            fetchAlerts();
        } catch (error) {
            alert('Failed to acknowledge alert: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleResolve = async (id) => {
        const resolution = prompt('Enter resolution notes:');
        if (resolution) {
            try {
                await adminAPI.resolveAlert(id, resolution);
                fetchAlerts();
            } catch (error) {
                alert('Failed to resolve alert: ' + (error.response?.data?.message || error.message));
            }
        }
    };

    const getSeverityColor = (severity) => {
        switch (severity) {
            case 'critical': return 'text-red-600 bg-red-100 border-red-200';
            case 'high': return 'text-orange-600 bg-orange-100 border-orange-200';
            case 'medium': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
            case 'low': return 'text-blue-600 bg-blue-100 border-blue-200';
            default: return 'text-gray-600 bg-gray-100 border-gray-200';
        }
    };

    const getSeverityIcon = (severity) => {
        switch (severity) {
            case 'critical':
            case 'high':
                return <XCircle className="w-5 h-5" />;
            case 'medium':
                return <AlertTriangle className="w-5 h-5" />;
            default:
                return <CheckCircle className="w-5 h-5" />;
        }
    };

    const filteredAlerts = alerts.filter(alert => {
        const matchesStatus = filter === 'all' || alert.status === filter;
        const matchesSeverity = severityFilter === 'all' || alert.severity === severityFilter;
        const matchesSearch = alert.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
            alert.message.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesStatus && matchesSeverity && matchesSearch;
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
                <h2 className="text-2xl font-bold text-gray-900">System Alerts</h2>
                <p className="text-gray-600 mt-1">Monitor and manage all security alerts across the platform</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="card">
                    <p className="text-sm text-gray-600 mb-1">Total Alerts</p>
                    <p className="text-2xl font-bold text-gray-900">{alerts.length}</p>
                </div>
                <div className="card bg-red-50 border-red-200">
                    <p className="text-sm text-red-600 mb-1">Critical</p>
                    <p className="text-2xl font-bold text-red-700">
                        {alerts.filter(a => a.severity === 'critical' && a.status === 'new').length}
                    </p>
                </div>
                <div className="card bg-orange-50 border-orange-200">
                    <p className="text-sm text-orange-600 mb-1">High</p>
                    <p className="text-2xl font-bold text-orange-700">
                        {alerts.filter(a => a.severity === 'high' && a.status === 'new').length}
                    </p>
                </div>
                <div className="card bg-yellow-50 border-yellow-200">
                    <p className="text-sm text-yellow-600 mb-1">Medium</p>
                    <p className="text-2xl font-bold text-yellow-700">
                        {alerts.filter(a => a.severity === 'medium' && a.status === 'new').length}
                    </p>
                </div>
                <div className="card bg-green-50 border-green-200">
                    <p className="text-sm text-green-600 mb-1">Resolved</p>
                    <p className="text-2xl font-bold text-green-700">
                        {alerts.filter(a => a.status === 'resolved').length}
                    </p>
                </div>
            </div>

            {/* Filters */}
            <div className="card">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search alerts..."
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
                        <option value="new">New</option>
                        <option value="acknowledged">Acknowledged</option>
                        <option value="resolved">Resolved</option>
                    </select>
                    <select
                        value={severityFilter}
                        onChange={(e) => setSeverityFilter(e.target.value)}
                        className="input-field"
                    >
                        <option value="all">All Severity</option>
                        <option value="critical">Critical</option>
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
                    </select>
                </div>
            </div>

            {/* Alerts List */}
            {filteredAlerts.length === 0 ? (
                <div className="card text-center py-12">
                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {searchTerm || filter !== 'all' || severityFilter !== 'all'
                            ? 'No Alerts Match Your Filters'
                            : 'No Alerts'}
                    </h3>
                    <p className="text-gray-600">
                        {searchTerm || filter !== 'all' || severityFilter !== 'all'
                            ? 'Try adjusting your filters'
                            : 'All systems are operating normally'}
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredAlerts.map((alert) => (
                        <div key={alert._id} className={`card border-2 hover:shadow-lg transition-shadow duration-200 ${getSeverityColor(alert.severity)}`}>
                            <div className="flex items-start space-x-4">
                                <div className={`p-3 rounded-lg ${getSeverityColor(alert.severity)}`}>
                                    {getSeverityIcon(alert.severity)}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between mb-2">
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900">{alert.type}</h3>
                                            <p className="text-sm text-gray-600 mt-1">{alert.message}</p>
                                        </div>
                                        <div className="flex items-center space-x-2 ml-4">
                                            <span className={`badge ${getSeverityColor(alert.severity)}`}>
                                                {alert.severity.toUpperCase()}
                                            </span>
                                            <span className={`badge ${alert.status === 'new' ? 'badge-danger' :
                                                alert.status === 'acknowledged' ? 'badge-warning' :
                                                    'badge-success'
                                                }`}>
                                                {alert.status.toUpperCase()}
                                            </span>
                                        </div>
                                    </div>

                                    {alert.metadata && Object.keys(alert.metadata).length > 0 && (
                                        <div className="bg-white bg-opacity-50 rounded-lg p-3 mb-3">
                                            <p className="text-xs font-semibold text-gray-700 mb-2">Alert Details:</p>
                                            <div className="grid grid-cols-2 gap-2 text-xs">
                                                {Object.entries(alert.metadata).map(([key, value]) => (
                                                    <div key={key}>
                                                        <span className="text-gray-600">{key}:</span>{' '}
                                                        <span className="text-gray-900 font-medium">{JSON.stringify(value)}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                                            <span className="flex items-center">
                                                <Clock className="w-4 h-4 mr-1" />
                                                {alert.createdAt ? format(new Date(alert.createdAt), 'MMM dd, yyyy HH:mm') : '-'}
                                            </span>
                                            {alert.apiKey && (
                                                <span>API Key: {alert.apiKey.name}</span>
                                            )}
                                            {alert.user && (
                                                <span>User: {alert.user.name}</span>
                                            )}
                                        </div>

                                        <div className="flex space-x-2">
                                            {alert.status === 'new' && (
                                                <button
                                                    onClick={() => handleAcknowledge(alert._id)}
                                                    className="btn-secondary text-sm"
                                                >
                                                    Acknowledge
                                                </button>
                                            )}
                                            {alert.status !== 'resolved' && (
                                                <button
                                                    onClick={() => handleResolve(alert._id)}
                                                    className="btn-primary text-sm"
                                                >
                                                    Resolve
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {alert.resolution && (
                                        <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                                            <p className="text-sm font-medium text-green-800">Resolution:</p>
                                            <p className="text-sm text-green-700 mt-1">{alert.resolution}</p>
                                            {alert.resolvedAt && (
                                                <p className="text-xs text-green-600 mt-1">
                                                    Resolved on {alert.resolvedAt ? format(new Date(alert.resolvedAt), 'MMM dd, yyyy HH:mm') : 'N/A'}
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
