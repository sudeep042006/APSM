// ── Theme Context Provider ──────────────────────────────────────────
// APSM ships a single, dark-only theme. The provider is retained so the
// existing `useTheme` contract stays intact for consumers, but the
// resolved theme is always "dark" — the `.dark` class is pinned to
// <html> and any previously persisted light preference is discarded.

import { createContext, useContext } from "react";

// ── Create the Theme Context ────────────────────────────────────────
const ThemeContext = createContext(null);

// ── Theme Provider Component ────────────────────────────────────────
export function ThemeProvider({ children }) {
  // ── Keep the document pinned to the dark class ────────────────────
  if (typeof document !== "undefined") {
    document.documentElement.classList.add("dark");
  }

  // ── Context value exposed to consumers ────────────────────────────
  const value = {
    theme: "dark",
    isDark: true,
    toggleTheme: () => {},
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
