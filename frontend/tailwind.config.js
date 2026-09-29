// ── Tailwind CSS Configuration ───────────────────────────────────────
// Brand: "Aurora" — a deep indigo/violet professional theme inspired by
// Supabase's dark surfaces and MongoDB's purple accents.
//
// The neutral ramp ("slate") is re-tinted toward deep indigo so every
// existing surface in the app picks up the brand hue automatically, while
// "indigo" / "violet" / "purple" / "blue" are re-graded onto a single
// cohesive purple-to-blue family.

import tailwindcssAnimate from "tailwindcss-animate";

/** @type {import('tailwindcss').Config} */

// ── Brand Neutral Ramp ───────────────────────────────────────────────
// Indigo-tinted neutrals. 950 is the app canvas, 900/800 are surfaces.
const slate = {
  50: "#F7F7FC",
  100: "#F0F0F8",
  200: "#E1E1EF",
  300: "#C8C8DE",
  400: "#9D9DC0",
  500: "#74749B",
  600: "#55557A",
  700: "#41415E",
  800: "#282842",
  900: "#141426",
  950: "#08080F",
};

// ── Primary Ramp (indigo → violet) ───────────────────────────────────
const indigo = {
  50: "#F2F0FE",
  100: "#E5E0FD",
  200: "#CDC4FB",
  300: "#AE9CF7",
  400: "#8F73F2",
  500: "#7550EA",
  600: "#6433DE",
  700: "#5426C2",
  800: "#452199",
  900: "#391C7C",
  950: "#1F0F4A",
};

// ── Accent Ramp (electric violet) ────────────────────────────────────
const violet = {
  50: "#F8F0FE",
  100: "#EFE1FD",
  200: "#DFC7FB",
  300: "#CBA5F8",
  400: "#B37DF3",
  500: "#9D54EE",
  600: "#8733E0",
  700: "#7224C1",
  800: "#5E1D9E",
  900: "#4E1A80",
  950: "#2D0C50",
};

// ── Secondary Ramp (deep purple, Mongo-adjacent) ─────────────────────
const purple = {
  50: "#F6EFFE",
  100: "#EDDCFD",
  200: "#DCBDFB",
  300: "#C795F7",
  400: "#AE6CF1",
  500: "#9644E9",
  600: "#8127DA",
  700: "#6D1DB6",
  800: "#5A1A94",
  900: "#4A1878",
  950: "#290A45",
};

// ── Tertiary Ramp (electric blue, Supabase-adjacent) ─────────────────
const blue = {
  50: "#EEF4FF",
  100: "#D9E7FF",
  200: "#B9D2FF",
  300: "#8AB4FF",
  400: "#5C8DFA",
  500: "#3B6BF0",
  600: "#2A4EDB",
  700: "#243EB2",
  800: "#22368D",
  900: "#21326F",
  950: "#151D42",
};

