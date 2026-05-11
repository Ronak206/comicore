"use client";

import { ArrowRight, Play, Sparkles, BookOpen, FileText, Users } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface Stats {
  totalComics: number;
  totalPages: number;
  totalCharacters: number;
  totalExports: number;
  totalUsers: number;
  totalExportSize: string;
}

export function HeroSection() {
  const [stats, setStats] = useState<Stats>({
    totalComics: 0,
    totalPages: 0,
    totalCharacters: 0,
    totalExports: 0,
    totalUsers: 0,
    totalExportSize: "0 KB",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/stats");
        const data = await res.json();
        if (data.success) {
          setStats(data.data);
        }
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  return (
    <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 halftone-bg" />
      <div className="absolute top-32 right-0 w-[500px] h-[500px] bg-[#E8B931]/5 rounded-full blur-[120px]" />
      <div className="absolute bottom-20 left-0 w-[300px] h-[300px] bg-[#E8B931]/3 rounded-full blur-[100px]" />

      {/* Corner panel lines */}
      <div className="absolute top-24 left-8 w-20 h-20 border-l-2 border-t-2 border-[#E8B931]/30" />
      <div className="absolute bottom-8 right-8 w-20 h-20 border-r-2 border-b-2 border-[#E8B931]/30" />

      <div className="relative max-w-7xl mx-auto px-6 py-24 grid lg:grid-cols-2 gap-16 items-center">
        {/* Left Content */}
        <div className="space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 border border-[#E8B931]/30 bg-[#E8B931]/5">
            <Sparkles className="w-3.5 h-3.5 text-[#E8B931]" />
            <span className="text-xs text-[#E8B931] tracking-widest uppercase">
              Page by Page AI Generation
            </span>
          </div>

          {/* Heading */}
          <div className="space-y-3">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black leading-[0.95] tracking-tight text-[#F5F5F0]">
              YOUR STORY.
              <br />
              <span className="text-stroke">EVERY PANEL.</span>
              <br />
              ONE COMIC.
            </h1>
          </div>

          {/* Description */}
          <p className="text-lg text-[#888] max-w-md leading-relaxed">
            Describe your world, create characters, and watch Comicore bring your comic to life — one page at a time. 
            Review each page. Refine it. Then continue.
          </p>

          {/* Stats */}
          <div className="flex gap-8 py-4">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <BookOpen className="w-4 h-4 text-[#E8B931]" />
                <span className="text-2xl font-black text-[#E8B931]">
                  {loading ? "..." : stats.totalComics.toLocaleString()}
                </span>
              </div>
              <div className="text-xs text-[#666] tracking-widest uppercase">Comics</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <FileText className="w-4 h-4 text-[#E8B931]" />
                <span className="text-2xl font-black text-[#E8B931]">
                  {loading ? "..." : stats.totalPages.toLocaleString()}
                </span>
              </div>
              <div className="text-xs text-[#666] tracking-widest uppercase">Pages</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <Users className="w-4 h-4 text-[#E8B931]" />
                <span className="text-2xl font-black text-[#E8B931]">
                  {loading ? "..." : stats.totalCharacters.toLocaleString()}
                </span>
              </div>
              <div className="text-xs text-[#666] tracking-widest uppercase">Characters</div>
            </div>
          </div>

          {/* CTAs */}
          <div className="flex flex-wrap items-center gap-4 pt-4">
            <Link
              href="/signup"
              className="group flex items-center gap-3 px-8 py-4 bg-[#E8B931] text-[#0A0A0A] font-bold tracking-wide uppercase text-sm"
            >
              Start Creating
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <button className="flex items-center gap-3 px-8 py-4 border border-[#333] text-[#F5F5F0] tracking-wide uppercase text-sm">
              <Play className="w-4 h-4" />
              Watch Demo
            </button>
          </div>

          <p className="text-xs text-[#555] tracking-wide">
            Free to start. No credit card needed.
          </p>
        </div>

        {/* Right - Comic Preview Mockup */}
        <div className="relative hidden lg:block">
          <div className="relative animate-float">
            {/* Browser mockup */}
            <div className="border-2 border-[#222] bg-[#111] rounded-sm overflow-hidden">
              {/* Browser chrome */}
              <div className="flex items-center gap-2 px-4 py-3 bg-[#181818] border-b border-[#222]">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#E8B931]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#333]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#333]" />
                </div>
                <div className="flex-1 ml-4 px-3 py-1 bg-[#0A0A0A] text-[#555] text-xs rounded-sm">
                  comicore.app/studio
                </div>
              </div>
              {/* Content area - Comic panels mockup */}
              <div className="p-4 grid grid-cols-3 gap-2">
                {/* Panel 1 */}
                <div className="col-span-2 row-span-2 bg-[#1A1A1A] aspect-[4/3] relative overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&h=400&fit=crop"
                    alt="Comic panel 1"
                    className="w-full h-full object-cover opacity-70"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#0A0A0A] to-transparent p-3">
                    <div className="text-xs text-[#E8B931] font-bold">PAGE 1 — PANEL 1</div>
                    <div className="text-[10px] text-[#888] mt-0.5">In the beginning...</div>
                  </div>
                </div>
                {/* Panel 2 */}
                <div className="bg-[#1A1A1A] aspect-square relative overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1635805737707-575885ab0820?w=300&h=300&fit=crop"
                    alt="Comic panel 2"
                    className="w-full h-full object-cover opacity-70"
                  />
                </div>
                {/* Panel 3 */}
                <div className="bg-[#1A1A1A] aspect-square relative overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1550684376-efcbd6e3f031?w=300&h=300&fit=crop"
                    alt="Comic panel 3"
                    className="w-full h-full object-cover opacity-70"
                  />
                </div>
                {/* Panel 4 */}
                <div className="bg-[#1A1A1A] aspect-[3/2] relative overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1563089145-599997674d42?w=300&h=200&fit=crop"
                    alt="Comic panel 4"
                    className="w-full h-full object-cover opacity-70"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-[#E8B931] text-[#0A0A0A] text-[10px] font-bold px-2 py-1">
                      APPROVED
                    </div>
                  </div>
                </div>
                {/* Panel 5 */}
                <div className="bg-[#1A1A1A] aspect-[3/2] relative overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1618336753974-aae8e04506aa?w=300&h=200&fit=crop"
                    alt="Comic panel 5"
                    className="w-full h-full object-cover opacity-70"
                  />
                </div>
                {/* Panel 6 */}
                <div className="bg-[#1A1A1A] aspect-[3/2] relative overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1534996858221-380b92700493?w=300&h=200&fit=crop"
                    alt="Comic panel 6"
                    className="w-full h-full object-cover opacity-70"
                  />
                </div>
              </div>
              {/* Bottom toolbar */}
              <div className="flex items-center justify-between px-4 py-3 bg-[#181818] border-t border-[#222]">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 border border-[#E8B931] flex items-center justify-center text-[8px] text-[#E8B931]">1</div>
                  <div className="text-xs text-[#888]">Page 1 of 24</div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="px-3 py-1.5 bg-[#E8B931]/10 border border-[#E8B931]/30 text-[10px] text-[#E8B931]">
                    REVIEW
                  </div>
                  <div className="px-3 py-1.5 bg-[#E8B931] text-[10px] text-[#0A0A0A] font-bold">
                    NEXT PAGE
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Decorative elements */}
          <div className="absolute -top-6 -right-6 w-16 h-16 border-2 border-[#E8B931]/20 rotate-12" />
          <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-[#E8B931]/10" />
        </div>
      </div>
    </section>
  );
}
