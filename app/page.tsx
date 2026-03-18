import { LandingMotionProvider } from "@/components/landing/Motion";
import { LandingNavbar } from "@/components/landing/Navbar";
import { LandingHero } from "@/components/landing/Hero";
import { LandingProblem } from "@/components/landing/Problem";
import { LandingSolution } from "@/components/landing/Solution";
import { LandingBenefits } from "@/components/landing/Benefits";
import { LandingPlan } from "@/components/landing/Plan";
import { LandingFinalCTA } from "@/components/landing/FinalCTA";
import { LandingFooter } from "@/components/landing/Footer";

export default function Home() {
  return (
    <LandingMotionProvider>
      <main className="min-h-screen">
        <LandingNavbar />

        <div className="mx-auto max-w-6xl px-4 py-8">
          <LandingHero />
        </div>

        <LandingProblem />
        <LandingSolution />
        <LandingBenefits />
        <LandingPlan />
        <LandingFinalCTA />
        <LandingFooter />
      </main>
    </LandingMotionProvider>
  );
}

