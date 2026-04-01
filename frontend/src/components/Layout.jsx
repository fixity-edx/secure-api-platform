import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    LayoutDashboard,
    Key,
    BarChart3,
    Bell,
    Webhook,
    Settings,
    LogOut,
    Menu,
    X,
    Shield,
    Users,
    Activity,
    FileText,
    Target,
    Store,
} from 'lucide-react';

export default function Layout({ children }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { user, logout, isAdmin } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    // Navigation items based on role
    const getNavigationItems = () => {
        if (isAdmin) {
            return [
                { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
                { name: 'Users', path: '/admin/users', icon: Users },
                { name: 'API Keys', path: '/admin/api-keys', icon: Key },
                { name: 'Alerts', path: '/admin/alerts', icon: Bell },
                { name: 'Audit Logs', path: '/admin/audit-logs', icon: FileText },
                { name: 'Threat Intel', path: '/admin/threat-intel', icon: Target },
            ];
        } else {
            return [
                { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
                { name: 'API Keys', path: '/api-keys', icon: Key },
                { name: 'Analytics', path: '/analytics', icon: BarChart3 },
                { name: 'Alerts', path: '/alerts', icon: Bell },
                { name: 'Webhooks', path: '/webhooks', icon: Webhook },
                { name: 'Settings', path: '/settings', icon: Settings },
            ];
        }
    };

    const navigationItems = getNavigationItems();

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Mobile sidebar backdrop */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                ></div>
            )}

            {/* Sidebar */}
            <aside
                className={`fixed top-0 left-0 z-50 h-full w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                <div className="flex flex-col h-full">
                    {/* Logo */}
                    <div className="flex items-center justify-between p-6 border-b border-gray-200">
                        <div className="flex items-center space-x-2">
                            <Shield className="w-8 h-8 text-primary-600" />
                            <span className="text-xl font-bold text-gray-800">
                                {isAdmin ? 'Admin' : 'SecureAPI'}
                            </span>
                        </div>
                        <button
                            onClick={() => setSidebarOpen(false)}
                            className="lg:hidden text-gray-500 hover:text-gray-700"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {/* User Info */}
                    <div className="p-6 border-b border-gray-200">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white font-semibold">
                                {user?.name?.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
                                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                            </div>
                        </div>
                        <div className="mt-3">
                            <span className={`badge ${isAdmin ? 'badge-danger' : 'badge-success'}`}>
                                {user?.role?.toUpperCase()}
                            </span>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 overflow-y-auto p-4">
                        <ul className="space-y-1">
                            {navigationItems.map((item) => {
                                const Icon = item.icon;
                                const isActive = location.pathname === item.path;
                                return (
                                    <li key={item.path}>
                                        <Link
                                            to={item.path}
                                            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200 ${isActive
                                                ? 'bg-primary-50 text-primary-700 font-medium'
                                                : 'text-gray-700 hover:bg-gray-100'
                                                }`}
                                            onClick={() => setSidebarOpen(false)}
                                        >
                                            <Icon className="w-5 h-5" />
                                            <span>{item.name}</span>
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    </nav>

                    {/* Logout Button */}
                    <div className="p-4 border-t border-gray-200">
                        <button
                            onClick={handleLogout}
                            className="flex items-center space-x-3 px-4 py-3 w-full rounded-lg text-red-600 hover:bg-red-50 transition-colors duration-200"
                        >
                            <LogOut className="w-5 h-5" />
                            <span className="font-medium">Logout</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="lg:ml-64">
                {/* Top Navbar */}
                <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30">
                    <div className="flex items-center justify-between px-6 py-4">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="lg:hidden text-gray-500 hover:text-gray-700"
                        >
                            <Menu className="w-6 h-6" />
                        </button>

                        <div className="flex-1 lg:flex-none">
                            <h1 className="text-2xl font-bold text-gray-800">
                                {navigationItems.find((item) => item.path === location.pathname)?.name || 'Dashboard'}
                            </h1>
                        </div>

                        <div className="flex items-center space-x-4">
                            {/* Notification Bell */}
                            <button className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                                <Bell className="w-6 h-6" />
                                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                            </button>

                            {/* User Avatar */}
                            <div className="hidden sm:flex items-center space-x-2">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white font-semibold text-sm">
                                    {user?.name?.charAt(0).toUpperCase()}
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="p-6">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>

                {/* Footer */}
                <footer className="bg-white border-t border-gray-200 mt-12">
                    <div className="max-w-7xl mx-auto px-6 py-4">
                        <div className="flex flex-col sm:flex-row justify-between items-center text-sm text-gray-600">
                            <p>&copy; 2026 Secure API Platform. All rights reserved.</p>
                            <p className="mt-2 sm:mt-0">Built with ❤️ using MERN + AI</p>
                        </div>
                    </div>
                </footer>
            </div>
        </div>
    );
}