export default {
  // ── Dark mode via class toggle ────────────────────────────────────
  darkMode: ["class"],

  // ── Content paths for purging unused styles ────────────────────────
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],

  // ── Theme Extensions ───────────────────────────────────────────────
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      // ── Brand Palette Overrides ────────────────────────────────────
      // Re-grades the core ramps so every hardcoded utility in the
      // codebase lands on the purple-blue brand system.
      colors: {
        slate,
        indigo,
        violet,
        purple,
        blue,

        // ── Shadcn UI CSS variable-driven color system ───────────────
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },

        // ── Extended Semantic Tokens ────────────────────────────────
        // Surface / elevation layers for consistent depth stacking.
        surface: {
          DEFAULT: "hsl(var(--surface))",
          raised: "hsl(var(--surface-raised))",
          sunken: "hsl(var(--surface-sunken))",
          overlay: "hsl(var(--surface-overlay))",
        },
        hairline: "hsl(var(--hairline))",
        brand: {
          50: "#F2F0FE",
          100: "#E5E0FD",
          200: "#CDC4FB",
          300: "#AE9CF7",
          400: "#8F73F2",
          500: "#7550EA",
          600: "#6433DE",
          700: "#5426C2",
          800: "#452199",
          900: "#391C7C",
          950: "#1F0F4A",
        },
      },

      // ── Border Radius Tokens ─────────────────────────────────────
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xl: "calc(var(--radius) + 4px)",
        "2xl": "calc(var(--radius) + 8px)",
        "3xl": "calc(var(--radius) + 14px)",
      },

      // ── Typography ───────────────────────────────────────────────
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "Segoe UI", "sans-serif"],
        display: ["Sora", "Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      letterSpacing: {
        tighter: "-0.045em",
        tightest: "-0.06em",
      },

      // ── Elevation: layered, soft, brand-tinted shadows ────────────
      boxShadow: {
        xs: "0 1px 2px 0 hsl(var(--shadow-color) / 0.28)",
        sm: "0 1px 3px 0 hsl(var(--shadow-color) / 0.32), 0 1px 2px -1px hsl(var(--shadow-color) / 0.24)",
        DEFAULT:
          "0 4px 12px -2px hsl(var(--shadow-color) / 0.36), 0 2px 6px -2px hsl(var(--shadow-color) / 0.28)",
        md: "0 10px 24px -4px hsl(var(--shadow-color) / 0.42), 0 4px 10px -4px hsl(var(--shadow-color) / 0.32)",
        lg: "0 20px 40px -8px hsl(var(--shadow-color) / 0.48), 0 8px 18px -8px hsl(var(--shadow-color) / 0.36)",
        xl: "0 32px 64px -12px hsl(var(--shadow-color) / 0.56), 0 12px 28px -12px hsl(var(--shadow-color) / 0.4)",
        "2xl": "0 48px 96px -16px hsl(var(--shadow-color) / 0.64), 0 20px 40px -20px hsl(var(--shadow-color) / 0.44)",

        // ── Brand glows ────────────────────────────────────────────
        glow: "0 0 0 1px hsl(var(--primary) / 0.28), 0 8px 30px -6px hsl(var(--primary) / 0.45)",
        "glow-sm": "0 0 0 1px hsl(var(--primary) / 0.22), 0 4px 16px -4px hsl(var(--primary) / 0.35)",
        "glow-lg": "0 0 0 1px hsl(var(--primary) / 0.32), 0 18px 56px -12px hsl(var(--primary) / 0.58)",
        "inner-glow": "inset 0 1px 0 0 hsl(var(--foreground) / 0.06)",

        // ── Signature drop shadows (brand accent halos) ─────────────
        "glow-violet": "0 10px 40px -10px rgba(139, 92, 246, 0.55)",
        "glow-indigo": "0 10px 40px -10px rgba(79, 70, 229, 0.55)",
        "glow-blue": "0 10px 40px -10px rgba(59, 130, 246, 0.5)",
        "glow-cyan": "0 10px 40px -10px rgba(34, 211, 238, 0.45)",
      },

      // ── Motion: smooth, GPU-friendly, purposeful ──────────────────
      transitionTimingFunction: {
        smooth: "cubic-bezier(0.22, 1, 0.36, 1)",
        "out-expo": "cubic-bezier(0.16, 1, 0.3, 1)",
        spring: "cubic-bezier(0.34, 1.56, 0.64, 1)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },

        // ── Entrance choreography ───────────────────────────────────
        "fade-in": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in-up": {
          from: { opacity: "0", transform: "translateY(16px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in-down": {
          from: { opacity: "0", transform: "translateY(-12px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.96)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        "slide-in-left": {
          from: { opacity: "0", transform: "translateX(-16px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        "slide-in-right": {
          from: { opacity: "0", transform: "translateX(16px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },

        // ── Ambient motion ──────────────────────────────────────────
        aurora: {
          "0%, 100%": { transform: "translate3d(0,0,0) scale(1)", opacity: "0.65" },
          "33%": { transform: "translate3d(4%, -3%, 0) scale(1.08)", opacity: "0.85" },
          "66%": { transform: "translate3d(-3%, 4%, 0) scale(0.96)", opacity: "0.6" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        drift: {
          "0%, 100%": { transform: "translate3d(0,0,0)" },
          "50%": { transform: "translate3d(0,-14px,0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "pulse-ring": {
          "0%": { transform: "scale(0.85)", opacity: "0.7" },
          "80%, 100%": { transform: "scale(1.6)", opacity: "0" },
        },
        "spin-slow": {
          to: { transform: "rotate(360deg)" },
        },

        // ── Gradient motion ─────────────────────────────────────────
        "gradient-x": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        "gradient-border": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        "beam-sweep": {
          "0%": { transform: "translateX(-120%) skewX(-18deg)" },
          "100%": { transform: "translateX(320%) skewX(-18deg)" },
        },

        // ── Progress / data motion ──────────────────────────────────
        "grow-x": {
          from: { transform: "scaleX(0)" },
          to: { transform: "scaleX(1)" },
        },
        "grow-y": {
          from: { transform: "scaleY(0)" },
          to: { transform: "scaleY(1)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",

        "fade-in": "fade-in 0.45s cubic-bezier(0.22, 1, 0.36, 1) both",
        "fade-in-up": "fade-in-up 0.6s cubic-bezier(0.22, 1, 0.36, 1) both",
        "fade-in-down": "fade-in-down 0.5s cubic-bezier(0.22, 1, 0.36, 1) both",
        "scale-in": "scale-in 0.35s cubic-bezier(0.22, 1, 0.36, 1) both",
        "slide-in-left": "slide-in-left 0.4s cubic-bezier(0.22, 1, 0.36, 1) both",
        "slide-in-right": "slide-in-right 0.4s cubic-bezier(0.22, 1, 0.36, 1) both",

        aurora: "aurora 22s ease-in-out infinite",
        float: "float 7s ease-in-out infinite",
        drift: "drift 9s ease-in-out infinite",
        shimmer: "shimmer 2.4s linear infinite",
        "pulse-ring": "pulse-ring 2.4s cubic-bezier(0.24, 0, 0.38, 1) infinite",
        "spin-slow": "spin-slow 14s linear infinite",

        "gradient-x": "gradient-x 6s ease infinite",
        "gradient-border": "gradient-border 6s ease infinite",
        "beam-sweep": "beam-sweep 3.2s ease-in-out infinite",

        "grow-x": "grow-x 0.8s cubic-bezier(0.22, 1, 0.36, 1) both",
        "grow-y": "grow-y 0.8s cubic-bezier(0.22, 1, 0.36, 1) both",
      },

      // ── Backdrop & filter presets ────────────────────────────────
      backdropBlur: {
        xs: "2px",
        "2xl": "40px",
        "3xl": "64px",
      },
      filter: {
        "glow-sm": "drop-shadow(0 0 8px hsl(var(--primary) / 0.45))",
      },
    },
  },

  // ── Plugins ─────────────────────────────────────────────────────────
  plugins: [tailwindcssAnimate],
};
