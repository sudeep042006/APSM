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
      } catch {
        // ── Corrupted data, clear storage ───────────────────────────────
        localStorage.removeItem("incubein_token");
        localStorage.removeItem("incubein_user");
      }
    }

    setLoading(false);
  }, []);

  // ── Action: Login (MOCKED for standalone frontend) ───────────────────
  const login = async (email, password) => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const mockToken = "mock_jwt_token_12345";
    const mockUser = { id: "1", name: email.split("@")[0] || "User", email };

    localStorage.setItem("incubein_token", mockToken);
    localStorage.setItem("incubein_user", JSON.stringify(mockUser));
    setUser(mockUser);

    return { success: true, data: { token: mockToken, user: mockUser } };
  };

  // ── Action: Register (MOCKED for standalone frontend) ────────────────
  const register = async (name, email, password) => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const mockToken = "mock_jwt_token_12345";
    const mockUser = { id: "1", name, email };

    localStorage.setItem("incubein_token", mockToken);
    localStorage.setItem("incubein_user", JSON.stringify(mockUser));
    setUser(mockUser);

    return { success: true, data: { token: mockToken, user: mockUser } };
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
