import { create } from "zustand";
import { persist } from "zustand/middleware";

type User = {
  username: string;
};

type AuthState = {
  currentUser: User | null;
  isInitialized: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  initialize: () => void;
};

const allowedUsernames = ["user01", "user02", "user03", "user04"] as const;
const PASSWORD = "12345678";

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      isInitialized: false,
      async login(username: string, password: string) {
        const normalized = username.trim().toLowerCase();
        const isValidUser = (allowedUsernames as readonly string[]).includes(
          normalized
        );
        const isValidPassword = password === PASSWORD;
        if (isValidUser && isValidPassword) {
          set({ currentUser: { username: normalized }, isInitialized: true });
          return true;
        }
        return false;
      },
      logout() {
        set({ currentUser: null, isInitialized: true });
      },
      initialize() {
        set({ isInitialized: true });
      },
    }),
    {
      name: "game-admin-auth",
      partialize: (state) => ({ 
        currentUser: state.currentUser,
        isInitialized: state.isInitialized 
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.isInitialized = true;
        }
      },
    }
  )
);


