// ── Landing Page ────────────────────────────────────────────────────
// Public marketing homepage for APSM Analytics.
// Showcases product features and funnels visitors toward sign-up.

import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import {
  BarChart3,
  Share2,
  Send,
  ArrowRight,
  Zap,
  Shield,
  TrendingUp,
  CheckCircle2,
  Sparkles,
  Radio,
  Gauge,
  Layers,
} from "lucide-react";
import { Youtube, Linkedin } from "@/components/icons/BrandIcons";
import { DashboardPreview, OrbitNetwork, LogoMark } from "@/components/Illustrations";

// ── Feature card data ───────────────────────────────────────────────
const features = [
  {
    icon: Youtube,
    title: "YouTube Analytics",
    desc: "Track subscribers, views, watch time, and video performance with real-time data sync.",
    color: "from-red-500 to-rose-600",
    points: ["Watch-time curves", "Revenue splits", "Traffic sources"],
  },
  {
    icon: Linkedin,
    title: "LinkedIn Insights",
    desc: "Monitor follower growth, post impressions, and engagement rates across your profile.",
    color: "from-blue-500 to-sky-600",
    points: ["Impression trends", "Demographic splits", "Post benchmarking"],
  },
  {
    icon: Share2,
    title: "Meta Dashboard",
    desc: "Unified Facebook + Instagram analytics — reach, impressions, and audience breakdown.",
    color: "from-indigo-500 to-violet-600",
    points: ["Reach vs. follows", "Reels & stories", "Audience personas"],
  },
  {
    icon: Send,
    title: "Cross-Posting",
    desc: "Schedule and publish content across all platforms from a single command center.",
    color: "from-emerald-500 to-teal-600",
    points: ["Queue & schedule", "Per-network preview", "Publish history"],
  },
];

// ── Stats data ──────────────────────────────────────────────────────
const stats = [
  { value: "4+", label: "Platforms" },
  { value: "99.9%", label: "Uptime" },
  { value: "50K+", label: "Data Points" },
  { value: "<2s", label: "Load Time" },
];

// ── How-it-works steps ──────────────────────────────────────────────
const steps = [
  {
    step: "01",
    icon: Shield,
    title: "Connect securely",
    desc: "Authorize each channel through OAuth 2.0. Credentials are encrypted at rest with AES-256 — we never see your password.",
  },
  {
    step: "02",
    icon: Gauge,
    title: "Let the engine sync",
    desc: "Background jobs pull reporting-API data continuously, refreshing your dashboard without you lifting a finger.",
  },
  {
    step: "03",
    icon: TrendingUp,
    title: "Act on the signal",
    desc: "Cross-post, compare platforms side by side, and turn insight into the next post — all from one console.",
  },
];

// ── Platform strip ──────────────────────────────────────────────────
const platforms = [
  { name: "YouTube", color: "#FF4E45" },
  { name: "LinkedIn", color: "#5C8DFA" },
  { name: "Facebook", color: "#8F73F2" },
  { name: "Instagram", color: "#C86DD7" },
];

