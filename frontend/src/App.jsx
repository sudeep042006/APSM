// ── Root App Component ──────────────────────────────────────────────
// Wraps the entire application with context providers and the router.

import { RouterProvider } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { Toaster } from "@/components/ui/toaster";
import router from "@/routes";
import Loader from "@/components/Loader";

export default function App() {
  return (
    // ── Theme Provider (outermost for CSS class management) ──────────
    <ThemeProvider>
      {/* ── Auth Provider (manages user session state) ────────────────── */}
      <AuthProvider>
        {/* ── Router Provider (client-side navigation) ────────────────── */}
        <RouterProvider router={router} fallbackElement={<Loader />} />
        {/* ── Global Toast Notifications (Shadcn) ───────────────────────── */}
        <Toaster />
      </AuthProvider>
    </ThemeProvider>
  );
}
