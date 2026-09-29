// ── Shadcn UI: Tabs Components ──────────────────────────────────────
// Radix UI Tabs primitives styled with Shadcn conventions.
// The active pill uses a brand gradient with a soft halo.

import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "@/lib/utils";

// ── Tabs Root ───────────────────────────────────────────────────────
const Tabs = TabsPrimitive.Root;

// ── Tabs List (Navigation Bar) ──────────────────────────────────────
const TabsList = React.forwardRef(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      "inline-flex h-11 items-center justify-center gap-1 rounded-xl border border-white/[0.07] bg-surface-sunken/80 p-1 text-muted-foreground backdrop-blur-sm",
      className
    )}
    {...props}
  />
));
TabsList.displayName = TabsPrimitive.List.displayName;

// ── Tabs Trigger (Individual Tab Button) ────────────────────────────
const TabsTrigger = React.forwardRef(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center whitespace-nowrap rounded-lg px-3.5 py-1.5 text-sm font-semibold tracking-[-0.01em] ring-offset-background transition-all duration-300 ease-smooth hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-[linear-gradient(135deg,hsl(var(--brand-violet)),hsl(var(--brand-indigo)))] data-[state=active]:text-white data-[state=active]:shadow-glow-sm",
      className
    )}
    {...props}
  />
));
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

// ── Tabs Content (Panel Content Area) ───────────────────────────────
const TabsContent = React.forwardRef(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-4 animate-fade-in-up ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      className
    )}
    {...props}
  />
));
TabsContent.displayName = TabsPrimitive.Content.displayName;

export { Tabs, TabsList, TabsTrigger, TabsContent };
