import React from "react";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "success" | "warning" | "danger" | "player" | "gradient" | "fire" | "water" | "air";
  size?: "sm" | "md" | "lg";
};

export function Button({ className = "", variant = "primary", size = "md", ...props }: ButtonProps) {
  const base = "inline-flex items-center justify-center rounded-xl font-medium transition-all duration-300 focus:outline-none disabled:opacity-50 disabled:pointer-events-none transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl";
  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
  };
  const variants: Record<NonNullable<ButtonProps["variant"]>, string> = {
    primary: "bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700",
    secondary: "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-900 hover:from-gray-200 hover:to-gray-300 dark:from-gray-800 dark:to-gray-700 dark:text-gray-100",
    ghost: "bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800",
    success: "bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700",
    warning: "bg-gradient-to-r from-yellow-500 to-yellow-600 text-white hover:from-yellow-600 hover:to-yellow-700",
    danger: "bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700",
    player: "bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600",
    gradient: "bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white hover:from-blue-600 hover:via-purple-600 hover:to-pink-600",
    fire: "bg-gradient-to-r from-orange-500 to-red-600 text-white hover:from-orange-600 hover:to-red-700",
    water: "bg-gradient-to-r from-blue-400 to-cyan-600 text-white hover:from-blue-500 hover:to-cyan-700",
    air: "bg-gradient-to-r from-sky-400 to-blue-500 text-white hover:from-sky-500 hover:to-blue-600",
  };
  return <button className={`${base} ${sizes[size]} ${variants[variant]} ${className}`} {...props} />;
}

type InputProps = React.InputHTMLAttributes<HTMLInputElement>;
export function Input({ className = "", ...props }: InputProps) {
  return (
    <input
      className={`w-full rounded-xl border-2 border-gray-200 bg-white/80 backdrop-blur-sm px-4 py-3 text-base outline-none ring-offset-0 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-300 dark:border-gray-700 dark:bg-gray-800/80 ${className}`}
      {...props}
    />
  );
}

export function Card({ className = "", children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={`rounded-2xl border border-gray-200/50 bg-white/90 backdrop-blur-sm p-6 shadow-xl hover:shadow-2xl transition-all duration-300 dark:border-gray-800/50 dark:bg-gray-900/90 ${className}`}>
      {children}
    </div>
  );
}

export function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">{children}</h2>;
}

export function StatusBadge({ status, className = "" }: { status: string; className?: string }) {
  const variants: Record<string, string> = {
    room1: "bg-gradient-to-r from-orange-100 to-red-200 text-orange-800 dark:from-orange-900 dark:to-red-800 dark:text-orange-200",
    room2: "bg-gradient-to-r from-blue-100 to-cyan-200 text-blue-800 dark:from-blue-900 dark:to-cyan-800 dark:text-blue-200",
    room3: "bg-gradient-to-r from-sky-100 to-blue-200 text-sky-800 dark:from-sky-900 dark:to-blue-800 dark:text-sky-200",
    completed: "bg-gradient-to-r from-green-100 to-green-200 text-green-800 dark:from-green-900 dark:to-green-800 dark:text-green-200",
  };
  return (
    <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-bold shadow-lg ${variants[status] || "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800"} ${className}`}>
      {status.toUpperCase()}
    </span>
  );
}

export function PlayerCard({ 
  player, 
  isActive, 
  onClick, 
  className = "" 
}: { 
  player: { id: string; name: string }; 
  isActive: boolean; 
  onClick: () => void;
  className?: string;
}) {
  return (
    <div 
      className={`relative rounded-2xl p-6 cursor-pointer transition-all duration-300 transform hover:scale-105 hover:rotate-1 ${
        isActive 
          ? 'bg-gradient-to-br from-orange-400 via-red-500 to-yellow-600 shadow-2xl ring-4 ring-orange-300 animate-pulse' 
          : 'bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300 hover:from-gray-200 hover:via-gray-300 hover:to-gray-400 shadow-lg hover:shadow-xl'
      } ${className}`}
      onClick={onClick}
    >
      <div className="text-center">
        <div className={`text-xl font-bold mb-2 ${
          isActive ? 'text-white' : 'text-gray-700'
        }`}>
          {player.name}
        </div>
        <div className={`text-sm ${
          isActive ? 'text-white/90' : 'text-gray-500'
        }`}>
          {isActive ? '✓ Selected' : 'Click to select'}
        </div>
      </div>
      {isActive && (
        <div className="absolute top-3 right-3">
          <div className="w-4 h-4 bg-white rounded-full animate-bounce shadow-lg"></div>
        </div>
      )}
    </div>
  );
}

export function ObjectButton({ 
  objectIndex, 
  isSelected, 
  onClick, 
  className = "",
  roomTheme = "fire"
}: { 
  objectIndex: number; 
  isSelected: boolean; 
  onClick: () => void;
  className?: string;
  roomTheme?: "fire" | "water" | "air";
}) {
  const themes = {
    fire: {
      selected: 'bg-gradient-to-br from-orange-500 via-red-600 to-yellow-500 ring-2 ring-orange-300 text-white shadow-lg',
      unselected: 'bg-gradient-to-br from-orange-400 via-red-500 to-red-600 hover:from-orange-500 hover:via-red-600 hover:to-red-700 text-white shadow-md'
    },
    water: {
      selected: 'bg-gradient-to-br from-blue-400 via-cyan-500 to-blue-600 ring-2 ring-blue-300 text-white shadow-lg',
      unselected: 'bg-gradient-to-br from-blue-400 via-cyan-500 to-cyan-600 hover:from-blue-500 hover:via-cyan-600 hover:to-cyan-700 text-white shadow-md'
    },
    air: {
      selected: 'bg-gradient-to-br from-sky-400 via-blue-500 to-sky-600 ring-2 ring-sky-300 text-white shadow-lg',
      unselected: 'bg-gradient-to-br from-sky-400 via-blue-500 to-blue-600 hover:from-sky-500 hover:via-blue-600 hover:to-blue-700 text-white shadow-md'
    }
  };

  return (
    <button
      onClick={onClick}
      className={`w-8 h-8 rounded-md font-bold text-xs transition-all duration-300 transform hover:scale-110 active:scale-95 ${
        isSelected 
          ? `${themes[roomTheme].selected} animate-pulse` 
          : `${themes[roomTheme].unselected}`
      } ${className}`}
    >
      {isSelected ? '✓' : objectIndex}
    </button>
  );
}

export function Header({ children }: { children: React.ReactNode }) {
  return (
    <header className="bg-gradient-to-r from-orange-600 via-red-600 to-yellow-600 shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {children}
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="bg-gradient-to-r from-gray-800 via-gray-900 to-black text-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center">
          <h3 className="text-xl font-bold mb-2">लक्ष्य वेध - Target Shooting Game</h3>
          <p className="text-gray-400">अग्नि • जल • वायु कक्ष प्रबंधन प्रणाली</p>
        </div>
      </div>
    </footer>
  );
}

export function PageLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-yellow-50">
      {children}
    </div>
  );
}