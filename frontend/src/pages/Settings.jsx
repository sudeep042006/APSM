// ── Settings ────────────────────────────────────────────────────────
// Serves two purposes from one route:
//
//   • OAuth trampoline. The backend redirects here after a social-account
//     callback with ?connected=… or ?error=…. When those params are present
//     this component refreshes the user and bounces back to the saved
//     returnPath, using replace: true so the callback never lands in history.
//     The old /settings fallback path no longer exists, so the default is the
//     workspace rather than the YouTube dashboard.
//
//   • Account page. Visiting /settings directly shows the real panel, which is
//     where sign-out lives now that the sidebar no longer carries it.

import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { AlertTriangle, Loader, LogOut, Settings as SettingsIcon, User, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const FALLBACK_RETURN_PATH = "/dashboard/crosspost";

const Settings = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, refreshUser, logout } = useAuth();

  const connected = searchParams.get("connected");
  const error = searchParams.get("error");

  // Only a callback carries these. A bare visit renders the panel below.
  const isOAuthCallback = Boolean(connected || error);
  const [statusMessage, setStatusMessage] = useState("Routing…");

  useEffect(() => {
    if (!isOAuthCallback) return;

    // ── 1. Read and clear the saved return path ─────────────────────
    const returnPath = localStorage.getItem("returnPath") || FALLBACK_RETURN_PATH;
    localStorage.removeItem("returnPath");

    // ── 2. Preserve any query the backend sent ──────────────────────
    const paramsStr = searchParams.toString();
    const finalPath = paramsStr ? `${returnPath}?${paramsStr}` : returnPath;

    if (connected) {
      setStatusMessage(`Connected ${connected}! Redirecting…`);
      // Refresh so the dashboard reflects the new connection immediately.
      refreshUser().finally(() => navigate(finalPath, { replace: true }));
      return;
    }

    setStatusMessage("Connection issue detected. Redirecting…");
    navigate(finalPath, { replace: true });
  }, [isOAuthCallback, connected, searchParams, navigate, refreshUser]);

  // ── Minimal loading UI shown while the redirect processes ─────────
  if (isOAuthCallback) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4 animate-pulse">
          <Loader className="text-purple-500 animate-spin mx-auto" size={32} />
          <p className="text-sm text-slate-400 font-medium">{statusMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-4 py-10 sm:px-6">
      <div className="mx-auto w-full max-w-2xl space-y-5">
        <header>
          <h1 className="flex items-center gap-2 text-lg font-bold tracking-tight text-white">
            <SettingsIcon className="h-5 w-5" />
            Settings
          </h1>
          <p className="mt-1 text-xs text-muted-foreground">
            Your account and session.
          </p>
          <div className="mt-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(user?.role === 'creator' ? '/creator' : '/dashboard')}
              className="h-8 text-xs text-muted-foreground hover:text-white"
            >
              <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
              Back to Dashboard
            </Button>
          </div>
        </header>

        {/* Account */}
        <section className="surface-card p-5">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-100">
            <User className="h-4 w-4 text-muted-foreground" />
            Account
          </h2>

          <dl className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-[110px_1fr]">
            <dt className="text-xs text-muted-foreground">Name</dt>
            <dd className="text-xs font-medium text-slate-200">{user?.name || "—"}</dd>

            <dt className="text-xs text-muted-foreground">Email</dt>
            <dd className="break-all text-xs font-medium text-slate-200">{user?.email || "—"}</dd>

            <dt className="text-xs text-muted-foreground">Role</dt>
            <dd className="text-xs font-medium capitalize text-slate-200">{user?.role || "—"}</dd>
          </dl>
        </section>

        {/* Session */}
        <section className="surface-card p-5">
          <h2 className="text-sm font-semibold text-slate-100">Session</h2>
          <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
            Signing out clears your session on this device. Linked social accounts
            stay linked and can be managed from the cross-posting overview.
          </p>

          <button
            type="button"
            onClick={logout}
            className="mt-4 flex h-9 items-center gap-2 rounded-xl border border-destructive/25 bg-destructive/[0.07] px-4 text-xs font-semibold text-red-300 transition-colors hover:border-destructive/40 hover:bg-destructive/15"
          >
            <LogOut className="h-4 w-4" />
            Log out
          </button>
        </section>

        {/* Connected accounts are managed elsewhere — say so rather than
            offering a control that does nothing. */}
        <p className="flex items-start gap-2 px-1 text-[11px] text-muted-foreground">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          To connect or disconnect a social account, use Cross-Posting → Overview.
        </p>
      </div>
    </div>
  );
};

export default Settings;