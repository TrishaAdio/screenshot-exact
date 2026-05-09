import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check } from "lucide-react";
import symdealsLogo from "@/assets/symdeals-logo.png";

const MESSAGES = [
  "Setting up your workspace",
  "Configuring your account",
  "Personalizing your dashboard",
  "Almost ready...",
];

const DURATION_MS = 6000;

export function OnboardingLoader({
  open,
  onComplete,
}: {
  open: boolean;
  onComplete: () => void;
}) {
  const [progress, setProgress] = useState(0);
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    if (!open) {
      setProgress(0);
      setMsgIndex(0);
      return;
    }
    const start = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(100, ((t - start) / DURATION_MS) * 100);
      setProgress(p);
      if (p < 100) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    const stepMs = DURATION_MS / MESSAGES.length;
    const msgInt = window.setInterval(() => {
      setMsgIndex((i) => (i + 1 < MESSAGES.length ? i + 1 : i));
    }, stepMs);

    const done = window.setTimeout(onComplete, DURATION_MS);
    return () => {
      cancelAnimationFrame(raf);
      window.clearInterval(msgInt);
      window.clearTimeout(done);
    };
  }, [open, onComplete]);

  // Floating particles - deterministic positions
  const particles = Array.from({ length: 18 }, (_, i) => ({
    id: i,
    left: (i * 53) % 100,
    delay: (i % 6) * 0.4,
    duration: 6 + (i % 5),
    size: 2 + (i % 3),
  }));

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="onboarding-loader"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.02 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[200] flex items-center justify-center overflow-hidden bg-background"
        >
          {/* Ambient gradient motion */}
          <div className="pointer-events-none absolute inset-0">
            <motion.div
              className="absolute -top-1/3 left-1/2 h-[80vmin] w-[80vmin] -translate-x-1/2 rounded-full"
              style={{
                background:
                  "radial-gradient(closest-side, color-mix(in oklab, hsl(var(--primary)) 22%, transparent), transparent)",
                filter: "blur(40px)",
              }}
              animate={{ scale: [1, 1.15, 1], opacity: [0.6, 0.9, 0.6] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              className="absolute -bottom-1/3 right-1/4 h-[60vmin] w-[60vmin] rounded-full"
              style={{
                background:
                  "radial-gradient(closest-side, color-mix(in oklab, hsl(var(--primary)) 14%, transparent), transparent)",
                filter: "blur(60px)",
              }}
              animate={{ scale: [1.1, 1, 1.1], opacity: [0.5, 0.8, 0.5] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>

          {/* Floating particles */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            {particles.map((p) => (
              <motion.span
                key={p.id}
                className="absolute rounded-full bg-primary/40"
                style={{
                  left: `${p.left}%`,
                  bottom: -10,
                  width: p.size,
                  height: p.size,
                  boxShadow: "0 0 8px hsl(var(--primary) / 0.6)",
                }}
                initial={{ y: 0, opacity: 0 }}
                animate={{ y: "-110vh", opacity: [0, 1, 1, 0] }}
                transition={{
                  duration: p.duration,
                  delay: p.delay,
                  repeat: Infinity,
                  ease: "linear",
                }}
              />
            ))}
          </div>

          {/* Content */}
          <div className="relative z-10 flex w-full max-w-md flex-col items-center px-6 text-center">
            {/* Logo + success ring */}
            <div className="relative mb-8 flex h-24 w-24 items-center justify-center">
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-primary/30"
                animate={{ scale: [1, 1.3, 1.6], opacity: [0.6, 0.2, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
              />
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-primary/40"
                animate={{ scale: [1, 1.3, 1.6], opacity: [0.6, 0.2, 0] }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeOut",
                  delay: 1,
                }}
              />
              <motion.div
                initial={{ scale: 0, rotate: -90 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 220,
                  damping: 16,
                  delay: 0.1,
                }}
                className="relative flex h-20 w-20 items-center justify-center rounded-full bg-primary/15 ring-1 ring-primary/30"
                style={{
                  boxShadow:
                    "0 0 40px color-mix(in oklab, hsl(var(--primary)) 35%, transparent)",
                }}
              >
                <Check
                  className="h-9 w-9 text-primary"
                  strokeWidth={3}
                />
              </motion.div>
            </div>

            <motion.img
              src={symdealsLogo}
              alt="SymDeals"
              className="mb-6 h-5 w-auto opacity-90"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 0.9, y: 0 }}
              transition={{ delay: 0.25, duration: 0.5 }}
            />

            <motion.h2
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="font-display text-[20px] font-bold tracking-[-0.01em] text-foreground sm:text-[22px]"
            >
              Please wait, we are preparing your dashboard...
            </motion.h2>

            {/* Rotating subtext */}
            <div className="mt-3 h-5 overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.p
                  key={msgIndex}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="text-[13px] text-muted-foreground"
                >
                  {MESSAGES[msgIndex]}
                </motion.p>
              </AnimatePresence>
            </div>

            {/* Progress bar */}
            <div className="relative mt-8 h-[6px] w-full overflow-hidden rounded-full bg-surface ring-1 ring-border">
              <motion.div
                className="h-full rounded-full"
                style={{
                  width: `${progress}%`,
                  background:
                    "linear-gradient(90deg, color-mix(in oklab, hsl(var(--primary)) 70%, transparent), hsl(var(--primary)))",
                  boxShadow:
                    "0 0 16px color-mix(in oklab, hsl(var(--primary)) 60%, transparent)",
                }}
              />
              {/* Shimmer */}
              <motion.div
                className="absolute inset-y-0 w-1/3"
                style={{
                  background:
                    "linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent)",
                }}
                animate={{ x: ["-100%", "300%"] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: "linear" }}
              />
            </div>

            <div className="mt-3 flex w-full items-center justify-between text-[11.5px] font-medium tabular-nums text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Dot delay={0} />
                <Dot delay={0.2} />
                <Dot delay={0.4} />
              </div>
              <span>{Math.round(progress)}%</span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Dot({ delay }: { delay: number }) {
  return (
    <motion.span
      className="block h-1.5 w-1.5 rounded-full bg-primary"
      animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1, 0.8] }}
      transition={{ duration: 1.2, repeat: Infinity, delay, ease: "easeInOut" }}
    />
  );
}