export default function LandingPage() {
  const { user } = useAuth();

  const targetPath = user ? "/dashboard/youtube" : "/login";
  const signupTargetPath = user ? "/dashboard/youtube" : "/signup";
  const btnText = user ? "Dashboard" : "Sign In";
  const ctaText = user ? "Go to Dashboard" : "Get Started Free";
  const bottomCtaText = user ? "Go to Dashboard" : "Start Your Dashboard";

  return (
    <div className="aurora-bg relative min-h-screen overflow-x-hidden bg-background">
      <div className="noise-overlay" />

      {/* ── Navigation Bar ──────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-background/70 backdrop-blur-2xl">
        <nav className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-6 py-3.5 lg:px-10">
          <Link to="/" className="group flex items-center gap-3">
            <span className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-[linear-gradient(135deg,hsl(var(--brand-violet)),hsl(var(--brand-indigo))_55%,hsl(var(--brand-blue)))] shadow-glow-sm transition-transform duration-500 ease-smooth group-hover:scale-105">
              <div className="noise-overlay" />
              <LogoMark className="relative h-6 w-6" />
            </span>
            <span className="font-display text-lg font-bold tracking-tight text-white">
              APSM
            </span>
          </Link>

          <div className="hidden items-center gap-8 md:flex">
            {[
              "Features",
              "Platforms",
              "How it works",
              "Get started",
            ].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase().replace(/\s+/g, "-")}`}
                className="text-sm font-medium text-muted-foreground transition-colors duration-300 hover:text-white"
              >
                {item}
              </a>
            ))}
          </div>

          <Link to={targetPath}>
            <Button variant="outline" size="sm" id="landing-login-btn" className="gap-2">
              {btnText}
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
            </Button>
          </Link>
        </nav>
      </header>

      {/* ══ Hero Section ═════════════════════════════════════════════ */}
      <section className="relative px-6 pb-24 pt-20 lg:px-10 lg:pt-28">
        <div className="relative z-10 mx-auto max-w-7xl">
          <div className="grid items-center gap-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
            {/* ── Copy column ─────────────────────────────────────── */}
            <div className="animate-fade-in-up text-center lg:text-left">
              <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 py-1.5 pl-2 pr-4 text-xs font-semibold text-primary backdrop-blur-sm">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[linear-gradient(120deg,hsl(var(--brand-violet)),hsl(var(--brand-blue)))]">
                  <Sparkles className="h-3 w-3 text-white" />
                </span>
                Unified Analytics Platform
              </div>

              <h1 className="mb-6 font-display text-4xl font-extrabold leading-[1.08] tracking-tighter text-white sm:text-5xl lg:text-[3.6rem]">
                All Your Social Media{" "}
                <span className="text-gradient-animated">Analytics</span> in One
                Place
              </h1>

              <p className="mx-auto mb-9 max-w-xl text-lg leading-relaxed text-muted-foreground lg:mx-0">
                Track performance, schedule posts, and grow your audience across
                YouTube, LinkedIn, Facebook, and Instagram — all from one
                beautiful dashboard.
              </p>

              <div className="mb-9 flex flex-col items-center gap-4 sm:flex-row lg:justify-start">
                <Link to={signupTargetPath} className="w-full sm:w-auto">
                  <Button size="xl" className="w-full gap-2" id="landing-get-started-btn">
                    {ctaText}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="xl"
                  id="landing-learn-more-btn"
                  className="w-full sm:w-auto"
                >
                  Learn More
                </Button>
              </div>

              {/* ── Trust signals ─────────────────────────────────── */}
              <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-medium text-muted-foreground lg:justify-start">
                {["No credit card", "OAuth 2.0", "AES-256 encrypted"].map((item) => (
                  <span key={item} className="inline-flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                    {item}
                  </span>
                ))}
              </div>
            </div>

            {/* ── Product preview column ─────────────────────────── */}
            <div className="relative animate-fade-in-up [animation-delay:0.15s]">
              <div className="relative">
                {/* Glow backing */}
                <div
                  aria-hidden="true"
                  className="absolute -inset-10 -z-10 rounded-[3rem] bg-[radial-gradient(60%_60%_at_50%_40%,hsl(var(--brand-violet)/0.28),transparent_70%)] blur-2xl"
                />

                {/* Framed preview */}
                <div className="border-gradient animate-fade-in rounded-3xl bg-surface/60 p-2 shadow-2xl backdrop-blur-xl">
                  <div className="overflow-hidden rounded-2xl border border-white/[0.07] bg-background">
                    <DashboardPreview />
                  </div>
                </div>

                {/* Floating KPI chips */}
                <div className="glass absolute -left-3 top-16 hidden rounded-2xl px-4 py-3 animate-float lg:block">
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[linear-gradient(135deg,hsl(var(--brand-violet)),hsl(var(--brand-blue)))]">
                      <TrendingUp className="h-4 w-4 text-white" />
                    </span>
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Total Reach
                      </p>
                      <p className="font-display text-base font-bold leading-tight text-white">
                        2.48M
                      </p>
                    </div>
                    <span className="ml-1 rounded-md bg-emerald-400/15 px-1.5 py-0.5 text-[10px] font-bold text-emerald-400">
                      +18%
                    </span>
                  </div>
                </div>

                <div
                  className="glass absolute -right-3 bottom-16 hidden rounded-2xl px-4 py-3 animate-float lg:block [animation-delay:-3s]"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[linear-gradient(135deg,hsl(var(--brand-cyan)),hsl(var(--brand-blue)))]">
                      <Radio className="h-4 w-4 text-white" />
                    </span>
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Sync Status
                      </p>
                      <p className="flex items-center gap-1.5 font-display text-sm font-bold leading-tight text-white">
                        <span className="status-dot bg-emerald-400" />
                        Live · 4 channels
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ Platform Strip ══════════════════════════════════════════ */}
      <section className="relative border-y border-white/[0.06] bg-surface/40 backdrop-blur-sm">
        <div className="relative z-10 mx-auto flex max-w-7xl flex-col items-center gap-6 px-6 py-8 lg:flex-row lg:justify-between lg:px-10">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">
            One console · Four networks
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {platforms.map((p) => (
              <span
                key={p.name}
                className="inline-flex items-center gap-2 rounded-xl border border-white/[0.07] bg-background/50 px-4 py-2 text-sm font-semibold text-muted-foreground transition-all duration-300 ease-smooth hover:-translate-y-0.5 hover:border-primary/30 hover:text-white"
              >
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ background: p.color, boxShadow: `0 0 10px ${p.color}` }}
                />
                {p.name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ══ Stats Bar ══════════════════════════════════════════════ */}
      <section className="relative px-6 lg:px-10">
        <div className="relative z-10 mx-auto grid max-w-7xl grid-cols-2 gap-6 py-14 sm:grid-cols-4">
          {stats.map((stat, i) => (
            <div
              key={stat.label}
              className="surface-card surface-card-hover group px-6 py-7 text-center"
              style={{ animationDelay: `${i * 0.06}s` }}
            >
              <p className="font-display text-3xl font-extrabold tracking-tight text-gradient sm:text-4xl">
                {stat.value}
              </p>
              <p className="mt-1.5 text-sm font-medium text-muted-foreground">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ══ Features Grid ══════════════════════════════════════════ */}
      <section id="features" className="relative px-6 py-20 lg:px-10">
        <div className="relative z-10 mx-auto max-w-7xl">
          <div className="mb-14 max-w-2xl">
            <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-primary">
              <Layers className="h-3 w-3" />
              Capabilities
            </span>
            <h2 className="mb-4 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Everything You Need to Grow
            </h2>
            <p className="text-lg leading-relaxed text-muted-foreground">
              Powerful analytics, seamless cross-posting, and real-time insights
              for every major social platform.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="surface-card surface-card-hover group p-7"
              >
                <div className="mb-5 flex items-start justify-between gap-4">
                  <div
                    className={`flex shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${feature.color} p-3.5 shadow-lg transition-transform duration-500 ease-smooth group-hover:scale-110 group-hover:rotate-3`}
                    style={{ height: "3.25rem", width: "3.25rem" }}
                  >
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <span className="mt-1 inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.07] text-muted-foreground transition-all duration-300 group-hover:border-primary/30 group-hover:text-primary">
                    <ArrowRight className="h-4 w-4 -rotate-45 transition-transform duration-300 group-hover:rotate-0" />
                  </span>
                </div>

                <h3 className="mb-2 font-display text-lg font-semibold text-white">
                  {feature.title}
                </h3>
                <p className="mb-5 text-sm leading-relaxed text-muted-foreground">
                  {feature.desc}
                </p>

                <ul className="space-y-2 border-t border-white/[0.06] pt-4">
                  {feature.points.map((point) => (
                    <li
                      key={point}
                      className="flex items-center gap-2 text-xs font-medium text-muted-foreground"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-primary/70" />
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ Cross-Posting Showcase ═════════════════════════════════ */}
      <section id="platforms" className="relative border-y border-white/[0.06] px-6 py-20 lg:px-10">
        <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-16 lg:grid-cols-2">
          <div className="order-2 lg:order-1">
            <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-primary">
              <Send className="h-3 w-3" />
              Cross-Posting Engine
            </span>
            <h2 className="mb-5 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Write Once. Publish Everywhere.
            </h2>
            <p className="mb-8 text-lg leading-relaxed text-muted-foreground">
              Compose a post, preview it per network, and queue it to all four
              channels in a single action. APSM handles token refresh, rate
              limits, and per-platform formatting behind the scenes.
            </p>

            <div className="grid gap-4 sm:grid-cols-2">
              {[
                { icon: Send, label: "One-click fan-out to 4 networks" },
                { icon: BarChart3, label: "Per-network performance tracking" },
                { icon: Shield, label: "Encrypted token custody" },
                { icon: Zap, label: "Automatic token refresh" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-surface/40 px-4 py-3 text-sm font-medium text-muted-foreground transition-all duration-300 ease-smooth hover:-translate-y-0.5 hover:border-primary/25 hover:text-white"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/12 text-primary">
                    <item.icon className="h-4 w-4" />
                  </span>
                  {item.label}
                </div>
              ))}
            </div>
          </div>

          <div className="order-1 flex justify-center lg:order-2">
            <div className="relative w-full max-w-md animate-float">
              <div
                aria-hidden="true"
                className="absolute inset-0 -z-10 rounded-full bg-[radial-gradient(circle,hsl(var(--brand-blue)/0.24),transparent_65%)] blur-2xl"
              />
              <OrbitNetwork />
            </div>
          </div>
        </div>
      </section>

      {/* ══ How It Works ═══════════════════════════════════════════ */}
      <section id="how-it-works" className="relative px-6 py-20 lg:px-10">
        <div className="relative z-10 mx-auto max-w-7xl">
          <div className="mb-14 max-w-2xl">
            <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-primary">
              <Gauge className="h-3 w-3" />
              Getting Started
            </span>
            <h2 className="mb-4 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
              From zero to live in three steps
            </h2>
            <p className="text-lg leading-relaxed text-muted-foreground">
              No credit card, no CSV imports, no manual reporting. Just connect,
              sync, and act.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {steps.map((s) => (
              <div
                key={s.step}
                className="surface-card surface-card-hover group relative overflow-hidden p-7"
              >
                <span className="pointer-events-none absolute -right-2 -top-4 font-display text-7xl font-extrabold text-white/[0.04] transition-all duration-500 group-hover:text-primary/10">
                  {s.step}
                </span>

                <div className="relative mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border border-primary/25 bg-primary/10 text-primary transition-all duration-300 group-hover:bg-[linear-gradient(135deg,hsl(var(--brand-violet)),hsl(var(--brand-indigo)))] group-hover:text-white group-hover:shadow-glow-sm">
                  <s.icon className="h-5 w-5" />
                </div>

                <h3 className="relative mb-2 font-display text-lg font-semibold text-white">
                  {s.title}
                </h3>
                <p className="relative text-sm leading-relaxed text-muted-foreground">
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ CTA Section ═════════════════════════════════════════════ */}
      <section id="get-started" className="relative border-t border-white/[0.06] px-6 py-24 lg:px-10">
        <div className="relative z-10 mx-auto max-w-4xl">
          <div className="border-gradient relative overflow-hidden rounded-3xl bg-surface/50 px-8 py-16 text-center backdrop-blur-xl sm:px-16">
            <div className="noise-overlay" />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -top-24 left-1/2 h-64 w-[36rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,hsl(var(--brand-violet)/0.28),transparent_70%)] blur-2xl"
            />

            <div className="relative mb-4 flex justify-center gap-2">
              <Shield className="h-5 w-5 text-violet-400" />
              <TrendingUp className="h-5 w-5 text-indigo-400" />
            </div>
            <h2 className="relative mb-4 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Ready to Supercharge Your Growth?
            </h2>
            <p className="relative mx-auto mb-9 max-w-xl text-lg leading-relaxed text-muted-foreground">
              Join thousands of creators and brands managing their social presence
              through APSM.
            </p>
            <Link to={signupTargetPath} className="relative inline-block">
              <Button size="xl" className="gap-2" id="landing-cta-btn">
                {bottomCtaText}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ══ Footer ═════════════════════════════════════════════════ */}
      <footer className="relative border-t border-white/[0.06] px-6 py-8 lg:px-10">
        <div className="relative z-10 mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} APSM. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            {platforms.map((p) => (
              <span
                key={p.name}
                title={p.name}
                className="h-2 w-2 rounded-full transition-transform duration-300 hover:scale-150"
                style={{ background: p.color, boxShadow: `0 0 10px ${p.color}` }}
              />
            ))}
            <div className="ml-2 flex h-8 w-8 items-center justify-center rounded-xl bg-[linear-gradient(135deg,hsl(var(--brand-violet)),hsl(var(--brand-blue)))] shadow-glow-sm">
              <BarChart3 className="h-4 w-4 text-white" />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
