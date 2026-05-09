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
    <div className="w-full px-3 pt-3 sm:px-4 sm:pt-4">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={notice.id}
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
          role="status"
          aria-live="polite"
          className={`mx-auto flex w-full max-w-7xl items-center gap-2.5 overflow-hidden rounded-lg border ${style.ring} bg-gradient-to-r ${style.bg} px-3 py-1.5 backdrop-blur-sm sm:gap-3 sm:px-4 sm:py-2`}
        >
          <Icon className={`h-3.5 w-3.5 shrink-0 ${style.iconColor}`} aria-hidden />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[12px] leading-5 text-foreground/85 sm:text-[12.5px]">
              {notice.title && (
                <>
                  <span className={`font-semibold ${style.chip}`}>{notice.title}</span>
                  <span aria-hidden className={`mx-2 inline-block h-1 w-1 rounded-full align-middle ${style.dot}`} />
                </>
              )}
              <span>{notice.message}</span>
            </p>
          </div>
          {visible.length > 1 && (
            <span className="hidden shrink-0 rounded-full border border-border/60 bg-white/[0.03] px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground sm:inline">
              +{visible.length - 1}
            </span>
          )}
          <motion.button
            type="button"
            onClick={onDismiss}
            aria-label="Dismiss notice"
            whileTap={{ scale: 0.92 }}
            className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-muted-foreground/70 transition-colors hover:bg-white/[0.04] hover:text-foreground"
          >
            <X className="h-3 w-3" />
          </motion.button>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
