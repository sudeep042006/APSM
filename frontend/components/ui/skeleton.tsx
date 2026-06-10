// Shadcn UI Component: Skeleton
// A placeholder loading animation for content that hasn't loaded yet
import { cn } from "@/lib/utils";

/* Skeleton component — renders a pulsing placeholder block */
function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  );
}

export { Skeleton };
