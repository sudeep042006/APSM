// ── Client-Side Route Configuration ─────────────────────────────────
// Defines all application routes using react-router-dom.
// Dashboard routes are wrapped in a layout shell with Sidebar + Navbar.

import { createBrowserRouter, Navigate } from "react-router-dom";

// ── Page Imports ────────────────────────────────────────────────────
import LandingPage from "@/pages/LandingPage/LandingPage";
import AuthPage from "@/pages/Auth/AuthPage";
import YoutubeDash from "@/pages/YoutubeDash/YoutubeDash";
import LinkedInDash from "@/pages/LinkedInDash/LinkedInDash";
import FacebookLayout from "@/pages/MetaDash/FacebookLayout";
import FacebookDash from "@/pages/MetaDash/FacebookDash";
import FacebookContent from "@/pages/MetaDash/FacebookContent";
import FacebookAudience from "@/pages/MetaDash/FacebookAudience";
import FacebookEngagement from "@/pages/MetaDash/FacebookEngagement";
import FacebookPageLikes from "@/pages/MetaDash/FacebookPageLikes";
import FacebookReachViews from "@/pages/MetaDash/FacebookReachViews";
import FacebookVideos from "@/pages/MetaDash/FacebookVideos";
import FacebookStories from "@/pages/MetaDash/FacebookStories";
import FacebookGroups from "@/pages/MetaDash/FacebookGroups";
import FacebookAds from "@/pages/MetaDash/FacebookAds";
import FacebookReports from "@/pages/MetaDash/FacebookReports";
import FacebookInsights from "@/pages/MetaDash/FacebookInsights";
import FacebookSettings from "@/pages/MetaDash/FacebookSettings";
import FacebookHelp from "@/pages/MetaDash/FacebookHelp";
import InstagramDash from "@/pages/InstagramDash/InstagramDash";
import InstagramLayout from "@/pages/InstagramDash/InstagramLayout";
import MetricDetailView from "@/pages/InstagramDash/MetricDetailView";
import InstagramContent from "@/pages/InstagramDash/InstagramContent";
import InstagramAudience from "@/pages/InstagramDash/InstagramAudience";
import InstagramEngagement from "@/pages/InstagramDash/InstagramEngagement";
import InstagramStories from "@/pages/InstagramDash/InstagramStories";
import InstagramReels from "@/pages/InstagramDash/InstagramReels";
import InstagramGrowth from "@/pages/InstagramDash/InstagramGrowth";
import InstagramHashtags from "@/pages/InstagramDash/InstagramHashtags";
import InstagramInsights from "@/pages/InstagramDash/InstagramInsights";
import InstagramReports from "@/pages/InstagramDash/InstagramReports";
import InstagramSettings from "@/pages/InstagramDash/InstagramSettings";
import InstagramHelp from "@/pages/InstagramDash/InstagramHelp";
import Placeholder from "@/components/Placeholder";
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
      { path: "youtube/settings", element: <Placeholder /> },
      { path: "youtube/help", element: <Placeholder /> },
      { path: "linkedin", element: <LinkedInDash /> },
      { path: "linkedin/settings", element: <Placeholder /> },
      { path: "linkedin/help", element: <Placeholder /> },
      // ── Facebook Dashboard — nested layout with child routes ──────
      // Mirrors the Instagram routing architecture exactly:
      // FacebookLayout = sidebar shell + Outlet
      // FacebookDash   = Overview index child page only
      {
        path: "facebook",
        element: <FacebookLayout />,
        children: [
          { index: true,                  element: <FacebookDash />      },
          { path: "content",              element: <FacebookContent />   },
          { path: "audience",             element: <FacebookAudience />  },
          { path: "engagement",           element: <FacebookEngagement />},
          { path: "page_likes",           element: <FacebookPageLikes /> },
          { path: "reach_views",          element: <FacebookReachViews />},
          { path: "videos",               element: <FacebookVideos />    },
          { path: "stories",              element: <FacebookStories />   },
          { path: "groups",               element: <FacebookGroups />    },
          { path: "ads",                  element: <FacebookAds />       },
          { path: "reports",              element: <FacebookReports />   },
          { path: "insights",             element: <FacebookInsights />  },
          { path: "settings",             element: <FacebookSettings />  },
          { path: "help",                 element: <FacebookHelp />      },
        ]
      },
      { 
        path: "instagram",
        element: <InstagramLayout />,
        children: [
          { index: true, element: <InstagramDash /> },
          { path: "content", element: <InstagramContent /> },
          { path: "audience", element: <InstagramAudience /> },
          { path: "engagement", element: <InstagramEngagement /> },
          { path: "stories", element: <InstagramStories /> },
          { path: "reels", element: <InstagramReels /> },
          { path: "growth", element: <InstagramGrowth /> },
          { path: "hashtags", element: <InstagramHashtags /> },
          { path: "insights", element: <InstagramInsights /> },
          { path: "reports", element: <InstagramReports /> },
          { path: "settings", element: <InstagramSettings /> },
          { path: "help", element: <InstagramHelp /> },
          { path: "metrics/:metricId", element: <MetricDetailView /> }
        ]
      },
      { path: "crosspost", element: <CrossPostingDash /> },
      { path: "crosspost/new", element: <NewPostPage /> },
    ],
  },

  // ── 404 Catch-All ─────────────────────────────────────────────────
  { path: "*", element: <NotFound /> },
]);

export default router;
