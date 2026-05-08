import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight, Check, Zap, ShieldCheck, Lock } from "lucide-react";
import { isLoggedIn } from "@/lib/api";
import {
  NetflixMark,
  PrimeMark,
  YouTubePremiumMark,
  DisneyHotstarMark,
  SpotifyMark,
  SonyLivMark,
  Zee5Mark,
  AppleTvMark,
  MxPlayerMark,
  CrunchyrollMark,
  JioCinemaMark,
} from "./OttLogos";

export function Hero() {
  const [authed, setAuthed] = useState(false);
  const [authReady, setAuthReady] = useState(false);

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
    <section className="relative overflow-hidden border-b border-border pt-32 pb-20 md:pt-40 md:pb-28">
      {/* Background — subtle radial green glow + grid */}
      <div className="absolute inset-0 bg-radial-glow" />
      <div className="absolute inset-0 grid-pattern" />

      <div className="relative mx-auto max-w-7xl px-6">
        <div className="grid gap-16 lg:grid-cols-12 lg:items-center">
          {/* Left — text + CTA */}
          <div className="lg:col-span-7">
            {/* Status pill */}
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 animate-fade-up">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-70" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
              </span>
              <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                Save up to 70% on Premium OTT
              </span>
            </div>

            {/* Headline */}
            <h1
              className="mt-6 font-display text-[2.5rem] font-bold leading-[1.05] tracking-[-0.03em] text-foreground sm:text-5xl md:text-6xl lg:text-[4rem] animate-fade-up"
              style={{ animationDelay: "0.05s" }}
            >
              Netflix, Prime, YouTube
              <br />
              <span className="text-gradient">— All in One Place</span>
            </h1>

            {/* Subhead */}
            <p
              className="mt-6 max-w-xl text-[15px] leading-[1.65] text-muted-foreground md:text-base animate-fade-up"
              style={{ animationDelay: "0.1s" }}
            >
              Save up to 70% on premium OTT subscriptions with instant access
              and warranty included.
            </p>

            {/* CTAs */}
            <div
              className={`mt-8 flex flex-col items-start gap-3 sm:flex-row sm:items-center animate-fade-up transition-opacity duration-300 ${
                authReady ? "opacity-100" : "opacity-0"
              }`}
              style={{ animationDelay: "0.15s" }}
            >
              {authed ? (
                <Link
                  to="/dashboard"
                  className="group inline-flex items-center gap-2 rounded-md bg-primary px-6 py-3 text-[14px] font-semibold tracking-tight text-primary-foreground transition-all hover:bg-[var(--primary-hover)] hover:shadow-glow"
                >
                  Dashboard
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              ) : (
                <>
                  <Link
                    to="/signup"
                    className="group inline-flex items-center gap-2 rounded-md bg-primary px-6 py-3 text-[14px] font-semibold tracking-tight text-primary-foreground transition-all hover:bg-[var(--primary-hover)] hover:shadow-glow"
                  >
                    Get Started
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-2 rounded-md border border-border bg-surface px-6 py-3 text-[14px] font-semibold tracking-tight text-foreground transition-all hover:border-muted-foreground/30 hover:bg-surface-elevated"
                  >
                    Log In
                  </Link>
                </>
              )}
            </div>

            {/* Helper line */}
            <div
              className="mt-4 text-[12px] text-muted-foreground animate-fade-up"
              style={{ animationDelay: "0.2s" }}
            >
              Takes less than 30 seconds · Instant activation after payment
            </div>

            {/* Trust micro */}
            <div
              className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-border pt-6 animate-fade-up"
              style={{ animationDelay: "0.25s" }}
            >
              <TrustItem icon={Lock} label="Secure Access" />
              <TrustItem icon={Zap} label="Instant Delivery" />
              <TrustItem icon={ShieldCheck} label="Warranty Included" />
            </div>
          </div>

          {/* Right — OTT preview panel */}
          <div className="lg:col-span-5">
            <OttPreview />
          </div>
        </div>
      </div>
    </section>
  );
}

