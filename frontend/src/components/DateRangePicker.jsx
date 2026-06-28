import { useState, useRef, useEffect } from "react";
import { Calendar as CalendarIcon, ChevronDown } from "lucide-react";

export function formatDateRange(start, end) {
  if (!start || !end) return "Select Date";
  
  const options = { month: "short", day: "numeric", year: "numeric" };
  const dStart = new Date(start).toLocaleDateString("en-US", options);
  const dEnd = new Date(end).toLocaleDateString("en-US", options);
  
  if (start === end) {
    return dStart;
  }
  return `${dStart} - ${dEnd}`;
}

export default function DateRangePicker({ startDate, endDate, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getPastDate = (daysAgo) => {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    return d.toISOString().split('T')[0];
  };

  const handlePreset = (days) => {
    const today = getPastDate(0);
    let start = today;
    let end = today;

    if (days === 1) { // Yesterday
      start = getPastDate(1);
      end = getPastDate(1);
    } else if (days > 1) {
      start = getPastDate(days - 1);
    }

    onChange({ start, end });
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 h-9 bg-white/5 hover:bg-white/10 border border-white/10 rounded-md text-sm font-medium text-slate-300 transition-colors"
      >
        <CalendarIcon className="h-4 w-4" />
        {formatDateRange(startDate, endDate)}
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-72 bg-[#161B22] border border-white/10 rounded-xl shadow-2xl z-50 p-4 animate-in fade-in slide-in-from-top-2">
          {/* Presets */}
          <div className="space-y-1 mb-4">
            <button
              onClick={() => handlePreset(0)}
              className="w-full text-left px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-white/5 rounded-md transition-colors"
            >
              Today
            </button>
            <button
              onClick={() => handlePreset(1)}
              className="w-full text-left px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-white/5 rounded-md transition-colors"
            >
              Yesterday
            </button>
            <button
              onClick={() => handlePreset(7)}
              className="w-full text-left px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-white/5 rounded-md transition-colors"
            >
              Last 7 Days
            </button>
            <button
              onClick={() => handlePreset(28)}
              className="w-full text-left px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-white/5 rounded-md transition-colors"
            >
              Last 28 Days
            </button>
          </div>

          <div className="h-px w-full bg-white/10 mb-4" />

          {/* Custom Range */}
          <div className="space-y-3">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Custom Range</p>
            <div className="space-y-1">
              <label className="text-xs text-slate-400">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => onChange({ start: e.target.value, end: endDate })}
                className="w-full bg-[#0B1121] border border-white/10 rounded-md px-3 py-1.5 text-sm text-slate-200 focus:outline-none focus:border-blue-500 color-scheme-dark"
                style={{ colorScheme: 'dark' }}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-slate-400">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => onChange({ start: startDate, end: e.target.value })}
                className="w-full bg-[#0B1121] border border-white/10 rounded-md px-3 py-1.5 text-sm text-slate-200 focus:outline-none focus:border-blue-500 color-scheme-dark"
                style={{ colorScheme: 'dark' }}
              />
            </div>
            
            <button
              onClick={() => setIsOpen(false)}
              className="w-full mt-2 px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-md transition-colors"
            >
              Apply Range
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
