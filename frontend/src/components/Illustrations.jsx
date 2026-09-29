// ── Illustrations ───────────────────────────────────────────────────
// Hand-built, dependency-free SVG artwork used across the marketing
// surfaces. Vector-only so they stay crisp at any size and add no
// network payload.

import { cn } from "@/lib/utils";

// ── Brand Gradient Definitions ──────────────────────────────────────
// Referenced by every illustration via an `id` suffix so multiple
// instances on one page never collide.
function Defs({ id }) {
  return (
    <defs>
      <linearGradient id={`violet-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#8F73F2" />
        <stop offset="55%" stopColor="#6433DE" />
        <stop offset="100%" stopColor="#3B6BF0" />
      </linearGradient>
      <linearGradient id={`cyan-${id}`} x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#3B6BF0" />
        <stop offset="100%" stopColor="#22D3EE" />
      </linearGradient>
      <linearGradient id={`pink-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#C86DD7" />
        <stop offset="100%" stopColor="#8F73F2" />
      </linearGradient>
      <linearGradient id={`area-${id}`} x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#8F73F2" stopOpacity="0.42" />
        <stop offset="100%" stopColor="#8F73F2" stopOpacity="0" />
      </linearGradient>
      <linearGradient id={`frame-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#8F73F2" stopOpacity="0.85" />
        <stop offset="50%" stopColor="#3B6BF0" stopOpacity="0.35" />
        <stop offset="100%" stopColor="#22D3EE" stopOpacity="0.55" />
      </linearGradient>
      <filter id={`soft-${id}`} x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="9" />
      </filter>
    </defs>
  );
}

// ── Dashboard Preview ───────────────────────────────────────────────
// A stylized analytics console: chrome bar, sidebar rail, KPI row,
// area chart and donut. Used as the hero "product shot".
export function DashboardPreview({ className }) {
  return (
    <svg
      viewBox="0 0 720 440"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("h-auto w-full", className)}
      role="img"
      aria-label="APSM analytics dashboard preview"
    >
      <Defs id="dash" />

      {/* ── Ambient glow behind the console ─────────────────────────── */}
      <ellipse
        cx="360"
        cy="250"
        rx="300"
        ry="150"
        fill="#6433DE"
        opacity="0.22"
        filter="url(#soft-dash)"
      />

      {/* ── Window frame ───────────────────────────────────────────── */}
      <rect
        x="20"
        y="18"
        width="680"
        height="404"
        rx="18"
        fill="#0D0D1E"
        stroke={`url(#frame-dash)`}
        strokeWidth="1.5"
      />

      {/* ── Chrome bar ─────────────────────────────────────────────── */}
      <path d="M20 36a18 18 0 0 1 18-18h644a18 18 0 0 1 18 18v22H20V36Z" fill="#141426" />
      <line x1="20" y1="58" x2="700" y2="58" stroke="#282842" strokeWidth="1" />
      <circle cx="42" cy="39" r="4" fill="#FF5F57" />
      <circle cx="58" cy="39" r="4" fill="#FEBC2E" />
      <circle cx="74" cy="39" r="4" fill="#28C840" />
      <rect x="96" y="31" width="240" height="16" rx="8" fill="#08080F" />
      <circle cx="110" cy="39" r="3" fill="#8F73F2" />
      <rect x="118" y="36" width="120" height="6" rx="3" fill="#41415E" />

      {/* ── Sidebar rail ───────────────────────────────────────────── */}
      <rect x="20" y="58" width="132" height="364" fill="#0A0A14" />
      <line x1="152" y1="58" x2="152" y2="422" stroke="#282842" strokeWidth="1" />

      {/* Brand mark */}
      <rect x="36" y="76" width="22" height="22" rx="7" fill={`url(#violet-dash)`} />
      <path d="M41 90l5-6 4 5 3-3" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />

      {/* Active nav item */}
      <rect x="32" y="112" width="108" height="28" rx="8" fill="#6433DE" fillOpacity="0.18" stroke="#8F73F2" strokeOpacity="0.35" />
      <rect x="32" y="120" width="2.5" height="12" rx="1.25" fill="#8F73F2" />
      <circle cx="49" cy="126" r="5" fill="#8F73F2" />
      <rect x="60" y="122" width="52" height="8" rx="4" fill="#C8C8DE" />

      {/* Inactive nav items */}
      {[0, 1, 2, 3].map((i) => (
        <g key={i} transform={`translate(0 ${152 + i * 30})`}>
          <circle cx="49" cy="126" r="4.5" fill="#41415E" />
          <rect x="60" y="123" width={44 - i * 5} height="6" rx="3" fill="#282842" />
        </g>
      ))}

      {/* Sidebar footer pill */}
      <rect x="32" y="380" width="108" height="30" rx="10" fill="#141426" />
      <circle cx="49" cy="395" r="8" fill={`url(#violet-dash)`} />
      <rect x="62" y="391" width="40" height="8" rx="4" fill="#282842" />

      {/* ── Top bar ────────────────────────────────────────────────── */}
      <line x1="152" y1="102" x2="700" y2="102" stroke="#202036" strokeWidth="1" />
      <rect x="170" y="74" width="96" height="10" rx="5" fill="#E1E1EF" />
      <rect x="170" y="88" width="58" height="6" rx="3" fill="#41415E" />

      {/* Date range pill */}
      <rect x="516" y="72" width="104" height="26" rx="8" fill="#141426" stroke="#282842" />
      <path d="M530 82v8M526 86h8" stroke="#8F73F2" strokeWidth="1.4" strokeLinecap="round" />
      <rect x="542" y="83" width="62" height="5" rx="2.5" fill="#55557A" />

      {/* Refresh button */}
      <rect x="632" y="72" width="50" height="26" rx="8" fill={`url(#violet-dash)`} />
      <rect x="644" y="82" width="26" height="5" rx="2.5" fill="#fff" fillOpacity="0.85" />

      {/* ── KPI cards ──────────────────────────────────────────────── */}
      {[0, 1, 2].map((i) => (
        <g key={i} transform={`translate(${172 + i * 174} 120)`}>
          <rect width="158" height="76" rx="12" fill="#141426" stroke="#202036" />
          <rect x="14" y="14" width="46" height="6" rx="3" fill="#41415E" />
          <rect x="14" y="30" width="72" height="14" rx="4" fill="#E1E1EF" />
          <rect
            x="112"
            y="12"
            width="34"
            height="16"
            rx="8"
            fill={i === 1 ? "#22D3EE" : "#8F73F2"}
            fillOpacity="0.16"
          />
          {/* Sparkline */}
          <path
            d={
              i === 0
                ? "M14 62 L38 54 L62 58 L86 46 L110 50 L134 40"
                : i === 1
                  ? "M14 56 L38 58 L62 48 L86 52 L110 38 L134 42"
                  : "M14 64 L38 52 L62 60 L86 42 L110 48 L134 32"
            }
            stroke={i === 1 ? "#22D3EE" : i === 2 ? "#C86DD7" : "#8F73F2"}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      ))}

      {/* ── Area chart panel ───────────────────────────────────────── */}
      <rect x="172" y="210" width="346" height="188" rx="12" fill="#141426" stroke="#202036" />
      <rect x="188" y="226" width="90" height="8" rx="4" fill="#55557A" />
      <rect x="188" y="240" width="52" height="5" rx="2.5" fill="#282842" />

      {/* Grid lines */}
      {[0, 1, 2, 3].map((i) => (
        <line
          key={i}
          x1="188"
          y1={272 + i * 30}
          x2="502"
          y2={272 + i * 30}
          stroke="#202036"
          strokeWidth="1"
          strokeDasharray="3 5"
        />
      ))}

      {/* Area fill + line */}
      <path
        d="M188 350 L230 322 L272 336 L314 296 L356 308 L398 268 L440 282 L482 246 L482 372 L188 372 Z"
        fill={`url(#area-dash)`}
      />
      <path
        d="M188 350 L230 322 L272 336 L314 296 L356 308 L398 268 L440 282 L482 246"
        stroke="#8F73F2"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Highlighted data point */}
      <circle cx="398" cy="268" r="5" fill="#0D0D1E" stroke="#22D3EE" strokeWidth="2.4" />
      <circle cx="398" cy="268" r="10" stroke="#22D3EE" strokeOpacity="0.3" strokeWidth="2" />

      {/* ── Donut + legend panel ───────────────────────────────────── */}
      <rect x="530" y="210" width="154" height="188" rx="12" fill="#141426" stroke="#202036" />
      <rect x="546" y="226" width="62" height="8" rx="4" fill="#55557A" />

      {/* Donut */}
      <g transform="translate(607 288)">
        <circle r="34" stroke="#282842" strokeWidth="11" fill="none" />
        <circle
          r="34"
          stroke="#8F73F2"
          strokeWidth="11"
          fill="none"
          strokeLinecap="round"
          strokeDasharray="150 214"
          transform="rotate(-90)"
        />
        <circle
          r="34"
          stroke="#3B6BF0"
          strokeWidth="11"
          fill="none"
          strokeLinecap="round"
          strokeDasharray="72 214"
          strokeDashoffset="-150"
          transform="rotate(-90)"
        />
        <circle
          r="34"
          stroke="#22D3EE"
          strokeWidth="11"
          fill="none"
          strokeLinecap="round"
          strokeDasharray="40 214"
          strokeDashoffset="-222"
          transform="rotate(-90)"
        />
      </g>

      {/* Legend rows */}
      {[0, 1, 2].map((i) => (
        <g key={i} transform={`translate(0 ${340 + i * 16})`}>
          <circle cx="550" cy={4} r="3.5" fill={["#8F73F2", "#3B6BF0", "#22D3EE"][i]} />
          <rect x="560" y="1" width="40" height="6" rx="3" fill="#282842" />
          <rect x="648" y="1" width="22" height="6" rx="3" fill="#41415E" />
        </g>
      ))}
    </svg>
  );
}

// ── Orbit Network ───────────────────────────────────────────────────
// Abstract cross-platform publishing graph: a central hub orbited by
// connected platform nodes.
export function OrbitNetwork({ className }) {
  return (
    <svg
      viewBox="0 0 400 400"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("h-auto w-full", className)}
      role="img"
      aria-label="Cross-platform publishing network"
    >
      <Defs id="orbit" />

      {/* ── Orbit rings ────────────────────────────────────────────── */}
      <circle cx="200" cy="200" r="70" stroke="#8F73F2" strokeOpacity="0.28" strokeWidth="1" />
      <circle cx="200" cy="200" r="122" stroke="#3B6BF0" strokeOpacity="0.2" strokeWidth="1" strokeDasharray="4 8" />
      <circle cx="200" cy="200" r="172" stroke="#22D3EE" strokeOpacity="0.14" strokeWidth="1" />

      {/* ── Connector spokes ───────────────────────────────────────── */}
      {[0, 60, 120, 180, 240, 300].map((deg) => (
        <line
          key={deg}
          x1="200"
          y1="200"
          x2={200 + 172 * Math.cos((deg * Math.PI) / 180)}
          y2={200 + 172 * Math.sin((deg * Math.PI) / 180)}
          stroke="#8F73F2"
          strokeOpacity="0.16"
          strokeWidth="1"
        />
      ))}

      {/* ── Hub ────────────────────────────────────────────────────── */}
      <circle cx="200" cy="200" r="52" fill="#8F73F2" opacity="0.2" filter="url(#soft-orbit)" />
      <circle cx="200" cy="200" r="38" fill={`url(#violet-orbit)`} />
      <circle cx="200" cy="200" r="38" stroke="#C8C8DE" strokeOpacity="0.28" />
      <path d="M186 216v-14M200 216v-26M214 216v-18" stroke="#fff" strokeWidth="4" strokeLinecap="round" />

      {/* ── Satellite nodes ────────────────────────────────────────── */}
      {[
        { x: 200, y: 28, c: "#FF4E45" },
        { x: 349, y: 286, c: "#5C8DFA" },
        { x: 51, y: 286, c: "#C86DD7" },
        { x: 200, y: 372, c: "#22D3EE" },
        { x: 328, y: 114, c: "#8F73F2" },
        { x: 72, y: 114, c: "#3B6BF0" },
      ].map((n, i) => (
        <g key={i}>
          <circle cx={n.x} cy={n.y} r="20" fill={n.c} opacity="0.22" filter="url(#soft-orbit)" />
          <circle cx={n.x} cy={n.y} r="13" fill="#0D0D1E" stroke={n.c} strokeWidth="2" />
          <circle cx={n.x} cy={n.y} r="4.5" fill={n.c} />
        </g>
      ))}
    </svg>
  );
}

// ── Logo Mark ───────────────────────────────────────────────────────
// Compact brand glyph: a paper-plane arc resolving into analytics bars.
export function LogoMark({ className }) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("h-full w-full", className)}
      role="img"
      aria-label="APSM"
    >
      <Defs id="mark" />
      <path
        d="M9 27c0-7 4.6-11.4 12-12.6l-.7 2.2c-5.4.9-8.4 4.3-8.4 10.4H9Z"
        fill={`url(#violet-mark)`}
      />
      <path d="M18.5 8 26 4.4 21.4 12.4l-3.3-1.9.4-2.5Z" fill={`url(#cyan-mark)`} />
      <rect x="14" y="22" width="3.4" height="8" rx="1.4" fill="#fff" fillOpacity="0.9" />
      <rect x="19" y="18" width="3.4" height="12" rx="1.4" fill="#fff" />
      <rect x="24" y="14" width="3.4" height="16" rx="1.4" fill="#fff" fillOpacity="0.75" />
    </svg>
  );
}
