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
    <div className="relative flex min-h-screen bg-background">
      {/* ── Ambient brand washes (fixed, non-interactive) ────────────── */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      >
        <div className="absolute -left-40 -top-40 h-[34rem] w-[34rem] rounded-full bg-[radial-gradient(circle,hsl(var(--brand-violet)/0.13),transparent_65%)] blur-2xl animate-aurora" />
        <div className="absolute -right-32 top-1/3 h-[28rem] w-[28rem] rounded-full bg-[radial-gradient(circle,hsl(var(--brand-blue)/0.10),transparent_65%)] blur-2xl animate-aurora [animation-delay:-8s]" />
        <div className="absolute bottom-0 left-1/3 h-[24rem] w-[24rem] rounded-full bg-[radial-gradient(circle,hsl(var(--brand-purple)/0.09),transparent_65%)] blur-2xl animate-aurora [animation-delay:-14s]" />
      </div>

      {/* ── Sidebar (fixed left) ───────────────────────────────────────── */}
      <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      {/* ── Main Content Area (offset by sidebar width) ────────────────── */}
      <div
        className={`relative z-10 flex-1 transition-all duration-300 ease-smooth ${
          isCollapsed ? "ml-[72px]" : "ml-64"
        }`}
      >
        {/* ── Top Navbar ─────────────────────────────────────────────────── */}
        <Navbar title="Analytics Dashboard" />

        {/* ── Page Content ───────────────────────────────────────────────── */}
        <main className="animate-fade-in-up p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
