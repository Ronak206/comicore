"use client";

import { useState, useCallback } from "react";
import { Navbar } from "@/components/comicore/Navbar";
import { HeroSection } from "@/components/comicore/HeroSection";
import { FeaturesSection } from "@/components/comicore/FeaturesSection";
import { HowItWorksSection } from "@/components/comicore/HowItWorksSection";
import { GallerySection } from "@/components/comicore/GallerySection";
import { MemorySection } from "@/components/comicore/MemorySection";
import { CTASection } from "@/components/comicore/CTASection";
import { Footer } from "@/components/comicore/Footer";
import { SignUpPage } from "@/components/comicore/SignUpPage";
import { LoginPage } from "@/components/comicore/LoginPage";

export type PageView = "landing" | "signup" | "login";

function getInitialPage(): PageView {
  if (typeof window !== "undefined") {
    const hash = window.location.hash;
    if (hash === "#signup") return "signup";
    if (hash === "#login") return "login";
  }
  return "landing";
}

export default function Home() {
  const [currentPage, setCurrentPage] = useState<PageView>(getInitialPage);

  const navigateTo = useCallback((page: PageView) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  if (currentPage === "signup") {
    return <SignUpPage onNavigate={navigateTo} />;
  }

  if (currentPage === "login") {
    return <LoginPage onNavigate={navigateTo} />;
  }

  return (
    <main className="min-h-screen">
      <Navbar onNavigate={navigateTo} />
      <HeroSection onNavigate={navigateTo} />
      <div className="panel-divider" />
      <FeaturesSection />
      <div className="panel-divider" />
      <HowItWorksSection />
      <div className="panel-divider" />
      <GallerySection />
      <div className="panel-divider" />
      <MemorySection />
      <CTASection onNavigate={navigateTo} />
      <Footer onNavigate={navigateTo} />
    </main>
  );
}
