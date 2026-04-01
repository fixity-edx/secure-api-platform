# 🔐 Secure API Credential Lifecycle and Usage Monitoring Platform

A comprehensive **SaaS-based security platform** built with the **MERN stack** that manages the entire lifecycle of API credentials, including generation, storage, encryption, rotation, access control, monitoring, usage analytics, and **AI-driven threat detection**.

## 🚀 Features

### 🔑 Core Features

#### **API Key Lifecycle Management**
- ✅ Secure API key generation with customizable prefixes
- ✅ Encrypted storage using AES-256-GCM
- ✅ Automatic key rotation scheduling
- ✅ Manual and forced key rotation
- ✅ Key revocation with audit trails
- ✅ Expiration management
- ✅ Environment separation (dev/staging/production)

#### **Security & Access Control**
- ✅ JWT-based authentication
- ✅ Role-based access control (User/Vendor/Admin)
- ✅ IP whitelisting
- ✅ Domain restrictions
- ✅ Permission-based access
- ✅ Account lockout after failed attempts
- ✅ Refresh token flow

#### **Rate Limiting & Throttling**
- ✅ Per-minute rate limits
- ✅ Per-hour rate limits
- ✅ Per-day rate limits
- ✅ Customizable limits per API key
- ✅ Rate limit headers in responses

#### **Monitoring & Analytics**
- ✅ Real-time usage tracking
- ✅ Request history with detailed logs
- ✅ Success/failure rate analytics
- ✅ Bandwidth usage monitoring
- ✅ Performance metrics
- ✅ Daily/weekly/monthly breakdowns
- ✅ Export reports (JSON/CSV)

#### **AI-Powered Security** 🤖
- ✅ Abnormal usage pattern detection
- ✅ Credential leakage probability analysis
- ✅ Threat prediction and risk scoring
- ✅ Security recommendations
- ✅ API optimization suggestions
- ✅ Breach prediction
- ✅ Behavioral analysis

#### **Alerting & Notifications**
- ✅ Security threat alerts
- ✅ Anomaly detection alerts
- ✅ Key expiration warnings
- ✅ Rate limit exceeded notifications
- ✅ Webhook integration for events
- ✅ Alert acknowledgment and resolution

#### **Admin Dashboard**
- ✅ Global API key visibility
- ✅ User management
- ✅ Force key rotation
- ✅ Revoke compromised keys
- ✅ System-wide analytics
- ✅ Threat intelligence dashboard
- ✅ AI security audit reports
- ✅ Audit log viewer

#### **Vendor Features**
- ✅ API consumption analytics
- ✅ Rate limit visualization
- ✅ Integration dashboard
- ✅ Error tracking
- ✅ Performance insights

## 🛠️ Tech Stack

- **Backend**: Node.js + Express.js
- **Database**: MongoDB Atlas
- **Authentication**: JWT (JSON Web Tokens)
- **AI Integration**: Grok AI (llama-3.1-8b-instant)
- **Security**: 
  - AES-256-GCM encryption
  - bcryptjs for password hashing
  - Helmet for security headers
  - express-rate-limit
  - express-mongo-sanitize
  - xss-clean
  - hpp (HTTP Parameter Pollution protection)

## 📁 Project Structure

```
backend/
├── config/
│   └── db.js                 # MongoDB connection
├── controllers/
│   ├── authController.js     # Authentication logic
│   ├── apiKeyController.js   # API key management
│   ├── adminController.js    # Admin operations
│   ├── analyticsController.js # Usage analytics
│   └── ...
├── middleware/
│   ├── auth.js              # Authentication middleware
│   ├── rateLimiter.js       # Rate limiting
│   ├── auditLogger.js       # Audit logging
│   └── errorHandler.js      # Error handling
├── models/
│   ├── User.js              # User model
│   ├── ApiKey.js            # API key model
│   ├── AuditLog.js          # Audit log model
│   ├── Alert.js             # Alert model
│   └── Webhook.js           # Webhook model
├── routes/
│   ├── authRoutes.js        # Auth endpoints
│   ├── apiKeyRoutes.js      # API key endpoints
│   ├── adminRoutes.js       # Admin endpoints
│   ├── analyticsRoutes.js   # Analytics endpoints
│   ├── aiRoutes.js          # AI endpoints
│   ├── monitoringRoutes.js  # Monitoring endpoints
│   ├── webhookRoutes.js     # Webhook endpoints
│   ├── auditRoutes.js       # Audit log endpoints
│   └── vendorRoutes.js      # Vendor endpoints
├── services/
│   └── aiService.js         # Grok AI integration
├── utils/
│   └── encryption.js        # Encryption utilities
├── .env                     # Environment variables
├── .gitignore
├── package.json
├── server.js                # Entry point
└── README.md
```

## 🚀 Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- MongoDB Atlas account
- Grok API key

### 1. Clone the repository
```bash
cd backend
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment variables
The `.env` file is already configured with your credentials:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
ADMIN_EMAIL=admin@gmail.com
ADMIN_PASSWORD=admin123
GROK_API_KEY=your_grok_api_key
GROK_MODEL=llama-3.1-8b-instant
GROK_ENDPOINT=https://api.groq.com/openai/v1/chat/completions
```

### 4. Start the server

**Development mode:**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

The server will run on `http://localhost:5000`

## 📡 API Endpoints

