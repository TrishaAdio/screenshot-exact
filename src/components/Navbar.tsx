import { Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, LayoutDashboard, ShoppingBag, User, LogOut } from "lucide-react";
import { isLoggedIn, clearSession, type AuthUser } from "@/lib/api";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [authReady, setAuthReady] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 6);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const sync = () => setAuthed(isLoggedIn());
    sync();
    setAuthReady(true);
    const onStorage = (e: StorageEvent) => {
      if (!e.key || e.key.startsWith("symdeals.")) sync();
    };
    const onFocus = () => sync();
    window.addEventListener("storage", onStorage);
    window.addEventListener("focus", onFocus);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("focus", onFocus);
    };
  }, []);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const user: AuthUser | null = (() => {
    if (!authed || typeof window === "undefined") return null;
    try {
      const raw = window.localStorage.getItem("symdeals.user");
      return raw ? (JSON.parse(raw) as AuthUser) : null;
    } catch {
      return null;
    }
  })();
  const initials = user?.name
    ? user.name.split(" ").map((p: string) => p[0]).slice(0, 2).join("").toUpperCase()
    : "U";

  return (
    <header
      className={`fixed left-1/2 top-3 z-50 w-[calc(100%-1.5rem)] max-w-6xl -translate-x-1/2 rounded-full transition-all duration-500 ${
        scrolled
          ? "glass-nav border border-border/70 shadow-soft"
          : "border border-transparent"
      }`}
    >
      <nav className="flex items-center justify-between px-5 py-2.5">
        <Link to="/" aria-label="SymDeals home" className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-foreground text-background">
            <span className="font-display text-[13px] font-bold tracking-tight">S</span>
          </span>
          <span className="font-display text-[14px] font-semibold tracking-tight text-foreground">
            SymDeals
          </span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          <NavItem to="/features">Features</NavItem>
          <NavItem to="/how-it-works">How it works</NavItem>
          <NavItem to="/faq">FAQ</NavItem>
          <NavItem to="/support">Support</NavItem>
        </div>

        <div className="flex items-center gap-2">
          <div
            className={`flex items-center gap-2 transition-opacity duration-300 ${
              authReady ? "opacity-100" : "opacity-0"
            }`}
          >
            {authed ? (
              <div ref={menuRef} className="relative">
                <button
                  onClick={() => setMenuOpen((v) => !v)}
                  className="flex items-center gap-2 rounded-full border border-border bg-surface/60 py-1 pl-1 pr-2.5 text-[12px] font-medium text-foreground transition-all hover:border-muted-foreground/40 hover:bg-surface-elevated"
                  aria-haspopup="menu"
                  aria-expanded={menuOpen}
                >
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/15 text-[10px] font-semibold text-primary">
                    {initials}
                  </span>
                  <span className="hidden max-w-[80px] truncate sm:inline">
                    {user?.name || "Account"}
                  </span>
                  <ChevronDown className="h-3 w-3 text-muted-foreground" />
                </button>
                {menuOpen && (
                  <div
                    className="absolute right-0 mt-2 w-56 overflow-hidden rounded-xl border border-border bg-popover shadow-elevated animate-fade-up"
                    style={{ animationDuration: "180ms" }}
                  >
                    <div className="border-b border-border px-3 py-2.5">
                      <div className="truncate text-[13px] font-medium text-foreground">
                        {user?.name || "Member"}
                      </div>
                      <div className="truncate text-[11px] text-muted-foreground">
                        {user?.email}
                      </div>
                    </div>
                    <MenuLink to="/dashboard" icon={LayoutDashboard}>
                      Dashboard
                    </MenuLink>
                    <MenuLink to="/orders" icon={ShoppingBag}>
                      My Orders
                    </MenuLink>
                    <MenuLink to="/myprofile" icon={User}>
                      Profile
                    </MenuLink>
                    <button
                      onClick={() => {
                        clearSession();
                        window.location.href = "/";
                      }}
                      className="flex w-full items-center gap-2.5 border-t border-border px-3 py-2.5 text-left text-[13px] text-muted-foreground transition-colors hover:bg-surface-elevated hover:text-foreground"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      Log out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="hidden rounded-full px-3 py-1.5 text-[12px] font-medium text-muted-foreground transition-colors hover:text-foreground sm:inline-block"
                >
                  Log in
                </Link>
                <Link
                  to="/signup"
                  className="inline-flex items-center gap-1.5 rounded-full bg-foreground px-3.5 py-1.5 text-[12px] font-semibold tracking-tight text-background transition-all hover:bg-foreground/90"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}

function NavItem({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link
      to={to}
      className="rounded-full px-3 py-1.5 text-[12.5px] font-medium text-muted-foreground transition-colors hover:bg-surface/60 hover:text-foreground"
      activeProps={{ className: "rounded-full px-3 py-1.5 text-[12.5px] font-medium bg-surface/80 text-foreground" }}
    >
      {children}
    </Link>
  );
}

function MenuLink({
  to,
  icon: Icon,
  children,
}: {
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <Link
      to={to}
      className="flex items-center gap-2.5 px-3 py-2.5 text-[13px] text-muted-foreground transition-colors hover:bg-surface-elevated hover:text-foreground"
    >
      <Icon className="h-3.5 w-3.5" />
      {children}
    </Link>
  );
}
