import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { CheckCircle2, Inbox, Loader2, ShoppingBag } from "lucide-react";
import {
  type Order,
  type OrderStatus,
  fetchMyOrders,
  getToken,
  resolveImageUrl,
  verifyOrderStatus,
} from "@/lib/api";
import symdealsLogo from "@/assets/symdeals-logo.png";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { ServiceLogo } from "@/components/ServiceLogo";

export const Route = createFileRoute("/orders")({
  component: OrdersPage,
  head: () => ({
    meta: [
      { title: "My Orders — SymDeals" },
      { name: "description", content: "Track your SymDeals orders in real time." },
    ],
  }),
});

const POLL_MS = 5000;
const WHATSAPP_NUMBER = "251708539654";

function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!getToken()) {
      window.location.href = "/login";
      return;
    }
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetchMyOrders();
        if (!cancelled) setOrders(res.orders);
      } catch (err) {
        if (!cancelled)
          setError(err instanceof Error ? err.message : "Failed to load orders");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Polling: every 5s verify any PROCESSING orders
  useEffect(() => {
    const hasPending = orders.some((o) => o.status === "PROCESSING");
    if (!hasPending) {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
      return;
    }
    if (pollRef.current) return;

    const tick = async () => {
      const pending = orders.filter((o) => o.status === "PROCESSING");
      const updates = await Promise.all(
        pending.map(async (o) => {
          try {
            const r = await verifyOrderStatus(o.orderId);
            return { orderId: o.orderId, status: r.status };
          } catch {
            return null;
          }
        })
      );
      const map = new Map<string, OrderStatus>();
      for (const u of updates) if (u) map.set(u.orderId, u.status);
      if (map.size === 0) return;
      setOrders((prev) =>
        prev.map((o) =>
          map.has(o.orderId) ? { ...o, status: map.get(o.orderId)! } : o
        )
      );
    };

    pollRef.current = setInterval(() => void tick(), POLL_MS);
    void tick();

    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
  }, [orders]);

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
            to="/dashboard"
            className="text-[13px] font-medium text-muted-foreground hover:text-foreground"
          >
            Dashboard
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-5 py-10 pb-32 sm:px-6 sm:py-12 lg:pb-12">
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1">
          <ShoppingBag className="h-3 w-3 text-primary" />
          <span className="text-[10.5px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Your Orders
          </span>
        </div>
        <h1 className="mt-5 font-display text-[2rem] font-bold tracking-[-0.02em] text-foreground">
          My Orders
        </h1>
        <p className="mt-2 text-[14px] text-muted-foreground">
          Track and manage all your SymDeals purchases.
        </p>

        <div className="mt-8">
          {loading ? (
            <div className="space-y-3">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="h-28 animate-pulse rounded-2xl border border-border bg-surface"
                />
              ))}
            </div>
          ) : error ? (
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-5 text-sm text-destructive">
              {error}
            </div>
          ) : orders.length === 0 ? (
            <EmptyOrders />
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {orders.map((o) => (
                <OrderCard key={o.id} order={o} />
              ))}
            </div>
          )}
        </div>
      </main>
      <MobileBottomNav />
    </div>
  );
}

function OrderCard({ order }: { order: Order }) {
  const completed = order.status === "COMPLETED";

  return (
    <article
      className={`group relative overflow-hidden rounded-2xl border bg-surface transition-all duration-500 ${
        completed
          ? "border-emerald-400/30 shadow-[0_0_30px_-10px_rgba(16,185,129,0.45)]"
          : "border-border"
      }`}
    >
      <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:gap-5 sm:p-5">
        {/* LEFT: image + name */}
        <div className="flex min-w-0 flex-1 items-center gap-4">
          <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-border bg-background sm:h-16 sm:w-16">
            {order.productImage ? (
              <img
                src={resolveImageUrl(order.productImage)}
                alt={order.productName}
                className="h-full w-full object-cover"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = "none";
                }}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-muted-foreground/40">
                <ShoppingBag className="h-5 w-5" />
              </div>
            )}
          </div>
          <div className="min-w-0">
            <h3 className="truncate font-display text-[14.5px] font-semibold tracking-tight text-foreground sm:text-[15.5px]">
              {order.productName}
            </h3>
            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11.5px] text-muted-foreground">
              <span className="font-mono">{order.orderId}</span>
              <span className="font-semibold text-foreground">
                ₹{order.amount.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT: status */}
        <div className="flex shrink-0 sm:justify-end">
          <StatusPill status={order.status} />
        </div>
      </div>
    </article>
  );
}

function StatusPill({ status }: { status: OrderStatus }) {
  if (status === "COMPLETED") {
    return (
      <div
        key="completed"
        className="inline-flex animate-fade-in items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1.5 text-[11.5px] font-semibold text-emerald-400"
        style={{ animation: "scale-in 0.4s ease-out" }}
      >
        <CheckCircle2 className="h-3.5 w-3.5" />
        Completed
      </div>
    );
  }
  if (status === "FAILED") {
    return (
      <div className="inline-flex items-center gap-1.5 rounded-full border border-destructive/30 bg-destructive/10 px-3 py-1.5 text-[11.5px] font-semibold text-destructive">
        Failed
      </div>
    );
  }
  return (
    <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1.5 text-[11.5px] font-semibold text-amber-400">
      <Loader2 className="h-3.5 w-3.5 animate-spin" />
      Processing
    </div>
  );
}

function EmptyOrders() {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-surface px-6 py-16 text-center">
      <Inbox className="h-8 w-8 text-muted-foreground/60" />
      <p className="mt-3 text-[14px] font-semibold text-foreground">
        No orders yet
      </p>
      <p className="mt-1 text-[12.5px] text-muted-foreground">
        Your purchases will appear here once you make your first order.
      </p>
      <Link
        to="/dashboard"
        className="mt-5 inline-flex items-center rounded-full bg-primary px-5 py-2 text-[12.5px] font-bold uppercase tracking-[0.12em] text-primary-foreground hover:bg-[var(--primary-hover)]"
      >
        Browse Products
      </Link>
    </div>
  );
}
