// Dashboard Layout — Wraps all authenticated routes with Sidebar & Navbar
// Uses a route group (dashboard) so the layout persists across platform pages
import { Sidebar } from "@/components/sidebar";
import { Navbar } from "@/components/navbar";

/* ─── Dashboard Layout Component ──────────────────────────────────── */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-background">
      {/* ── Persistent Sidebar (desktop only) ──────────────────── */}
      <Sidebar />

      {/* ── Main Content Area ──────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* ── Persistent Top Navbar ─────────────────────────────── */}
        <Navbar />

        {/* ── Page Content ─────────────────────────────────────── */}
        <main className="flex-1 p-6 page-transition">{children}</main>
      </div>
    </div>
  );
}
