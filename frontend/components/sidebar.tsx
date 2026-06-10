// Dashboard Sidebar — Persistent navigation for authenticated areas
// Renders the platform links and branding in the left sidebar
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

/* ─── Sidebar Navigation Items ────────────────────────────────────── */
const sidebarLinks = [
  {
    title: "YouTube",
    href: "/youtube",
    /* Red accent for YouTube */
    color: "text-red-500",
    bgColor: "bg-red-500/10",
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
  },
  {
    title: "LinkedIn",
    href: "/linkedin",
    /* Blue accent for LinkedIn */
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },
  {
    title: "Meta",
    href: "/meta",
    /* Indigo accent for Meta */
    color: "text-indigo-500",
    bgColor: "bg-indigo-500/10",
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
  },
  {
    title: "Cross-Post",
    href: "/cross-post",
    /* Green accent for Cross-Post */
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z" />
      </svg>
    ),
  },
];

/* ─── Sidebar Component ───────────────────────────────────────────── */
export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="hidden md:flex flex-col w-64 border-r border-border/50 bg-card/50 backdrop-blur-sm h-screen sticky top-0"
      id="dashboard-sidebar"
    >
      {/* ── Brand Header ───────────────────────────────────────── */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-border/50">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
          <span className="text-white font-bold">I</span>
        </div>
        <div>
          <h2 className="font-semibold text-sm tracking-tight">Incubein</h2>
          <p className="text-xs text-muted-foreground">Analytics Dashboard</p>
        </div>
      </div>

      {/* ── Navigation Links ───────────────────────────────────── */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        <p className="px-3 mb-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Platforms
        </p>
        {sidebarLinks.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                isActive
                  ? `${link.bgColor} ${link.color}`
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              <span className={cn(isActive ? link.color : "text-muted-foreground")}>
                {link.icon}
              </span>
              {link.title}
            </Link>
          );
        })}
      </nav>

      {/* ── Sidebar Footer ─────────────────────────────────────── */}
      <div className="px-4 py-4 border-t border-border/50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-xs font-bold text-white">
            U
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">Demo User</p>
            <p className="text-xs text-muted-foreground truncate">demo@incubein.com</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
