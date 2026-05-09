import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Eye, EyeOff, Loader2, Check, ShieldCheck, Lock, ArrowRight } from "lucide-react";
import { login as apiLogin, isLoggedIn, saveSession } from "@/lib/api";
import { InlineErrorBanner } from "@/components/InlineErrorBanner";
import symdealsLogo from "@/assets/symdeals-logo.png";

export const Route = createFileRoute("/login")({
  component: LoginPage,
  head: () => ({
    meta: [
      { title: "Log in — SymDeals" },
      {
        name: "description",
        content:
          "Log in to SymDeals to access your premium OTT subscriptions — Netflix, Prime Video, YouTube, Disney+ Hotstar — instantly and securely.",
      },
      { property: "og:title", content: "Log in — SymDeals" },
      {
        property: "og:description",
        content:
          "Secure login to your SymDeals account. Premium OTT access with instant delivery and warranty.",
      },
    ],
  }),
});

type FormState = { email: string; password: string };
type FormErrors = Partial<Record<keyof FormState, string>>;

function validate(form: FormState): FormErrors {
  const errors: FormErrors = {};
  if (!form.email.trim()) errors.email = "Required";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
    errors.email = "Enter a valid email address";
  if (!form.password) errors.password = "Required";
  return errors;
}

function LoginPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState<FormState>({ email: "", password: "" });
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<keyof FormState, boolean>>({
    email: false,
    password: false,
  });
  const [showPwd, setShowPwd] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (isLoggedIn()) {
      navigate({ to: "/dashboard" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const update = (key: keyof FormState, value: string) => {
    const next = { ...form, [key]: value };
    setForm(next);
    if (touched[key]) setErrors(validate(next));
    if (submitError) setSubmitError(null);
  };

  const blur = (key: keyof FormState) => {
    setTouched((t) => ({ ...t, [key]: true }));
    setErrors(validate(form));
  };

  const submitLogin = async () => {
    const v = validate(form);
    setErrors(v);
    setTouched({ email: true, password: true });
    if (Object.keys(v).length > 0) return;
    setSubmitError(null);
    setSubmitting(true);
    try {
      const res = await apiLogin({
        email: form.email.trim(),
        password: form.password,
      });
      saveSession(res);
      navigate({ to: "/dashboard" });
    } catch (err) {
      setSubmitError(
        err instanceof Error && err.message
          ? err.message
          : "Login failed. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void submitLogin();
  };

  const onGoogle = () => {
    setGoogleLoading(true);
    window.setTimeout(() => {
      setGoogleLoading(false);
      navigate({ to: "/dashboard" });
    }, 1000);
  };

  const benefits = [
    "Netflix, Prime Video, YouTube & more",
    "Save up to 70% on subscriptions",
    "Instant delivery after payment",
    "Secure access and warranty included",
    "24/7 support available",
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link to="/" aria-label="SymDeals home" className="group flex items-center">
            <img
              src={symdealsLogo}
              alt="SymDeals"
              className="h-5 w-auto object-contain transition-all duration-300 ease-out group-hover:scale-[1.03] sm:h-6"
              style={{ filter: "drop-shadow(0 0 6px rgba(0, 255, 170, 0.2))" }}
            />
          </Link>
          <Link
            to="/"
            className="text-[12px] font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            ← Back
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-14 lg:py-20">
        <div className="grid gap-16 lg:grid-cols-2 lg:gap-20">
          {/* LEFT — form */}
          <div className="animate-fade-up">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-70" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
              </span>
              <span className="text-[10.5px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Secure Login
              </span>
            </div>

            <h1 className="mt-5 font-display text-[1.75rem] font-bold tracking-[-0.02em] text-foreground">
              Welcome Back
            </h1>
            <p className="mt-2 text-[13px] text-muted-foreground">
              Access your subscriptions instantly.
            </p>

            <form className="mt-7 space-y-5" onSubmit={onSubmit}>
              <Field
                label="Email"
                type="email"
                value={form.email}
                onChange={(v) => update("email", v)}
                onBlur={() => blur("email")}
                error={touched.email ? errors.email : undefined}
                autoComplete="email"
                autoFocus
              />

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-[10.5px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    Password
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-[10.5px] font-semibold uppercase tracking-[0.12em] text-primary transition-colors hover:text-[var(--primary-hover)]"
                  >
                    Forgot?
                  </Link>
                </div>
                <FieldShell error={touched.password ? errors.password : undefined}>
                  <input
                    type={showPwd ? "text" : "password"}
                    value={form.password}
                    onChange={(e) => update("password", e.target.value)}
                    onBlur={() => blur("password")}
                    autoComplete="current-password"
                    className="w-full bg-transparent px-3.5 py-3 text-[14px] font-medium text-foreground placeholder:text-muted-foreground/50 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd((s) => !s)}
                    aria-label={showPwd ? "Hide password" : "Show password"}
                    className="pr-3 text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {showPwd ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </FieldShell>
                {touched.password && errors.password && (
                  <p className="mt-1.5 text-[11px] font-medium text-destructive">
                    {errors.password}
                  </p>
                )}
              </div>

              <InlineErrorBanner
                message={submitError}
                onDismiss={() => setSubmitError(null)}
              />

              <button
                type="submit"
                disabled={submitting}
                onClick={(e) => {
                  // Defensive fallback in case the form submit event is swallowed
                  // by a parent handler or hydration mismatch.
                  e.preventDefault();
                  if (!submitting) void submitLogin();
                }}
                className="group inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-6 py-3 text-[14px] font-semibold tracking-tight text-primary-foreground transition-all hover:bg-[var(--primary-hover)] hover:shadow-glow disabled:opacity-70"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Signing in…
                  </>
                ) : (
                  <>
                    Log In
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="my-7 flex items-center gap-3">
              <div className="h-px flex-1 bg-border" />
              <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                or
              </span>
              <div className="h-px flex-1 bg-border" />
            </div>

            {/* Google */}
            <button
              type="button"
              onClick={onGoogle}
              disabled={googleLoading}
              className="flex w-full items-center justify-center gap-2.5 rounded-md border border-border bg-surface px-4 py-3 text-[13px] font-semibold tracking-tight text-foreground transition-all hover:border-muted-foreground/30 hover:bg-surface-elevated disabled:opacity-70"
            >
              {googleLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <GoogleIcon className="h-4 w-4" />
              )}
              {googleLoading ? "Connecting…" : "Continue with Google"}
            </button>

            {/* Trust footer */}
            <div className="mt-6 flex items-center justify-center gap-2 text-[11.5px] text-muted-foreground">
              <Lock className="h-3 w-3 text-primary" />
              <span>Secure login · Your data is protected</span>
            </div>

            <div className="mt-6 border-t border-border pt-6 text-center text-[13px] text-muted-foreground">
              Don't have an account?{" "}
              <Link
                to="/signup"
                className="font-semibold text-primary hover:underline"
              >
                Sign Up
              </Link>
            </div>
          </div>

          {/* RIGHT — value panel */}
          <div className="lg:border-l lg:border-border lg:pl-20">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1">
              <ShieldCheck className="h-3 w-3 text-primary" />
              <span className="text-[10.5px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Trusted Platform
              </span>
            </div>

            <h2 className="mt-5 font-display text-[1.5rem] font-bold tracking-[-0.02em] text-foreground">
              Access Premium OTT Subscriptions
            </h2>
            <p className="mt-2 text-[13px] text-muted-foreground">
              Everything you need, in one secure account.
            </p>

            <ul className="mt-8 space-y-4">
              {benefits.map((b, i) => (
                <li
                  key={b}
                  className="flex items-center gap-3 animate-fade-up"
                  style={{ animationDelay: `${0.05 + i * 0.05}s` }}
                >
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/15">
                    <Check className="h-3 w-3 text-primary" strokeWidth={3} />
                  </div>
                  <span className="text-[13.5px] font-medium text-foreground">
                    {b}
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-10 rounded-md border border-border bg-surface p-4">
              <div className="label-uppercase">Live Status</div>
              <div className="mt-2 flex items-center gap-2">
                <span className="flex h-1.5 w-1.5 animate-pulse-soft rounded-full bg-primary" />
                <span className="text-[13px] font-medium text-foreground">
                  All services operational
                </span>
              </div>
              <p className="mt-2 text-[11.5px] text-muted-foreground">
                Fast access · No delays · Reliable service
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  type,
  value,
  onChange,
  onBlur,
  error,
  autoComplete,
  autoFocus,
}: {
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  onBlur?: () => void;
  error?: string;
  autoComplete?: string;
  autoFocus?: boolean;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <label className="text-[10.5px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          {label}
        </label>
        {error && (
          <span className="text-[10.5px] font-semibold uppercase tracking-[0.12em] text-destructive">
            {error}
          </span>
        )}
      </div>
      <FieldShell error={error}>
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          autoComplete={autoComplete}
          autoFocus={autoFocus}
          className="w-full bg-transparent px-3.5 py-3 text-[14px] font-medium text-foreground placeholder:text-muted-foreground/50 focus:outline-none"
        />
      </FieldShell>
    </div>
  );
}

function FieldShell({
  children,
  error,
}: {
  children: React.ReactNode;
  error?: string;
}) {
  return (
    <div
      className={`relative flex items-center rounded-md border bg-input transition-all duration-150 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 ${
        error ? "border-destructive/60" : "border-border"
      }`}
    >
      {children}
    </div>
  );
}

function GoogleIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.49 12.27c0-.79-.07-1.54-.2-2.27H12v4.51h6.45c-.28 1.45-1.12 2.68-2.39 3.5v2.91h3.86c2.26-2.08 3.57-5.16 3.57-8.65z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.96-1.07 7.94-2.91l-3.86-2.91c-1.07.72-2.45 1.16-4.08 1.16-3.13 0-5.78-2.11-6.73-4.96H1.28v3.11C3.25 21.3 7.31 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.38c-.24-.72-.38-1.49-.38-2.28s.14-1.56.38-2.28V6.71H1.28A11.99 11.99 0 0 0 0 12.1c0 1.94.46 3.78 1.28 5.39l3.99-3.11z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.25 2.7 1.28 6.71l3.99 3.11C6.22 6.86 8.87 4.75 12 4.75z"
      />
    </svg>
  );
}
