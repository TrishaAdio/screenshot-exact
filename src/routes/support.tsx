import { createFileRoute, Link } from "@tanstack/react-router";
import symdealsLogo from "@/assets/symdeals-logo.png";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import {
  AlertTriangle,
  ArrowRight,
  Instagram,
  MessageCircle,
  Send,
} from "lucide-react";

export const Route = createFileRoute("/support")({
  component: SupportPage,
  head: () => ({
    meta: [
      { title: "Support — SymDeals" },
      {
        name: "description",
        content:
          "Contact SymDeals support via Instagram, Telegram, or WhatsApp. We're here to help you anytime.",
      },
      { property: "og:title", content: "Support — SymDeals" },
      {
        property: "og:description",
        content:
          "Reach SymDeals support through our official channels — Instagram, Telegram, and WhatsApp.",
      },
    ],
  }),
});

const channels = [
  {
    name: "Instagram",
    tagline: "Message us on Instagram",
    status: "Usually replies in minutes",
    href: "https://www.instagram.com/symdeals/",
    Icon: Instagram,
  },
  {
    name: "Telegram",
    tagline: "Chat with us on Telegram",
    status: "Active now",
    href: "https://t.me/SymDealsAdmin",
    Icon: Send,
  },
  {
    name: "WhatsApp",
    tagline: "Reach us on WhatsApp",
    status: "Fastest response",
    href: "https://wa.me/918389393923",
    Icon: MessageCircle,
  },
];

function SupportPage() {
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
          <Link
            to="/dashboard"
            className="text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Dashboard
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-6 py-16 pb-32 md:py-24 lg:pb-24">
        {/* Top Section */}
        <div className="text-center animate-fade-up">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
            <span className="text-[10.5px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Support
            </span>
          </div>
          <h1 className="mt-6 font-display text-[2.25rem] font-bold leading-[1.1] tracking-[-0.025em] text-white sm:text-[2.75rem]">
            Support that actually helps —{" "}
            <span className="text-emerald-400">instantly</span>
          </h1>
          <p className="mt-5 text-[15px] leading-[1.7] tracking-[0.005em] text-white/90 sm:text-[16px]">
            Get <span className="font-semibold text-emerald-400">fast</span>,{" "}
            <span className="font-semibold text-emerald-400">verified</span>{" "}
            help from real humans — available{" "}
            <span className="font-semibold text-emerald-400">24/7</span>
          </p>
          <p className="mt-4 text-[12.5px] text-muted-foreground">
            We never ask for payments outside this website
          </p>
        </div>

        {/* Contact Section */}
        <section className="mt-14">
          <h2 className="text-center font-display text-[1.25rem] font-bold tracking-tight text-foreground">
            Contact Us
          </h2>

          <div className="mx-auto mt-10 flex max-w-md flex-col gap-4">
            {channels.map(({ name, tagline, status, href, Icon }) => (
              <a
                key={name}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative flex items-center gap-4 overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-b from-white/[0.04] to-white/[0.015] px-5 py-5 shadow-[0_1px_0_0_rgba(255,255,255,0.04)_inset,0_8px_24px_-12px_rgba(0,0,0,0.6)] transition-all duration-300 ease-out hover:-translate-y-1 hover:border-emerald-400/40 hover:from-white/[0.06] hover:to-white/[0.025] hover:shadow-[0_1px_0_0_rgba(52,211,153,0.15)_inset,0_18px_40px_-16px_rgba(52,211,153,0.35)]"
              >
                {/* Soft top edge highlight */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent opacity-60"
                />

                {/* Icon */}
                <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-white/[0.08] bg-gradient-to-b from-white/[0.07] to-white/[0.02] text-white shadow-[0_1px_0_0_rgba(255,255,255,0.06)_inset] transition-all duration-300 group-hover:border-emerald-400/40 group-hover:text-emerald-400 group-hover:shadow-[0_0_0_1px_rgba(52,211,153,0.2)_inset,0_0_24px_-4px_rgba(52,211,153,0.4)]">
                  <Icon className="h-[18px] w-[18px]" />
                </div>

                {/* Text */}
                <div className="min-w-0 flex-1">
                  <p className="font-display text-[16px] font-semibold tracking-tight text-white">
                    {name}
                  </p>
                  <p className="mt-1 text-[13px] leading-snug text-muted-foreground">
                    {tagline}
                  </p>
                  <div className="mt-2 flex items-center gap-1.5">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/60 opacity-75" />
                      <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    </span>
                    <span className="text-[10.5px] font-medium uppercase tracking-[0.12em] text-muted-foreground/80">
                      {status}
                    </span>
                  </div>
                </div>

                {/* Arrow */}
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/[0.06] bg-white/[0.03] text-muted-foreground transition-all duration-300 group-hover:border-emerald-400/40 group-hover:bg-emerald-400/10 group-hover:text-emerald-400">
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                </div>
              </a>
            ))}
          </div>
        </section>

        {/* Important Notice */}
        <section className="mt-10">
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-5">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-amber-500/15">
                <AlertTriangle className="h-4 w-4 text-amber-400" />
              </div>
              <div>
                <p className="font-display text-[14px] font-bold tracking-tight text-amber-300">
                  Important Notice
                </p>
                <p className="mt-2 text-[13px] leading-[1.65] text-muted-foreground">
                  Our support accounts are only used to assist you with your
                  issues. We will{" "}
                  <span className="font-semibold text-foreground">
                    never ask for payments or deals
                  </span>{" "}
                  through these channels. All purchases must be completed only
                  through this website.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <MobileBottomNav />
    </div>
  );
}
