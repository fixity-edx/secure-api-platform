import { useState, useEffect } from 'react';
import { webhooksAPI } from '../services/api';
import { Webhook, Plus, Trash2, TestTube, CheckCircle, XCircle } from 'lucide-react';

export default function Webhooks() {
    const [webhooks, setWebhooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);

    useEffect(() => {
        fetchWebhooks();
    }, []);

    const fetchWebhooks = async () => {
        try {
            const response = await webhooksAPI.getAll();
            setWebhooks(response.data.data);
        } catch (error) {
            console.error('Failed to fetch webhooks:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (webhookData) => {
        try {
            await webhooksAPI.create(webhookData);
            setShowCreateModal(false);
            fetchWebhooks();
        } catch (error) {
            alert('Failed to create webhook: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleDelete = async (id, name) => {
        if (window.confirm(`Delete webhook "${name}"?`)) {
            try {
                await webhooksAPI.delete(id);
                fetchWebhooks();
            } catch (error) {
                alert('Failed to delete webhook: ' + (error.response?.data?.message || error.message));
            }
        }
    };

    const handleTest = async (id, name) => {
        try {
            await webhooksAPI.test(id);
            alert(`Test event sent to "${name}"`);
        } catch (error) {
            alert('Failed to test webhook: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleToggle = async (id, isActive) => {
        try {
            await webhooksAPI.update(id, { isActive: !isActive });
            fetchWebhooks();
        } catch (error) {
            alert('Failed to update webhook: ' + (error.response?.data?.message || error.message));
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
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Webhooks</h2>
                    <p className="text-gray-600 mt-1">Configure event-based notifications</p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="btn-primary flex items-center space-x-2"
                >
                    <Plus className="w-5 h-5" />
                    <span>Create Webhook</span>
                </button>
            </div>

            {/* Webhooks List */}
            {webhooks.length === 0 ? (
                <div className="card text-center py-12">
                    <Webhook className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Webhooks Configured</h3>
                    <p className="text-gray-600 mb-4">Set up webhooks to receive real-time notifications</p>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="btn-primary inline-flex items-center space-x-2"
                    >
                        <Plus className="w-5 h-5" />
                        <span>Create Webhook</span>
                    </button>
                </div>
            ) : (
                <div className="grid gap-4">
                    {webhooks.map((webhook) => (
                        <div key={webhook._id} className="card hover:shadow-lg transition-shadow duration-200">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center space-x-3 mb-3">
                                        <h3 className="text-lg font-semibold text-gray-900">{webhook.name}</h3>
                                        <span className={`badge ${webhook.isActive ? 'badge-success' : 'badge-danger'}`}>
                                            {webhook.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </div>

                                    <div className="space-y-2 mb-4">
                                        <div className="flex items-center space-x-2 text-sm">
                                            <span className="text-gray-600 font-medium">URL:</span>
                                            <code className="bg-gray-100 px-2 py-1 rounded text-gray-900">{webhook.url}</code>
                                        </div>
                                        <div className="flex items-center space-x-2 text-sm">
                                            <span className="text-gray-600 font-medium">Events:</span>
                                            <div className="flex flex-wrap gap-1">
                                                {webhook.events.map((event, idx) => (
                                                    <span key={idx} className="badge badge-info">{event}</span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-4 text-sm">
                                        <div>
                                            <p className="text-gray-600">Total Deliveries</p>
                                            <p className="font-semibold text-gray-900">{webhook.deliveryStats?.total || 0}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-600">Successful</p>
                                            <p className="font-semibold text-green-600 flex items-center">
                                                <CheckCircle className="w-4 h-4 mr-1" />
                                                {webhook.deliveryStats?.successful || 0}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-gray-600">Failed</p>
                                            <p className="font-semibold text-red-600 flex items-center">
                                                <XCircle className="w-4 h-4 mr-1" />
                                                {webhook.deliveryStats?.failed || 0}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2 ml-6">
                                    <button
                                        onClick={() => handleToggle(webhook._id, webhook.isActive)}
                                        className={`btn-secondary text-sm ${webhook.isActive ? '' : 'bg-green-100 text-green-700'}`}
                                    >
                                        {webhook.isActive ? 'Disable' : 'Enable'}
                                    </button>
                                    <button
                                        onClick={() => handleTest(webhook._id, webhook.name)}
                                        className="btn-secondary text-sm flex items-center space-x-1"
                                    >
                                        <TestTube className="w-4 h-4" />
                                        <span>Test</span>
                                    </button>
                                    <button
                                        onClick={() => handleDelete(webhook._id, webhook.name)}
                                        className="btn-danger text-sm flex items-center space-x-1"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        <span>Delete</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create Webhook Modal */}
            {showCreateModal && (
                <CreateWebhookModal
                    onClose={() => setShowCreateModal(false)}
                    onCreate={handleCreate}
                />
            )}
        </div>
    );
}

// Create Webhook Modal Component
function CreateWebhookModal({ onClose, onCreate }) {
    const [formData, setFormData] = useState({
        name: '',
        url: '',
        events: [],
    });

    const availableEvents = [
        'key_created',
        'key_rotated',
        'key_revoked',
        'key_expired',
        'security_alert',
        'anomaly_detected',
        'rate_limit_exceeded',
    ];

    const handleEventToggle = (event) => {
        setFormData(prev => ({
            ...prev,
            events: prev.events.includes(event)
                ? prev.events.filter(e => e !== event)
                : [...prev.events, event]
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onCreate(formData);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Create Webhook</h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Webhook Name *
                        </label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="input-field"
                            placeholder="My Webhook"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Webhook URL *
                        </label>
                        <input
                            type="url"
                            value={formData.url}
                            onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                            className="input-field"
                            placeholder="https://your-server.com/webhook"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Events to Subscribe *
                        </label>
                        <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-300 rounded-lg p-3">
                            {availableEvents.map((event) => (
                                <label key={event} className="flex items-center space-x-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.events.includes(event)}
                                        onChange={() => handleEventToggle(event)}
                                        className="rounded text-primary-600 focus:ring-primary-500"
                                    />
                                    <span className="text-sm text-gray-700">{event.replace(/_/g, ' ')}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="flex space-x-3 pt-4">
                        <button type="button" onClick={onClose} className="flex-1 btn-secondary">
                            Cancel
                        </button>
                        <button type="submit" className="flex-1 btn-primary" disabled={formData.events.length === 0}>
                            Create Webhook
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
