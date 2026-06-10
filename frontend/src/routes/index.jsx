// ── Client-Side Route Configuration ─────────────────────────────────
// Defines all application routes using react-router-dom.
// Dashboard routes are wrapped in a layout shell with Sidebar + Navbar.

import { createBrowserRouter, Navigate } from "react-router-dom";

// ── Page Imports ────────────────────────────────────────────────────
import LandingPage from "@/pages/LandingPage/LandingPage";
import AuthPage from "@/pages/Auth/AuthPage";
import YoutubeDash from "@/pages/YoutubeDash/YoutubeDash";
import LinkedInDash from "@/pages/LinkedInDash/LinkedInDash";
import MetaDash from "@/pages/MetaDash/MetaDash";
import CrossPostingDash from "@/pages/CrossPostingDash/CrossPostingDash";
import NotFound from "@/pages/NotFound/NotFound";

// ── Layout Import ───────────────────────────────────────────────────
import DashboardLayout from "@/components/DashboardLayout";

// ── Router Definition ───────────────────────────────────────────────
const router = createBrowserRouter([
  // ── Public Routes ─────────────────────────────────────────────────
  { path: "/", element: <LandingPage /> },
  { path: "/login", element: <AuthPage /> },

  // ── Dashboard Routes (wrapped in layout shell) ────────────────────
  {
    path: "/dashboard",
    element: <DashboardLayout />,
    children: [
      { index: true, element: <Navigate to="/dashboard/youtube" replace /> },
      { path: "youtube", element: <YoutubeDash /> },
      { path: "linkedin", element: <LinkedInDash /> },
      { path: "meta", element: <MetaDash /> },
      { path: "crosspost", element: <CrossPostingDash /> },
    ],
  },

  // ── 404 Catch-All ─────────────────────────────────────────────────
  { path: "*", element: <NotFound /> },
]);

export default router;
