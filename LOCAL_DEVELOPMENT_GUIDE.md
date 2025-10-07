# 🚀 Local Development Guide - Target Shooting Game

## ✅ **Current Setup Status:**
- ✅ **Routing Fixed** - No more conflicts
- ✅ **API Proxy Configured** - Frontend → Backend communication
- ✅ **Development Scripts Ready** - Easy commands

## 🎯 **Development Commands:**

### **Option 1: Start Both Frontend + Backend Together**
```bash
npm run dev
```
**This will start:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

### **Option 2: Start Separately**

**Terminal 1 - Frontend:**
```bash
npm run dev:client
```
- **URL**: http://localhost:5173
- **Features**: Hot reload, API proxy to backend

**Terminal 2 - Backend:**
```bash
npm run dev:server
```
- **URL**: http://localhost:5000
- **Features**: API endpoints, database

### **Option 3: Install Dependencies First**
```bash
npm run install-all
npm run dev
```

## 🌐 **Local URLs:**

### **Frontend (React App):**
- **Main App**: http://localhost:5173
- **Login**: http://localhost:5173/login
- **Dashboard**: http://localhost:5173/dashboard
- **Games**: http://localhost:5173/dashboard/games
- **New Game**: http://localhost:5173/dashboard/games/new
- **Leaderboard**: http://localhost:5173/dashboard/leaderboard

### **Backend API:**
- **Health Check**: http://localhost:5000/api/health
- **Games API**: http://localhost:5000/api/games
- **All API routes**: http://localhost:5000/api/*

## 👥 **Test User Accounts:**
- **Admin**: `user01` (can create games)
- **Fire Room**: `user02`
- **Water Room**: `user03`
- **Air Room**: `user04`

## 🔧 **Development Features:**

### **Frontend (Vite):**
- ✅ **Hot Reload** - Changes reflect instantly
- ✅ **API Proxy** - `/api/*` → `http://localhost:5000`
- ✅ **TypeScript Support** - Type checking
- ✅ **Tailwind CSS** - Styling

### **Backend (Express):**
- ✅ **CORS Enabled** - Cross-origin requests
- ✅ **JSON Database** - File-based storage
- ✅ **API Endpoints** - RESTful API
- ✅ **Error Handling** - Proper error responses

## 🎮 **Testing Flow:**

1. **Start Development:**
   ```bash
   npm run dev
   ```

2. **Open Browser:**
   - Go to: http://localhost:5173
   - Should redirect to: http://localhost:5173/login

3. **Test Login:**
   - Login as `user01` (admin)
   - Should redirect to: http://localhost:5173/dashboard

4. **Test Game Creation:**
   - Click "Create New Game"
   - Should work without 404 errors

5. **Test API:**
   - Check: http://localhost:5000/api/health
   - Should return: `{"ok": true}`

## 🚨 **Troubleshooting:**

### **If Frontend Shows 404:**
- Check if backend is running on port 5000
- Verify API proxy in `client/vite.config.ts`

### **If API Calls Fail:**
- Ensure backend server is running
- Check console for CORS errors
- Verify API endpoints in `server/src/index.js`

### **If Routes Don't Work:**
- Check browser console for errors
- Verify React Router setup in `client/src/App.tsx`

## 🎯 **Quick Start:**
```bash
# Install all dependencies
npm run install-all

# Start development servers
npm run dev

# Open browser
# http://localhost:5173
```

**Your local development is now properly configured! 🎉**
