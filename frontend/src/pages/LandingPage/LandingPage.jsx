// ── Landing Page ────────────────────────────────────────────────────
// Public marketing homepage for Incubein Analytics Dashboard.
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
} from "lucide-react";
import { Youtube, Linkedin } from "@/components/icons/BrandIcons";
import ApsmLogo from "@/assets/images/apsm-logo.svg";

// ── Feature card data ───────────────────────────────────────────────
const features = [
  {
    icon: Youtube,
    title: "YouTube Analytics",
    desc: "Track subscribers, views, watch time, and video performance with real-time data sync.",
    color: "from-red-500 to-rose-600",
  },
  {
    icon: Linkedin,
    title: "LinkedIn Insights",
    desc: "Monitor follower growth, post impressions, and engagement rates across your profile.",
    color: "from-blue-500 to-sky-600",
  },
  {
    icon: Share2,
    title: "Meta Dashboard",
    desc: "Unified Facebook + Instagram analytics — reach, impressions, and audience breakdown.",
    color: "from-indigo-500 to-violet-600",
  },
  {
    icon: Send,
    title: "Cross-Posting",
    desc: "Schedule and publish content across all platforms from a single command center.",
    color: "from-emerald-500 to-teal-600",
  },
];

// ── Stats data ──────────────────────────────────────────────────────
const stats = [
  { value: "4+", label: "Platforms" },
  { value: "99.9%", label: "Uptime" },
  { value: "50K+", label: "Data Points" },
  { value: "<2s", label: "Load Time" },
];

export default function LandingPage() {
  const { user } = useAuth();

  const targetPath = user ? "/dashboard/youtube" : "/login";
  const signupTargetPath = user ? "/dashboard/youtube" : "/signup";
  const btnText = user ? "Dashboard" : "Sign In";
  const ctaText = user ? "Go to Dashboard" : "Get Started Free";
  const bottomCtaText = user ? "Go to Dashboard" : "Start Your Dashboard";

  return (
    <div className="min-h-screen bg-background">
      {/* ── Hero Section ───────────────────────────────────────────────── */}
      <header className="relative overflow-hidden">
        {/* ── Gradient Background Orbs ────────────────────────────────── */}
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-violet-600/20 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-indigo-600/20 blur-3xl" />

        {/* ── Navigation Bar ──────────────────────────────────────────── */}
        <nav className="relative z-10 flex items-center justify-between px-6 py-4 lg:px-16">
          <div className="flex items-center gap-3">
            <img src={ApsmLogo} alt="APSM Logo" className="h-8 w-auto object-contain shrink-0" />
            <span className="text-xl font-bold tracking-wide text-white">APSM</span>
          </div>
          <Link to={targetPath}>
            <Button variant="outline" size="sm" id="landing-login-btn">
              {btnText}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </nav>

        {/* ── Hero Content ─────────────────────────────────────────────── */}
        <div className="relative z-10 mx-auto max-w-4xl px-6 py-24 text-center lg:py-32">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border bg-card/50 px-4 py-1.5 text-sm backdrop-blur-sm">
            <Zap className="h-3.5 w-3.5 text-violet-500" />
            <span className="text-muted-foreground">Unified Analytics Platform</span>
          </div>

          <h1 className="mb-6 text-4xl font-extrabold leading-tight tracking-tighter sm:text-5xl lg:text-6xl">
            All Your Social Media{" "}
            <span className="bg-gradient-to-r from-violet-500 to-indigo-500 bg-clip-text text-transparent">
              Analytics
            </span>{" "}
            in One Place
          </h1>

          <p className="mx-auto mb-10 max-w-2xl text-lg text-muted-foreground">
            Track performance, schedule posts, and grow your audience across YouTube,
            LinkedIn, Facebook, and Instagram — all from one beautiful dashboard.
          </p>

          <div className="flex items-center justify-center gap-4">
            <Link to={signupTargetPath}>
              <Button size="lg" className="gap-2" id="landing-get-started-btn">
                {ctaText}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Button variant="outline" size="lg" id="landing-learn-more-btn">
              Learn More
            </Button>
          </div>
        </div>
      </header>

      {/* ── Stats Bar ────────────────────────────────────────────────── */}
      <section className="border-y bg-card/50 backdrop-blur-sm">
        <div className="mx-auto grid max-w-4xl grid-cols-2 gap-8 px-6 py-12 sm:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-3xl font-bold bg-gradient-to-r from-violet-500 to-indigo-500 bg-clip-text text-transparent">
                {stat.value}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features Grid ────────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-6 py-24">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight">
            Everything You Need to Grow
          </h2>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            Powerful analytics, seamless cross-posting, and real-time insights for every
            major social platform.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group rounded-xl border bg-card p-6 transition-all duration-300 hover:border-violet-500/50 hover:shadow-lg hover:shadow-violet-500/5"
            >
              <div
                className={`mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br ${feature.color} transition-transform duration-300 group-hover:scale-110`}
              >
                <feature.icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA Section ──────────────────────────────────────────────── */}
      <section className="border-t">
        <div className="mx-auto max-w-4xl px-6 py-24 text-center">
          <div className="mb-4 flex justify-center gap-2">
            <Shield className="h-5 w-5 text-violet-500" />
            <TrendingUp className="h-5 w-5 text-indigo-500" />
          </div>
          <h2 className="mb-4 text-3xl font-bold tracking-tight">
            Ready to Supercharge Your Growth?
          </h2>
          <p className="mx-auto mb-8 max-w-xl text-muted-foreground">
            Join thousands of creators and brands managing their social presence
            through Incubein.
          </p>
          <Link to={signupTargetPath}>
            <Button size="lg" className="gap-2" id="landing-cta-btn">
              {bottomCtaText}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────── */}
      <footer className="border-t px-6 py-8">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Incubein. All rights reserved.
          </p>
          <div className="flex items-center gap-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600">
              <BarChart3 className="h-3.5 w-3.5 text-white" />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
