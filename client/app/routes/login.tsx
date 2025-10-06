import { useState, useEffect } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router";
import { useAuthStore } from "../store/auth";
import { Button, Card, Input, PageLayout } from "../components/ui";

export function meta() {
  return [
    { title: "Target Shooting - Admin Login" },
    { name: "description", content: "Login to Target Shooting game admin" },
  ];
}

export default function Login() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const currentUser = useAuthStore((s) => s.currentUser);
  const isInitialized = useAuthStore((s) => s.isInitialized);
  const [username, setUsername] = useState(currentUser?.username ?? "");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isInitialized && currentUser) {
      navigate("/dashboard", { replace: true });
    }
  }, [isInitialized, currentUser, navigate]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    const ok = await login(username, password);
    if (!ok) {
      setError("Invalid credentials");
      return;
    }
    navigate("/dashboard");
  }

  // Show loading while checking auth state
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

  return (
    <PageLayout>
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
              <div className="text-center mb-8">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 via-red-600 to-yellow-600 bg-clip-text text-transparent mb-2">
                  Target Shooting
                </h1>
                <p className="text-gray-600 text-lg">Target Shooting Game Admin</p>
                <p className="text-sm text-gray-500 mt-2">Fire • Water • Air Room Management</p>
              </div>
          
          <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-2xl">
            <h2 className="text-2xl font-bold text-center mb-6 bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              Welcome Back
            </h2>
            <form onSubmit={onSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Username</label>
                <Input 
                  value={username} 
                  onChange={(e) => setUsername(e.target.value)} 
                  placeholder="user01" 
                  className="text-center"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Password</label>
                <Input 
                  type="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  placeholder="12345678" 
                  className="text-center"
                />
              </div>
              {error && (
                <div className="p-3 bg-red-100 border border-red-300 rounded-xl text-red-700 text-center">
                  {error}
                </div>
              )}
              <Button type="submit" variant="gradient" className="w-full">
                Login
              </Button>
              <div className="text-center text-sm text-gray-500">
                <p>Available users: user01, user02, user03, user04</p>
                <p>Password: 12345678</p>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </PageLayout>
  );
}