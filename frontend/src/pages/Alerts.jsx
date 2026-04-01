import { useState, useEffect } from 'react';
import { monitoringAPI } from '../services/api';
import { AlertTriangle, CheckCircle, XCircle, Clock, Shield } from 'lucide-react';
import { format } from 'date-fns';

export default function Alerts() {
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        fetchAlerts();
    }, [filter]);

    const fetchAlerts = async () => {
        try {
            const params = filter !== 'all' ? { severity: filter } : {};
            const response = await monitoringAPI.getAlerts(params);
            setAlerts(response.data.data);
        } catch (error) {
            console.error('Failed to fetch alerts:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAcknowledge = async (id) => {
        try {
            await monitoringAPI.acknowledgeAlert(id);
            fetchAlerts();
        } catch (error) {
            alert('Failed to acknowledge alert: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleResolve = async (id) => {
        const resolution = prompt('Enter resolution notes:');
        if (resolution) {
            try {
                await monitoringAPI.resolveAlert(id, resolution);
                fetchAlerts();
            } catch (error) {
                alert('Failed to resolve alert: ' + (error.response?.data?.message || error.message));
            }
        }
    };

    const getSeverityColor = (severity) => {
        switch (severity) {
            case 'critical': return 'text-red-600 bg-red-100';
            case 'high': return 'text-orange-600 bg-orange-100';
            case 'medium': return 'text-yellow-600 bg-yellow-100';
            case 'low': return 'text-blue-600 bg-blue-100';
            default: return 'text-gray-600 bg-gray-100';
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
                return <Shield className="w-5 h-5" />;
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
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Security Alerts</h2>
                    <p className="text-gray-600 mt-1">Monitor and manage security notifications</p>
                </div>
                <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="input-field"
                >
                    <option value="all">All Alerts</option>
                    <option value="critical">Critical</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                </select>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                <div className="card bg-blue-50 border-blue-200">
                    <p className="text-sm text-blue-600 mb-1">Low</p>
                    <p className="text-2xl font-bold text-blue-700">
                        {alerts.filter(a => a.severity === 'low' && a.status === 'new').length}
                    </p>
                </div>
            </div>

            {/* Alerts List */}
            {alerts.length === 0 ? (
                <div className="card text-center py-12">
                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Alerts</h3>
                    <p className="text-gray-600">All systems are operating normally</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {alerts.map((alert) => (
                        <div key={alert._id} className="card hover:shadow-lg transition-shadow duration-200">
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

                                    {alert.metadata && (
                                        <div className="bg-gray-50 rounded-lg p-3 mb-3">
                                            <pre className="text-xs text-gray-700 overflow-x-auto">
                                                {JSON.stringify(alert.metadata, null, 2)}
                                            </pre>
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
