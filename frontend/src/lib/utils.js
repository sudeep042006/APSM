// ── Shadcn UI Utility: Class Name Merger ────────────────────────────
// Combines clsx conditional classes with tailwind-merge to prevent
// Tailwind class conflicts. Used by all Shadcn UI components.

import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
