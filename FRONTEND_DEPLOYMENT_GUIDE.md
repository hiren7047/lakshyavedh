# Frontend Deployment Guide with Render Backend

## Backend URL Updated
Your frontend is now configured to use the Render backend:
**Backend URL**: `https://lakshyavedh.onrender.com/api`

## Files Updated
1. **`client/vite.config.ts`** - Updated API URL for production
2. **`client/env.production`** - Production environment variables

## Frontend Deployment Options

### Option 1: Deploy to Netlify (Recommended)
1. Go to [netlify.com](https://netlify.com)
2. Connect your GitHub repository
3. Build settings:
   - **Build command**: `cd client && npm run build`
   - **Publish directory**: `client/dist`
4. Deploy

### Option 2: Deploy to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Connect your GitHub repository
3. Build settings:
   - **Framework Preset**: Vite
   - **Root Directory**: `client`
4. Deploy

### Option 3: Deploy to Render (Static Site)
1. Go to [render.com](https://render.com)
2. Click "New +" → "Static Site"
3. Connect your GitHub repository
4. Build settings:
   - **Build Command**: `cd client && npm install && npm run build`
   - **Publish Directory**: `client/dist`
5. Deploy

## Local Development
For local development, the frontend will still use the local backend proxy:
- **Local**: `http://localhost:5000/api`
- **Production**: `https://lakshyavedh.onrender.com/api`

## Testing
After deployment, test your frontend:
1. Open your deployed frontend URL
2. Try creating a new game
3. Check if data is being saved to the Render backend
4. Verify the health endpoint: `https://lakshyavedh.onrender.com/api/health`

## Environment Variables
The frontend automatically uses the correct API URL based on the environment:
- **Development**: Uses local proxy
- **Production**: Uses Render backend

## Troubleshooting
If you encounter CORS issues:
1. Update backend CORS settings in `server/src/index.js`
2. Add your frontend domain to allowed origins
3. Redeploy the backend

## Next Steps
1. Deploy your frontend to your preferred platform
2. Test the complete application
3. Update any hardcoded URLs if needed
4. Set up monitoring and analytics
