import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { HomeFeatures } from "@/components/HomeFeatures";
import { CtaSection } from "@/components/CtaSection";
import { Footer } from "@/components/Footer";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "SymDeals — Netflix, Prime, YouTube All in One Place" },
      {
        name: "description",
        content:
          "Save up to 70% on premium OTT subscriptions — Netflix, Prime Video, YouTube, Disney+ Hotstar — with instant access and warranty included.",
      },
      {
        property: "og:title",
        content: "SymDeals — Netflix, Prime, YouTube All in One Place",
      },
      {
        property: "og:description",
        content:
          "Save up to 70% on premium OTT subscriptions with instant access and warranty included.",
      },
    ],
  }),
});

function Index() {
  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <Navbar />
      <main>
        <Hero />
        <HomeFeatures />
        <CtaSection />
      </main>
      <Footer />
    </div>
  );
}
