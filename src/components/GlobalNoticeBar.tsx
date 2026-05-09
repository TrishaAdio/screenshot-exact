import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  CheckCircle2,
  Info,
  Megaphone,
  X,
} from "lucide-react";
import { fetchActiveNotices, type Notice, type NoticeType } from "@/lib/api";

const DISMISS_KEY = "symdeals.notices.dismissed";
const POLL_MS = 60_000;

function readDismissed(): Record<string, number> {
  if (typeof window === "undefined") return {};
  try {
    const raw = sessionStorage.getItem(DISMISS_KEY);
    return raw ? (JSON.parse(raw) as Record<string, number>) : {};
  } catch {
    return {};
  }
}

function writeDismissed(map: Record<string, number>) {
  try {
    sessionStorage.setItem(DISMISS_KEY, JSON.stringify(map));
  } catch {
    /* ignore */
  }
}

const STYLES: Record<
  NoticeType,
  { ring: string; bg: string; dot: string; chip: string; iconColor: string; Icon: typeof Info }
> = {
  info: {
    ring: "border-sky-400/15",
    bg: "from-sky-500/[0.04] to-transparent",
    dot: "bg-sky-400/70",
    chip: "text-sky-300",
    iconColor: "text-sky-300",
    Icon: Info,
  },
  success: {
    ring: "border-emerald-400/15",
    bg: "from-emerald-500/[0.04] to-transparent",
    dot: "bg-emerald-400/70",
    chip: "text-emerald-300",
    iconColor: "text-emerald-300",
    Icon: CheckCircle2,
  },
  warning: {
    ring: "border-amber-400/15",
    bg: "from-amber-500/[0.04] to-transparent",
    dot: "bg-amber-400/70",
    chip: "text-amber-300",
    iconColor: "text-amber-300",
    Icon: AlertTriangle,
  },
  urgent: {
    ring: "border-rose-500/20",
    bg: "from-rose-500/[0.05] to-transparent",
    dot: "bg-rose-400/80",
    chip: "text-rose-300",
    iconColor: "text-rose-300",
    Icon: Megaphone,
  },
};

export function GlobalNoticeBar() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [dismissed, setDismissed] = useState<Record<string, number>>({});

  useEffect(() => {
    setDismissed(readDismissed());
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetchActiveNotices();
        if (!cancelled) setNotices(res.notices);
      } catch {
        /* silent — notices are non-critical */
      }
    };
    void load();
    const id = window.setInterval(load, POLL_MS);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, []);

  const visible = notices.filter((n) => !dismissed[n.id]);
  if (visible.length === 0) return null;
  // Show one at a time (most recent first); user dismisses to reveal next.
  const notice = visible[0];

  const onDismiss = () => {
    const next = { ...dismissed, [notice.id]: Date.now() };
    setDismissed(next);
    writeDismissed(next);
  };

  const style = STYLES[notice.type] ?? STYLES.info;
  const Icon = style.Icon;

  return (
    <div className="sticky top-0 z-50 px-3 pt-3 sm:px-4 sm:pt-4">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={notice.id}
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          role="status"
          aria-live="polite"
          className={`mx-auto flex max-w-7xl items-center gap-2.5 overflow-hidden rounded-xl border ${style.ring} bg-gradient-to-r ${style.bg} px-3 py-2 backdrop-blur-md shadow-[0_10px_30px_-18px_rgba(0,0,0,0.7)] sm:gap-3 sm:px-4 sm:py-2.5`}
        >
          <span
            aria-hidden
            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md border ${style.icon}`}
          >
            <Icon className="h-3.5 w-3.5" />
          </span>
          <div className="min-w-0 flex-1">
            {notice.title ? (
              <p className="truncate text-[12.5px] font-semibold text-foreground sm:text-[13px]">
                <span className={`mr-2 ${style.chip}`}>{notice.title}</span>
                <span className="font-normal text-foreground/80">
                  {notice.message}
                </span>
              </p>
            ) : (
              <p className="truncate text-[12.5px] text-foreground/90 sm:text-[13px]">
                {notice.message}
              </p>
            )}
          </div>
          {visible.length > 1 && (
            <span className="hidden shrink-0 rounded-full border border-border bg-white/[0.04] px-2 py-0.5 text-[10px] font-medium text-muted-foreground sm:inline">
              +{visible.length - 1} more
            </span>
          )}
          <motion.button
            type="button"
            onClick={onDismiss}
            aria-label="Dismiss notice"
            whileTap={{ scale: 0.9 }}
            className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground"
          >
            <X className="h-3.5 w-3.5" />
          </motion.button>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
