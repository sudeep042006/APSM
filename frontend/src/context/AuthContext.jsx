// ── Auth Context Provider ───────────────────────────────────────────
// Global authentication state management using React Context.
// Stores the JWT token and user object in localStorage for persistence.
// Provides login, register, and logout actions to all child components.

import { createContext, useContext, useState, useEffect } from "react";
import api from "../lib/api";

// ── Create the Auth Context ─────────────────────────────────────────
const AuthContext = createContext(null);

// ── Auth Provider Component ─────────────────────────────────────────
export function AuthProvider({ children }) {
  // ── State: User object and loading flag ─────────────────────────────
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ── On mount: Restore session from localStorage ─────────────────────
  useEffect(() => {
    const token = localStorage.getItem("incubein_token");
    const savedUser = localStorage.getItem("incubein_user");

    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
        api.get("/auth/me")
          .then((res) => {
            const latestUser = res.data.user;
            localStorage.setItem("incubein_user", JSON.stringify(latestUser));
            setUser(latestUser);
          })
          .catch((err) => {
            console.error("Session sync failed:", err);
            logout();
          })
          .finally(() => {
            setLoading(false);
          });
        return;
      } catch {
        // ── Corrupted data, clear storage ───────────────────────────────
        localStorage.removeItem("incubein_token");
        localStorage.removeItem("incubein_user");
      }
    }

    setLoading(false);
  }, []);

  // ── Action: Login ──────────────────────────────────────────────────
  const login = async (email, password) => {
    const res = await api.post("/auth/login", { email, password });
    const { token, user } = res.data;

    localStorage.setItem("incubein_token", token);
    localStorage.setItem("incubein_user", JSON.stringify(user));
    setUser(user);

    return { success: true, data: { token, user } };
  };

  // ── Action: Register ───────────────────────────────────────────────
  const register = async (name, email, password) => {
    const res = await api.post("/auth/register", { name, email, password });
    const { token, user } = res.data;

    localStorage.setItem("incubein_token", token);
    localStorage.setItem("incubein_user", JSON.stringify(user));
    setUser(user);

    return { success: true, data: { token, user } };
  };

  // ── Action: Refresh User Details ───────────────────────────────────
  const refreshUser = async () => {
    const res = await api.get("/auth/me");
    const latestUser = res.data.user;
    localStorage.setItem("incubein_user", JSON.stringify(latestUser));
    setUser(latestUser);
    return latestUser;
  };

  // ── Action: Logout ────────────────────────────────────────────────────
  const logout = () => {
    localStorage.removeItem("incubein_token");
    localStorage.removeItem("incubein_user");
    setUser(null);
  };

  // ── Context value exposed to consumers ────────────────────────────────
  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ── Custom Hook: useAuth ────────────────────────────────────────────
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export default AuthContext;
