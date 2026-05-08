import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { isLoggedIn } from "@/lib/api";
import symdealsLogo from "@/assets/symdeals-logo.png";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll);
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

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 border-b transition-all duration-300 ${
        scrolled
          ? "border-border bg-background/85 backdrop-blur-xl"
          : "border-transparent bg-transparent"
      }`}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link
          to="/"
          aria-label="SymDeals home"
          className="group flex items-center"
        >
          <img
            src={symdealsLogo}
            alt="SymDeals"
            className="h-5 w-auto object-contain transition-all duration-300 ease-out group-hover:scale-[1.03] sm:h-6"
            style={{ filter: "drop-shadow(0 0 6px rgba(0, 255, 170, 0.2))" }}
          />
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          <Link
            to="/features"
            className="text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground"
            activeProps={{ className: "text-[13px] font-medium text-foreground" }}
          >
            Features
          </Link>
          <Link
            to="/how-it-works"
            className="text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground"
            activeProps={{ className: "text-[13px] font-medium text-foreground" }}
          >
            How It Works
          </Link>
          <Link
            to="/support"
            className="text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground"
            activeProps={{ className: "text-[13px] font-medium text-foreground" }}
          >
            Support
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <div
            className={`flex items-center gap-3 transition-opacity duration-300 ${
              authReady ? "opacity-100" : "opacity-0"
            }`}
          >
            {authed ? (
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-[13px] font-semibold tracking-tight text-primary-foreground transition-all hover:bg-[var(--primary-hover)] hover:shadow-glow"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="hidden text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground sm:inline-block"
                >
                  Log In
                </Link>
                <Link
                  to="/signup"
                  className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-[13px] font-semibold tracking-tight text-primary-foreground transition-all hover:bg-[var(--primary-hover)] hover:shadow-glow"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}
