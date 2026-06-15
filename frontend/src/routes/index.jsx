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
import NewPostPage from "@/pages/CrossPostingDash/NewPostPage";
import NotFound from "@/pages/NotFound/NotFound";
import Settings from "@/pages/Settings";

// ── Layout & Guard Imports ──────────────────────────────────────────
import DashboardLayout from "@/components/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";

// ── Router Definition ───────────────────────────────────────────────
const router = createBrowserRouter([
  // ── Public Routes ─────────────────────────────────────────────────
  { path: "/", element: <LandingPage /> },
  { path: "/login", element: <AuthPage /> },
  { path: "/settings", element: <ProtectedRoute><Settings /></ProtectedRoute> },

  // ── Dashboard Routes (wrapped in layout shell) ────────────────────
  {
    path: "/dashboard",
    element: <ProtectedRoute><DashboardLayout /></ProtectedRoute>,
    children: [
      { index: true, element: <Navigate to="/dashboard/youtube" replace /> },
      { path: "youtube", element: <YoutubeDash /> },
      { path: "linkedin", element: <LinkedInDash /> },
      { path: "meta", element: <MetaDash /> },
      { path: "crosspost", element: <CrossPostingDash /> },
      { path: "crosspost/new", element: <NewPostPage /> },
    ],
  },

  // ── 404 Catch-All ─────────────────────────────────────────────────
  { path: "*", element: <NotFound /> },
]);

export default router;
