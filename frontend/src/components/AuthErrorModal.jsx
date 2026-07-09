// ── AuthErrorModal ────────────────────────────────────────────────────
// Full-screen blocking overlay that renders whenever a 401 or 403 response
// is caught by the global API interceptors. It prevents any further
// interaction with the dashboard until the user reconnects their account.
// Rendered inside AuthContext so it covers the entire application tree.

import { useNavigate } from "react-router-dom";
import { ShieldAlert, RefreshCw } from "lucide-react";

// ── Constants ─────────────────────────────────────────────────────────
// Maps each social platform brand color for the reconnect buttons
const PLATFORM_BUTTONS = [
  {
    label: "Reconnect Meta",
    color: "bg-blue-600 hover:bg-blue-700",
    ring: "ring-blue-500/30",
  },
  {
    label: "Reconnect YouTube",
    color: "bg-red-600 hover:bg-red-700",
    ring: "ring-red-500/30",
  },
  {
    label: "Reconnect LinkedIn",
    color: "bg-sky-600 hover:bg-sky-700",
    ring: "ring-sky-500/30",
  },
];

// ── AuthErrorModal Component ──────────────────────────────────────────
export default function AuthErrorModal({ onDismiss }) {
  const navigate = useNavigate();

  // ── Handle reconnect click ─────────────────────────────────────────
  // Navigates the user to the Settings page where they can re-authenticate
  // their individual social platform accounts via the existing OAuth flow.
  const handleReconnect = () => {
    if (onDismiss) onDismiss();
    navigate("/settings");
  };

  return (
    // ── Full-screen blocking overlay ───────────────────────────────────
    // z-[9999] ensures this modal sits above all dashboard content,
    // sidebars, headers, and any other UI elements.
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-error-title"
    >
      {/* ── Modal card ─────────────────────────────────────────────── */}
      {/* Glassmorphism style: semi-transparent dark card with a subtle border */}
      <div className="relative mx-4 w-full max-w-md rounded-2xl border border-white/10 bg-[#161B22] p-8 shadow-2xl">

        {/* ── Decorative glow background ───────────────────────────── */}
        {/* Adds a subtle amber bloom behind the warning icon for visual emphasis */}
        <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
          <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl" />
        </div>

        {/* ── Warning icon ─────────────────────────────────────────── */}
        <div className="relative flex justify-center mb-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-500/20">
            <ShieldAlert className="h-8 w-8 text-amber-400" />
          </div>
        </div>

        {/* ── Title ────────────────────────────────────────────────── */}
        <h2
          id="auth-error-title"
          className="relative text-center text-xl font-bold text-white tracking-tight"
        >
          Connection Expired
        </h2>

        {/* ── Description ──────────────────────────────────────────── */}
        <p className="relative mt-3 text-center text-sm leading-relaxed text-slate-400">
          For your security, your connection to the social platform has expired.
          Please reconnect your account to continue viewing your live analytics.
        </p>

        {/* ── Divider ──────────────────────────────────────────────── */}
        <div className="relative my-6 h-px bg-white/10" />

        {/* ── Primary action: go to Settings ───────────────────────── */}
        {/* This is the main CTA — navigates to the Settings page where
            the user can trigger each platform's OAuth re-authentication flow */}
        <button
          onClick={handleReconnect}
          className="relative w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-3 text-sm font-semibold text-white shadow-lg hover:from-amber-400 hover:to-orange-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
        >
          <RefreshCw className="h-4 w-4" />
          Reconnect Account
        </button>

        {/* ── Platform-specific quick-reconnect row ────────────────── */}
        {/* Optional: shows individual platform labels so users know
            which platform(s) they need to reconnect */}
        <div className="relative mt-4 flex gap-2">
          {PLATFORM_BUTTONS.map(({ label, color, ring }) => (
            <button
              key={label}
              onClick={handleReconnect}
              className={`flex-1 rounded-lg ${color} px-2 py-1.5 text-xs font-medium text-white transition-colors focus:outline-none focus:ring-2 ${ring}`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* ── Footer note ──────────────────────────────────────────── */}
        <p className="relative mt-4 text-center text-xs text-slate-600">
          Your data is safe. This is a routine security expiry.
        </p>
      </div>
    </div>
  );
}
