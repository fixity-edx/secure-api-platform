# 🚀 Production Deployment Guide

## Deploy Your Secure API Platform to Production

---

## 📋 Table of Contents
1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Environment Configuration](#environment-configuration)
3. [Deployment Options](#deployment-options)
4. [Security Hardening](#security-hardening)
5. [Monitoring & Maintenance](#monitoring--maintenance)

---

## 1. Pre-Deployment Checklist

### ✅ Backend Checklist
- [ ] All environment variables configured
- [ ] MongoDB Atlas production cluster ready
- [ ] JWT secrets are strong and unique
- [ ] Admin credentials are secure
- [ ] Grok API key is valid
- [ ] CORS origins configured for production
- [ ] Rate limits are appropriate
- [ ] Error logging is configured
- [ ] Database indexes are created
- [ ] API documentation is up to date

### ✅ Security Checklist
- [ ] All secrets are in environment variables (not hardcoded)
- [ ] HTTPS is enforced
- [ ] Security headers are enabled (Helmet)
- [ ] Input validation is implemented
- [ ] SQL/NoSQL injection protection is active
- [ ] XSS protection is enabled
- [ ] Rate limiting is configured
- [ ] CORS is properly configured
- [ ] Authentication tokens expire appropriately

---

## 2. Environment Configuration

### Production Environment Variables

Create `backend/.env.production`:

```env
# Server Configuration
NODE_ENV=production
PORT=5000

# MongoDB Configuration (Production)
MONGODB_URI=mongodb+srv://your_prod_user:your_prod_password@your_prod_cluster.mongodb.net/secure-api-platform-prod?retryWrites=true&w=majority

# JWT Configuration (Use strong secrets!)
JWT_SECRET=your_very_strong_jwt_secret_here_min_32_chars
JWT_EXPIRE=7d
JWT_REFRESH_EXPIRE=30d

# Admin Credentials (Change these!)
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD=your_very_strong_admin_password

# Grok AI Configuration
GROK_API_KEY=your_grok_api_key
GROK_MODEL=llama-3.1-8b-instant
GROK_ENDPOINT=https://api.groq.com/openai/v1/chat/completions

# Encryption Configuration (Generate new key!)
ENCRYPTION_KEY=your_32_character_encryption_key
ENCRYPTION_ALGORITHM=aes-256-gcm

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# CORS Configuration (Your frontend domain)
CORS_ORIGIN=https://yourdomain.com

# API Key Configuration
API_KEY_LENGTH=32
API_KEY_PREFIX=sk_
API_KEY_ROTATION_DAYS=90
```

### Generate Strong Secrets

```bash
# Generate JWT Secret (Node.js)
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Generate Encryption Key (32 chars)
node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"

# Generate Admin Password
node -e "console.log(require('crypto').randomBytes(16).toString('base64'))"
```

---

## 3. Deployment Options

### Option 1: Deploy to Heroku

#### Step 1: Install Heroku CLI
```bash
# Download from https://devcenter.heroku.com/articles/heroku-cli
```

#### Step 2: Login and Create App
```bash
heroku login
cd backend
heroku create your-app-name
```

#### Step 3: Set Environment Variables
```bash
heroku config:set NODE_ENV=production
heroku config:set MONGODB_URI="your_mongodb_uri"
heroku config:set JWT_SECRET="your_jwt_secret"
heroku config:set ADMIN_EMAIL="admin@yourdomain.com"
heroku config:set ADMIN_PASSWORD="your_admin_password"
heroku config:set GROK_API_KEY="your_grok_key"
heroku config:set CORS_ORIGIN="https://your-frontend-domain.com"
# ... set all other env variables
```

#### Step 4: Create Procfile
Create `backend/Procfile`:
```
web: node server.js
```

#### Step 5: Deploy
```bash
git add .
git commit -m "Prepare for production deployment"
git push heroku main
```

#### Step 6: Open App
```bash
heroku open
heroku logs --tail  # View logs
```

---

### Option 2: Deploy to Railway

#### Step 1: Install Railway CLI
```bash
npm install -g @railway/cli
```

#### Step 2: Login and Initialize
```bash
railway login
cd backend
railway init
```

#### Step 3: Add Environment Variables
```bash
railway variables set NODE_ENV=production
railway variables set MONGODB_URI="your_mongodb_uri"
# ... set all other variables
```

#### Step 4: Deploy
```bash
railway up
```

---

### Option 3: Deploy to Render

#### Step 1: Create Account
Go to https://render.com and create an account

#### Step 2: New Web Service
- Click "New +" → "Web Service"
- Connect your GitHub repository
- Select the backend directory

#### Step 3: Configure
- **Name**: your-app-name
- **Environment**: Node
- **Build Command**: `npm install`
- **Start Command**: `node server.js`

#### Step 4: Add Environment Variables
Add all environment variables in the Render dashboard

#### Step 5: Deploy
Click "Create Web Service"

---

### Option 4: Deploy to AWS EC2

#### Step 1: Launch EC2 Instance
- Choose Ubuntu Server 22.04 LTS
- Instance type: t2.micro (or larger)
- Configure security group (allow ports 22, 80, 443, 5000)

#### Step 2: Connect to Instance
```bash
ssh -i your-key.pem ubuntu@your-ec2-ip
```

#### Step 3: Install Node.js
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
sudo npm install -g pm2
```

#### Step 4: Clone Repository
```bash
git clone your-repo-url
cd Secure-API-platform/backend
npm install
```

#### Step 5: Create Environment File
```bash
nano .env
# Paste your production environment variables
```

#### Step 6: Start with PM2
```bash
pm2 start server.js --name api-platform
pm2 save
pm2 startup
```

#### Step 7: Setup Nginx (Optional)
```bash
sudo apt-get install nginx
sudo nano /etc/nginx/sites-available/default
```

Add:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
sudo systemctl restart nginx
```

#### Step 8: Setup SSL with Let's Encrypt
```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

---

### Option 5: Deploy to DigitalOcean App Platform

#### Step 1: Create Account
Go to https://www.digitalocean.com

#### Step 2: Create App
- Click "Create" → "Apps"
- Connect GitHub repository
- Select backend directory

#### Step 3: Configure
- **Name**: your-app-name
- **Environment Variables**: Add all variables
- **Build Command**: `npm install`
- **Run Command**: `node server.js`

#### Step 4: Deploy
Click "Create Resources"

---

## 4. Security Hardening

### Update Production Settings

Update `backend/server.js` for production:

```javascript
// Add security middleware
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import helmet from 'helmet';

// Strict rate limiting for production
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 100 : 1000
});

app.use(limiter);

// Helmet with strict CSP
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// Trust proxy (for Heroku, Railway, etc.)
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}
```

### Database Security

```javascript
// MongoDB connection with production settings
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      // Production settings
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};
```

### Environment-Based CORS

```javascript
const corsOptions = {
  origin: process.env.NODE_ENV === 'production'
    ? process.env.CORS_ORIGIN
    : 'http://localhost:5173',
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
```

---

## 5. Monitoring & Maintenance

### Setup Logging

Install Winston for production logging:

```bash
npm install winston
```

Create `backend/utils/logger.js`:

```javascript
import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));
}

