import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, ArrowRight, Loader2, Mail, CheckCircle2 } from "lucide-react";
import { forgotPassword } from "@/lib/api";
import { InlineErrorBanner } from "@/components/InlineErrorBanner";
import symdealsLogo from "@/assets/symdeals-logo.png";

export const Route = createFileRoute("/forgot-password")({
  component: ForgotPasswordPage,
  head: () => ({
    meta: [
      { title: "Forgot password — SymDeals" },
      {
        name: "description",
        content:
          "Reset your SymDeals password. We'll email you a secure link that works on any device.",
      },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
});

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid || submitting) return;
    setError(null);
    setSubmitting(true);
    try {
      await forgotPassword({ email: email.trim() });
      setSent(true);
    } catch (err) {
      setError(
        err instanceof Error && err.message
          ? err.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
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
            to="/login"
            className="inline-flex items-center gap-1.5 text-[12px] font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to login
          </Link>
        </div>
      </header>

      <div className="mx-auto flex max-w-md flex-col px-6 py-16 lg:py-24">
        <div className="animate-fade-up">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1">
            <Mail className="h-3 w-3 text-primary" />
            <span className="text-[10.5px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Password Reset
            </span>
          </div>

          <h1 className="mt-5 font-display text-[1.75rem] font-bold tracking-[-0.02em] text-foreground">
            Reset your password
          </h1>
          <p className="mt-2 text-[13px] text-muted-foreground">
            Enter your email to receive a reset link.
          </p>

          {sent ? (
            <div className="mt-8 rounded-md border border-primary/30 bg-primary/5 p-5">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                <div>
                  <p className="text-[14px] font-semibold text-foreground">
                    Check your inbox
                  </p>
                  <p className="mt-1 text-[12.5px] leading-relaxed text-muted-foreground">
                    If an account exists for{" "}
                    <span className="font-medium text-foreground">
                      {email.trim()}
                    </span>
                    , we've sent a reset link. It expires in 10 minutes.
                  </p>
                  <p className="mt-3 text-[12px] leading-relaxed text-muted-foreground">
                    You can open this link from any device — no need to use the
                    same phone.
                  </p>
                </div>
              </div>
              <div className="mt-5 flex flex-col gap-2 sm:flex-row">
                <button
                  type="button"
                  onClick={() => {
                    setSent(false);
                  }}
                  className="rounded-md border border-border bg-surface px-4 py-2 text-[12.5px] font-semibold text-foreground transition-colors hover:bg-surface-elevated"
                >
                  Resend link
                </button>
                <Link
                  to="/login"
                  className="rounded-md bg-primary px-4 py-2 text-center text-[12.5px] font-semibold text-primary-foreground transition-colors hover:bg-[var(--primary-hover)]"
                >
                  Back to login
                </Link>
              </div>
            </div>
          ) : (
            <form className="mt-7 space-y-5" onSubmit={submit}>
              <div>
                <label className="mb-2 block text-[10.5px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Email
                </label>
                <div className="relative flex items-center rounded-md border border-border bg-input transition-all duration-150 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (error) setError(null);
                    }}
                    autoComplete="email"
                    autoFocus
                    placeholder="you@example.com"
                    className="w-full bg-transparent px-3.5 py-3 text-[14px] font-medium text-foreground placeholder:text-muted-foreground/50 focus:outline-none"
                  />
                </div>
              </div>

              {error && (
                <p className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-[12px] font-medium text-destructive">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={!valid || submitting}
                className="group inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-6 py-3 text-[14px] font-semibold tracking-tight text-primary-foreground transition-all hover:bg-[var(--primary-hover)] hover:shadow-glow disabled:opacity-60"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Sending…
                  </>
                ) : (
                  <>
                    Send Reset Link
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </>
                )}
              </button>

              <p className="text-center text-[11.5px] text-muted-foreground">
                The link works on any device — open it from your phone, tablet,
                or computer.
              </p>
            </form>
          )}

          <div className="mt-8 border-t border-border pt-6 text-center text-[13px] text-muted-foreground">
            Remember your password?{" "}
            <Link to="/login" className="font-semibold text-primary hover:underline">
              Log in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