function TrustItem({
  icon: Icon,
  label,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10">
        <Icon className="h-3.5 w-3.5 text-primary" />
      </div>
      <span className="text-[12px] font-medium text-muted-foreground">
        {label}
      </span>
    </div>
  );
}

function OttPreview() {
  const platforms = [
    { name: "Netflix", Logo: NetflixMark, plan: "Premium · UHD", savings: "65%" },
    { name: "Prime Video", Logo: PrimeMark, plan: "Premium · UHD", savings: "70%" },
    { name: "YouTube Premium", Logo: YouTubePremiumMark, plan: "Ad-free · Music", savings: "55%" },
    { name: "Disney+ Hotstar", Logo: DisneyHotstarMark, plan: "Super · 4K", savings: "60%" },
    { name: "Spotify", Logo: SpotifyMark, plan: "Premium · Family", savings: "62%" },
    { name: "SonyLIV", Logo: SonyLivMark, plan: "Premium · Yearly", savings: "58%" },
    { name: "Zee5", Logo: Zee5Mark, plan: "Premium · UHD", savings: "50%" },
    { name: "Apple TV+", Logo: AppleTvMark, plan: "Standard · 4K HDR", savings: "45%" },
    { name: "MX Player", Logo: MxPlayerMark, plan: "Gold · Ad-free", savings: "40%" },
    { name: "Crunchyroll", Logo: CrunchyrollMark, plan: "Mega Fan · HD", savings: "52%" },
    { name: "JioCinema", Logo: JioCinemaMark, plan: "Premium · UHD", savings: "48%" },
  ];

  // Duplicate the list once so the marquee can loop seamlessly.
  const loop = [...platforms, ...platforms];

  return (
    <div className="relative animate-fade-up" style={{ animationDelay: "0.3s" }}>
      {/* Glow behind panel */}
      <div className="pointer-events-none absolute -inset-6 rounded-2xl bg-primary/8 blur-3xl" />

      <div className="relative overflow-hidden rounded-xl border border-border bg-surface shadow-elegant">
        {/* Panel header */}
        <div className="flex items-center justify-between border-b border-border bg-surface-elevated/60 px-5 py-3">
          <div className="flex items-center gap-2">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-70" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
            </span>
            <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Active Catalog
            </span>
          </div>
          <span className="font-mono text-[11px] text-muted-foreground/70">
            Live · {platforms.length}+ services
          </span>
        </div>

        {/* Live feed — auto-scrolling list */}
        <div className="marquee-pause relative h-[360px] overflow-hidden mask-fade-y">
          <div className="animate-marquee-y flex flex-col">
            {loop.map((p, i) => (
              <div
                key={`${p.name}-${i}`}
                className="flex items-center justify-between border-b border-border/60 px-5 py-3.5 transition-colors hover:bg-surface-elevated/40"
              >
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 shrink-0 overflow-hidden rounded-md">
                    <p.Logo className="h-full w-full" />
                  </div>
                  <div className="min-w-0">
                    <div className="truncate text-[13px] font-semibold text-foreground">
                      {p.name}
                    </div>
                    <div className="text-[11px] text-muted-foreground">
                      {p.plan}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <div className="font-mono text-[13px] font-semibold text-primary">
                      -{p.savings}
                    </div>
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      Saved
                    </div>
                  </div>
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/15">
                    <Check className="h-3 w-3 text-primary" strokeWidth={3} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer status */}
        <div className="flex items-center justify-between border-t border-border bg-surface-elevated/60 px-5 py-3">
          <span className="text-[11px] text-muted-foreground">
            All services verified
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="flex h-1.5 w-1.5 animate-pulse-soft rounded-full bg-primary" />
            <span className="text-[11px] font-semibold text-primary">
              Live
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}
