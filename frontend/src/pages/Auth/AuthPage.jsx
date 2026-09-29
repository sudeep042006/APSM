// ── Auth Page (Login / Register) ─────────────────────────────────────
// Unified authentication screen with toggle between Login and Register
// modes. Includes social OAuth button placeholders.

import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Lock,
  Mail,
  User as UserIcon,
} from "lucide-react";
import { Youtube, Linkedin, Facebook } from "@/components/icons/BrandIcons";
import { LogoMark, DashboardPreview } from "@/components/Illustrations";

// Helper: check if path is signup (handles trailing slashes)
const isSignupPath = (path) => {
  return path.replace(/\/$/, "") === "/signup";
};

// ── Floating field component ────────────────────────────────────────
// Wraps an input with a leading icon, focus halo and trailing slot.
function Field({ icon: Icon, id, type = "text", trailing, className, ...props }) {
  return (
    <div className="group relative">
      <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors duration-300 group-focus-within:text-primary">
        <Icon className="h-4 w-4" />
      </span>
      <input
        id={id}
        type={type}
        className={`flex h-12 w-full rounded-xl border border-white/[0.07] bg-surface-sunken/80 pl-11 pr-11 text-sm text-foreground shadow-xs outline-none backdrop-blur-sm transition-all duration-300 ease-smooth placeholder:text-muted-foreground/70 hover:border-white/[0.14] focus:border-primary/60 focus:bg-surface-sunken focus:shadow-glow-sm ${className || ""}`}
        {...props}
      />
      {trailing}
    </div>
  );
}

