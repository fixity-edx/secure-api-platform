# 🎨 Secure API Platform - Frontend

A modern, feature-rich React frontend for the Secure API Credential Lifecycle and Usage Monitoring Platform.

## 🚀 Quick Start

```bash
# Install dependencies
npm install --legacy-peer-deps

# Start development server
npm run dev

# Build for production
npm run build
```

## 📦 Tech Stack

- **React 19** - UI Library
- **Vite** - Build Tool & Dev Server
- **React Router DOM** - Client-side Routing
- **Tailwind CSS** - Utility-first CSS Framework
- **Axios** - HTTP Client
- **Recharts** - Data Visualization
- **Lucide React** - Icon Library
- **date-fns** - Date Formatting

## 🏗️ Project Structure

```
frontend/
├── src/
│   ├── components/          # Reusable components
│   │   ├── Layout.jsx       # Main layout with sidebar & navbar
│   │   └── Loading.jsx      # Loading spinner component
│   │
│   ├── context/             # React Context providers
│   │   └── AuthContext.jsx  # Authentication state management
│   │
│   ├── pages/               # Page components
│   │   ├── Login.jsx        # User login page
│   │   ├── Register.jsx     # User registration page
│   │   ├── AdminLogin.jsx   # Admin login page
│   │   ├── Dashboard.jsx    # Main dashboard
│   │   ├── ApiKeys.jsx      # API key management
│   │   ├── Analytics.jsx    # Usage analytics & charts
│   │   ├── Alerts.jsx       # Security alerts
│   │   ├── Webhooks.jsx     # Webhook configuration
│   │   ├── Settings.jsx     # User settings
│   │   │
│   │   ├── admin/           # Admin-only pages
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── AdminUsers.jsx
│   │   │   ├── AdminApiKeys.jsx
│   │   │   ├── AdminAlerts.jsx
│   │   │   ├── AdminAuditLogs.jsx
│   │   │   └── AdminThreatIntel.jsx
│   │   │
│   │   └── vendor/          # Vendor-only pages
│   │       └── VendorDashboard.jsx
│   │
│   ├── services/            # API services
│   │   └── api.js           # Axios instance & API endpoints
│   │
│   ├── App.jsx              # Main app component with routing
│   ├── main.jsx             # Entry point
│   └── index.css            # Global styles & Tailwind imports
│
├── .env                     # Environment variables
├── tailwind.config.js       # Tailwind CSS configuration
├── postcss.config.js        # PostCSS configuration
└── package.json             # Dependencies & scripts
```

## 🎯 Features

### ✅ Authentication
- User registration & login
- Vendor registration & login
- Admin login (environment-based)
- JWT token management with auto-refresh
- Protected routes with role-based access

### ✅ Dashboard
- Real-time statistics
- Usage charts (Line, Bar, Pie)
- Quick action buttons
- Recent activity feed

### ✅ API Key Management
- Generate new API keys
- View all keys with details
- Rotate keys
- Revoke keys
- Copy key to clipboard
- Security warnings

### ✅ Analytics
- Usage over time charts
- Status distribution
- Top endpoints
- Response time tracking
- Export reports (CSV/JSON)
- Time range filtering

### ✅ Security Alerts
- View all alerts
- Filter by severity
- Acknowledge alerts
- Resolve alerts with notes
- Real-time notifications

### ✅ Webhooks
- Create webhooks
- Configure events
- Test webhooks
- Enable/disable webhooks
- Delivery statistics

### ✅ Settings
- Update profile information
- Change password
- Account information
- Security settings

### ✅ Admin Features
- System-wide dashboard
- User management
- All API keys overview
- System alerts
- Audit logs
- Threat intelligence

### ✅ Vendor Features
- Consumption analytics
- Rate limit monitoring
- Endpoint usage tracking

## 🎨 UI/UX Features

- **Modern Design**: Clean, professional interface with gradient accents
- **Responsive**: Works on desktop, tablet, and mobile
- **Dark Mode Ready**: Color scheme prepared for dark mode
- **Animations**: Smooth transitions and micro-interactions
- **Loading States**: Skeleton loaders and spinners
- **Error Handling**: User-friendly error messages
- **Form Validation**: Client-side validation with feedback
- **Accessibility**: Semantic HTML and ARIA labels

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the frontend directory:

