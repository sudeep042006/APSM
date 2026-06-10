// Utility: Tailwind class merge helper
// Combines clsx conditional classes with tailwind-merge to resolve conflicts
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
