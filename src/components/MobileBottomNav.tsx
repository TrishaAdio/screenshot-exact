import { useNavigate, useRouterState } from "@tanstack/react-router";
import { motion, LayoutGroup, useMotionValue, useTransform, animate } from "framer-motion";
import { Headphones, LayoutDashboard, ShoppingBag, Wallet, User } from "lucide-react";
import { useEffect, useRef, useState, useCallback } from "react";

const TABS = [
  { to: "/dashboard", label: "Home",    Icon: LayoutDashboard },
  { to: "/orders",    label: "Orders",  Icon: ShoppingBag },
  { to: "/myprofile", label: "Wallet",  Icon: Wallet },
  { to: "/support",   label: "Help",    Icon: Headphones },
  { to: "/myprofile", label: "Account", Icon: User },
] as const;

const SPRING = { type: "spring" as const, stiffness: 380, damping: 32, mass: 0.8 };

/**
 * Persistent mobile bottom navigation — Apple-style fluid floating dock.
 * Supports tap, hold-and-swipe selection, fluid pill morph, spring physics.
 */
export function MobileBottomNav() {
  const path = useRouterState({ select: (r) => r.location.pathname });
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const [pressed, setPressed] = useState(false);
  const draggingRef = useRef(false);

  const routeIdx = TABS.findIndex((t) => t.to === path);
  const activeIdx = hoverIdx ?? (routeIdx >= 0 ? routeIdx : 0);

  // Pill geometry as motion values for fluid morph
  const pillX = useMotionValue(0);
  const pillW = useMotionValue(0);

  const measureTo = useCallback((idx: number, immediate = false) => {
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
      animate(pillX, x, SPRING);
      animate(pillW, w, SPRING);
    }
  }, [pillX, pillW]);

  // Initial + on resize + on active change
  useEffect(() => {
    measureTo(activeIdx, pillW.get() === 0);
    const onResize = () => measureTo(activeIdx, true);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [activeIdx, measureTo, pillW]);

  // Touch hold-and-swipe handling
  const findIdxFromX = (clientX: number) => {
    for (let i = 0; i < tabRefs.current.length; i++) {
      const el = tabRefs.current[i];
      if (!el) continue;
      const r = el.getBoundingClientRect();
      if (clientX >= r.left && clientX <= r.right) return i;
    }
    return null;
  };

  const onPointerDown = (e: React.PointerEvent, idx: number) => {
    setPressed(true);
    draggingRef.current = false;
    setHoverIdx(idx);
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!pressed) return;
    const idx = findIdxFromX(e.clientX);
    if (idx !== null && idx !== hoverIdx) {
      draggingRef.current = true;
      setHoverIdx(idx);
    }
  };

  const onPointerUp = (e: React.PointerEvent) => {
    if (!pressed) return;
    setPressed(false);
    const idx = findIdxFromX(e.clientX) ?? hoverIdx ?? 0;
    setHoverIdx(null);
    const target = TABS[idx];
    if (target && target.to !== path) navigate({ to: target.to });
  };

  const onPointerCancel = () => {
    setPressed(false);
    setHoverIdx(null);
  };

  return (
    <nav
      className="fixed inset-x-3 z-40 lg:hidden"
      style={{ bottom: "calc(env(safe-area-inset-bottom, 0px) + 12px)" }}
      aria-label="Primary"
    >
      <LayoutGroup id="mobile-bottom-nav">
        <motion.div
          ref={containerRef}
          animate={{ scale: pressed ? 0.985 : 1 }}
          transition={SPRING}
          className="relative flex items-center justify-around overflow-hidden rounded-[22px] border border-white/[0.08] bg-[rgba(14,16,20,0.72)] px-1.5 py-1.5 shadow-[0_1px_0_0_rgba(255,255,255,0.06)_inset,0_18px_40px_-18px_rgba(0,0,0,0.7)] backdrop-blur-2xl"
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerCancel}
          style={{ touchAction: "none" }}
        >
          {/* Top edge highlight */}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"
          />

          {/* Fluid morphing active pill */}
          <motion.div
            aria-hidden
            style={{ x: pillX, width: pillW }}
            className="pointer-events-none absolute top-1.5 bottom-1.5 left-0 rounded-[16px] border border-emerald-400/15 bg-white/[0.06] shadow-[0_0_0_1px_rgba(255,255,255,0.04)_inset,0_8px_24px_-12px_rgba(52,211,153,0.35)]"
          >
            {/* Ambient emerald glow */}
            <span className="absolute inset-0 rounded-[16px] bg-[radial-gradient(60%_80%_at_50%_50%,rgba(52,211,153,0.18),transparent_70%)]" />
          </motion.div>

          {TABS.map((item, idx) => {
            const Icon = item.Icon;
            const active = idx === activeIdx;
            return (
              <button
                key={item.label + idx}
                ref={(el) => { tabRefs.current[idx] = el; }}
                aria-label={item.label}
                aria-current={active ? "page" : undefined}
                onPointerDown={(e) => onPointerDown(e, idx)}
                onClick={(e) => {
                  // pointerup already navigates if drag/press happened
                  if (draggingRef.current) e.preventDefault();
                }}
                className="relative z-10 flex flex-1 items-center justify-center bg-transparent outline-none"
                style={{ WebkitTapHighlightColor: "transparent" }}
              >
                <span className="relative flex flex-col items-center gap-0.5 rounded-xl px-2 py-1.5 text-[10px] font-medium tracking-tight">
                  <motion.span
                    animate={{
                      scale: active ? 1.08 : 1,
                      y: active ? -1 : 0,
                    }}
                    transition={SPRING}
                    className="flex flex-col items-center gap-0.5"
                  >
                    <Icon
                      className={`h-[18px] w-[18px] transition-colors duration-300 ${
                        active ? "text-emerald-300" : "text-muted-foreground"
                      }`}
                      style={active ? { filter: "drop-shadow(0 0 6px rgba(52,211,153,0.45))" } : undefined}
                    />
                    <motion.span
                      animate={{ opacity: active ? 1 : 0.7 }}
                      transition={{ duration: 0.25 }}
                      className={active ? "text-foreground" : "text-muted-foreground"}
                    >
                      {item.label}
                    </motion.span>
                  </motion.span>
                </span>
              </button>
            );
          })}
        </motion.div>
      </LayoutGroup>
    </nav>
  );
}
