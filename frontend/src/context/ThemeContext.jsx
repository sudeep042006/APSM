// ── Theme Context Provider ──────────────────────────────────────────
// Manages dark/light mode state and syncs it with the HTML class toggle
// and localStorage for persistence across sessions.

import { createContext, useContext, useState, useEffect } from "react";

// ── Create the Theme Context ────────────────────────────────────────
const ThemeContext = createContext(null);

// ── Theme Provider Component ────────────────────────────────────────
export function ThemeProvider({ children }) {
  // ── State: Current theme (defaults to dark) ─────────────────────────
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem("incubein_theme");
    return saved || "dark";
  });

  // ── Sync theme class on the <html> element ──────────────────────────
  useEffect(() => {
    const root = document.documentElement;

    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }

    localStorage.setItem("incubein_theme", theme);
  }, [theme]);

  // ── Action: Toggle between dark and light mode ──────────────────────
  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  // ── Context value exposed to consumers ────────────────────────────────
  const value = {
    theme,
    isDark: theme === "dark",
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

// ── Custom Hook: useTheme ───────────────────────────────────────────
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

export default ThemeContext;