### Authentication
```
POST   /api/v1/auth/register          # User/Vendor registration
POST   /api/v1/auth/login             # User/Vendor login
POST   /api/v1/auth/admin/login       # Admin login (env-based)
GET    /api/v1/auth/me                # Get current user
POST   /api/v1/auth/refresh           # Refresh access token
POST   /api/v1/auth/logout            # Logout
```

### API Keys
```
GET    /api/v1/api-keys               # Get all user's API keys
POST   /api/v1/api-keys               # Generate new API key
GET    /api/v1/api-keys/:id           # Get single API key
PUT    /api/v1/api-keys/:id           # Update API key
DELETE /api/v1/api-keys/:id           # Revoke API key
POST   /api/v1/api-keys/:id/rotate    # Rotate API key
GET    /api/v1/api-keys/:id/usage     # Get usage statistics
POST   /api/v1/api-keys/:id/security-scan  # Run AI security scan
```

### Analytics
```
GET    /api/v1/analytics/usage        # Usage analytics
GET    /api/v1/analytics/request-history  # Request history
GET    /api/v1/analytics/ai-insights  # AI-powered insights
GET    /api/v1/analytics/performance  # Performance metrics
GET    /api/v1/analytics/export       # Export report (JSON/CSV)
```

### Admin
```
GET    /api/v1/admin/dashboard        # Admin dashboard
GET    /api/v1/admin/users            # Get all users
PUT    /api/v1/admin/users/:id/status # Update user status
GET    /api/v1/admin/api-keys         # Get all API keys
DELETE /api/v1/admin/api-keys/:id     # Revoke any API key
POST   /api/v1/admin/api-keys/:id/force-rotate  # Force rotation
GET    /api/v1/admin/alerts           # Get all alerts
GET    /api/v1/admin/audit-logs       # Get audit logs
GET    /api/v1/admin/ai-security-audit  # AI security audit
GET    /api/v1/admin/threat-intelligence  # Threat intelligence
```

### AI Features
```
GET    /api/v1/ai/recommendations     # Security recommendations
POST   /api/v1/ai/analyze-usage       # Analyze usage patterns
POST   /api/v1/ai/detect-leakage      # Detect credential leakage
POST   /api/v1/ai/optimize            # Optimization suggestions
POST   /api/v1/ai/predict-breach      # Predict security breach
```

### Monitoring
```
GET    /api/v1/monitoring/alerts      # Get user's alerts
PUT    /api/v1/monitoring/alerts/:id/acknowledge  # Acknowledge alert
PUT    /api/v1/monitoring/alerts/:id/resolve      # Resolve alert
```

### Webhooks
```
GET    /api/v1/webhooks               # Get all webhooks
POST   /api/v1/webhooks               # Create webhook
PUT    /api/v1/webhooks/:id           # Update webhook
DELETE /api/v1/webhooks/:id           # Delete webhook
POST   /api/v1/webhooks/:id/test      # Test webhook
```

### Vendor
```
GET    /api/v1/vendor/dashboard       # Vendor dashboard
GET    /api/v1/vendor/consumption     # API consumption analytics
GET    /api/v1/vendor/rate-limits     # Rate limit status
```

### Audit Logs
```
GET    /api/v1/audit                  # Get user's audit logs
GET    /api/v1/audit/:id              # Get single audit log
```

## 🔒 Security Features

1. **Encryption**: All API keys are encrypted using AES-256-GCM before storage
2. **Hashing**: Passwords are hashed using bcryptjs with salt rounds
3. **JWT**: Secure token-based authentication with refresh tokens
4. **Rate Limiting**: Protection against brute force and DDoS attacks
5. **Input Sanitization**: MongoDB injection and XSS protection
6. **Security Headers**: Helmet middleware for secure HTTP headers
7. **Audit Logging**: Complete activity tracking with automatic cleanup
8. **IP Whitelisting**: Restrict API key usage to specific IPs
9. **Account Lockout**: Automatic lockout after failed login attempts

## 🤖 AI Integration

The platform uses **Grok AI** for:
- **Anomaly Detection**: Identifies unusual API usage patterns
- **Threat Analysis**: Predicts potential security breaches
- **Leakage Detection**: Analyzes probability of credential compromise
- **Security Recommendations**: Provides actionable security advice
- **Optimization**: Suggests performance improvements
- **Risk Scoring**: Assigns threat levels (0-100)

## 👥 User Roles

### User
- Generate and manage own API keys
- View usage analytics
- Configure webhooks
- Receive security alerts

### Vendor
- All user features
- Advanced consumption analytics
- Rate limit monitoring
- Integration dashboard

### Admin
- Full system access
- User management
- Global API key oversight
- Force key rotation/revocation
- AI security audits
- Threat intelligence dashboard

## 🔐 Admin Access

**Admin login is protected and uses environment-based credentials:**
- Email: `admin@gmail.com`
- Password: `admin123`

**No signup page for admin** - credentials are stored in `.env` file.

## 📊 Monitoring & Alerts

The system automatically creates alerts for:
- Security threats
- Anomaly detection
- Rate limit violations
- Key expiration
- Compromised keys
- Unusual activity
- Policy violations

## 🎯 Production Ready

This backend is production-ready with:
- ✅ Error handling
- ✅ Input validation
- ✅ Security best practices
- ✅ Scalable architecture
- ✅ Comprehensive logging
- ✅ Rate limiting
- ✅ CORS configuration
- ✅ Environment-based config

## 📝 License

This project is licensed under the ISC License.

## 🤝 Support

For issues or questions, please contact the development team.

---

**Built with ❤️ using MERN Stack + AI**
