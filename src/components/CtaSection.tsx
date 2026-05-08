import { Link } from "@tanstack/react-router";
import { ArrowRight, ShieldCheck } from "lucide-react";

export function CtaSection() {
  return (
    <section className="relative py-20 md:py-28">
      <div className="mx-auto max-w-5xl px-6">
        <div className="relative overflow-hidden rounded-xl border border-border bg-surface p-10 md:p-14">
          {/* Subtle radial glow */}
          <div className="absolute -top-32 left-1/2 h-72 w-[600px] -translate-x-1/2 rounded-full bg-primary/15 blur-[100px]" />
          <div className="absolute inset-0 grid-pattern opacity-40" />

          <div className="relative grid gap-10 md:grid-cols-2 md:items-center">
            <div>
              <div className="label-uppercase text-primary">
                Members Only
              </div>
              <h2 className="mt-3 font-display text-3xl font-bold leading-[1.1] tracking-[-0.02em] text-foreground md:text-4xl">
                Unlock <span className="text-gradient">exclusive deals</span> on
                premium OTT.
              </h2>
              <p className="mt-4 max-w-md text-[14px] leading-[1.65] text-muted-foreground">
                Create a free account to view plans curated for the way you
                stream. No card required.
              </p>
            </div>

            <div className="flex flex-col items-start gap-4 md:items-end">
              <Link
                to="/signup"
                className="group inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-7 py-3.5 text-[14px] font-semibold tracking-tight text-primary-foreground transition-all hover:bg-[var(--primary-hover)] hover:shadow-glow md:w-auto"
              >
                Create Account
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <div className="text-[12px] text-muted-foreground">
                Takes less than 30 seconds
              </div>
              <div className="flex items-center gap-2 text-[12px] text-muted-foreground">
                <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                Warranty included — free replacement on any issue
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
