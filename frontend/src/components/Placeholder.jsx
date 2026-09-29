import React from 'react';
import { Construction } from 'lucide-react';

const Placeholder = ({ title }) => {
  return (
    <div className="relative flex min-h-[60vh] w-full flex-col items-center justify-center overflow-hidden rounded-2xl border border-white/[0.06] bg-surface/40 p-10 text-center">
      {/* Ambient bloom */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/3 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,hsl(var(--brand-violet)/0.18),transparent_70%)] blur-2xl"
      />

      <div className="relative mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-primary/25 bg-primary/10 shadow-glow-sm">
        <Construction className="h-7 w-7 text-primary" />
      </div>

      <h2 className="relative mb-2 font-display text-2xl font-bold tracking-tight text-foreground">
        {title}
      </h2>
      <p className="relative max-w-md text-sm leading-relaxed text-muted-foreground">
        This view is currently under construction. Detailed metrics and charts
        for {title.toLowerCase()} will be available soon.
      </p>
    </div>
  );
};

export default Placeholder;
