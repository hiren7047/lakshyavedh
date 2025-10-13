# Render.com Deployment Guide for Lakshyavedh Backend

## Overview
This guide will help you deploy your Lakshyavedh backend to Render.com cloud platform.

## Prerequisites
- GitHub repository with your code
- Render.com account
- MySQL database (can use Render's managed database)

## Step 1: Prepare Your Repository

### 1.1 Ensure your code is pushed to GitHub
```bash
git add .
git commit -m "Prepare for Render deployment"
git push origin main
```

### 1.2 Verify your file structure
Your repository should have:
```
server/
├── src/
│   ├── index.js
│   └── database.js
├── package.json
├── migrate.js
└── database/
    └── schema.sql
```

## Step 2: Create Render Web Service

### 2.1 Go to Render Dashboard
1. Visit [render.com](https://render.com)
2. Sign in to your account
3. Click "New +" → "Web Service"

### 2.2 Connect Repository
1. Connect your GitHub account
2. Select your repository
3. Choose the branch (usually `main`)

### 2.3 Configure Service Settings

**Basic Settings:**
- **Name**: `lakshyavedh-backend`
- **Region**: Choose closest to your users (Oregon recommended)
- **Branch**: `main`
- **Root Directory**: Leave empty (or set to `server` if your backend is in a subfolder)

**Build & Deploy:**
- **Build Command**: `npm install`
- **Start Command**: `npm start`

**Advanced Settings:**
- **Instance Type**: Free (or Starter for better performance)
- **Auto-Deploy**: Yes (recommended)

## Step 3: Environment Variables

In Render dashboard, go to Environment tab and add:

### Required Environment Variables:
```
NODE_ENV=production
PORT=10000
DB_HOST=your-mysql-host
DB_PORT=3306
DB_USER=your-mysql-user
DB_PASSWORD=your-mysql-password
DB_NAME=u533366727_lakshyavedh
```

### Optional Environment Variables:
```
CORS_ORIGIN=https://your-frontend-domain.com
```

## Step 4: Database Setup

### Option A: Use Render Managed Database
1. In Render dashboard, click "New +" → "PostgreSQL" (or MySQL if available)
2. Choose plan (Free tier available)
3. Note the connection details
4. Update environment variables with database credentials

### Option B: Use External Database
- Use your existing MySQL database
- Update environment variables accordingly

## Step 5: Deploy

### 5.1 Initial Deployment
1. Click "Create Web Service"
2. Render will automatically:
   - Clone your repository
   - Install dependencies
   - Start your application

### 5.2 Monitor Deployment
- Check the "Logs" tab for deployment progress
- Look for "Your service is live" message

### 5.3 Test Your Deployment
1. Copy the service URL (e.g., `https://lakshyavedh-backend.onrender.com`)
2. Test health endpoint: `https://your-service-url.onrender.com/api/health`
3. Expected response:
```json
{
  "ok": true,
  "database": "connected",
  "storage": "mysql",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

## Step 6: Database Migration

### 6.1 Run Migration Script
If you need to migrate existing data:

1. SSH into your Render service (if available) or
2. Add a migration endpoint to your API:

```javascript
// Add to your server/src/index.js
app.post('/api/migrate', async (req, res) => {
  try {
    const { migrateData } = require('../migrate');
    await migrateData();
    res.json({ message: 'Migration completed successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

3. Call the migration endpoint: `POST https://your-service-url.onrender.com/api/migrate`

## Step 7: Frontend Configuration

### 7.1 Update Frontend API URL
Update your frontend to point to the new backend:

```javascript
// In your frontend code
const API_BASE = 'https://your-service-url.onrender.com/api';
```

### 7.2 Update CORS Settings
If needed, update CORS in your backend:

```javascript
// In server/src/index.js
app.use(cors({
  origin: ['https://your-frontend-domain.com', 'http://localhost:5173'],
  credentials: true
}));
```

## Step 8: Monitoring & Maintenance

### 8.1 Health Monitoring
- Set up health checks in Render dashboard
- Monitor logs for errors
- Set up alerts for downtime

### 8.2 Performance Monitoring
- Monitor response times
- Check database connection status
- Monitor memory usage

### 8.3 Backup Strategy
- Regular database backups
- Code repository backups
- Environment variable backups

## Troubleshooting

### Common Issues:

1. **Build Failures**
   - Check Node.js version compatibility
   - Verify all dependencies are in package.json
   - Check build logs for specific errors

2. **Database Connection Issues**
   - Verify environment variables
   - Check database credentials
   - Ensure database allows connections from Render

3. **Service Not Starting**
   - Check start command
   - Verify PORT environment variable
   - Check application logs

4. **CORS Issues**
   - Update CORS settings
   - Verify frontend domain
   - Check preflight requests

### Debug Commands:
```bash
# Check service logs
# In Render dashboard → Logs tab

# Test health endpoint
curl https://your-service-url.onrender.com/api/health

# Test database connection
curl https://your-service-url.onrender.com/api/games
```

## Cost Optimization

### Free Tier Limits:
- 750 hours per month
- Service sleeps after 15 minutes of inactivity
- Cold start delays

### Upgrade Options:
- Starter plan ($7/month): Always-on service
- Professional plan ($25/month): Better performance

## Security Considerations

1. **Environment Variables**
   - Never commit sensitive data
   - Use Render's environment variable system
   - Rotate credentials regularly

2. **Database Security**
   - Use strong passwords
   - Enable SSL connections
   - Restrict database access

3. **API Security**
   - Implement rate limiting
   - Add authentication if needed
   - Monitor for suspicious activity

## Next Steps

After successful deployment:

1. Update frontend to use new backend URL
2. Test all functionality
3. Set up monitoring and alerts
4. Plan for scaling as needed
5. Document deployment process for team

## Support

- Render Documentation: https://render.com/docs
- Render Community: https://community.render.com
- GitHub Issues: For code-related problems
