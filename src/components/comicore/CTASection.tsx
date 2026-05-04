"use client";

import { ArrowRight } from "lucide-react";
import type { PageView } from "@/app/page";

interface CTASectionProps {
  onNavigate: (page: PageView) => void;
}

export function CTASection({ onNavigate }: CTASectionProps) {
  return (
    <section className="relative py-32 bg-[#0A0A0A] overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#E8B931]/5 rounded-full blur-[200px]" />
      </div>

      {/* Panel borders */}
      <div className="absolute top-16 left-16 w-32 h-32 border-l-2 border-t-2 border-[#E8B931]/20" />
      <div className="absolute bottom-16 right-16 w-32 h-32 border-r-2 border-b-2 border-[#E8B931]/20" />

      <div className="relative max-w-4xl mx-auto px-6 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 border border-[#E8B931]/30 bg-[#E8B931]/5 mb-8">
          <span className="text-xs text-[#E8B931] tracking-widest uppercase">
            Ready to Create?
          </span>
        </div>

        {/* Heading */}
        <h2 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight text-[#F5F5F0] leading-[0.95] mb-6">
          YOUR COMIC
          <br />
          <span className="text-stroke">STARTS HERE.</span>
        </h2>

        {/* Description */}
        <p className="text-lg text-[#888] max-w-lg mx-auto leading-relaxed mb-10">
          Stop imagining. Start creating. Comicore gives you the tools, the AI, 
          and the workflow to turn any story into a professional comic.
        </p>

        {/* CTA */}
        <button
          onClick={() => onNavigate("signup")}
          className="group inline-flex items-center gap-3 px-10 py-5 bg-[#E8B931] text-[#0A0A0A] font-bold tracking-wide uppercase text-sm"
        >
          Get Started Free
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </button>

        {/* Trust */}
        <p className="mt-6 text-xs text-[#555] tracking-wide">
          No credit card. No art skills needed. Just your story.
        </p>
      </div>
    </section>
  );
}
