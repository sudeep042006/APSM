// ── AuthErrorModal ────────────────────────────────────────────────────
// Full-screen blocking overlay that renders whenever a 401 or 403 response
// is caught by the global API interceptors. It prevents any further
// interaction with the dashboard until the user reconnects their account.
// Rendered inside AuthContext so it covers the entire application tree.

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

  // ── Handle reconnect click ─────────────────────────────────────────
  // Navigates the user to the Settings page where they can re-authenticate
  // their individual social platform accounts via the existing OAuth flow.
  const handleReconnect = () => {
    if (onDismiss) onDismiss();
    window.location.href = "/settings";
  };

  return (
    // ── Full-screen blocking overlay ───────────────────────────────────
    // z-[9999] ensures this modal sits above all dashboard content,
    // sidebars, headers, and any other UI elements.
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-error-title"
    >
      {/* ── Modal card ─────────────────────────────────────────────── */}
      {/* Layered glass surface with an ambient bloom behind the icon */}
      <div className="glass relative mx-4 w-full max-w-md rounded-2xl p-8 shadow-2xl">

        {/* ── Decorative glow background ───────────────────────────── */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl">
          <div className="absolute -top-16 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full bg-amber-500/10 blur-3xl" />
        </div>

        {/* ── Warning icon ─────────────────────────────────────────── */}
        <div className="relative mb-6 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-amber-500/25 bg-amber-500/10 shadow-[0_10px_30px_-10px_rgba(245,158,11,0.6)]">
            <ShieldAlert className="h-8 w-8 text-amber-400" />
          </div>
        </div>

        {/* ── Title ────────────────────────────────────────────────── */}
        <h2
          id="auth-error-title"
          className="relative text-center font-display text-xl font-bold tracking-tight text-foreground"
        >
          Connection Expired
        </h2>

        {/* ── Description ──────────────────────────────────────────── */}
        <p className="relative mt-3 text-center text-sm leading-relaxed text-muted-foreground">
          For your security, your connection to the social platform has expired.
          Please reconnect your account to continue viewing your live analytics.
        </p>

        {/* ── Divider ──────────────────────────────────────────────── */}
        <div className="relative my-6 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        {/* ── Primary action: go to Settings ───────────────────────── */}
        {/* This is the main CTA — navigates to the Settings page where
            the user can trigger each platform's OAuth re-authentication flow */}
        <button
          onClick={handleReconnect}
          className="shine relative flex w-full items-center justify-center gap-2 rounded-xl bg-[linear-gradient(120deg,#F59E0B,#F97316)] px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all duration-300 ease-smooth hover:brightness-110 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50 active:scale-[0.98]"
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
              className={`lift flex-1 rounded-lg ${color} px-2 py-1.5 text-xs font-semibold text-white focus:outline-none focus:ring-2 ${ring}`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* ── Footer note ──────────────────────────────────────────── */}
        <p className="relative mt-5 text-center text-xs text-muted-foreground/60">
          Your data is safe. This is a routine security expiry.
        </p>
      </div>
    </div>
  );
}
