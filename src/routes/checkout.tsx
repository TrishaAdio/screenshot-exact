import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Info,
  KeyRound,
  Link2,
  Lock,
  ShoppingBag,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import symdealsLogo from "@/assets/symdeals-logo.png";
import {
  type AuthUser,
  type Product,
  clearSession,
  fetchMe,
  fetchProduct,
  getToken,
} from "@/lib/api";
import { LogoutConfirmDialog } from "@/components/LogoutConfirmDialog";

export const Route = createFileRoute("/checkout")({
  component: CheckoutPage,
  head: () => ({
    meta: [
      { title: "Checkout — SymDeals" },
      {
        name: "description",
        content:
          "Securely complete your SymDeals order. Pay via UPI and receive instant access.",
      },
    ],
  }),
});

type CheckoutState = {
  productId?: string;
  months?: number;
  quantity?: number;
};

function readCheckoutState(): CheckoutState {
  if (typeof window === "undefined") return {};
  try {
    const raw = sessionStorage.getItem("symdeals.checkout");
    if (!raw) return {};
    return JSON.parse(raw) as CheckoutState;
  } catch {
    return {};
  }
}

function CheckoutPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [product, setProduct] = useState<Product | null>(null);
  const [months, setMonths] = useState<number | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [whatsapp, setWhatsapp] = useState("+91");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);

  useEffect(() => {
    if (!getToken()) {
      navigate({ to: "/login" });
      return;
    }
    const state = readCheckoutState();
    if (!state.productId) {
      navigate({ to: "/dashboard" });
      return;
    }
    let cancelled = false;
    setLoading(true);
    Promise.all([fetchMe(), fetchProduct(state.productId)])
      .then(([me, p]) => {
        if (cancelled) return;
        setUser(me.user);
        if (me.user.email) setEmail(me.user.email);
        setProduct(p.product);
        const sorted = [...p.product.plans].sort((a, b) => a.months - b.months);
        const chosen =
          sorted.find((pl) => pl.months === state.months) ?? sorted[0] ?? null;
        setMonths(chosen?.months ?? null);
        setQuantity(Math.max(1, Number(state.quantity) || 1));
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Failed to load checkout");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  const plan = useMemo(
    () => product?.plans.find((p) => p.months === months) ?? null,
    [product, months]
  );
  const subtotal = plan ? plan.price * quantity : 0;
  const total = subtotal;

  const onLogout = () => setLogoutOpen(true);
  const confirmLogout = () => {
    setLogoutOpen(false);
    clearSession();
    navigate({ to: "/login" });
  };

  const validatePhone = (v: string) => /^\+?\d{10,15}$/.test(v.trim());
  const validateEmail = (v: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!product || !plan) return;
    if (!validatePhone(whatsapp)) {
      toast.error("Enter a valid WhatsApp number");
      return;
    }
    if (!validateEmail(email)) {
      toast.error("Enter a valid email address");
      return;
    }
    setSubmitting(true);
    try {
      sessionStorage.setItem(
        "symdeals.checkout",
        JSON.stringify({
          productId: product.id,
          months: plan.months,
          quantity,
          amount: total,
          productName: `${product.name} ${plan.months} month${plan.months > 1 ? "s" : ""}`,
          productImage: product.image,
          whatsapp,
          email,
        })
      );
    } catch {
      /* ignore */
    }
    navigate({ to: "/pay" });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link to="/dashboard" aria-label="SymDeals home" className="group flex items-center">
            <img
              src={symdealsLogo}
              alt="SymDeals"
              className="h-5 w-auto object-contain transition-all duration-300 ease-out group-hover:scale-[1.03] sm:h-6"
              style={{ filter: "drop-shadow(0 0 6px rgba(0, 255, 170, 0.2))" }}
            />
          </Link>
          <div className="flex items-center gap-3">
            {user && (
              <span className="hidden text-xs text-muted-foreground sm:inline">
                {user.email}
              </span>
            )}
            <button
              onClick={onLogout}
              className="rounded-md border border-border px-3 py-1.5 text-xs font-medium text-foreground/80 transition hover:bg-white/5"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 pb-24 pt-8 sm:px-6">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Continue shopping
        </Link>

        <div className="mt-6">
          <h1 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Checkout
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Review your order and complete the secure UPI payment.
          </p>
        </div>

        {loading ? (
          <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_420px]">
            <div className="h-[420px] animate-pulse rounded-2xl border border-border bg-white/[0.02]" />
            <div className="h-[420px] animate-pulse rounded-2xl border border-border bg-white/[0.02]" />
          </div>
        ) : error ? (
          <div className="mt-10 rounded-2xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
            {error}
          </div>
        ) : (
          <form
            onSubmit={handlePlaceOrder}
            className="mt-8 grid gap-8 lg:grid-cols-[1fr_420px]"
          >
            {/* LEFT COLUMN */}
            <div className="order-2 space-y-6 lg:order-1">
              {/* Billing Details */}
              <section className="rounded-2xl border border-border bg-white/[0.02] p-6 sm:p-7">
                <div className="flex items-center gap-2">
                  <h2 className="font-display text-lg font-semibold tracking-tight text-foreground">
                    Billing details
                  </h2>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  We'll send your access link to these contacts.
                </p>

                <div className="mt-6 space-y-5">
                  <div>
                    <label
                      htmlFor="whatsapp"
                      className="label-uppercase text-[11px] text-muted-foreground"
                    >
                      WhatsApp number <span className="text-emerald-400">*</span>
                    </label>
                    <input
                      id="whatsapp"
                      type="tel"
                      required
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value)}
                      placeholder="+91 90000 00000"
                      className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition placeholder:text-muted-foreground/60 focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-400/20"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="email"
                      className="label-uppercase text-[11px] text-muted-foreground"
                    >
                      Email address <span className="text-emerald-400">*</span>
                    </label>
                    <input
                      id="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition placeholder:text-muted-foreground/60 focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-400/20"
                    />
                  </div>
                </div>
              </section>

              {/* How it works */}
              <section className="rounded-2xl border border-border bg-white/[0.02] p-6 sm:p-7">
                <div className="flex items-center gap-2">
                  <Info className="h-4 w-4 text-emerald-400" />
                  <h2 className="label-uppercase text-[11px] text-muted-foreground">
                    How it works
                  </h2>
                </div>

                <div className="mt-5 space-y-3">
                  <Step
                    n={1}
                    icon={<ShoppingBag className="h-4 w-4" />}
                    title="Place order"
                    text="Browse the catalog and complete your secure payment."
                  />
                  <Step
                    n={2}
                    icon={<Link2 className="h-4 w-4" />}
                    title="Get access link"
                    text="After payment, you will receive an access link."
                  />
                  <Step
                    n={3}
                    icon={<KeyRound className="h-4 w-4" />}
                    title="Login credentials"
                    text="Click the link to instantly retrieve your account login details."
                  />
                </div>
              </section>

              {/* Important Notice */}
              <section className="rounded-2xl border border-emerald-400/20 bg-emerald-400/[0.04] p-6 sm:p-7">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-emerald-400/30 bg-emerald-400/10 text-emerald-400">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="label-uppercase text-[11px] text-emerald-400">
                      Important notice
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-foreground/85">
                      After completing your payment, you will receive an access
                      link.{" "}
                      <span className="text-foreground">
                        Click the link to instantly retrieve your account
                        credentials and log in.
                      </span>
                    </p>
                  </div>
                </div>
              </section>
            </div>

            {/* RIGHT COLUMN — sticky on desktop */}
            <aside className="order-1 lg:order-2">
              <div className="lg:sticky lg:top-6 lg:self-start">
                <div className="overflow-hidden rounded-2xl border border-border bg-white/[0.02]">
                  <div className="border-b border-border px-6 pb-4 pt-5">
                    <h2 className="label-uppercase text-[11px] text-muted-foreground">
                      Order summary
                    </h2>
                  </div>

                  <div className="space-y-5 px-6 py-5">
                    {product && plan && (
                      <div className="flex items-center gap-4">
                        <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-border bg-background">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).style.display =
                                "none";
                            }}
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-foreground">
                            {product.name}
                          </p>
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {plan.months} month{plan.months > 1 ? "s" : ""} ·
                            qty {quantity}
                          </p>
                        </div>
                        <span className="text-sm font-medium text-foreground">
                          ₹{(plan.price * quantity).toLocaleString()}
                        </span>
                      </div>
                    )}

                    <div className="h-px bg-border" />

                    <div className="space-y-2">
                      <Row label="Subtotal" value={`₹${subtotal.toLocaleString()}`} />
                      <Row
                        label="Quantity"
                        value={String(quantity)}
                        muted
                      />
                    </div>

                    <div className="h-px bg-border" />

                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-muted-foreground">
                        Total
                      </span>
                      <span className="font-display text-2xl font-bold tracking-tight text-emerald-400">
                        ₹{total.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Payment */}
                  <div className="border-t border-border px-6 py-5">
                    <h3 className="label-uppercase text-[11px] text-muted-foreground">
                      Payment method
                    </h3>
                    <div className="mt-3 flex items-center justify-between rounded-xl border border-border bg-background px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-white/[0.03] text-emerald-400">
                          <CheckCircle2 className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            Pay via UPI
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            Scan & Pay with any UPI app
                          </p>
                        </div>
                      </div>
                      <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-400">
                        Recommended
                      </span>
                    </div>
                  </div>

                  {/* CTA */}
                  <div className="border-t border-border bg-white/[0.015] px-6 py-5">
                    <button
                      type="submit"
                      disabled={submitting || !plan}
                      className="group relative flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 py-3.5 text-sm font-semibold text-emerald-950 shadow-[0_10px_30px_-12px_rgba(16,185,129,0.6)] transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <Lock className="h-4 w-4" />
                      {submitting ? "Placing order…" : "Place order"}
                    </button>
                    <p className="mt-3 text-center text-[11px] text-muted-foreground">
                      Secure checkout · Encrypted end-to-end
                    </p>
                  </div>
                </div>
              </div>
            </aside>
          </form>
        )}
      </main>

      <LogoutConfirmDialog
        open={logoutOpen}
        onCancel={() => setLogoutOpen(false)}
        onConfirm={confirmLogout}
      />
    </div>
  );
}

function Row({
  label,
  value,
  muted,
}: {
  label: string;
  value: string;
  muted?: boolean;
}) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className={muted ? "text-muted-foreground" : "text-foreground"}>
        {value}
      </span>
    </div>
  );
}

function Step({
  n,
  icon,
  title,
  text,
}: {
  n: number;
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-border bg-background/40 p-4">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-white/[0.03] text-emerald-400">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="label-uppercase text-[10px] text-muted-foreground">
          Step {n}
        </p>
        <p className="mt-0.5 text-sm font-semibold text-foreground">{title}</p>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
          {text}
        </p>
      </div>
    </div>
  );
}
