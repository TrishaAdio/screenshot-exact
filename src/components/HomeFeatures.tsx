import { Zap, ShieldCheck, Lock, Headphones } from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "Instant Delivery",
    desc: "Credentials delivered in under 10 seconds. Verified, encrypted, ready to stream.",
  },
  {
    icon: ShieldCheck,
    title: "Warranty Included",
    desc: "Full coverage on every plan — replace, refund, or extend, no questions asked.",
  },
  {
    icon: Lock,
    title: "Secure Access",
    desc: "End-to-end encryption and isolated sessions keep your account permanently safe.",
  },
  {
    icon: Headphones,
    title: "24/7 Support",
    desc: "Real humans, fast replies. Live chat available around the clock for members.",
  },
];

export function HomeFeatures() {
  return (
    <section className="relative border-b border-border py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-6">
        <div className="max-w-2xl">
          <div className="label-uppercase">Why SymDeals</div>
          <h2 className="mt-3 font-display text-3xl font-bold leading-[1.1] tracking-[-0.02em] text-foreground md:text-4xl lg:text-[2.75rem]">
            Built for trust, speed,
            <br />
            and <span className="text-gradient">premium streaming.</span>
          </h2>
        </div>

        <div className="mt-14 grid gap-px overflow-hidden rounded-xl border border-border bg-border md:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                className="group bg-surface p-7 transition-colors hover:bg-surface-elevated"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 transition-colors group-hover:bg-primary/15">
                  <Icon className="h-4.5 w-4.5 text-primary" strokeWidth={2} />
                </div>
                <h3 className="mt-6 font-display text-[15px] font-semibold tracking-tight text-foreground">
                  {f.title}
                </h3>
                <p className="mt-2 text-[13px] leading-[1.6] text-muted-foreground">
                  {f.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
