import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Building, Shield, Save } from 'lucide-react';

export default function Settings() {
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        organization: user?.organization || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });
        setSaving(true);

        // Simulate save
        setTimeout(() => {
            setMessage({ type: 'success', text: 'Settings saved successfully!' });
            setSaving(false);
        }, 1000);
    };

    return (
        <div className="max-w-4xl space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
                <p className="text-gray-600 mt-1">Manage your account settings and preferences</p>
            </div>

            {message.text && (
                <div className={`p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' :
                        'bg-red-50 text-red-800 border border-red-200'
                    }`}>
                    {message.text}
                </div>
            )}

            {/* Profile Settings */}
            <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                    <User className="w-5 h-5 mr-2" />
                    Profile Information
                </h3>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Full Name
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="input-field"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Email Address
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="input-field"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Organization
                        </label>
                        <input
                            type="text"
                            name="organization"
                            value={formData.organization}
                            onChange={handleChange}
                            className="input-field"
                        />
                    </div>

                    <div className="pt-4">
                        <button type="submit" disabled={saving} className="btn-primary flex items-center space-x-2">
                            <Save className="w-4 h-4" />
                            <span>{saving ? 'Saving...' : 'Save Changes'}</span>
                        </button>
                    </div>
                </form>
            </div>

            {/* Security Settings */}
            <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                    <Shield className="w-5 h-5 mr-2" />
                    Security Settings
                </h3>

                <form className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Current Password
                        </label>
                        <input
                            type="password"
                            name="currentPassword"
                            value={formData.currentPassword}
                            onChange={handleChange}
                            className="input-field"
                            placeholder="Enter current password"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                New Password
                            </label>
                            <input
                                type="password"
                                name="newPassword"
                                value={formData.newPassword}
                                onChange={handleChange}
                                className="input-field"
                                placeholder="Enter new password"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Confirm New Password
                            </label>
                            <input
                                type="password"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                className="input-field"
                                placeholder="Confirm new password"
                            />
                        </div>
                    </div>

                    <div className="pt-4">
                        <button type="button" className="btn-primary">
                            Update Password
                        </button>
                    </div>
                </form>
            </div>

            {/* Account Information */}
            <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Account Information</h3>

                <div className="space-y-4">
                    <div className="flex justify-between items-center py-3 border-b border-gray-200">
                        <span className="text-gray-600">Account Type</span>
                        <span className="badge badge-info">{user?.role?.toUpperCase()}</span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-gray-200">
                        <span className="text-gray-600">Account Status</span>
                        <span className="badge badge-success">ACTIVE</span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-gray-200">
                        <span className="text-gray-600">Member Since</span>
                        <span className="text-gray-900">{new Date(user?.createdAt || Date.now()).toLocaleDateString()}</span>
                    </div>
                </div>
            </div>

            {/* Danger Zone */}
            <div className="card border-red-200 bg-red-50">
                <h3 className="text-lg font-semibold text-red-900 mb-4">Danger Zone</h3>
                <p className="text-sm text-red-700 mb-4">
                    Once you delete your account, there is no going back. Please be certain.
                </p>
                <button className="btn-danger">
                    Delete Account
                </button>
            </div>
        </div>
    );
}
