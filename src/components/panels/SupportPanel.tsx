import {
  AlertTriangle,
  ArrowRight,
  Headphones,
  Instagram,
  MessageCircle,
  Send,
} from "lucide-react";

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

export function SupportPanel() {
  return (
    <div className="mx-auto max-w-2xl">
      <div className="text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/60 px-3 py-1">
          <Headphones className="h-3 w-3 text-primary" />
          <span className="text-[10.5px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Support
          </span>
        </div>
        <h1 className="mt-6 font-display text-[2rem] font-semibold leading-[1.1] tracking-[-0.025em] text-foreground sm:text-[2.4rem]">
          Support that actually helps —{" "}
          <span className="text-emerald-400">instantly</span>
        </h1>
        <p className="mt-5 text-[15px] leading-[1.7] text-muted-foreground">
          Get <span className="font-semibold text-emerald-400">fast</span>,{" "}
          <span className="font-semibold text-emerald-400">verified</span> help from real humans —
          available <span className="font-semibold text-emerald-400">24/7</span>
        </p>
        <p className="mt-3 text-[12.5px] text-muted-foreground/80">
          We never ask for payments outside this website
        </p>
      </div>

      <section className="mt-12">
        <h2 className="text-center font-display text-[1.15rem] font-semibold tracking-tight text-foreground">
          Contact Us
        </h2>
        <div className="mx-auto mt-8 flex max-w-md flex-col gap-3.5">
          {channels.map(({ name, tagline, status, href, Icon }) => (
            <a
              key={name}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative flex items-center gap-4 overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-b from-white/[0.04] to-white/[0.015] px-5 py-5 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-emerald-400/40"
            >
              <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-white/[0.08] bg-gradient-to-b from-white/[0.07] to-white/[0.02] text-foreground transition-all duration-300 group-hover:border-emerald-400/40 group-hover:text-emerald-400">
                <Icon className="h-[18px] w-[18px]" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-display text-[15.5px] font-semibold tracking-tight text-foreground">
                  {name}
                </p>
                <p className="mt-0.5 text-[12.5px] leading-snug text-muted-foreground">
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
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/[0.06] bg-white/[0.03] text-muted-foreground transition-all duration-300 group-hover:border-emerald-400/40 group-hover:bg-emerald-400/10 group-hover:text-emerald-400">
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
              </div>
            </a>
          ))}
        </div>
      </section>

      <section className="mt-8">
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-amber-500/15">
              <AlertTriangle className="h-4 w-4 text-amber-400" />
            </div>
            <div>
              <p className="font-display text-[14px] font-semibold tracking-tight text-amber-300">
                Important Notice
              </p>
              <p className="mt-2 text-[13px] leading-[1.65] text-muted-foreground">
                Our support accounts are only used to assist you with your issues. We will{" "}
                <span className="font-semibold text-foreground">never ask for payments or deals</span>{" "}
                through these channels. All purchases must be completed only through this website.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
