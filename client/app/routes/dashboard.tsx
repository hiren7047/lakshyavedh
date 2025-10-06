import { useEffect } from "react";
import { Outlet, useNavigate, Link, useLocation } from "react-router";
import { useAuthStore } from "../store/auth";
import { Button, Header, Footer, PageLayout } from "../components/ui";

export function meta() {
  return [{ title: "Target Shooting - Game Admin" }];
}

export default function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const currentUser = useAuthStore((s) => s.currentUser);
  const isInitialized = useAuthStore((s) => s.isInitialized);
  const logout = useAuthStore((s) => s.logout);
  const initialize = useAuthStore((s) => s.initialize);

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (isInitialized && !currentUser) {
      navigate("/login", { replace: true });
    }
  }, [isInitialized, currentUser, navigate]);

  // Show loading while initializing
  if (!isInitialized) {
    return (
      <PageLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  // Don't render if not logged in (will redirect)
  if (!currentUser) return null;

  const isUserAdmin = currentUser.username === "user01";

  return (
    <PageLayout>
      <Header>
        <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white">Target Shooting - Game Admin</h1>
                <p className="text-white/80">Target Shooting Game Management System</p>
              </div>
          <div className="flex items-center gap-4">
            <div className="text-white/90">
              <span className="font-medium">{currentUser.username}</span>
              <span className="text-sm ml-2 opacity-75">
                {currentUser.username === "user01" ? "👑 Admin" : "👤 User"}
              </span>
            </div>
            <Button variant="secondary" onClick={logout} className="bg-white/20 hover:bg-white/30 text-white border-white/30">
              Logout
            </Button>
          </div>
        </div>
        
        {/* Navigation Links */}
        <nav className="mt-4 flex flex-wrap gap-4 justify-center">
          <Link 
            to="/dashboard" 
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
              location.pathname === "/dashboard" 
                ? "bg-white/30 text-white shadow-lg" 
                : "bg-white/10 text-white/80 hover:bg-white/20 hover:text-white"
            }`}
          >
            🏠 Dashboard
          </Link>
          
          {isUserAdmin && (
            <Link 
              to="/dashboard/games/new" 
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                location.pathname === "/dashboard/games/new" 
                  ? "bg-white/30 text-white shadow-lg" 
                  : "bg-white/10 text-white/80 hover:bg-white/20 hover:text-white"
              }`}
            >
              🎮 Create Game
            </Link>
          )}
          
          <Link 
            to="/dashboard/games" 
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
              location.pathname.startsWith("/dashboard/games") && location.pathname !== "/dashboard/games/new"
                ? "bg-white/30 text-white shadow-lg" 
                : "bg-white/10 text-white/80 hover:bg-white/20 hover:text-white"
            }`}
          >
            📊 Games
          </Link>
          
          <Link 
            to="/dashboard/leaderboard" 
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
              location.pathname === "/dashboard/leaderboard" 
                ? "bg-white/30 text-white shadow-lg" 
                : "bg-white/10 text-white/80 hover:bg-white/20 hover:text-white"
            }`}
          >
            🏆 Leaderboard
          </Link>
        </nav>
      </Header>
      
      <main className="flex-1">
        <Outlet />
      </main>
      
      <Footer />
    </PageLayout>
  );
}


