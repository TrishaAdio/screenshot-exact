import { createFileRoute, Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion, LayoutGroup } from "framer-motion";
import {
  Bell,
  Code2,
  Grid3x3,
  Headphones,
  Layers,
  LayoutDashboard,
  LogOut,
  Mail,
  Menu,
  Music,
  Package,
  Search,
  Settings as SettingsIcon,
  ShoppingBag,
  Sparkles,
  TrendingDown,
  Tv,
  Wallet,
  X,
  Zap,
  ArrowUpRight,
  ArrowRight,
} from "lucide-react";
import {
  type AuthUser,
  type Product,
  type ProductCategory,
  clearSession,
  fetchMe,
  fetchProducts,
  getToken,
  resolveImageUrl,
} from "@/lib/api";
import { LogoutConfirmDialog } from "@/components/LogoutConfirmDialog";
import { OtpVerifyModal } from "@/components/OtpVerifyModal";
import { OnboardingTour } from "@/components/OnboardingTour";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type CategoryFilter = ProductCategory | "All";

const CATEGORY_TABS: {
  key: CategoryFilter;
  label: string;
  Icon: typeof Grid3x3;
}[] = [
  { key: "All", label: "All", Icon: Grid3x3 },
  { key: "Subscriptions", label: "OTT", Icon: Tv },
  { key: "Music", label: "Music", Icon: Music },
  { key: "Software", label: "Software", Icon: Code2 },
  { key: "Adult", label: "AI Tools", Icon: Sparkles },
  { key: "Combo Pack", label: "Combo Packs", Icon: Layers },
];

const SIDEBAR_ITEMS = [
  { to: "/dashboard", label: "Dashboard", Icon: LayoutDashboard },
  { to: "/dashboard", label: "Browse", Icon: Grid3x3 },
  { to: "/orders", label: "Orders", Icon: ShoppingBag },
  { to: "/myprofile", label: "Wallet", Icon: Wallet },
  { to: "/support", label: "Support", Icon: Headphones },
  { to: "/myprofile", label: "Settings", Icon: SettingsIcon },
] as const;

export const Route = createFileRoute("/dashboard")({
  component: DashboardPage,
  head: () => ({
    meta: [
      { title: "Dashboard — SymDeals" },
      { name: "description", content: "Your SymDeals dashboard." },
    ],
  }),
});

function DashboardPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingMe, setLoadingMe] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [otpOpen, setOtpOpen] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>("All");
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const openProduct = (p: Product) => {
    const routeId = p.service_id ? String(p.service_id) : p.id;
    navigate({ to: "/product/$id", params: { id: routeId } });
  };

  useEffect(() => {
    if (!getToken()) {
      navigate({ to: "/" });
      return;
    }
    void (async () => {
      try {
        const me = await fetchMe();
        setUser(me.user);
      } catch {
        clearSession();
        navigate({ to: "/" });
        return;
      } finally {
        setLoadingMe(false);
      }
    })();
    void (async () => {
      try {
        const res = await fetchProducts();
        setProducts(res.products);
      } catch {
        /* non-fatal */
      } finally {
        setLoadingProducts(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ⌘K / Ctrl+K to open search
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const confirmLogout = () => {
    setLogoutOpen(false);
    clearSession();
    navigate({ to: "/login" });
  };

  const firstName = (user?.name || "").trim().split(/\s+/)[0] || "there";

  const filteredProducts = useMemo(() => {
    const byCat =
      selectedCategory === "All"
        ? products
        : products.filter((p) => p.category === selectedCategory);
    const q = searchQuery.trim().toLowerCase();
    if (!q) return byCat;
    return byCat.filter((p) => {
      const hay = `${p.name ?? ""} ${p.category ?? ""} ${p.description ?? ""}`.toLowerCase();
      return hay.includes(q);
    });
  }, [products, selectedCategory, searchQuery]);

  const totalSaved = user?.totalSaved ?? 0;

  return (
    <TooltipProvider delayDuration={350} skipDelayDuration={150}>
    <div className="relative min-h-screen bg-background text-foreground">
      {/* Background — matte black + subtle radial + grid */}
      <div className="pointer-events-none fixed inset-0 -z-10 mesh-bg opacity-60" />
      <div className="pointer-events-none fixed inset-0 -z-10 grid-pattern opacity-50" />

      <div className="flex min-h-screen">
        {/* Desktop sidebar */}
        <DesktopSidebar onLogout={() => setLogoutOpen(true)} user={user} />

        <div className="flex min-w-0 flex-1 flex-col">
          {/* Top bar */}
          <header className="sticky top-0 z-40 border-b border-border bg-background/70 backdrop-blur-xl">
            <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-3.5 lg:px-10">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setMobileNavOpen(true)}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-surface/60 text-muted-foreground transition-colors hover:text-foreground lg:hidden"
                  aria-label="Open menu"
                >
                  <Menu className="h-4 w-4" />
                </button>
                <Link to="/" className="flex items-center gap-2 lg:hidden">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-foreground text-background">
                    <span className="font-display text-[12px] font-bold">S</span>
                  </span>
                </Link>
              </div>

              <Tooltip>
                <TooltipTrigger asChild>
                  <motion.button
                    onClick={() => setSearchOpen(true)}
                    data-tour="search"
                    whileHover={{ scale: 1.005 }}
                    whileTap={{ scale: 0.99 }}
                    transition={{ type: "spring", stiffness: 420, damping: 28 }}
                    className="group relative flex h-10 w-full max-w-lg items-center gap-2.5 overflow-hidden rounded-xl border border-border bg-surface/60 px-3.5 text-left text-[13px] text-muted-foreground transition-all duration-300 hover:border-primary/30 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 hover:shadow-[0_0_0_3px_color-mix(in_oklab,var(--primary)_8%,transparent)]"
                  >
                    <Search className="h-4 w-4 transition-colors group-hover:text-primary" />
                    <span className="flex-1 truncate">Search services…</span>
                    <kbd className="hidden rounded-md border border-border bg-background/60 px-1.5 py-0.5 text-[10.5px] font-medium text-muted-foreground transition-colors group-hover:border-primary/30 group-hover:text-foreground sm:inline-block">
                      ⌘K
                    </kbd>
                  </motion.button>
                </TooltipTrigger>
                <TooltipContent side="bottom" sideOffset={8}>Search subscriptions and services</TooltipContent>
              </Tooltip>

              <div className="flex items-center gap-2.5">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      className="hidden h-10 w-10 items-center justify-center rounded-xl border border-border bg-surface/60 text-muted-foreground transition-all hover:text-foreground hover:border-muted-foreground/30 sm:inline-flex"
                      aria-label="Notifications"
                    >
                      <Bell className="h-4 w-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" sideOffset={8}>Notifications</TooltipContent>
                </Tooltip>
                <UserBadge user={user} loading={loadingMe} />
              </div>
            </div>
          </header>

          <main className="mx-auto w-full max-w-7xl flex-1 px-6 pb-28 pt-10 lg:px-10 lg:pb-16">
            {/* Verify email — slim */}
            {!loadingMe && user && user.isVerified === false && !bannerDismissed && (
              <VerifyBanner
                onVerify={() => setOtpOpen(true)}
                onDismiss={() => setBannerDismissed(true)}
              />
            )}

            {/* Welcome + stats */}
            <section className="grid gap-8 lg:grid-cols-12 lg:items-end">
              <div className="lg:col-span-6 animate-fade-up">
                <div className="label-uppercase">Overview</div>
                <h1 className="mt-3 font-display text-[2rem] font-semibold tracking-[-0.025em] text-foreground sm:text-[2.35rem]">
                  {loadingMe ? (
                    <span className="text-muted-foreground/40">Loading…</span>
                  ) : (
                    <>Welcome back, {firstName}</>
                  )}
                </h1>
                <p className="mt-2 text-[14px] text-muted-foreground">
                  Pick up where you left off.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:col-span-6">
                <ActiveOrdersCard loading={loadingMe} />
                <TotalSavedCard loading={loadingMe} amount={totalSaved} />
              </div>
            </section>

            {/* Filter pills */}
            <section className="mt-12 animate-fade-up" data-tour="categories">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-[15px] font-semibold tracking-tight text-foreground">
                  Catalog
                </h2>
                <span className="text-[11.5px] text-muted-foreground">
                  {loadingProducts ? "—" : `${filteredProducts.length} services`}
                </span>
              </div>
              <LayoutGroup id="category-pills">
                <div
                  className="mt-4 -mx-5 flex gap-2 overflow-x-auto px-5 pb-1 lg:mx-0 lg:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                  role="tablist"
                >
                  {CATEGORY_TABS.map(({ key, label, Icon }) => {
                    const active = selectedCategory === key;
                    return (
                      <motion.button
                        key={key}
                        role="tab"
                        aria-selected={active}
                        onClick={() => setSelectedCategory(key)}
                        whileTap={{ scale: 0.94 }}
                        transition={{ type: "spring", stiffness: 400, damping: 26 }}
                        className={`relative inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-[12.5px] font-medium tracking-tight transition-colors ${
                          active
                            ? "border-transparent text-background"
                            : "border-border bg-surface/60 text-muted-foreground hover:border-muted-foreground/30 hover:text-foreground"
                        }`}
                      >
                        {active && (
                          <motion.span
                            layoutId="category-pill-active"
                            className="absolute inset-0 rounded-full bg-foreground"
                            transition={{ type: "spring", stiffness: 380, damping: 30 }}
                          />
                        )}
                        <Icon className="relative h-3.5 w-3.5" />
                        <span className="relative">{label}</span>
                      </motion.button>
                    );
                  })}
                </div>
              </LayoutGroup>
            </section>

            {/* Product grid */}
            <section className="mt-6" data-tour="products">
              {loadingProducts ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {[0, 1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className="h-[148px] animate-pulse rounded-2xl border border-border bg-surface/60"
                    />
                  ))}
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-surface/40 px-6 py-16 text-center">
                  <Package className="h-7 w-7 text-muted-foreground/60" />
                  <p className="mt-3 text-[13.5px] font-medium text-foreground">
                    {selectedCategory === "All"
                      ? "No services available yet"
                      : `No services in ${selectedCategory}`}
                  </p>
                </div>
              ) : (
                <div
                  key={selectedCategory}
                  className="grid animate-fade-up grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
                >
                  {filteredProducts.map((p) => (
                    <ProductCard
                      key={p.id}
                      product={p}
                      onOpen={() => openProduct(p)}
                    />
                  ))}
                </div>
              )}
            </section>

          </main>
        </div>
      </div>

      {/* Mobile bottom nav */}
      <MobileBottomNav />

      {/* Mobile drawer (extras) */}
      <MobileDrawer
        open={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
        onLogout={() => {
          setMobileNavOpen(false);
          setLogoutOpen(true);
        }}
        user={user}
      />

      <LogoutConfirmDialog
        open={logoutOpen}
        onCancel={() => setLogoutOpen(false)}
        onConfirm={confirmLogout}
      />

      <OtpVerifyModal
        open={otpOpen}
        email={user?.email || ""}
        autoSend={true}
        onClose={() => setOtpOpen(false)}
        onVerified={() => {
          setOtpOpen(false);
          setUser((u) => (u ? { ...u, isVerified: true } : u));
        }}
      />

      <SearchOverlay
        open={searchOpen}
        query={searchQuery}
        onQueryChange={setSearchQuery}
        onClose={() => setSearchOpen(false)}
        products={products}
        onOpenProduct={(p) => {
          setSearchOpen(false);
          openProduct(p);
        }}
      />

      <OnboardingTour />
    </div>
    </TooltipProvider>
  );
}

/* ---------- Sidebar ---------- */

function DesktopSidebar({
  user,
  onLogout,
}: {
  user: AuthUser | null;
  onLogout: () => void;
}) {
  const path = useRouterState({ select: (r) => r.location.pathname });
  return (
    <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-border bg-surface/40 backdrop-blur-xl lg:flex">
      <div className="flex h-14 items-center gap-2 border-b border-border px-5">
        <Link to="/" className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-foreground text-background">
            <span className="font-display text-[12.5px] font-bold">S</span>
          </span>
          <span className="font-display text-[14px] font-semibold tracking-tight text-foreground">
            SymDeals
          </span>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <div className="px-2 pb-2 text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground/70">
          Workspace
        </div>
        <LayoutGroup id="sidebar-nav">
          <ul className="space-y-px">
            {SIDEBAR_ITEMS.map((item, idx) => {
              const Icon = item.Icon;
              const firstMatchIdx = SIDEBAR_ITEMS.findIndex((i) => i.to === path);
              const active = idx === firstMatchIdx;
              return (
                <li key={item.label}>
                  <Link
                    to={item.to}
                    className={`group relative flex items-center gap-2.5 rounded-lg px-3 py-1.5 text-[12.5px] font-medium transition-colors duration-200 ${
                      active
                        ? "text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {active && (
                      <motion.span
                        layoutId="sidebar-active"
                        className="absolute inset-0 rounded-lg bg-surface-elevated"
                        transition={{ type: "spring", stiffness: 380, damping: 32 }}
                      />
                    )}
                    <span
                      aria-hidden
                      className={`relative h-3.5 w-px rounded-full transition-colors ${
                        active ? "bg-primary" : "bg-transparent"
                      }`}
                    />
                    <Icon className="relative h-3.5 w-3.5" />
                    <span className="relative">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </LayoutGroup>
      </nav>

      <div className="border-t border-border p-3">
        <div className="flex items-center gap-2.5 rounded-lg border border-border bg-background/60 p-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/15 text-[10.5px] font-semibold text-primary">
            {(user?.name?.[0] || "U").toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-[12px] font-semibold text-foreground">
              {user?.name || "Member"}
            </div>
            <div className="truncate text-[10.5px] text-muted-foreground">
              {user?.email || "—"}
            </div>
          </div>
          <button
            onClick={onLogout}
            aria-label="Sign out"
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-surface hover:text-foreground"
          >
            <LogOut className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}

/* ---------- Mobile bottom nav + drawer ---------- */

const MOBILE_NAV = [
  { to: "/dashboard", label: "Home", Icon: LayoutDashboard },
  { to: "/orders", label: "Orders", Icon: ShoppingBag },
  { to: "/myprofile", label: "Wallet", Icon: Wallet },
  { to: "/support", label: "Help", Icon: Headphones },
] as const;

function MobileBottomNav() {
  const path = useRouterState({ select: (r) => r.location.pathname });
  return (
    <nav className="fixed inset-x-3 bottom-3 z-40 lg:hidden">
      <div className="glass-nav flex items-center justify-around rounded-2xl border border-border px-2 py-1.5 shadow-elevated">
        {MOBILE_NAV.map((item) => {
          const Icon = item.Icon;
          const active = path === item.to;
          return (
            <Link
              key={item.label}
              to={item.to}
              className={`flex flex-1 flex-col items-center gap-0.5 rounded-xl px-2 py-2 text-[10.5px] font-medium transition-colors ${
                active
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className={`h-4 w-4 ${active ? "text-primary" : ""}`} />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

function MobileDrawer({
  open,
  onClose,
  user,
  onLogout,
}: {
  open: boolean;
  onClose: () => void;
  user: AuthUser | null;
  onLogout: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  return (
    <div
      className={`fixed inset-0 z-[60] lg:hidden ${open ? "pointer-events-auto" : "pointer-events-none"}`}
      aria-hidden={!open}
    >
      <button
        type="button"
        aria-label="Close menu"
        onClick={onClose}
        className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity ${
          open ? "opacity-100" : "opacity-0"
        }`}
      />
      <aside
        role="dialog"
        aria-modal="true"
        className={`absolute left-0 top-0 flex h-full w-[80%] max-w-xs flex-col border-r border-border bg-background transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-foreground text-background">
              <span className="font-display text-[12px] font-bold">S</span>
            </span>
            <span className="font-display text-[14px] font-semibold text-foreground">
              SymDeals
            </span>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border text-muted-foreground"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <ul className="space-y-0.5">
            {SIDEBAR_ITEMS.map((item) => (
              <li key={item.label}>
                <Link
                  to={item.to}
                  onClick={onClose}
                  className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-[13px] font-medium text-muted-foreground transition-colors hover:bg-surface hover:text-foreground"
                >
                  <item.Icon className="h-3.5 w-3.5" />
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="border-t border-border p-3">
          <div className="mb-3 flex items-center gap-2.5 rounded-lg border border-border bg-surface/60 p-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/15 text-[10.5px] font-semibold text-primary">
              {(user?.name?.[0] || "U").toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-[12px] font-semibold text-foreground">
                {user?.name || "Member"}
              </div>
              <div className="truncate text-[10.5px] text-muted-foreground">
                {user?.email}
              </div>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-surface/60 px-4 py-2.5 text-[12.5px] font-medium text-muted-foreground transition-colors hover:bg-surface-elevated hover:text-foreground"
          >
            <LogOut className="h-3.5 w-3.5" />
            Sign Out
          </button>
        </div>
      </aside>
    </div>
  );
}

/* ---------- Building blocks ---------- */

function UserBadge({ user, loading }: { user: AuthUser | null; loading: boolean }) {
  if (loading)
    return (
      <div className="h-8 w-8 animate-pulse rounded-full border border-border bg-surface" />
    );
  const initial = (user?.name?.[0] || "U").toUpperCase();
  return (
    <Link
      to="/myprofile"
      className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-surface/60 text-[11.5px] font-semibold text-foreground transition-colors hover:border-muted-foreground/30"
      aria-label="My profile"
    >
      {initial}
    </Link>
  );
}

function ActiveOrdersCard({ loading }: { loading: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="group relative overflow-hidden rounded-2xl border border-border bg-surface/60 p-4 backdrop-blur shadow-card"
    >
      <div className="flex items-center justify-between">
        <span className="text-[10.5px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
          Active Orders
        </span>
        <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-border bg-background/60">
          <ShoppingBag className="h-3.5 w-3.5 text-muted-foreground" />
        </div>
      </div>
      <div className="mt-3 flex items-baseline gap-2">
        <span className="font-display text-[1.6rem] font-semibold tracking-tight text-foreground">
          {loading ? <span className="text-muted-foreground/40">—</span> : "0"}
        </span>
        <Link
          to="/orders"
          className="group/link inline-flex items-center gap-0.5 text-[11px] font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          View all
          <ArrowRight className="h-3 w-3 transition-transform group-hover/link:translate-x-0.5" />
        </Link>
      </div>
    </motion.div>
  );
}

function QuickAccessCard({
  items,
  onSelect,
}: {
  items: { key: CategoryFilter; label: string; Icon: typeof Grid3x3 }[];
  onSelect: (key: CategoryFilter) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
      className="relative overflow-hidden rounded-2xl border border-border bg-surface/60 p-4 backdrop-blur shadow-card sm:col-span-2"
    >
      <div className="flex items-center justify-between">
        <span className="text-[10.5px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
          Quick Access
        </span>
        <Sparkles className="h-3.5 w-3.5 text-muted-foreground" />
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {items.map(({ key, label, Icon }) => (
          <motion.button
            key={key}
            type="button"
            onClick={() => {
              onSelect(key);
              if (typeof window !== "undefined") {
                window.scrollTo({ top: 320, behavior: "smooth" });
              }
            }}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.96 }}
            transition={{ type: "spring", stiffness: 380, damping: 24 }}
            className="group flex flex-col items-start gap-1.5 rounded-xl border border-border bg-background/40 p-2.5 text-left transition-colors hover:border-muted-foreground/30 hover:bg-background/70"
          >
            <Icon className="h-3.5 w-3.5 text-muted-foreground transition-colors group-hover:text-foreground" />
            <span className="text-[11.5px] font-medium tracking-tight text-foreground/85 group-hover:text-foreground">
              {label}
            </span>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}

function VerifyBanner({
  onVerify,
  onDismiss,
}: {
  onVerify: () => void;
  onDismiss: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="mb-6"
    >
      <div className="relative flex items-center gap-2.5 overflow-hidden rounded-lg border border-primary/15 bg-primary/[0.04] py-1.5 pl-3 pr-1.5">
        <span aria-hidden className="flex h-5 w-5 items-center justify-center rounded-md bg-primary/10">
          <Mail className="h-3 w-3 text-primary" />
        </span>
        <p className="flex-1 text-[12px] font-medium text-foreground/90">
          Verify your email to unlock offers and faster service.
        </p>
        <motion.button
          type="button"
          onClick={onVerify}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 400, damping: 22 }}
          className="inline-flex h-6 items-center justify-center rounded-md bg-primary/90 px-2.5 text-[10.5px] font-semibold tracking-tight text-primary-foreground shadow-sm transition-colors hover:bg-primary"
        >
          Verify
        </motion.button>
        <motion.button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss"
          whileTap={{ scale: 0.9 }}
          className="inline-flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-surface hover:text-foreground"
        >
          <X className="h-3 w-3" />
        </motion.button>
      </div>
    </motion.div>
  );
}

/* ---------- Product card ---------- */

function ProductCard({
  product,
  onOpen,
}: {
  product: Product;
  onOpen: () => void;
}) {
  const plans = product.plans.length
    ? [...product.plans].sort((a, b) => a.price - b.price)
    : [];
  const lowest = plans[0] ?? null;
  const highest = plans.length > 1 ? plans[plans.length - 1] : null;
  const showOldPrice = highest && highest.price > (lowest?.price ?? 0);

  const cardRef = useRef<HTMLElement>(null);
  const handleMove = (e: React.MouseEvent<HTMLElement>) => {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - rect.left}px`);
    el.style.setProperty("--my", `${e.clientY - rect.top}px`);
  };

  return (
    <motion.article
      ref={cardRef}
      onClick={onOpen}
      onMouseMove={handleMove}
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.985 }}
      transition={{ type: "spring", stiffness: 320, damping: 26 }}
      className="group relative cursor-pointer overflow-hidden rounded-2xl border border-border bg-surface/60 p-4 backdrop-blur transition-colors duration-300 hover:border-muted-foreground/30 hover:bg-surface-elevated/80 hover:shadow-elevated"
    >
      {/* cursor glow */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background:
            "radial-gradient(220px circle at var(--mx, 50%) var(--my, 50%), color-mix(in oklab, var(--primary) 14%, transparent), transparent 60%)",
        }}
      />

      <div className="relative flex items-start gap-3.5">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border bg-background/70 transition-transform duration-300 group-hover:scale-[1.04]">
          <ProductImage
            src={product.image}
            alt={product.name}
            className="h-full w-full object-cover"
            iconClass="h-5 w-5"
          />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="truncate font-display text-[14px] font-semibold tracking-tight text-foreground">
              {product.name}
            </h3>
            <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-foreground" />
          </div>
          <div className="mt-0.5 truncate text-[11.5px] text-muted-foreground">
            {product.category || "Service"}
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            <span className="inline-flex items-center gap-1 rounded-full border border-border bg-background/60 px-2 py-0.5 text-[10.5px] font-medium text-muted-foreground">
              <Zap className="h-2.5 w-2.5 text-primary" />
              Instant
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border border-border bg-background/60 px-2 py-0.5 text-[10.5px] font-medium text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              In stock
            </span>
          </div>
        </div>
      </div>

      <div className="relative mt-4 flex items-end justify-between border-t border-border pt-3">
        <div>
          <div className="text-[10.5px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
            From
          </div>
          <div className="mt-0.5 flex items-baseline gap-1.5">
            <span className="font-display text-[18px] font-semibold tracking-tight text-foreground">
              {lowest ? `₹${lowest.price.toLocaleString()}` : "—"}
            </span>
            {showOldPrice && (
              <span className="text-[11px] font-medium text-muted-foreground line-through">
                ₹{highest!.price.toLocaleString()}
              </span>
            )}
          </div>
        </div>
        <motion.button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onOpen();
          }}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.92 }}
          transition={{ type: "spring", stiffness: 420, damping: 22 }}
          className="inline-flex h-8 items-center justify-center rounded-full bg-foreground px-4 text-[11.5px] font-semibold tracking-tight text-background shadow-sm transition-shadow hover:shadow-md"
        >
          Purchase
        </motion.button>
      </div>
    </motion.article>
  );
}

/* ---------- Search overlay (preserved) ---------- */

function SearchOverlay({
  open,
  query,
  onQueryChange,
  onClose,
  products,
  onOpenProduct,
}: {
  open: boolean;
  query: string;
  onQueryChange: (v: string) => void;
  onClose: () => void;
  products: Product[];
  onOpenProduct: (p: Product) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [debounced, setDebounced] = useState(query);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const t = setTimeout(() => inputRef.current?.focus(), 50);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
      clearTimeout(t);
    };
  }, [open, onClose]);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(query), 200);
    return () => clearTimeout(t);
  }, [query]);

  const q = debounced.trim().toLowerCase();

  const results = useMemo(() => {
    if (!q) return [] as Product[];
    const fuzzyHit = (target: string, needle: string) => {
      let i = 0;
      for (const ch of target) {
        if (ch === needle[i]) i++;
        if (i === needle.length) return true;
      }
      return false;
    };
    const scored: { p: Product; score: number }[] = [];
    for (const p of products) {
      const name = (p.name ?? "").toLowerCase();
      const cat = (p.category ?? "").toLowerCase();
      const desc = (p.description ?? "").toLowerCase();
      const sid = p.service_id ? String(p.service_id) : "";
      let score = 0;
      if (sid && sid === q) score = 100;
      else if (sid && sid.startsWith(q)) score = 90;
      else if (name && name === q) score = 85;
      else if (name && name.startsWith(q)) score = 75;
      else if (name && name.includes(q)) score = 60;
      else if (cat && cat.includes(q)) score = 40;
      else if (desc && desc.includes(q)) score = 25;
      else if (q.length >= 3 && name && fuzzyHit(name, q)) score = 15;
      if (score > 0) scored.push({ p, score });
    }
    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, 6).map((s) => s.p);
  }, [products, q]);

  return (
    <div
      className={`fixed inset-0 z-[70] ${open ? "pointer-events-auto" : "pointer-events-none"}`}
      aria-hidden={!open}
    >
      <button
        type="button"
        aria-label="Close search"
        onClick={onClose}
        className={`absolute inset-0 bg-black/70 backdrop-blur-md transition-opacity duration-200 ${
          open ? "opacity-100" : "opacity-0"
        }`}
      />
      <div
        className={`absolute inset-x-0 top-0 mx-auto flex max-h-screen w-full max-w-2xl flex-col px-4 pt-6 transition-all duration-200 sm:pt-16 ${
          open ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0"
        }`}
      >
        <div className="flex items-center gap-2 rounded-2xl border border-border bg-surface px-3 py-2 shadow-elevated">
          <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Search services…"
            className="h-9 flex-1 bg-transparent text-[14px] font-medium text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => onQueryChange("")}
              aria-label="Clear search"
              className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-7 items-center justify-center rounded-md border border-border bg-background/60 px-2.5 text-[11px] font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            ESC
          </button>
        </div>

        {q && (
          <div className="mt-3 overflow-hidden rounded-2xl border border-border bg-surface/90 shadow-elevated backdrop-blur-xl animate-fade-up">
            {results.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <p className="text-[13.5px] font-medium text-foreground">
                  No matching services
                </p>
                <p className="mt-1 text-[12px] text-muted-foreground">
                  Try a different keyword
                </p>
              </div>
            ) : (
              <ul className="max-h-[60vh] divide-y divide-border/40 overflow-y-auto">
                {results.map((p) => {
                  const lowest =
                    Array.isArray(p.plans) && p.plans.length
                      ? Math.min(...p.plans.map((pl) => pl.price))
                      : null;
                  return (
                    <li key={p.id}>
                      <button
                        type="button"
                        onClick={() => onOpenProduct(p)}
                        className="group flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-surface-elevated"
                      >
                        <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-border bg-background/60">
                          <ProductImage
                            src={p.image}
                            alt={p.name}
                            className="h-full w-full object-cover"
                            iconClass="h-4 w-4"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[13px] font-semibold text-foreground">
                            {p.name}
                          </p>
                          <p className="truncate text-[11px] text-muted-foreground">
                            {p.category}
                          </p>
                        </div>
                        {lowest !== null && (
                          <span className="shrink-0 font-display text-[12.5px] font-semibold text-foreground">
                            ₹{lowest.toLocaleString()}
                          </span>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function ProductImage({
  src,
  alt,
  className,
  iconClass,
}: {
  src?: string;
  alt: string;
  className?: string;
  iconClass?: string;
}) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    return (
      <div className="flex h-full w-full items-center justify-center text-muted-foreground/40">
        <Package className={iconClass ?? "h-5 w-5"} />
      </div>
    );
  }
  return (
    <img
      src={resolveImageUrl(src)}
      alt={alt}
      loading="lazy"
      className={className}
      onError={() => setFailed(true)}
    />
  );
}
