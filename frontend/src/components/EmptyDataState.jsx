import React from 'react';
import { DatabaseZap } from 'lucide-react';

const EmptyDataState = ({ message = "Gathering Data..." }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[250px] bg-slate-900/50 rounded-xl border border-slate-800/50 p-6">
      <div className="relative mb-4">
        <div className="absolute inset-0 bg-indigo-500/20 blur-xl rounded-full"></div>
        <div className="relative bg-slate-800 p-4 rounded-full border border-slate-700/50 shadow-inner">
          <DatabaseZap className="w-8 h-8 text-indigo-400 opacity-80" />
        </div>
      </div>
      <h3 className="text-slate-300 font-medium mb-2">{message}</h3>
      <p className="text-slate-500 text-sm text-center max-w-xs">
        Not enough historical data yet to generate this chart. Check back later!
      </p>
    </div>
  );
};

export default EmptyDataState;