```env
VITE_API_URL=http://localhost:5000/api/v1
```

### Tailwind CSS

Custom colors, animations, and utilities are configured in `tailwind.config.js`:

- Primary colors (blue shades)
- Secondary colors (purple shades)
- Custom animations (fade-in, slide-up, pulse-slow)
- Utility classes (btn-primary, card, badge, etc.)

## 📱 Pages Overview

### Public Pages
- `/login` - User login
- `/register` - User registration
- `/admin/login` - Admin login

### User Pages
- `/dashboard` - Main dashboard
- `/api-keys` - API key management
- `/analytics` - Usage analytics
- `/alerts` - Security alerts
- `/webhooks` - Webhook configuration
- `/settings` - Account settings

### Vendor Pages
- `/vendor/dashboard` - Vendor-specific dashboard

### Admin Pages
- `/admin/dashboard` - Admin dashboard
- `/admin/users` - User management
- `/admin/api-keys` - All API keys
- `/admin/alerts` - System alerts
- `/admin/audit-logs` - Audit logs
- `/admin/threat-intel` - Threat intelligence

## 🔐 Security Features

- JWT token storage in localStorage
- Automatic token refresh
- Protected routes
- Role-based access control
- XSS protection
- CSRF protection
- Secure password input
- Auto-logout on token expiry

## 🎯 API Integration

All API calls are centralized in `src/services/api.js`:

```javascript
import { apiKeysAPI, authAPI, analyticsAPI } from '../services/api';

// Example usage
const keys = await apiKeysAPI.getAll();
const analytics = await analyticsAPI.getUsage({ timeRange: '7d' });
```

### Available API Services:
- `authAPI` - Authentication endpoints
- `apiKeysAPI` - API key management
- `analyticsAPI` - Usage analytics
- `adminAPI` - Admin operations
- `monitoringAPI` - Alerts & monitoring
- `webhooksAPI` - Webhook management
- `aiAPI` - AI features
- `vendorAPI` - Vendor operations
- `auditAPI` - Audit logs

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

This creates an optimized build in the `dist/` directory.

### Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Deploy to Netlify

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy --prod
```

### Environment Variables for Production

Set these in your deployment platform:

```
VITE_API_URL=https://your-backend-api.com/api/v1
```

## 📊 Performance

- **Code Splitting**: Automatic route-based code splitting
- **Lazy Loading**: Components loaded on demand
- **Optimized Images**: Proper image optimization
- **Minification**: CSS and JS minified in production
- **Tree Shaking**: Unused code removed

## 🎨 Customization

### Colors

Edit `tailwind.config.js` to change the color scheme:

```javascript
colors: {
  primary: { /* your colors */ },
  secondary: { /* your colors */ },
}
```

### Logo

Replace the Shield icon in Layout.jsx with your logo:

```jsx
<img src="/your-logo.png" alt="Logo" className="w-8 h-8" />
```

## 🐛 Troubleshooting

### Port Already in Use

If port 5173 is in use, Vite will automatically use the next available port (5174, 5175, etc.).

### Dependencies Installation Issues

Use `--legacy-peer-deps` flag:

```bash
npm install --legacy-peer-deps
```

### API Connection Issues

Check that:
1. Backend is running on port 5000
2. `.env` file has correct `VITE_API_URL`
3. CORS is enabled in backend

## 📝 Development Tips

### Hot Module Replacement (HMR)

Vite provides instant HMR. Changes reflect immediately without full page reload.

### VS Code Extensions

Recommended extensions:
- ES7+ React/Redux/React-Native snippets
- Tailwind CSS IntelliSense
- ESLint
- Prettier

### Code Style

- Use functional components with hooks
- Follow React best practices
- Keep components small and focused
- Use meaningful variable names
- Add comments for complex logic

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## 📄 License

MIT License - See LICENSE file for details

## 🎉 Credits

Built with ❤️ using:
- React
- Vite
- Tailwind CSS
- Recharts
- Lucide Icons

---

**Ready to use! Start the dev server and visit http://localhost:5174** 🚀
