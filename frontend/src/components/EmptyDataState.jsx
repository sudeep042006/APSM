import React from 'react';
import { DatabaseZap } from 'lucide-react';

const EmptyDataState = ({ message = "Gathering Data..." }) => {
  return (
    <div className="surface-card flex h-full min-h-[250px] flex-col items-center justify-center p-6">
      <div className="relative mb-5">
        <div className="absolute inset-0 animate-pulse rounded-full bg-primary/25 blur-xl" />
        <div className="relative flex rounded-full border border-primary/25 bg-primary/10 p-4 shadow-inner-glow">
          <DatabaseZap className="h-8 w-8 text-primary" />
        </div>
      </div>
      <h3 className="mb-2 font-display text-base font-semibold text-foreground">{message}</h3>
      <p className="max-w-xs text-center text-sm leading-relaxed text-muted-foreground">
        Not enough historical data yet to generate this chart. Check back later!
      </p>

      {/* Indeterminate progress rail */}
      <div className="relative mt-6 h-1 w-40 overflow-hidden rounded-full bg-white/[0.06]">
        <div className="absolute inset-y-0 left-0 w-1/3 rounded-full bg-[linear-gradient(90deg,transparent,hsl(var(--brand-violet)),hsl(var(--brand-cyan)),transparent)] animate-beam-sweep" />
      </div>
    </div>
  );
};

export default EmptyDataState;
