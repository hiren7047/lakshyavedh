# Target Shooting Game

A multiplayer target shooting game with role-based access control and real-time scoring.

## 🎯 Features

- **Multi-Room Gameplay**: Fire Room → Water Room → Air Room progression
- **Role-Based Access**: Different users manage different rooms
- **Real-Time Scoring**: Live score updates and leaderboards
- **Persistent Data**: File-based database with API
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Hindi Theme**: Localized interface with English fallback

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### Local Development

1. **Clone Repository**
```bash
git clone https://github.com/yourusername/target-shooting-game.git
cd target-shooting-game
```

2. **Start Backend**
```bash
cd server
npm install
npm run dev
```

3. **Start Frontend**
```bash
cd client
npm install
npm run dev
```

4. **Access Application**
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000/api

## 👥 User Accounts

### Admin (user01)
- Password: `12345678`
- Access: Full control, create games, view all data

### Room Managers
- **user02**: Fire Room (अग्नि कक्ष)
- **user03**: Water Room (जल कक्ष)  
- **user04**: Air Room (वायु कक्ष)
- Password: `12345678`

## 🎮 How to Play

1. **Admin creates game** with 5 players
2. **Room managers** enter target data for their assigned room
3. **Players progress** through Fire → Water → Air rooms
4. **Final results** calculated and displayed
5. **Leaderboard** shows rankings

## 🛠️ Technology Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS
- **Backend**: Node.js, Express, File-based storage
- **State Management**: Zustand
- **Routing**: React Router v7
- **Deployment**: Vercel + Railway

## 📁 Project Structure

```
├── client/                 # React Frontend
│   ├── app/
│   │   ├── components/     # UI Components
│   │   ├── lib/           # Utilities & Storage
│   │   ├── routes/        # Page Components
│   │   └── store/         # State Management
│   ├── vercel.json        # Deployment Config
│   └── package.json
├── server/                # Node.js Backend
│   ├── src/
│   │   └── index.js       # Express Server
│   ├── data/              # Database Files
│   └── package.json
└── DEPLOYMENT.md          # Deployment Guide
```

## 🌐 Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

**Quick Deploy:**
1. Push to GitHub
2. Deploy backend on Railway
3. Deploy frontend on Vercel
4. Set environment variables
5. Go live! 🚀

## 🔧 Configuration

### Environment Variables

**Frontend:**
- `VITE_API_URL`: Backend API URL

**Backend:**
- `PORT`: Server port (default: 5000)

### Database

Data is stored in `server/data/games.json` with automatic file creation and error handling.

## 📊 API Endpoints

- `GET /api/games` - List all games
- `GET /api/games/:id` - Get specific game
- `POST /api/games` - Create new game
- `PUT /api/games/:id` - Update game
- `DELETE /api/games` - Clear all games

## 🎨 Customization

### Points System
Edit the `POINTS` array in `client/app/routes/dashboard.games.$gameId.tsx`:

```typescript
const POINTS: number[] = [
  2000, 100, 3000, 100, 3000,
  // ... 40 values total
];
```

### Room Themes
Modify room colors and themes in `client/app/components/ui.tsx`:

```typescript
const variants = {
  fire: "bg-gradient-to-r from-orange-500 to-red-600",
  water: "bg-gradient-to-r from-blue-400 to-cyan-600", 
  air: "bg-gradient-to-r from-sky-400 to-blue-500",
};
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## 📄 License

MIT License - feel free to use for personal or commercial projects.

## 🆘 Support

- **Issues**: GitHub Issues
- **Documentation**: See DEPLOYMENT.md
- **Live Demo**: [Your deployed URL]

---

Made with ❤️ for target shooting enthusiasts! 🎯🔥💧💨