export default function AuthPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register, user, loading: authLoading } = useAuth();

  // ── State management ──────────────────────────────────────────────
  const [isLogin, setIsLogin] = useState(!isSignupPath(location.pathname));
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  // ── Sync login/signup mode with path changes ─────────────────────
  useEffect(() => {
    setIsLogin(!isSignupPath(location.pathname));
  }, [location.pathname]);

  // ── Redirect authenticated users away from auth pages ───────────
  useEffect(() => {
    if (user && !authLoading) {
      navigate("/dashboard/youtube", { replace: true });
    }
  }, [user, authLoading, navigate]);

  // ── Form input handler ────────────────────────────────────────────
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  // ── Form submission handler ───────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (isLogin) {
        await login(form.email, form.password);
      } else {
        await register(form.name, form.email, form.password);
      }
      navigate("/dashboard/youtube");
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  // ── Session verification state ────────────────────────────────────
  if (authLoading) {
    return (
      <div className="aurora-bg flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center">
          <div className="relative h-16 w-16">
            <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
            <div className="absolute inset-0 animate-spin-slow rounded-full border-4 border-transparent border-t-primary" />
            <div className="absolute inset-2 animate-spin rounded-full border-2 border-transparent border-t-cyan-400/70" />
          </div>
          <p className="mt-5 font-medium text-muted-foreground animate-pulse">
            Verifying Session...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="aurora-bg relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-12">
      <div className="noise-overlay" />

      {/* ══ Two-column shell: brand panel + form ═════════════════════ */}
      <div className="relative z-10 grid w-full max-w-5xl overflow-hidden rounded-3xl border border-white/[0.07] bg-surface/50 shadow-2xl backdrop-blur-2xl lg:grid-cols-[1.05fr_1fr]">

        {/* ── Left: Brand showcase panel ─────────────────────────── */}
        <aside className="relative hidden overflow-hidden border-r border-white/[0.07] bg-surface-sunken/60 p-10 lg:flex lg:flex-col">
          {/* Local aurora */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -left-20 -top-20 h-80 w-80 rounded-full bg-[radial-gradient(circle,hsl(var(--brand-violet)/0.28),transparent_65%)] blur-2xl"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-24 -right-16 h-80 w-80 rounded-full bg-[radial-gradient(circle,hsl(var(--brand-blue)/0.22),transparent_65%)] blur-2xl"
          />

          <div className="relative flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[linear-gradient(135deg,hsl(var(--brand-violet)),hsl(var(--brand-indigo))_55%,hsl(var(--brand-blue)))] shadow-glow-sm">
              <LogoMark className="h-6 w-6" />
            </span>
            <span className="font-display text-lg font-bold tracking-tight text-white">
              APSM
            </span>
          </div>

          <div className="relative my-auto py-10">
            <h2 className="mb-4 font-display text-3xl font-bold leading-tight tracking-tight text-white">
              The command center for your{" "}
              <span className="text-gradient">entire social presence</span>.
            </h2>
            <p className="mb-8 max-w-sm leading-relaxed text-muted-foreground">
              Connect YouTube, LinkedIn, Facebook and Instagram once. APSM keeps
              every metric, audience insight and publishing queue in sync.
            </p>

            {/* Product shot */}
            <div className="relative">
              <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-background shadow-xl">
                <DashboardPreview />
              </div>
            </div>
          </div>

          <ul className="relative space-y-2.5">
            {[
              "Unified cross-platform analytics",
              "Scheduled cross-posting queue",
              "AES-256 encrypted credentials",
            ].map((item) => (
              <li
                key={item}
                className="flex items-center gap-2.5 text-sm font-medium text-muted-foreground"
              >
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                {item}
              </li>
            ))}
          </ul>
        </aside>

        {/* ── Right: Auth form ───────────────────────────────────── */}
        <div className="relative p-8 sm:p-12">
          {/* Mobile brand lockup */}
          <div className="mb-8 flex flex-col items-center text-center lg:hidden">
            <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,hsl(var(--brand-violet)),hsl(var(--brand-indigo))_55%,hsl(var(--brand-blue)))] shadow-glow-sm">
              <LogoMark className="h-7 w-7" />
            </span>
            <p className="font-display text-lg font-bold tracking-tight text-white">
              APSM
            </p>
          </div>

          <div className="mb-8">
            <h1 className="mb-2 font-display text-2xl font-bold tracking-tight text-white">
              {isLogin ? "Welcome Back" : "Create Account"}
            </h1>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {isLogin
                ? "Sign in to access your analytics dashboard"
                : "Get started with APSM"}
            </p>
          </div>

          {/* ── Error Alert ───────────────────────────────────────── */}
          {error && (
            <div className="mb-5 flex animate-fade-in items-start gap-3 rounded-xl border border-destructive/35 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* ── Auth Form ──────────────────────────────────────────── */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* ── Name Field (Register only) ──────────────────────── */}
            {!isLogin && (
              <div className="space-y-2">
                <label
                  htmlFor="auth-name"
                  className="text-[13px] font-semibold text-foreground"
                >
                  Full Name
                </label>
                <Field
                  id="auth-name"
                  icon={UserIcon}
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  autoComplete="name"
                  required={!isLogin}
                />
              </div>
            )}

            {/* ── Email Field ──────────────────────────────────────── */}
            <div className="space-y-2">
              <label
                htmlFor="auth-email"
                className="text-[13px] font-semibold text-foreground"
              >
                Email
              </label>
              <Field
                id="auth-email"
                icon={Mail}
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                autoComplete="email"
                required
              />
            </div>

            {/* ── Password Field ───────────────────────────────────── */}
            <div className="space-y-2">
              <label
                htmlFor="auth-password"
                className="text-[13px] font-semibold text-foreground"
              >
                Password
              </label>
              <Field
                id="auth-password"
                icon={Lock}
                type={showPassword ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                autoComplete={isLogin ? "current-password" : "new-password"}
                required
                minLength={8}
                trailing={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-muted-foreground transition-colors duration-300 hover:bg-white/[0.07] hover:text-foreground"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                }
              />
              {!isLogin && (
                <p className="text-[11px] text-muted-foreground/80">
                  Minimum 8 characters.
                </p>
              )}
            </div>

            {/* ── Submit Button ────────────────────────────────────── */}
            <Button
              type="submit"
              size="lg"
              className="mt-2 w-full"
              disabled={loading}
              id="auth-submit-btn"
            >
              {loading ? "Please wait..." : isLogin ? "Sign In" : "Create Account"}
            </Button>
          </form>

          {/* ── Divider ────────────────────────────────────────────── */}
          {/*
          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted-foreground">OR CONTINUE WITH</span>
            <div className="h-px flex-1 bg-border" />
          </div>
          */}

          {/* ── Social OAuth Buttons ────────────────────────────────── */}
          {/*
          <div className="grid grid-cols-3 gap-3">
            <Button variant="outline" className="gap-2" id="auth-google-btn">
              <Youtube className="h-4 w-4 text-red-500" />
            </Button>
            <Button variant="outline" className="gap-2" id="auth-linkedin-btn">
              <Linkedin className="h-4 w-4 text-blue-600" />
            </Button>
            <Button variant="outline" className="gap-2" id="auth-facebook-btn">
              <Facebook className="h-4 w-4 text-blue-500" />
            </Button>
          </div>
          */}

          {/* ── Toggle Login/Register ───────────────────────────────── */}
          <p className="mt-7 text-center text-sm text-muted-foreground">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
            <button
              type="button"
              onClick={() => {
                const nextMode = !isLogin;
                setIsLogin(nextMode);
                setError("");
                navigate(nextMode ? "/login" : "/signup");
              }}
              className="font-semibold text-primary underline-offset-4 transition-colors duration-300 hover:text-primary/80 hover:underline"
              id="auth-toggle-mode"
            >
              {isLogin ? "Sign Up" : "Sign In"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
