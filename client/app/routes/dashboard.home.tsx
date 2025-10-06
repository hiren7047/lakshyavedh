import { Link } from "react-router";
import { Card, SectionTitle } from "../components/ui";
import { useAuthStore } from "../store/auth";

export function meta() {
  return [{ title: "Target Shooting - Dashboard" }];
}

function isAdmin(username: string): boolean {
  return username === "user01";
}

export default function DashboardHome() {
  const currentUser = useAuthStore((s) => s.currentUser);
  const isUserAdmin = currentUser ? isAdmin(currentUser.username) : false;

  return (
    <main className="max-w-7xl mx-auto p-6 space-y-8">
      <div className="text-center">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 via-red-600 to-yellow-600 bg-clip-text text-transparent mb-4">
              {isUserAdmin ? "Target Shooting - Admin Dashboard" : `Target Shooting - Welcome ${currentUser?.username}`}
            </h1>
        <p className="text-gray-600 text-lg">
          {isUserAdmin ? "Manage all target shooting games and control the system" : "Access your assigned target shooting rooms"}
        </p>
            <div className="mt-4 p-4 bg-gradient-to-r from-orange-100 to-red-100 rounded-xl border border-orange-200">
              <p className="text-orange-800 font-medium">
                "Welcome to Target Shooting Game! You need to read the targets placed in front of you in Fire, Water and Air rooms and hit the correct and appropriate target."
              </p>
            </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isUserAdmin && (
          <Card className="bg-gradient-to-br from-orange-50 to-red-100 border-orange-200 hover:shadow-2xl transform hover:scale-105 transition-all duration-300">
            <div className="text-center">
              <div className="text-4xl mb-4">🔥</div>
                  <Link to="/dashboard/games/new" className="text-xl font-bold text-orange-700 hover:text-orange-800 block mb-2">
                    Create New Game
                  </Link>
                  <p className="text-orange-600">Start new Target Shooting game with 5 players</p>
            </div>
          </Card>
        )}
        
        <Card className="bg-gradient-to-br from-blue-50 to-cyan-100 border-blue-200 hover:shadow-2xl transform hover:scale-105 transition-all duration-300">
          <div className="text-center">
            <div className="text-4xl mb-4">🎯</div>
            <Link to="/dashboard/games" className="text-xl font-bold text-blue-700 hover:text-blue-800 block mb-2">
              Target Games
            </Link>
            <p className="text-blue-600">
              {isUserAdmin ? "View and manage all target games" : "View your assigned target rooms"}
            </p>
          </div>
        </Card>
        
        <Card className="bg-gradient-to-br from-sky-50 to-blue-100 border-sky-200 hover:shadow-2xl transform hover:scale-105 transition-all duration-300">
          <div className="text-center">
            <div className="text-4xl mb-4">🏆</div>
            <Link to="/dashboard/leaderboard" className="text-xl font-bold text-sky-700 hover:text-sky-800 block mb-2">
              Results
            </Link>
            <p className="text-sky-600">View target shooting rankings and results</p>
          </div>
        </Card>
      </div>
      
      {/* Room Information */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-200">
          <div className="text-center">
            <div className="text-3xl mb-3">🔥</div>
                <h3 className="text-lg font-bold text-orange-800 mb-2">Fire Room</h3>
                <p className="text-orange-700 text-sm">Fire Room - First stage of target shooting</p>
                <p className="text-orange-600 text-xs mt-2">user02 manages this room</p>
          </div>
        </Card>
        
        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
          <div className="text-center">
            <div className="text-3xl mb-3">💧</div>
                <h3 className="text-lg font-bold text-blue-800 mb-2">Water Room</h3>
                <p className="text-blue-700 text-sm">Water Room - Second stage of target shooting</p>
                <p className="text-blue-600 text-xs mt-2">user03 manages this room</p>
          </div>
        </Card>
        
        <Card className="bg-gradient-to-br from-sky-50 to-blue-50 border-sky-200">
          <div className="text-center">
            <div className="text-3xl mb-3">💨</div>
                <h3 className="text-lg font-bold text-sky-800 mb-2">Air Room</h3>
                <p className="text-sky-700 text-sm">Air Room - Final stage of target shooting</p>
                <p className="text-sky-600 text-xs mt-2">user04 manages this room</p>
          </div>
        </Card>
      </div>
      
      {!isUserAdmin && (
        <Card className="bg-gradient-to-r from-orange-50 to-red-50 border-orange-200">
          <div className="text-center py-6">
            <h3 className="text-xl font-bold text-orange-800 mb-3">Your Role</h3>
            <p className="text-orange-700 mb-2">
              You can only access games where your assigned room is active or completed.
            </p>
                <p className="text-orange-600 font-medium">
                  {currentUser?.username === "user02" && "🔥 You handle Fire Room data entry"}
                  {currentUser?.username === "user03" && "💧 You handle Water Room data entry"}
                  {currentUser?.username === "user04" && "💨 You handle Air Room data entry"}
                </p>
          </div>
        </Card>
      )}
    </main>
  );
}


