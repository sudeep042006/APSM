// ── Shadcn UI: Card Components ──────────────────────────────────────
// Composable card primitives: Card, CardHeader, CardTitle,
// CardDescription, CardContent, CardFooter.
// Backed by the layered "surface-card" elevation system.

import * as React from "react";
import { cn } from "@/lib/utils";

// ── Card Container ──────────────────────────────────────────────────
const Card = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "surface-card text-card-foreground",
      className
    )}
    {...props}
  />
));
Card.displayName = "Card";

// ── Card Header ─────────────────────────────────────────────────────
const CardHeader = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

// ── Card Title ──────────────────────────────────────────────────────
const CardTitle = React.forwardRef(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "font-display text-xl font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

// ── Card Description ────────────────────────────────────────────────
const CardDescription = React.forwardRef(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn(
      "text-sm leading-relaxed text-muted-foreground",
      className
    )}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

// ── Card Content ────────────────────────────────────────────────────
const CardContent = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
));
CardContent.displayName = "CardContent";

// ── Card Footer ─────────────────────────────────────────────────────
const CardFooter = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };
