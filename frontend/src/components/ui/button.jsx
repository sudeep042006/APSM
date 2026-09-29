// ── Shadcn UI: Button Component ─────────────────────────────────────
// Variant-based button with size options and asChild slot support.
// Default variant carries the brand violet→indigo gradient + shine.

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

// ── Button Variants (CVA) ─────────────────────────────────────────────
const buttonVariants = cva(
  "inline-flex select-none items-center justify-center gap-2 whitespace-nowrap rounded-xl font-semibold tracking-[-0.01em] ring-offset-background outline-none transition-all duration-300 ease-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] [&_svg]:shrink-0 [&_svg]:transition-transform [&_svg]:duration-300",
  {
    variants: {
      variant: {
        default:
          "shine border border-white/10 bg-[linear-gradient(135deg,hsl(var(--brand-violet)),hsl(var(--brand-indigo))_55%,hsl(var(--brand-blue)))] text-white shadow-glow-sm hover:shadow-glow-lg hover:brightness-110",
        destructive:
          "border border-destructive/30 bg-destructive/90 text-destructive-foreground shadow-sm hover:bg-destructive hover:shadow-[0_10px_30px_-10px_hsl(var(--destructive)/0.6)]",
        outline:
          "border border-white/10 bg-white/[0.03] text-foreground backdrop-blur-sm shadow-xs hover:border-primary/40 hover:bg-white/[0.07] hover:text-foreground hover:shadow-glow-sm",
        secondary:
          "border border-white/[0.07] bg-secondary text-secondary-foreground hover:border-primary/25 hover:bg-accent",
        ghost:
          "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline decoration-primary/40 hover:decoration-primary",
        // ── Brand ghost: soft brand-tinted fill for secondary CTAs ──
        brandSoft:
          "border border-primary/25 bg-primary/10 text-primary hover:border-primary/45 hover:bg-primary/20 hover:text-primary hover:shadow-glow-sm",
      },
      size: {
        default: "h-10 px-4 py-2 text-sm",
        sm: "h-9 rounded-lg px-3.5 text-[13px]",
        lg: "h-12 rounded-xl px-7 text-[15px]",
        xl: "h-14 rounded-2xl px-9 text-base",
        icon: "h-10 w-10",
        "icon-sm": "h-8 w-8 rounded-lg",
        "icon-lg": "h-12 w-12 rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

// ── Button Component ─────────────────────────────────────────────────
const Button = React.forwardRef(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
