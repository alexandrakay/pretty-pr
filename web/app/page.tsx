import Header from "./components/Header";
import HeroSection from "./components/landing/HeroSection";
import ProblemSection from "./components/landing/ProblemSection";
import OutputsSection from "./components/landing/OutputsSection";
import DemoSection from "./components/landing/DemoSection";
import TwoWaysSection from "./components/landing/TwoWaysSection";
import TeamsSection from "./components/landing/TeamsSection";
import VibeCodingSection from "./components/landing/VibeCodingSection";
import HowItWorksSection from "./components/landing/HowItWorksSection";
import FinalCTASection from "./components/landing/FinalCTASection";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main>
        <HeroSection />
        <ProblemSection />
        <OutputsSection />
        <DemoSection />
        <TwoWaysSection />
        <TeamsSection />
        <VibeCodingSection />
        <HowItWorksSection />
<FinalCTASection />
      </main>
      <footer className="border-t border-border px-6 py-6 text-center text-xs text-text-muted">
        P<span className="text-accent">R</span>etty — Week 3 of{" "}
        <a href="https://github.com/alexandrakay" className="hover:text-text-primary transition-colors">
          12 weeks building in public
        </a>
      </footer>
    </div>
  );
}
