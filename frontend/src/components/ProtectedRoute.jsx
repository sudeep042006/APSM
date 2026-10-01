// ── Protected Route ──────────────────────────────────────────────────
// Gate for authenticated areas. Two checks, in order:
//
//   1. Is there a session? If not, bounce to /login carrying the attempted
//      path so the user returns to what they were opening rather than to a
//      generic landing page.
//   2. Does the role match? A `roles` allow-list keeps a creator out of the
//      admin workspace and vice versa. Without it, the route rendered and the
//      API answered 403 — the user saw a page they could not use.

import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { homeForRole, hasRole } from "../lib/roleRouting";

const SessionPending = () => (
  <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center flex-col">
    <div className="relative w-16 h-16">
      <div className="absolute top-0 left-0 w-full h-full border-4 border-purple-500/20 rounded-full" />
      <div className="absolute top-0 left-0 w-full h-full border-4 border-t-purple-500 rounded-full animate-spin" />
    </div>
    <p className="mt-4 text-slate-400 font-medium animate-pulse">Verifying Session...</p>
  </div>
);

const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <SessionPending />;

  if (!user) {
    // Remember where they were headed. Read back on a successful login.
    const attempted = `${location.pathname}${location.search}`;
    return <Navigate to={`/login?next=${encodeURIComponent(attempted)}`} replace />;
  }

  // Wrong role for this area — send them to their own dashboard rather than
  // showing a page whose every request would be refused.
  if (!hasRole(user.role, roles)) {
    return <Navigate to={homeForRole(user.role)} replace />;
  }

  return children;
};

export default ProtectedRoute;