export default logger;
```

### Health Check Endpoint

Already implemented at `/api/v1/health`

### Database Backups

```bash
# MongoDB Atlas automatic backups (recommended)
# Or manual backup:
mongodump --uri="your_mongodb_uri" --out=/backup/$(date +%Y%m%d)
```

### Monitoring Services

Consider integrating:
- **Sentry** - Error tracking
- **LogRocket** - Session replay
- **New Relic** - Performance monitoring
- **Datadog** - Infrastructure monitoring

### PM2 Monitoring (if using PM2)

```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7

# Monitor
pm2 monit
pm2 logs
```

---

## 6. Post-Deployment

### Test Production API

```bash
# Health check
curl https://your-domain.com/api/v1/health

# Test authentication
curl -X POST https://your-domain.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### Update Frontend

Update frontend `.env.production`:

```env
VITE_API_URL=https://your-backend-domain.com/api/v1
```

### Setup CI/CD (Optional)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Heroku
        uses: akhileshns/heroku-deploy@v3.12.12
        with:
          heroku_api_key: ${{secrets.HEROKU_API_KEY}}
          heroku_app_name: "your-app-name"
          heroku_email: "your-email@example.com"
```

---

## 7. Troubleshooting

### Common Issues

**MongoDB Connection Failed**
- Check MongoDB Atlas IP whitelist (allow 0.0.0.0/0 for cloud platforms)
- Verify connection string
- Check network access settings

**CORS Errors**
- Verify CORS_ORIGIN matches frontend domain
- Check if credentials are enabled
- Ensure HTTPS is used in production

**Environment Variables Not Loading**
- Verify all variables are set in platform dashboard
- Check for typos in variable names
- Restart the application after setting variables

**High Memory Usage**
- Increase instance size
- Optimize database queries
- Implement caching

---

## 8. Maintenance Checklist

### Daily
- [ ] Check error logs
- [ ] Monitor API response times
- [ ] Review security alerts

### Weekly
- [ ] Review usage analytics
- [ ] Check database performance
- [ ] Update dependencies (if needed)

### Monthly
- [ ] Rotate API keys
- [ ] Review and update security policies
- [ ] Database backup verification
- [ ] Performance optimization

---

## 🎉 Deployment Complete!

Your Secure API Platform is now live in production!

**Next Steps:**
1. Monitor application health
2. Set up alerts for errors
3. Configure automated backups
4. Implement CI/CD pipeline
5. Scale as needed

**Resources:**
- [Heroku Node.js Docs](https://devcenter.heroku.com/articles/deploying-nodejs)
- [Railway Docs](https://docs.railway.app/)
- [Render Docs](https://render.com/docs)
- [AWS EC2 Docs](https://docs.aws.amazon.com/ec2/)
- [MongoDB Atlas](https://docs.atlas.mongodb.com/)

---

**Happy Deploying! 🚀**
