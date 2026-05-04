import { Navbar } from "@/components/comicore/Navbar";
import { HeroSection } from "@/components/comicore/HeroSection";
import { FeaturesSection } from "@/components/comicore/FeaturesSection";
import { HowItWorksSection } from "@/components/comicore/HowItWorksSection";
import { GallerySection } from "@/components/comicore/GallerySection";
import { MemorySection } from "@/components/comicore/MemorySection";
import { CTASection } from "@/components/comicore/CTASection";
import { Footer } from "@/components/comicore/Footer";

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <HeroSection />
      <div className="panel-divider" />
      <FeaturesSection />
      <div className="panel-divider" />
      <HowItWorksSection />
      <div className="panel-divider" />
      <GallerySection />
      <div className="panel-divider" />
      <MemorySection />
      <CTASection />
      <Footer />
    </main>
  );
}
