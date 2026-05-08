import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Code2,
  Grid3x3,
  HelpCircle,
  Home,
  Layers,
  LayoutGrid,
  LogOut,
  Mail,
  MailCheck,
  Menu,
  MessageCircle,
  Monitor,
  Music,
  Package,
  Package2,
  Search,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Star,
  Tv,
  User as UserIcon,
  Wand2,
  X,
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
import symdealsLogo from "@/assets/symdeals-logo.png";

type CategoryFilter = ProductCategory | "All";

const CATEGORY_TABS: {
  key: CategoryFilter;
  label: string;
  Icon: typeof LayoutGrid;
  gradient: string;
}[] = [
  { key: "All", label: "View All", Icon: Grid3x3, gradient: "from-neutral-700 to-neutral-800" },
  { key: "Subscriptions", label: "Subscriptions", Icon: Monitor, gradient: "from-sky-400 to-blue-600" },
  { key: "Combo Pack", label: "Combo Pack", Icon: Layers, gradient: "from-amber-400 to-orange-600" },
  { key: "Adult", label: "Adult", Icon: Star, gradient: "from-pink-500 to-rose-600" },
  { key: "Software", label: "Software", Icon: Code2, gradient: "from-violet-500 to-purple-700" },
  { key: "Music", label: "Music", Icon: Music, gradient: "from-emerald-400 to-teal-600" },
];

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
  const [menuOpen, setMenuOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [otpOpen, setOtpOpen] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>("All");
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

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

  const onLogout = () => {
    setLogoutOpen(true);
  };

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

  const sectionTitle =
    selectedCategory === "All" ? "All Services" : selectedCategory;

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
            <button
              onClick={() => setSearchOpen(true)}
              aria-label="Search services"
              data-tour="search"
              className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-border bg-surface text-foreground transition-colors hover:border-primary/40 hover:bg-surface-elevated hover:text-primary"
            >
              <Search className="h-5 w-5" />
            </button>
            <button
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
              className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-border bg-surface text-foreground transition-colors hover:border-muted-foreground/30 hover:bg-surface-elevated"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-12">
        {!loadingMe && user && user.isVerified === false && !bannerDismissed && (
          <VerifyBanner
            onVerify={() => setOtpOpen(true)}
            onDismiss={() => setBannerDismissed(true)}
          />
        )}

        {/* Welcome */}
        <div className="animate-fade-up">
          <h1 className="font-display text-[1.75rem] font-bold tracking-[-0.02em] text-foreground sm:text-[2rem]">
            {loadingMe ? (
              <span className="text-muted-foreground/40">Loading…</span>
            ) : (
              <>Welcome back, {firstName}</>
            )}
          </h1>
          <p className="mt-1.5 text-[13.5px] text-muted-foreground">
            Browse and access services instantly
          </p>
        </div>

        {/* Category Row — clean marketplace style, centered on desktop, scroll on mobile */}
        <section className="mt-12 animate-fade-up" data-tour="categories">
          <div className="text-center">
            <span className="block text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
              Browse by Category
            </span>
          </div>
          <div
            className="-mx-6 mt-8 flex snap-x snap-mandatory justify-start gap-5 overflow-x-auto overflow-y-visible px-6 pt-2 pb-3 sm:gap-7 md:justify-center [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            role="tablist"
            aria-label="Product categories"
          >
            {CATEGORY_TABS.map(({ key, label, Icon, gradient }) => {
              const active = selectedCategory === key;
              return (
                <CategoryTile
                  key={key}
                  active={active}
                  label={label}
                  Icon={Icon}
                  gradient={gradient}
                  onSelect={() => setSelectedCategory(key)}
                />
              );
            })}
          </div>
        </section>

        {/* Services / Marketplace */}
        <section className="mt-12" data-tour="products">
          <div className="text-center">
            <h2 className="text-[1.35rem] font-semibold tracking-tight text-foreground sm:text-[1.5rem]">
              {sectionTitle}
            </h2>
            {!loadingProducts && filteredProducts.length > 0 && (
              <p className="mt-1.5 text-[12px] text-muted-foreground">
                {filteredProducts.length}{" "}
                {filteredProducts.length === 1 ? "service" : "services"} available
              </p>
            )}
          </div>

          <div className="mt-6">
            {loadingProducts ? (
              <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
                {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
                  <div
                    key={i}
                    className="aspect-[3/4] animate-pulse rounded-2xl border border-border bg-surface"
                  />
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-surface px-6 py-16 text-center">
                <Package className="h-8 w-8 text-muted-foreground/60" />
                <p className="mt-3 text-[14px] font-semibold text-foreground">
                  {selectedCategory === "All"
                    ? "No services available yet"
                    : `No services in ${selectedCategory}`}
                </p>
              </div>
            ) : (
              <div
                key={selectedCategory}
                className="grid animate-fade-up grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4"
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
          </div>
        </section>
      </main>

      <SideMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        user={user}
        onLogout={onLogout}
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
    <div className="mb-8 animate-fade-up">
      <div className="flex flex-col gap-3 rounded-xl border border-primary/30 bg-primary/8 px-4 py-3 sm:flex-row sm:items-center sm:gap-4 sm:py-2.5">
        <div className="flex flex-1 items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/15">
            <MailCheck className="h-4 w-4 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="text-[13.5px] font-semibold text-foreground">
              Verify your email to unlock offers and faster service ⚡
            </p>
            <p className="mt-0.5 hidden text-[12px] text-muted-foreground sm:block">
              Secure your account and get priority order processing.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={onVerify}
            className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-[12.5px] font-bold tracking-tight text-primary-foreground transition-all hover:bg-[var(--primary-hover)] hover:shadow-glow"
          >
            Verify Now
          </button>
          <button
            type="button"
            onClick={onDismiss}
            aria-label="Dismiss"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-surface hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

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

  return (
    <article
      onClick={onOpen}
      className="group flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-glow"
    >
      <div className="aspect-square w-full overflow-hidden rounded-t-2xl bg-background">
        <ProductImage src={product.image} alt={product.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]" iconClass="h-8 w-8 sm:h-10 sm:w-10" />
      </div>
      <div className="flex flex-1 flex-col gap-2 p-3 sm:gap-3 sm:p-4">
        <h3 className="font-display text-[13px] font-semibold tracking-tight text-foreground line-clamp-1 sm:text-[15px]">
          {product.name}
        </h3>

        <div className="flex items-baseline gap-1.5 sm:gap-2">
          <span className="font-display text-[1.05rem] font-bold tracking-tight text-foreground sm:text-[1.4rem]">
            {lowest ? `₹${lowest.price.toLocaleString()}` : "—"}
          </span>
          {showOldPrice && (
            <span className="text-[10.5px] font-medium text-muted-foreground line-through sm:text-[12px]">
              ₹{highest!.price.toLocaleString()}
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onOpen();
          }}
          className="mt-0.5 w-full rounded-full bg-primary px-3 py-2 text-[10.5px] font-bold uppercase tracking-[0.1em] text-primary-foreground transition-all duration-200 hover:bg-[var(--primary-hover)] hover:shadow-glow sm:py-2.5 sm:text-[12px]"
        >
          Buy Now
        </button>
      </div>
    </article>
  );
}

function SideMenu({
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
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  const navItems = [
    { to: "/", label: "Home", Icon: Home },
    { to: "/myprofile", label: "My Profile", Icon: UserIcon },
    { to: "/orders", label: "My Orders", Icon: ShoppingCart },
    { to: "/support", label: "Support", Icon: MessageCircle },
    { to: "/privacy", label: "Privacy Policy", Icon: ShieldCheck },
    { to: "/faq", label: "FAQ", Icon: HelpCircle },
  ] as const;

  return (
    <div
      className={`fixed inset-0 z-[60] ${open ? "pointer-events-auto" : "pointer-events-none"}`}
      aria-hidden={!open}
    >
      <button
        type="button"
        aria-label="Close menu"
        onClick={onClose}
        className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
          open ? "opacity-100" : "opacity-0"
        }`}
      />

      <aside
        role="dialog"
        aria-modal="true"
        className={`absolute right-0 top-0 flex h-full w-[75%] max-w-sm flex-col border-l border-border bg-background shadow-2xl transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-start justify-between border-b border-border px-5 py-5">
          <div className="min-w-0">
            <p className="truncate font-display text-[15px] font-bold tracking-tight text-foreground">
              {user?.name || "Welcome"}
            </p>
            {user?.email && (
              <p className="mt-0.5 flex items-center gap-1.5 truncate text-[12px] text-muted-foreground">
                <Mail className="h-3 w-3 shrink-0" />
                <span className="truncate">{user.email}</span>
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="ml-3 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border text-foreground transition-colors hover:bg-surface"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <ul className="flex flex-col gap-1">
            {navItems.map(({ to, label, Icon }) => (
              <li key={to}>
                <Link
                  to={to}
                  onClick={onClose}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13.5px] font-medium text-foreground transition-colors hover:bg-surface"
                >
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="border-t border-border p-4">
          <button
            type="button"
            onClick={() => {
              onClose();
              onLogout();
            }}
            className="flex w-full items-center justify-center gap-2 rounded-md bg-destructive/10 px-4 py-2.5 text-[13px] font-semibold text-destructive transition-colors hover:bg-destructive/15"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </aside>
    </div>
  );
}

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
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
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

  // Debounce query (250ms) for smooth typing.
  useEffect(() => {
    const t = setTimeout(() => setDebounced(query), 250);
    return () => clearTimeout(t);
  }, [query]);

  const q = debounced.trim().toLowerCase();


  const results = useMemo(() => {
    if (!q) return [] as Product[];

    // Lightweight fuzzy: characters of query appear in order in target.
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
        className={`absolute inset-x-0 top-0 mx-auto flex max-h-screen w-full max-w-2xl flex-col px-4 pt-4 transition-all duration-200 sm:pt-10 ${
          open ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0"
        }`}
      >
        <div className="relative flex items-center gap-2 rounded-2xl border border-border bg-surface px-3 py-2 shadow-2xl ring-1 ring-primary/0 transition-all focus-within:border-primary/60 focus-within:ring-primary/30">
          <Search className="h-5 w-5 shrink-0 text-muted-foreground" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Search services..."
            className="h-10 flex-1 bg-transparent text-[14.5px] font-medium text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => onQueryChange("")}
              aria-label="Clear search"
              className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="inline-flex h-9 items-center justify-center rounded-md border border-border bg-background px-3 text-[12px] font-semibold text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
          >
            Close
          </button>
        </div>

        <div className="mt-3 animate-fade-in overflow-hidden rounded-2xl border border-border/60 bg-surface/80 shadow-2xl backdrop-blur-xl">
          {!q ? (
            <p className="px-4 py-6 text-center text-[13px] text-muted-foreground">
              Start typing to search services…
            </p>
          ) : results.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <p className="text-[14px] font-semibold text-foreground">
                No matching services
              </p>
              <p className="mt-1 text-[12.5px] text-muted-foreground">
                Try a different keyword
              </p>
            </div>
          ) : (
            <SuggestionList items={results} onOpenProduct={onOpenProduct} />
          )}
        </div>
      </div>
    </div>
  );
}

function SuggestionList({
  items,
  onOpenProduct,
}: {
  items: Product[];
  onOpenProduct: (p: Product) => void;
}) {
  return (
    <ul className="max-h-[60vh] divide-y divide-border/40 overflow-y-auto">
      {items.map((p) => {
        const lowest = Array.isArray(p.plans) && p.plans.length
          ? Math.min(...p.plans.map((pl) => pl.price))
          : null;
        return (
          <li key={p.id}>
            <button
              type="button"
              onClick={() => onOpenProduct(p)}
              className="group flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-surface-elevated"
            >
              <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-background ring-1 ring-border/60">
                <ProductImage src={p.image} alt={p.name} className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105" iconClass="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13.5px] font-semibold text-foreground">
                  {p.name}
                </p>
                <p className="truncate text-[11.5px] text-muted-foreground">
                  {p.category}
                  {p.service_id ? ` • #${p.service_id}` : ""}
                </p>
              </div>
              {lowest !== null && (
                <span className="shrink-0 font-display text-[13px] font-bold text-foreground">
                  from ₹{lowest.toLocaleString()}
                </span>
              )}
            </button>
          </li>
        );
      })}
    </ul>
  );
}

type Ripple = { id: number; x: number; y: number };

function CategoryTile({
  active,
  label,
  Icon,
  gradient,
  onSelect,
}: {
  active: boolean;
  label: string;
  Icon: typeof LayoutGrid;
  gradient: string;
  onSelect: () => void;
}) {
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const [phase, setPhase] = useState<"idle" | "press" | "release">("idle");
  const [releaseKey, setReleaseKey] = useState(0);
  const [flashKey, setFlashKey] = useState(0);
  const ripplePosRef = useRef<{ x: number; y: number } | null>(null);

  const handlePointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    const target = e.currentTarget.querySelector<HTMLElement>("[data-tile]");
    if (target) {
      const rect = target.getBoundingClientRect();
      ripplePosRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    }
    setPhase("press");
  };

  const triggerRelease = () => {
    if (phase !== "press") return;
    // Spawn ripple at release moment (synchronized with bloom)
    const pos = ripplePosRef.current;
    if (pos) {
      const id = Date.now() + Math.random();
      setRipples((r) => [...r, { id, x: pos.x, y: pos.y }]);
      setTimeout(() => {
        setRipples((r) => r.filter((rp) => rp.id !== id));
      }, 600);
    }
    setReleaseKey((k) => k + 1);
    setFlashKey((k) => k + 1);
    setPhase("release");
    onSelect();
  };

  const handlePointerUp = () => triggerRelease();
  const handlePointerLeave = () => {
    if (phase === "press") setPhase("idle");
  };

  const tileAnim =
    phase === "press"
      ? "animate-cat-press-down"
      : phase === "release"
        ? "animate-cat-press-release"
        : "";

  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerLeave}
      onPointerCancel={handlePointerLeave}
      className="group flex w-[84px] shrink-0 snap-start flex-col items-center justify-start outline-none focus-visible:ring-2 focus-visible:ring-white/30 focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-[22px]"
    >
      <div className="relative h-[72px] w-[72px]">
        {/* Glow bloom on release */}
        {flashKey > 0 && (
          <span
            key={`flash-${flashKey}`}
            aria-hidden
            className="animate-cat-glow pointer-events-none absolute inset-0 rounded-[20px] bg-white/25 blur-md"
          />
        )}
        <div
          data-tile
          key={`tile-${releaseKey}-${phase}`}
          className={`cat-tile relative flex h-full w-full items-center justify-center overflow-hidden rounded-[20px] bg-gradient-to-br ${gradient} ${tileAnim} ${
            active
              ? "border border-white/40 shadow-[0_0_0_1px_rgba(255,255,255,0.18),0_12px_32px_-10px_rgba(255,255,255,0.32)]"
              : "border border-white/5 shadow-[0_4px_14px_-6px_rgba(0,0,0,0.45)]"
          }`}
        >
          <Icon className="h-7 w-7 text-white/95" strokeWidth={2} />
          {/* Ripples */}
          {ripples.map((r) => (
            <span
              key={r.id}
              aria-hidden
              className="animate-cat-ripple pointer-events-none absolute h-24 w-24 rounded-full bg-white/35"
              style={{ left: r.x, top: r.y }}
            />
          ))}
        </div>
      </div>
      <span
        className={`mt-2.5 block w-full text-center text-[12px] font-medium leading-[1.2] tracking-tight transition-colors duration-200 ${
          active ? "text-foreground" : "text-foreground/55 group-hover:text-foreground/85"
        }`}
      >
        {label}
      </span>
    </button>
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
        <Package className={iconClass ?? "h-8 w-8"} />
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

