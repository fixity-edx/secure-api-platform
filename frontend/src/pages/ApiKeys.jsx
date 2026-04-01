import { useState, useEffect } from 'react';
import { apiKeysAPI } from '../services/api';
import { Key, Plus, RotateCw, Trash2, Eye, EyeOff, Copy, Check, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

export default function ApiKeys() {
    const [apiKeys, setApiKeys] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showKeyModal, setShowKeyModal] = useState(false);
    const [generatedKey, setGeneratedKey] = useState('');
    const [copiedKey, setCopiedKey] = useState(false);

    useEffect(() => {
        fetchApiKeys();
    }, []);

    const fetchApiKeys = async () => {
        try {
            const response = await apiKeysAPI.getAll();
            setApiKeys(response.data.data);
        } catch (error) {
            console.error('Failed to fetch API keys:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateKey = async (keyData) => {
        try {
            const response = await apiKeysAPI.create(keyData);
            setGeneratedKey(response.data.data.key);
            setShowKeyModal(true);
            setShowCreateModal(false);
            fetchApiKeys();
        } catch (error) {
            alert('Failed to create API key: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleRevoke = async (id, name) => {
        if (window.confirm(`Are you sure you want to revoke "${name}"?`)) {
            try {
                await apiKeysAPI.revoke(id, 'User revoked');
                fetchApiKeys();
            } catch (error) {
                alert('Failed to revoke key: ' + (error.response?.data?.message || error.message));
            }
        }
    };

    const handleRotate = async (id, name) => {
        if (window.confirm(`Rotate API key "${name}"? The old key will be invalidated.`)) {
            try {
                const response = await apiKeysAPI.rotate(id);
                setGeneratedKey(response.data.data.key);
                setShowKeyModal(true);
                fetchApiKeys();
            } catch (error) {
                alert('Failed to rotate key: ' + (error.response?.data?.message || error.message));
            }
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(generatedKey);
        setCopiedKey(true);
        setTimeout(() => setCopiedKey(false), 2000);
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
                    <h2 className="text-2xl font-bold text-gray-900">API Keys</h2>
                    <p className="text-gray-600 mt-1">Manage your API keys and access tokens</p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="btn-primary flex items-center space-x-2"
                >
                    <Plus className="w-5 h-5" />
                    <span>Generate New Key</span>
                </button>
            </div>

            {/* API Keys List */}
            {apiKeys.length === 0 ? (
                <div className="card text-center py-12">
                    <Key className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No API Keys Yet</h3>
                    <p className="text-gray-600 mb-4">Create your first API key to get started</p>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="btn-primary inline-flex items-center space-x-2"
                    >
                        <Plus className="w-5 h-5" />
                        <span>Generate API Key</span>
                    </button>
                </div>
            ) : (
                <div className="grid gap-4">
                    {apiKeys.map((key) => (
                        <div key={key._id} className="card hover:shadow-lg transition-shadow duration-200">
                            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                                <div className="flex-1">
                                    <div className="flex items-start justify-between mb-3">
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900">{key.name}</h3>
                                            <p className="text-sm text-gray-600 mt-1">{key.description || 'No description'}</p>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-2 mb-3">
                                        <span className={`badge ${key.status === 'active' ? 'badge-success' :
                                            key.status === 'revoked' ? 'badge-danger' :
                                                key.status === 'expired' ? 'badge-warning' :
                                                    'badge-info'
                                            }`}>
                                            {key.status.toUpperCase()}
                                        </span>
                                        <span className="badge badge-info">{key.environment.toUpperCase()}</span>
                                        {key.tags?.map((tag, idx) => (
                                            <span key={idx} className="badge bg-gray-100 text-gray-700">{tag}</span>
                                        ))}
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                        <div>
                                            <p className="text-gray-600">Prefix</p>
                                            <p className="font-mono font-semibold text-gray-900">{key.prefix}***</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-600">Requests</p>
                                            <p className="font-semibold text-gray-900">{key.usageStats?.totalRequests || 0}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-600">Success Rate</p>
                                            <p className="font-semibold text-gray-900">
                                                {key.usageStats?.totalRequests > 0
                                                    ? ((key.usageStats.successfulRequests / key.usageStats.totalRequests) * 100).toFixed(1)
                                                    : 0}%
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-gray-600">Expires</p>
                                            <p className="font-semibold text-gray-900">
                                                {key.expiresAt ? format(new Date(key.expiresAt), 'MMM dd, yyyy') : 'Never'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex lg:flex-col gap-2 mt-4 lg:mt-0 lg:ml-6">
                                    <button
                                        onClick={() => handleRotate(key._id, key.name)}
                                        disabled={key.status !== 'active'}
                                        className="btn-secondary text-sm flex items-center space-x-1 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <RotateCw className="w-4 h-4" />
                                        <span>Rotate</span>
                                    </button>
                                    <button
                                        onClick={() => handleRevoke(key._id, key.name)}
                                        disabled={key.status === 'revoked'}
                                        className="btn-danger text-sm flex items-center space-x-1 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        <span>Revoke</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create API Key Modal */}
            {showCreateModal && (
                <CreateKeyModal
                    onClose={() => setShowCreateModal(false)}
                    onCreate={handleCreateKey}
                />
            )}

            {/* Show Generated Key Modal */}
            {showKeyModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-8">
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Check className="w-10 h-10 text-green-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">API Key Generated!</h2>
                            <p className="text-gray-600">Save this key securely - it will only be shown once</p>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-4 mb-6">
                            <div className="flex items-center justify-between mb-2">
                                <label className="text-sm font-medium text-gray-700">Your API Key</label>
                                <button
                                    onClick={copyToClipboard}
                                    className="text-sm text-primary-600 hover:text-primary-700 flex items-center space-x-1"
                                >
                                    {copiedKey ? (
                                        <>
                                            <Check className="w-4 h-4" />
                                            <span>Copied!</span>
                                        </>
                                    ) : (
                                        <>
                                            <Copy className="w-4 h-4" />
                                            <span>Copy</span>
                                        </>
                                    )}
                                </button>
                            </div>
                            <div className="bg-white border border-gray-300 rounded-lg p-3 font-mono text-sm break-all">
                                {generatedKey}
                            </div>
                        </div>

                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                            <div className="flex items-start space-x-3">
                                <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                                <div className="text-sm text-yellow-800">
                                    <p className="font-semibold mb-1">Important Security Notice</p>
                                    <ul className="list-disc list-inside space-y-1">
                                        <li>Store this key in a secure location</li>
                                        <li>Never commit it to version control</li>
                                        <li>Use environment variables in your code</li>
                                        <li>This key will not be shown again</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => {
                                setShowKeyModal(false);
                                setGeneratedKey('');
                            }}
                            className="w-full btn-primary"
                        >
                            I've Saved My Key
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

// Create Key Modal Component
function CreateKeyModal({ onClose, onCreate }) {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        environment: 'development',
        expiresInDays: 365,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        onCreate(formData);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Generate New API Key</h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Key Name *
                        </label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="input-field"
                            placeholder="Production API Key"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Description
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="input-field"
                            rows="3"
                            placeholder="Optional description..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Environment *
                        </label>
                        <select
                            value={formData.environment}
                            onChange={(e) => setFormData({ ...formData, environment: e.target.value })}
                            className="input-field"
                            required
                        >
                            <option value="development">Development</option>
                            <option value="staging">Staging</option>
                            <option value="production">Production</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Expires In (Days) *
                        </label>
                        <input
                            type="number"
                            value={formData.expiresInDays}
                            onChange={(e) => setFormData({ ...formData, expiresInDays: parseInt(e.target.value) })}
                            className="input-field"
                            min="1"
                            max="3650"
                            required
                        />
                    </div>

                    <div className="flex space-x-3 pt-4">
                        <button type="button" onClick={onClose} className="flex-1 btn-secondary">
                            Cancel
                        </button>
                        <button type="submit" className="flex-1 btn-primary">
                            Generate Key
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
