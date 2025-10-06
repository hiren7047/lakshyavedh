# Target Shooting Game - Deployment Guide

## 🚀 Free Deployment Options

### Option 1: Vercel + Railway (Recommended)

#### Frontend (Vercel)
1. **Create Vercel Account**: Go to [vercel.com](https://vercel.com) and sign up
2. **Connect GitHub**: Link your GitHub account
3. **Deploy Frontend**:
   - Push your code to GitHub
   - Import project in Vercel
   - Set build command: `npm run build`
   - Set output directory: `dist`
   - Add environment variable: `VITE_API_URL=https://your-backend-url.railway.app/api`

#### Backend (Railway)
1. **Create Railway Account**: Go to [railway.app](https://railway.app) and sign up
2. **Deploy Backend**:
   - Connect GitHub repository
   - Select the `server` folder
   - Railway will auto-detect Node.js
   - Add environment variable: `PORT=5000`

### Option 2: Netlify + Render

#### Frontend (Netlify)
1. **Create Netlify Account**: Go to [netlify.com](https://netlify.com)
2. **Deploy**:
   - Connect GitHub
   - Build command: `npm run build`
   - Publish directory: `dist`

#### Backend (Render)
1. **Create Render Account**: Go to [render.com](https://render.com)
2. **Deploy**:
   - Connect GitHub
   - Select Node.js service
   - Build command: `npm install`
   - Start command: `npm start`

### Option 3: All-in-One (Railway)

Deploy both frontend and backend on Railway:
1. Create two separate services on Railway
2. Frontend service: Build command `npm run build`
3. Backend service: Start command `npm start`

## 📁 Project Structure

```
bhautik-sir/
├── client/                 # React Frontend
│   ├── vercel.json        # Vercel config
│   ├── package.json       # Frontend dependencies
│   └── app/               # React app
└── server/                # Node.js Backend
    ├── package.json       # Backend dependencies
    ├── src/
    │   └── index.js       # Express server
    └── data/              # Database files (auto-created)
```

## 🔧 Environment Variables

### Frontend (Vercel/Netlify)
- `VITE_API_URL`: Backend API URL (e.g., `https://your-backend.railway.app/api`)

### Backend (Railway/Render)
- `PORT`: Server port (usually `5000`)

## 📝 Deployment Steps

### Step 1: Prepare Repository
```bash
# Initialize git if not already done
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/target-shooting-game.git
git push -u origin main
```

### Step 2: Deploy Backend
1. Go to Railway.app
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose your repository
5. Select the `server` folder
6. Railway will auto-deploy
7. Copy the generated URL

### Step 3: Deploy Frontend
1. Go to Vercel.com
2. Click "New Project"
3. Import your GitHub repository
4. Set build settings:
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. Add environment variable:
   - Name: `VITE_API_URL`
   - Value: `https://your-backend-url.railway.app/api`
6. Deploy

## 🎯 Free Tier Limits

### Vercel
- ✅ Unlimited static sites
- ✅ 100GB bandwidth/month
- ✅ Automatic HTTPS
- ✅ Custom domains

### Railway
- ✅ $5 credit/month (enough for small apps)
- ✅ Automatic deployments
- ✅ Custom domains
- ✅ Persistent storage

### Netlify
- ✅ 100GB bandwidth/month
- ✅ 300 build minutes/month
- ✅ Form handling
- ✅ Serverless functions

## 🔗 Final URLs

After deployment, you'll have:
- **Frontend**: `https://your-app.vercel.app`
- **Backend**: `https://your-backend.railway.app`
- **Database**: Stored in Railway's persistent storage

## 🛠️ Troubleshooting

### Common Issues:
1. **CORS Errors**: Backend CORS is already configured
2. **Build Failures**: Check Node.js version (18+)
3. **API Connection**: Verify environment variables
4. **Database**: Files are auto-created in `/data` folder

### Support:
- Vercel Docs: [vercel.com/docs](https://vercel.com/docs)
- Railway Docs: [docs.railway.app](https://docs.railway.app)
- Netlify Docs: [docs.netlify.com](https://docs.netlify.com)

## 🎉 Success!

Once deployed, your Target Shooting game will be live and accessible worldwide!
- Multiple users can play simultaneously
- Data persists across sessions
- Automatic HTTPS security
- Professional URLs

Happy deploying! 🚀🎯
