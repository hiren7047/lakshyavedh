import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './components/Login'
import Dashboard from './components/Dashboard'
import GamesList from './components/GamesList'
import NewGame from './components/NewGame'
import GameScreen from './components/GameScreen'
import Leaderboard from './components/Leaderboard'
import { useAuthStore } from './store/auth'
import { useEffect } from 'react'

function App() {
  const currentUser = useAuthStore((s) => s.currentUser)
  const isInitialized = useAuthStore((s) => s.isInitialized)
  const initialize = useAuthStore((s) => s.initialize)

  useEffect(() => {
    initialize()
  }, [initialize])

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-yellow-50">
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route 
          path="/dashboard" 
          element={currentUser ? <Dashboard /> : <Navigate to="/login" replace />}
        >
          <Route index element={<GamesList />} />
          <Route path="games" element={<GamesList />} />
          <Route path="games/new" element={<NewGame />} />
          <Route path="games/:gameId" element={<GameScreen />} />
          <Route path="leaderboard" element={<Leaderboard />} />
        </Route>
      </Routes>
    </div>
  )
}

export default App
