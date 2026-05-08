import { Link, useRouterState } from "@tanstack/react-router";
import { motion, LayoutGroup } from "framer-motion";
import { Headphones, LayoutDashboard, ShoppingBag, Wallet, User } from "lucide-react";

const TABS = [
  { to: "/dashboard", label: "Home",    Icon: LayoutDashboard },
  { to: "/orders",    label: "Orders",  Icon: ShoppingBag },
  { to: "/myprofile", label: "Wallet",  Icon: Wallet },
  { to: "/support",   label: "Help",    Icon: Headphones },
  { to: "/myprofile", label: "Account", Icon: User },
] as const;

/**
 * Persistent mobile bottom navigation — shared across authenticated pages.
 * Hidden on lg+. Sits above safe-area inset.
 */
export function MobileBottomNav() {
  const path = useRouterState({ select: (r) => r.location.pathname });

  // first-match active (Wallet & Account both go to /myprofile — pick first)
  const activeIdx = TABS.findIndex((t) => t.to === path);

  return (
    <nav
      className="fixed inset-x-3 z-40 lg:hidden"
      style={{ bottom: "calc(env(safe-area-inset-bottom, 0px) + 12px)" }}
      aria-label="Primary"
    >
      <LayoutGroup id="mobile-bottom-nav">
        <div className="glass-nav relative flex items-center justify-around rounded-2xl border border-border px-1.5 py-1.5 shadow-elevated">
          {TABS.map((item, idx) => {
            const Icon = item.Icon;
            const active = idx === activeIdx;
            return (
              <Link
                key={item.label}
                to={item.to}
                aria-label={item.label}
                aria-current={active ? "page" : undefined}
                className="relative flex flex-1 items-center justify-center"
              >
                <motion.span
                  whileTap={{ scale: 0.9 }}
                  transition={{ type: "spring", stiffness: 480, damping: 24 }}
                  className={`relative z-10 flex flex-col items-center gap-0.5 rounded-xl px-2 py-1.5 text-[10px] font-medium tracking-tight transition-colors ${
                    active ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="mobile-nav-active"
                      className="absolute inset-0 -z-10 rounded-xl bg-surface-elevated"
                      transition={{ type: "spring", stiffness: 420, damping: 32 }}
                    />
                  )}
                  <Icon className={`h-[18px] w-[18px] transition-colors ${active ? "text-primary" : ""}`} />
                  <span>{item.label}</span>
                </motion.span>
              </Link>
            );
          })}
        </div>
      </LayoutGroup>
    </nav>
  );
}
