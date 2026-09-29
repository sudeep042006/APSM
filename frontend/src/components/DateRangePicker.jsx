import { useState, useRef, useEffect } from "react";
import { Calendar as CalendarIcon, ChevronDown } from "lucide-react";

export function formatDateRange(start, end) {
  if (!start && !end) return "Overall Report";

  if (start && !end) {
    const date = new Date(start).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

    return date;
  }

  const options = {
    month: "short",
    day: "numeric",
    year: "numeric",
  };

  const dStart = new Date(start).toLocaleDateString("en-US", options);
  const dEnd = new Date(end).toLocaleDateString("en-US", options);

  if (start === end) {
    return dStart;
  }

  return `${dStart} - ${dEnd}`;
}

export default function DateRangePicker({
  startDate,
  endDate,
  onChange,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const getPastDate = (daysAgo) => {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    return d.toISOString().split("T")[0];
  };

  // ── Preset date ranges ────────────────────────────────────────────
  const handlePreset = (days) => {
    const today = getPastDate(0);

    let start = today;
    let end = today;

    if (days === 1) {
      // Yesterday
      start = getPastDate(1);
      end = getPastDate(1);
    } else if (days > 1) {
      start = getPastDate(days - 1);
    }

    onChange({
      start,
      end,
    });

    setIsOpen(false);
  };

  // ── Overall report ────────────────────────────────────────────────
  const handleOverall = () => {
    onChange({
      start: null,
      end: null,
    });

    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Date Range Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="lift flex h-9 items-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.03] px-3.5 text-[13px] font-semibold text-foreground backdrop-blur-sm hover:border-primary/35 hover:bg-white/[0.07]"
      >
        <CalendarIcon className="h-4 w-4 text-primary" />

        {formatDateRange(startDate, endDate)}

        <ChevronDown
          className={`h-4 w-4 text-muted-foreground transition-transform duration-300 ease-smooth ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="glass absolute right-0 top-full z-50 mt-2 w-80 rounded-2xl p-4 animate-in fade-in slide-in-from-top-2">
          {/* Overall Report */}
          <div className="mb-4 space-y-1">
            {[
              { label: "Overall Report", action: handleOverall, active: !startDate && !endDate },
              { label: "Today", action: () => handlePreset(0) },
              { label: "Yesterday", action: () => handlePreset(1) },
              { label: "Last 7 Days", action: () => handlePreset(7) },
              { label: "Last 28 Days", action: () => handlePreset(28) },
            ].map(({ label, action, active }) => (
              <button
                key={label}
                type="button"
                onClick={action}
                className={`w-full rounded-lg px-3 py-2 text-left text-sm font-medium transition-all duration-300 ease-smooth ${
                  active
                    ? "bg-[linear-gradient(100deg,hsl(var(--brand-violet)/0.22),hsl(var(--brand-blue)/0.10))] text-white ring-1 ring-inset ring-primary/30"
                    : "text-muted-foreground hover:bg-white/[0.06] hover:text-white"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="mb-4 h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />

          {/* Custom Date Range */}
          <div className="space-y-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
              Custom Range
            </p>

            {/* Start Date */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                Start Date
              </label>

              <input
                type="date"
                value={startDate || ""}
                onChange={(e) =>
                  onChange({
                    start: e.target.value || null,
                    end: endDate || e.target.value || null,
                  })
                }
                className="w-full rounded-xl border border-white/[0.07] bg-surface-sunken px-3 py-2 text-sm text-foreground outline-none transition-all duration-300 focus:border-primary/60 focus:shadow-glow-sm"
                style={{ colorScheme: "dark" }}
              />
            </div>

            {/* End Date */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                End Date
              </label>

              <input
                type="date"
                value={endDate || ""}
                min={startDate || undefined}
                onChange={(e) =>
                  onChange({
                    start: startDate || e.target.value || null,
                    end: e.target.value || null,
                  })
                }
                className="w-full rounded-xl border border-white/[0.07] bg-surface-sunken px-3 py-2 text-sm text-foreground outline-none transition-all duration-300 focus:border-primary/60 focus:shadow-glow-sm"
                style={{ colorScheme: "dark" }}
              />
            </div>

            {/* Apply */}
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="shine mt-2 w-full rounded-xl bg-[linear-gradient(135deg,hsl(var(--brand-violet)),hsl(var(--brand-indigo))_55%,hsl(var(--brand-blue)))] px-3 py-2 text-sm font-semibold text-white shadow-glow-sm transition-all duration-300 ease-smooth hover:shadow-glow-lg hover:brightness-110 active:scale-[0.98]"
            >
              Apply Range
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
