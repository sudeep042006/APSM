// ── Dashboard Layout Shell ──────────────────────────────────────────
// Wraps all dashboard routes with the Sidebar and Navbar.
// Uses react-router-dom Outlet to render child route components.

import { Outlet } from "react-router-dom";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";

export default function DashboardLayout() {
  return (
    <div className="flex min-h-screen bg-background">
      {/* ── Sidebar (fixed left) ───────────────────────────────────────── */}
      <Sidebar />

      {/* ── Main Content Area (offset by sidebar width) ────────────────── */}
      <div className="flex-1 ml-64">
        {/* ── Top Navbar ─────────────────────────────────────────────────── */}
        <Navbar title="Analytics Dashboard" />

        {/* ── Page Content ───────────────────────────────────────────────── */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
