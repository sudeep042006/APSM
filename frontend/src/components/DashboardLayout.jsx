// ── Dashboard Layout Shell ──────────────────────────────────────────
// Wraps all dashboard routes with the Sidebar and Navbar.
// Uses react-router-dom Outlet to render child route components.

import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";

export default function DashboardLayout() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-[#0B1121]">
      {/* ── Sidebar (fixed left) ───────────────────────────────────────── */}
      <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      {/* ── Main Content Area (offset by sidebar width) ────────────────── */}
      <div className={`flex-1 transition-all duration-300 ${isCollapsed ? "ml-16" : "ml-64"}`}>
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
