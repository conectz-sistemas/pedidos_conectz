import { LandingMotionProvider } from "@/components/landing/Motion";
import { LandingNavbar } from "@/components/landing/Navbar";
import { LandingHero } from "@/components/landing/Hero";
import { LandingProblemSolution } from "@/components/landing/ProblemSolution";
import { LandingFeatures } from "@/components/landing/Features";
import { LandingSocialProof } from "@/components/landing/SocialProof";
import { LandingPricing } from "@/components/landing/Pricing";
import { LandingCTA } from "@/components/landing/CTA";
import { LandingFooter } from "@/components/landing/Footer";

export default function Home() {
  return (
    <LandingMotionProvider>
      <main className="min-h-screen">
        <div className="relative">
          <div className="absolute inset-0 -z-10">
            <div className="bg-mesh" />
            <div className="noise" />
          </div>
          <LandingNavbar />
          <div className="mx-auto max-w-6xl px-4 py-8">
            <LandingHero />
          </div>
        </div>

        <LandingProblemSolution />
        <LandingSocialProof />
        <LandingFeatures />
        <LandingPricing />
        <LandingCTA />
        <LandingFooter />
      </main>
    </LandingMotionProvider>
  );
}

