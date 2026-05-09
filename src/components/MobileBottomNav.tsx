import { Link, useRouterState } from "@tanstack/react-router";
import { motion, useMotionValue, animate } from "framer-motion";
import { Headphones, LayoutDashboard, ShoppingBag, Wallet, User } from "lucide-react";
import { useEffect, useLayoutEffect, useMemo, useRef, useState, useCallback } from "react";

const TABS = [
  { to: "/dashboard", label: "Home",    Icon: LayoutDashboard },
  { to: "/orders",    label: "Orders",  Icon: ShoppingBag },
  { to: "/myprofile", label: "Wallet",  Icon: Wallet },
  { to: "/support",   label: "Help",    Icon: Headphones },
  { to: "/myprofile", label: "Account", Icon: User },
] as const;

const SPRING = { type: "spring" as const, stiffness: 380, damping: 32, mass: 0.8 };

/**
 * Persistent mobile bottom navigation — fluid floating dock.
 * Uses real <Link> elements so taps are always reliable; pill morphs
 * between active routes with a spring. No pointer capture, no
 * touch-action overrides — never blocks scroll or click.
 */
export function MobileBottomNav() {
  const path = useRouterState({ select: (r) => r.location.pathname });
  const containerRef = useRef<HTMLDivElement | null>(null);
  const tabRefs = useRef<Array<HTMLAnchorElement | null>>([]);
  const [pressedIdx, setPressedIdx] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);

  const activeIdx = Math.max(0, TABS.findIndex((t) => t.to === path));

  const pillX = useMotionValue(0);
  const pillW = useMotionValue(0);
  const pressTransition = useMemo(() => SPRING, []);

  const measureTo = useCallback((idx: number, immediate: boolean) => {
    const el = tabRefs.current[idx];
    const container = containerRef.current;
    if (!el || !container) return;
    const er = el.getBoundingClientRect();
    const cr = container.getBoundingClientRect();
    const x = er.left - cr.left;
    const w = er.width;
    if (immediate) {
      pillX.set(x);
      pillW.set(w);
    } else {
      const xControls = animate(pillX, x, SPRING);
      const wControls = animate(pillW, w, SPRING);
      return () => {
        xControls.stop();
        wControls.stop();
      };
    }
  }, [pillX, pillW]);

  // Measure once on mount synchronously to avoid pill flash
  useLayoutEffect(() => {
    measureTo(activeIdx, true);
    setMounted(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (mounted) return measureTo(activeIdx, false);
  }, [activeIdx, mounted, measureTo]);

  useEffect(() => {
    const onResize = () => measureTo(activeIdx, true);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [activeIdx, measureTo]);

  return (
    <nav
      className="fixed inset-x-3 z-40 lg:hidden"
      style={{ bottom: "calc(env(safe-area-inset-bottom, 0px) + 12px)" }}
      aria-label="Primary"
    >
      <div
        ref={containerRef}
        className="relative flex items-center justify-around overflow-hidden rounded-[22px] border border-white/[0.08] bg-[rgba(14,16,20,0.72)] px-1.5 py-1.5 shadow-[0_1px_0_0_rgba(255,255,255,0.06)_inset,0_18px_40px_-18px_rgba(0,0,0,0.7)] backdrop-blur-2xl"
      >
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"
        />

        {/* Fluid morphing active pill — non-interactive */}
        <motion.div
          aria-hidden
          style={{ x: pillX, width: pillW }}
          className="pointer-events-none absolute top-1.5 bottom-1.5 left-0 rounded-[16px] border border-emerald-400/15 bg-white/[0.06] shadow-[0_0_0_1px_rgba(255,255,255,0.04)_inset,0_8px_24px_-12px_rgba(52,211,153,0.35)]"
        >
          <span className="absolute inset-0 rounded-[16px] bg-[radial-gradient(60%_80%_at_50%_50%,rgba(52,211,153,0.18),transparent_70%)]" />
        </motion.div>

        {TABS.map((item, idx) => {
          const Icon = item.Icon;
          const active = idx === activeIdx;
          const pressed = pressedIdx === idx;
          return (
            <Link
              key={item.label + idx}
              to={item.to}
              ref={(el) => { tabRefs.current[idx] = el; }}
              aria-label={item.label}
              aria-current={active ? "page" : undefined}
              onClick={(e) => {
                if (active && e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey) {
                  e.preventDefault();
                }
              }}
              onPointerDown={() => setPressedIdx(idx)}
              onPointerUp={() => setPressedIdx(null)}
              onPointerLeave={() => setPressedIdx((p) => (p === idx ? null : p))}
              onPointerCancel={() => setPressedIdx(null)}
              className="relative z-10 flex flex-1 items-center justify-center outline-none"
              style={{ WebkitTapHighlightColor: "transparent" }}
            >
              <motion.span
                animate={{
                  scale: pressed ? 0.94 : active ? 1.04 : 1,
                  y: active ? -1 : 0,
                }}
                transition={pressTransition}
                className="relative flex flex-col items-center gap-0.5 rounded-xl px-2 py-1.5 text-[10px] font-medium tracking-tight"
              >
                <Icon
                  className={`h-[18px] w-[18px] transition-colors duration-300 ${
                    active ? "text-emerald-300" : "text-muted-foreground"
                  }`}
                  style={active ? { filter: "drop-shadow(0 0 6px rgba(52,211,153,0.45))" } : undefined}
                />
                <span className={active ? "text-foreground" : "text-muted-foreground"}>
                  {item.label}
                </span>
              </motion.span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
