import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Check,
  LogOut,
  MessageCircle,
  Minus,
  Package,
  Plus,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import symdealsLogo from "@/assets/symdeals-logo.png";
import {
  type Product,
  clearSession,
  fetchProduct,
  getToken,
  resolveImageUrl,
} from "@/lib/api";
import { LogoutConfirmDialog } from "@/components/LogoutConfirmDialog";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { ServiceLogo } from "@/components/ServiceLogo";

export const Route = createFileRoute("/product/$id")({
  component: ProductPage,
  head: () => ({
    meta: [
      { title: "Product — SymDeals" },
      { name: "description", content: "Premium subscription details." },
    ],
  }),
});

function ProductPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMonths, setSelectedMonths] = useState<number | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [logoutOpen, setLogoutOpen] = useState(false);

  useEffect(() => {
    if (!getToken()) {
      navigate({ to: "/login" });
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchProduct(id)
      .then((res) => {
        if (cancelled) return;
        setProduct(res.product);
        const sorted = [...res.product.plans].sort(
          (a, b) => a.months - b.months
        );
        setSelectedMonths(sorted[0]?.months ?? null);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Failed to load product");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id, navigate]);

  const plans = useMemo(
    () =>
      product
        ? [...product.plans].sort((a, b) => a.months - b.months)
        : [],
    [product]
  );
  const selectedPlan =
    plans.find((p) => p.months === selectedMonths) ?? plans[0] ?? null;
  const highest = plans.length > 1 ? plans[plans.length - 1] : null;
  const showOldPrice =
    selectedPlan && highest && highest.price > selectedPlan.price;
  const total = selectedPlan ? selectedPlan.price * quantity : 0;

  const onLogout = () => setLogoutOpen(true);
  const confirmLogout = () => {
    setLogoutOpen(false);
    clearSession();
    navigate({ to: "/login" });
  };

  const handleBuy = () => {
    if (!product || !selectedPlan) return;
    try {
      sessionStorage.setItem(
        "symdeals.checkout",
        JSON.stringify({
          productId: product.id,
          months: selectedPlan.months,
          quantity,
        })
      );
    } catch {
      /* ignore */
    }
    navigate({ to: "/checkout" });
  };

  const handleAddToCart = () => {
    if (!product) return;
    toast("Added to cart", { description: product.name });
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
          <div className="flex items-center gap-2">
            <Link
              to="/dashboard"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-md border border-border bg-surface px-3 py-1.5 text-[12px] font-semibold text-foreground transition-colors hover:border-muted-foreground/30 hover:bg-surface-elevated"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to Dashboard
            </Link>
            <button
              onClick={onLogout}
              className="inline-flex items-center gap-1.5 rounded-md border border-border bg-surface px-3 py-1.5 text-[12px] font-semibold text-foreground transition-colors hover:border-muted-foreground/30 hover:bg-surface-elevated"
            >
              <LogOut className="h-3.5 w-3.5" />
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10 pb-32 lg:pb-10">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-[12px] text-muted-foreground">
          <Link to="/dashboard" className="hover:text-foreground">
            Dashboard
          </Link>
          <span>/</span>
          <span className="text-foreground line-clamp-1">
            {product?.name ?? "Product"}
          </span>
        </nav>

        {loading ? (
          <div className="mt-8 grid gap-8 lg:grid-cols-2">
            <div className="aspect-square animate-pulse rounded-2xl border border-border bg-surface" />
            <div className="space-y-4">
              <div className="h-8 w-2/3 animate-pulse rounded-md bg-surface" />
              <div className="h-12 w-1/3 animate-pulse rounded-md bg-surface" />
              <div className="h-32 animate-pulse rounded-md bg-surface" />
              <div className="h-12 animate-pulse rounded-full bg-surface" />
            </div>
          </div>
        ) : error || !product ? (
          <div className="mt-12 flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-surface px-6 py-16 text-center">
            <Package className="h-10 w-10 text-muted-foreground/60" />
            <p className="mt-4 text-[14px] font-semibold text-foreground">
              {error ?? "Product not found"}
            </p>
            <Link
              to="/dashboard"
              className="mt-6 inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-2.5 text-[12.5px] font-bold uppercase tracking-[0.12em] text-primary-foreground transition-all hover:bg-[var(--primary-hover)] hover:shadow-glow"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to Dashboard
            </Link>
          </div>
        ) : (
          <>
            <div className="mt-8 grid gap-10 lg:grid-cols-2">
              {/* Image */}
              <div className="lg:sticky lg:top-8 lg:self-start">
                <div className="aspect-square w-full overflow-hidden rounded-2xl border border-border bg-surface">
                  {product.image ? (
                    <img
                      src={resolveImageUrl(product.image)}
                      alt={product.name}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).style.display =
                          "none";
                      }}
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-muted-foreground/40">
                      <Package className="h-16 w-16" />
                    </div>
                  )}
                </div>
              </div>

              {/* Details */}
              <div className="flex flex-col gap-6">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1">
                    <Sparkles className="h-3 w-3 text-primary" />
                    <span className="text-[10.5px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                      Premium Subscription
                    </span>
                  </div>
                  <h1 className="mt-4 font-display text-[2rem] font-bold leading-tight tracking-[-0.02em] text-foreground sm:text-[2.5rem]">
                    {product.name}
                  </h1>
                </div>

                {/* Price */}
                <div className="flex items-baseline gap-3">
                  <span className="font-display text-[2.5rem] font-bold tracking-tight text-foreground">
                    {selectedPlan
                      ? `₹${selectedPlan.price.toLocaleString()}`
                      : "—"}
                  </span>
                  {showOldPrice && (
                    <span className="text-[14px] font-medium text-muted-foreground line-through">
                      ₹{highest!.price.toLocaleString()}
                    </span>
                  )}
                  {selectedPlan && (
                    <span className="text-[12.5px] font-medium text-muted-foreground">
                      / {selectedPlan.months} month
                      {selectedPlan.months > 1 ? "s" : ""}
                    </span>
                  )}
                </div>

                {/* Duration */}
                {plans.length > 0 && (
                  <div>
                    <p className="text-[10.5px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                      Choose Duration
                    </p>
                    <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                      {plans.map((p) => {
                        const active = p.months === selectedMonths;
                        return (
                          <button
                            key={p.months}
                            type="button"
                            onClick={() => setSelectedMonths(p.months)}
                            className={
                              "rounded-full border px-4 py-2.5 text-[12.5px] font-semibold transition-all duration-200 " +
                              (active
                                ? "border-primary bg-primary text-primary-foreground shadow-glow"
                                : "border-border bg-surface text-foreground hover:border-primary/40")
                            }
                          >
                            {p.months} {p.months === 1 ? "Month" : "Months"}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Quantity */}
                <div>
                  <p className="text-[10.5px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    Quantity
                  </p>
                  <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-border bg-surface p-1">
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="flex h-9 w-9 items-center justify-center rounded-full text-foreground transition-colors hover:bg-surface-elevated disabled:opacity-40"
                      disabled={quantity <= 1}
                      aria-label="Decrease quantity"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="min-w-[2ch] text-center text-[13.5px] font-bold text-foreground">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.min(99, q + 1))}
                      className="flex h-9 w-9 items-center justify-center rounded-full text-foreground transition-colors hover:bg-surface-elevated"
                      aria-label="Increase quantity"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2.5 sm:flex-row">
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-border bg-surface px-4 py-3.5 text-[12.5px] font-bold uppercase tracking-[0.12em] text-foreground transition-colors hover:border-muted-foreground/30 hover:bg-surface-elevated"
                  >
                    <ShoppingCart className="h-3.5 w-3.5" />
                    Add to Cart
                  </button>
                  <button
                    type="button"
                    onClick={handleBuy}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-primary px-4 py-3.5 text-[12.5px] font-bold uppercase tracking-[0.12em] text-primary-foreground transition-all duration-200 hover:bg-[var(--primary-hover)] hover:shadow-glow"
                  >
                    <Zap className="h-3.5 w-3.5" />
                    Buy Now — ₹{total.toLocaleString()}
                  </button>
                </div>

                {/* Info */}
                <div className="flex items-start gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-500/15">
                    <MessageCircle className="h-4 w-4 text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-[13px] font-semibold text-foreground">
                      Important Note
                    </p>
                    <p className="mt-1 text-[12.5px] leading-relaxed text-muted-foreground">
                      After payment, send your{" "}
                      <span className="font-semibold text-foreground">
                        Order ID
                      </span>{" "}
                      on WhatsApp to receive your credentials quickly within
                      business hours.
                    </p>
                  </div>
                </div>

                {/* Trust badges */}
                <div className="grid grid-cols-3 gap-2 text-center">
                  {[
                    { icon: ShieldCheck, label: "Secure Payment" },
                    { icon: Zap, label: "Instant Delivery" },
                    { icon: Check, label: "Verified Seller" },
                  ].map(({ icon: Icon, label }) => (
                    <div
                      key={label}
                      className="flex flex-col items-center gap-1.5 rounded-lg border border-border bg-surface px-2 py-3"
                    >
                      <Icon className="h-4 w-4 text-primary" />
                      <span className="text-[10.5px] font-semibold text-foreground">
                        {label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Description */}
            <section className="mt-16 rounded-2xl border border-border bg-surface p-6 sm:p-8">
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1">
                <Package className="h-3 w-3 text-primary" />
                <span className="text-[10.5px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Description
                </span>
              </div>
              <h2 className="mt-4 font-display text-[1.5rem] font-bold tracking-[-0.02em] text-foreground">
                About this product
              </h2>
              <p className="mt-3 whitespace-pre-line text-[13.5px] leading-relaxed text-muted-foreground">
                {product.description || "No description provided."}
              </p>

              {plans.length > 0 && (
                <div className="mt-8">
                  <h3 className="font-display text-[1.05rem] font-bold tracking-[-0.01em] text-foreground">
                    Available Plans
                  </h3>
                  <div className="mt-3 overflow-hidden rounded-xl border border-border">
                    <table className="w-full text-left">
                      <thead className="bg-background">
                        <tr>
                          <th className="px-4 py-3 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                            Duration
                          </th>
                          <th className="px-4 py-3 text-right text-[10.5px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                            Price
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {plans.map((p) => (
                          <tr
                            key={p.months}
                            className="border-t border-border text-[13px]"
                          >
                            <td className="px-4 py-3 font-medium text-foreground">
                              {p.months} {p.months === 1 ? "Month" : "Months"}
                            </td>
                            <td className="px-4 py-3 text-right font-semibold text-foreground">
                              ₹{p.price.toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </section>
          </>
        )}
      </main>

      <LogoutConfirmDialog
        open={logoutOpen}
        onCancel={() => setLogoutOpen(false)}
        onConfirm={confirmLogout}
      />
      <MobileBottomNav />
    </div>
  );
}
