// Types: Global TypeScript interfaces for the Incubein Analytics Dashboard

// ─── User & Auth Types ───────────────────────────────────────────────
export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role: "admin" | "editor" | "viewer";
}

// ─── Analytics Metric Types ──────────────────────────────────────────
export interface MetricCard {
  title: string;
  value: string | number;
  change: number; // percentage change (positive = growth)
  changeLabel: string;
  icon?: string;
}

// ─── Platform Types ──────────────────────────────────────────────────
export type Platform = "youtube" | "linkedin" | "meta" | "cross-post";

export interface PlatformConfig {
  id: Platform;
  name: string;
  icon: string;
  color: string;
  href: string;
}

// ─── Post / Content Types ────────────────────────────────────────────
export interface PostItem {
  id: string;
  title: string;
  platform: Platform;
  status: "published" | "scheduled" | "draft";
  publishedAt?: string;
  scheduledAt?: string;
  metrics?: {
    views: number;
    likes: number;
    comments: number;
    shares: number;
  };
}

// ─── Navigation Types ────────────────────────────────────────────────
export interface NavItem {
  title: string;
  href: string;
  icon: string;
  badge?: string;
  disabled?: boolean;
}
