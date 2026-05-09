import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Eye, EyeOff, Loader2, Check } from "lucide-react";
import { SwipeButton } from "@/components/SwipeButton";
import { Checkbox } from "@/components/ui/checkbox";
import { OtpVerifyModal } from "@/components/OtpVerifyModal";
import { signup as apiSignup, isLoggedIn, saveSession } from "@/lib/api";
import { InlineErrorBanner } from "@/components/InlineErrorBanner";
import { OnboardingLoader } from "@/components/OnboardingLoader";
import symdealsLogo from "@/assets/symdeals-logo.png";

export const Route = createFileRoute("/signup")({
  component: SignupPage,
  head: () => ({
    meta: [
      { title: "Create your account — SymDeals" },
      {
        name: "description",
        content:
          "Sign up for SymDeals to access premium OTT subscriptions — Netflix, Prime Video, YouTube, Disney+ Hotstar — with instant access and warranty.",
      },
      { property: "og:title", content: "Create your account — SymDeals" },
      {
        property: "og:description",
        content:
          "Premium OTT access with instant delivery and warranty. Create your SymDeals account.",
      },
    ],
  }),
});

type FormState = {
  name: string;
  email: string;
  password: string;
  confirm: string;
};

type FormErrors = Partial<Record<keyof FormState, string>>;

function validate(form: FormState): FormErrors {
  const errors: FormErrors = {};
  if (!form.name.trim()) errors.name = "Required";
  else if (form.name.trim().length < 2) errors.name = "Name is too short";

  if (!form.email.trim()) errors.email = "Required";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
    errors.email = "Enter a valid email address";

  if (!form.password) errors.password = "Required";
  else if (form.password.length < 8)
    errors.password = "Use at least 8 characters";

  if (!form.confirm) errors.confirm = "Required";
  else if (form.confirm !== form.password)
    errors.confirm = "Passwords don't match";

  return errors;
}

function SignupPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    password: "",
    confirm: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<keyof FormState, boolean>>({
    name: false,
    email: false,
    password: false,
    confirm: false,
  });
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [shake, setShake] = useState(0);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [otpOpen, setOtpOpen] = useState(false);
  const [signedUpEmail, setSignedUpEmail] = useState<string>("");
  const [showOnboardingLoader, setShowOnboardingLoader] = useState(false);

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

  const onSwipeConfirm = async () => {
    const v = validate(form);
    setErrors(v);
    setTouched({ name: true, email: true, password: true, confirm: true });
    if (Object.keys(v).length > 0 || !acceptedTerms) {
      setShake((s) => s + 1);
      return;
    }
    setSubmitError(null);
    setSubmitting(true);
    try {
      const res = await apiSignup({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
      });
      saveSession(res);
      setSignedUpEmail(res.user.email);
      setOtpOpen(true);
    } catch (err) {
      setSubmitError(
        err instanceof Error && err.message
          ? err.message
          : "Signup failed. Please try again.",
      );
      setShake((s) => s + 1);
    } finally {
      setSubmitting(false);
    }
  };

  const onGoogle = () => {
    setGoogleLoading(true);
    window.setTimeout(() => {
      setGoogleLoading(false);
      navigate({ to: "/dashboard" });
    }, 1000);
  };

  const isInvalid = Object.keys(validate(form)).length > 0;
  const isReady = !isInvalid && acceptedTerms;

  const benefits = [
    {
      title: "Netflix, Prime, YouTube & more",
      desc: "Access all major OTT platforms in one place",
    },
    {
      title: "Save up to 70%",
      desc: "Premium subscriptions at a fraction of the price",
    },
    {
      title: "Instant delivery after payment",
      desc: "Credentials in your inbox within 10 seconds",
    },
    {
      title: "Secure and reliable access",
      desc: "Encrypted sessions with isolated profiles",
    },
    {
      title: "24/7 support available",
      desc: "Real humans, fast replies, warranty included",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar with logo */}
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
            <h1 className="font-display text-[1.75rem] font-bold tracking-[-0.02em] text-foreground">
              Create your account
            </h1>
            <p className="mt-2 text-[13px] text-muted-foreground">
              Get access to premium OTT subscriptions.
            </p>

            <form
              className="mt-7 space-y-5"
              onSubmit={(e) => {
                e.preventDefault();
                onSwipeConfirm();
              }}
            >
              <Field
                label="Full Name"
                type="text"
                value={form.name}
                onChange={(v) => update("name", v)}
                onBlur={() => blur("name")}
                error={touched.name ? errors.name : undefined}
                autoComplete="name"
              />
              <Field
                label="Email"
                type="email"
                value={form.email}
                onChange={(v) => update("email", v)}
                onBlur={() => blur("email")}
                error={touched.email ? errors.email : undefined}
                autoComplete="email"
              />
              <Field
                label="New Password"
                type={showPwd ? "text" : "password"}
                value={form.password}
                onChange={(v) => update("password", v)}
                onBlur={() => blur("password")}
                error={touched.password ? errors.password : undefined}
                autoComplete="new-password"
                rightAdornment={
                  <button
                    type="button"
                    onClick={() => setShowPwd((s) => !s)}
                    aria-label={showPwd ? "Hide password" : "Show password"}
                    className="text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {showPwd ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                }
              />
              <Field
                label="Confirm Password"
                type={showConfirm ? "text" : "password"}
                value={form.confirm}
                onChange={(v) => update("confirm", v)}
                onBlur={() => blur("confirm")}
                error={touched.confirm ? errors.confirm : undefined}
                autoComplete="new-password"
                rightAdornment={
                  <button
                    type="button"
                    onClick={() => setShowConfirm((s) => !s)}
                    aria-label={
                      showConfirm ? "Hide password" : "Show password"
                    }
                    className="text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {showConfirm ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                }
              />

              {/* Terms checkbox */}
              <div className="flex items-start gap-3 pt-2">
                <Checkbox
                  id="signup-terms"
                  checked={acceptedTerms}
                  onCheckedChange={(checked) => setAcceptedTerms(checked === true)}
                  className="mt-0.5 h-[18px] w-[18px] rounded-[4px] border-border data-[state=checked]:border-primary"
                />
                <p className="select-none text-[12.5px] leading-[1.55] text-muted-foreground">
                  <label htmlFor="signup-terms" className="cursor-pointer">
                    I have read and accept the{" "}
                  </label>
                  <a href="#" className="text-primary hover:underline">
                    User Agreement
                  </a>{" "}
                  and{" "}
                  <a href="#" className="text-primary hover:underline">
                    Privacy Policy
                  </a>
                  .
                </p>
              </div>

              {/* Captcha-style slider — locked until form valid + terms accepted */}
              <div className="pt-2">
                <SwipeButton
                  onConfirm={onSwipeConfirm}
                  shake={shake > 0 && (!isReady || !!submitError)}
                  disabled={!isReady || submitting}
                  resetSignal={submitError ? shake : 0}
                />
                {submitting && (
                  <p className="mt-3 flex items-center justify-center gap-2 text-[12px] text-muted-foreground">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Creating your account…
                  </p>
                )}
                {!submitting && (
                  <div className="mt-3">
                    <InlineErrorBanner
                      message={submitError}
                      onDismiss={() => setSubmitError(null)}
                    />
                  </div>
                )}
              </div>
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

            <div className="mt-8 border-t border-border pt-6 text-center text-[13px] text-muted-foreground">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-semibold text-primary hover:underline"
              >
                Log In
              </Link>
            </div>
          </div>

          {/* RIGHT — benefits */}
          <div className="lg:border-l lg:border-border lg:pl-20">
            <h2 className="font-display text-[18px] font-bold tracking-tight text-foreground">
              Access Premium OTT Subscriptions
            </h2>
            <ul className="mt-8 space-y-6">
              {benefits.map((b, i) => (
                <li
                  key={b.title}
                  className="flex gap-3 animate-fade-up"
                  style={{ animationDelay: `${0.05 + i * 0.05}s` }}
                >
                  <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/15">
                    <Check className="h-3 w-3 text-primary" strokeWidth={3} />
                  </div>
                  <div>
                    <div className="text-[14px] font-semibold text-foreground">
                      {b.title}
                    </div>
                    <div className="mt-0.5 text-[12.5px] leading-[1.55] text-muted-foreground">
                      {b.desc}
                    </div>
                  </div>
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
                * Availability depending on region.
              </p>
            </div>
          </div>
        </div>
      </div>

      <OtpVerifyModal
        open={otpOpen}
        email={signedUpEmail}
        autoSend={false}
        onClose={() => {
          setOtpOpen(false);
          setShowOnboardingLoader(true);
        }}
        onVerified={() => {
          setOtpOpen(false);
          setShowOnboardingLoader(true);
        }}
        onSkip={() => {
          setOtpOpen(false);
          setShowOnboardingLoader(true);
        }}
      />

      <OnboardingLoader
        open={showOnboardingLoader}
        onComplete={() => navigate({ to: "/dashboard" })}
      />
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
  rightAdornment,
}: {
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  onBlur?: () => void;
  error?: string;
  autoComplete?: string;
  rightAdornment?: React.ReactNode;
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
      <div
        className={`relative flex items-center rounded-md border bg-input transition-all duration-150 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 ${
          error ? "border-destructive/60" : "border-border"
        }`}
      >
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          autoComplete={autoComplete}
          className="w-full bg-transparent px-3.5 py-3 text-[14px] font-medium text-foreground placeholder:text-muted-foreground/50 focus:outline-none"
        />
        {rightAdornment && <div className="pr-3">{rightAdornment}</div>}
      </div>
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
