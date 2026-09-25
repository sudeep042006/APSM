// ── Navbar Component ────────────────────────────────────────────────
// Top navigation bar for the dashboard. Shows the current page title,
// a theme toggle button, and search placeholder.

import { useTheme } from "@/context/ThemeContext";
import { Moon, Sun, Bell, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import crosspostApi from "@/services/crosspostApi";

export default function Navbar({ title = "Dashboard" }) {
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [requests, setRequests] = useState([]);
  const [error, setError] = useState('');
  const load = async () => { try { setRequests(await crosspostApi.getPendingApprovals()); setError(''); } catch (e) { if (e.response?.status !== 403) setError('Could not load approval requests.'); } };
  useEffect(() => { load(); const timer = setInterval(load, 30000); return () => clearInterval(timer); }, []);
  const review = async (request, decision) => {
    try { const result = await crosspostApi.reviewApproval(request.id, decision); setRequests(current => current.filter(item => item.id !== request.id)); if (decision === 'accept') { localStorage.setItem('apsm:approved-draft', JSON.stringify(result.draft)); navigate('/dashboard/crosspost/new'); } }
    catch { setError('Could not update the request.'); }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-white/10 bg-background text-white px-6">
      {/* ── Page Title ────────────────────────────────────────────────── */}
      <h1 className="text-xl font-semibold tracking-tight">{title}</h1>

      {/* ── Right-side Actions ────────────────────────────────────────── */}
      <div className="flex items-center gap-2">
        <div className="relative">
          <Button variant="ghost" size="icon" id="navbar-notifications-btn" onClick={() => { setOpen(value => !value); if (!open) load(); }} aria-label="Approval requests">
            <Bell className="h-4 w-4" />
            {requests.length > 0 && <span className="absolute -right-1 -top-1 min-w-4 rounded-full bg-red-500 px-1 text-[10px] text-white">{requests.length}</span>}
          </Button>
          {open && <div className="absolute right-0 z-50 mt-2 w-96 rounded-lg border bg-background p-3 shadow-xl">
            <p className="mb-2 text-sm font-semibold">Pending post approvals</p>
            {error && <p className="text-xs text-red-400">{error}</p>}
            {!error && requests.length === 0 && <p className="text-xs text-muted-foreground">No pending requests.</p>}
            <div className="max-h-96 space-y-2 overflow-auto">{requests.map(request => <div key={request.id} className="rounded-md border p-3 text-xs"><p className="font-medium">{request.submitterName}</p><p className="mt-1 text-muted-foreground">{request.platforms.join(', ')} · {request.scheduledDate ? new Date(request.scheduledDate).toLocaleString() : 'Publish now'}</p><p className="mt-1 line-clamp-2">{request.summary}</p><div className="mt-2 flex gap-2"><Button size="sm" onClick={() => review(request, 'accept')}><Check className="mr-1 h-3 w-3" />Accept</Button><Button size="sm" variant="outline" onClick={() => review(request, 'decline')}><X className="mr-1 h-3 w-3" />Decline</Button></div></div>)}</div>
          </div>}
        </div>

        {/* ── Theme Toggle ──────────────────────────────────────────────── */}
        {/* <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          id="navbar-theme-toggle"
          aria-label="Toggle theme"
        >
          {isDark ? (
            <Sun className="h-4 w-4 transition-transform duration-300" />
          ) : (
            <Moon className="h-4 w-4 transition-transform duration-300" />
          )}
        </Button> */}
      </div>
    </header>
  );
}
