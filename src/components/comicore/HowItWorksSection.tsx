"use client";

import { Pencil, Eye, ThumbsUp, RotateCcw } from "lucide-react";

const steps = [
  {
    number: "01",
    title: "Describe Your Story",
    description: "Give Comicore your premise — characters, setting, genre, art style. The more detail you provide, the better the starting point.",
    icon: Pencil,
    visual: (
      <div className="bg-[#111] border border-[#222] p-4 h-full">
        <div className="text-[10px] text-[#E8B931] mb-3 tracking-widest uppercase">Story Setup</div>
        <div className="space-y-2">
          <div className="h-2 bg-[#1A1A1A] w-full rounded-full" />
          <div className="h-2 bg-[#1A1A1A] w-3/4 rounded-full" />
          <div className="h-2 bg-[#1A1A1A] w-5/6 rounded-full" />
          <div className="mt-4 flex gap-2">
            <div className="w-12 h-12 bg-[#1A1A1A] border border-[#E8B931]/20" />
            <div className="w-12 h-12 bg-[#1A1A1A] border border-[#333]" />
            <div className="w-12 h-12 bg-[#1A1A1A] border border-[#333]" />
          </div>
          <div className="mt-3 h-2 bg-[#1A1A1A] w-2/3 rounded-full" />
          <div className="h-2 bg-[#1A1A1A] w-1/2 rounded-full" />
        </div>
      </div>
    ),
  },
  {
    number: "02",
    title: "Generate a Page",
    description: "Comicore creates the next page with panels, artwork, and dialogue. The AI uses everything it knows about your story and characters.",
    icon: Eye,
    visual: (
      <div className="bg-[#111] border border-[#222] p-3 h-full grid grid-cols-3 gap-1.5">
        <div className="col-span-2 row-span-2 bg-[#1A1A1A] relative">
          <img src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&h=300&fit=crop" alt="" className="w-full h-full object-cover opacity-40" />
        </div>
        <div className="bg-[#1A1A1A] relative">
          <img src="https://images.unsplash.com/photo-1635805737707-575885ab0820?w=200&h=150&fit=crop" alt="" className="w-full h-full object-cover opacity-40" />
        </div>
        <div className="bg-[#1A1A1A] relative">
          <img src="https://images.unsplash.com/photo-1550684376-efcbd6e3f031?w=200&h=150&fit=crop" alt="" className="w-full h-full object-cover opacity-40" />
        </div>
        <div className="col-span-3 bg-[#E8B931]/5 border border-[#E8B931]/10 p-2 flex items-center justify-between">
          <span className="text-[9px] text-[#E8B931] tracking-widest">PAGE 1 — GENERATED</span>
          <span className="text-[9px] text-[#888]">4 panels</span>
        </div>
      </div>
    ),
  },
  {
    number: "03",
    title: "Review & Refine",
    description: "Look at the generated page carefully. Approve it to lock it in, or provide feedback to regenerate. Your call, always.",
    icon: ThumbsUp,
    visual: (
      <div className="bg-[#111] border border-[#222] p-4 h-full">
        <div className="text-[10px] text-[#E8B931] mb-4 tracking-widest uppercase">Review Panel</div>
        <div className="space-y-3">
          <div className="flex gap-2">
            <div className="flex-1 py-2 bg-[#E8B931] text-[#0A0A0A] text-[10px] font-bold text-center tracking-widest">
              APPROVE
            </div>
            <div className="flex-1 py-2 border border-[#333] text-[#888] text-[10px] text-center tracking-widest">
              REVISE
            </div>
          </div>
          <div className="h-16 bg-[#1A1A1A] border border-[#222] p-2">
            <div className="text-[9px] text-[#555] tracking-wider uppercase mb-1">Feedback</div>
            <div className="h-8 bg-[#0A0A0A] rounded-sm" />
          </div>
          <div className="flex items-center gap-2 text-[9px] text-[#555]">
            <RotateCcw className="w-3 h-3" />
            <span>Revisions used: 1 of 5</span>
          </div>
        </div>
      </div>
    ),
  },
  {
    number: "04",
    title: "Build Your Comic",
    description: "Approved pages accumulate. The memory system tracks everything. Keep going until your story is complete.",
    icon: RotateCcw,
    visual: (
      <div className="bg-[#111] border border-[#222] p-4 h-full">
        <div className="text-[10px] text-[#E8B931] mb-3 tracking-widest uppercase">Story Progress</div>
        <div className="space-y-1.5">
          {[1, 2, 3, 4, 5, 6, 7].map((page) => (
            <div key={page} className={`flex items-center gap-2 py-1.5 px-2 ${page <= 3 ? "bg-[#E8B931]/5 border border-[#E8B931]/10" : "bg-[#1A1A1A]"}`}>
              <div className={`w-4 h-4 text-[8px] font-bold flex items-center justify-center ${page <= 3 ? "bg-[#E8B931] text-[#0A0A0A]" : "bg-[#222] text-[#555]"}`}>
                {page}
              </div>
              <span className={`text-[9px] ${page <= 3 ? "text-[#E8B931]" : "text-[#555]"}`}>
                {page <= 3 ? "APPROVED" : "PENDING"}
              </span>
              {page <= 3 && <div className="flex-1 border-t border-dashed border-[#E8B931]/20 ml-2" />}
            </div>
          ))}
        </div>
      </div>
    ),
  },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="relative py-32 bg-[#0A0A0A] stripe-bg">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section header */}
        <div className="mb-20">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-[2px] bg-[#E8B931]" />
            <span className="text-xs text-[#E8B931] tracking-[0.3em] uppercase">The Process</span>
          </div>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-[#F5F5F0] leading-tight">
            FOUR STEPS.
            <br />
            <span className="text-stroke">INFINITE PAGES.</span>
          </h2>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step) => (
            <div key={step.number} className="relative">
              {/* Step number */}
              <div className="text-7xl font-black text-[#E8B931]/10 mb-4 tracking-tighter">
                {step.number}
              </div>

              {/* Icon */}
              <div className="w-10 h-10 border border-[#333] flex items-center justify-center mb-4">
                <step.icon className="w-4 h-4 text-[#E8B931]" />
              </div>

              {/* Content */}
              <h3 className="text-lg font-bold text-[#F5F5F0] mb-2 tracking-tight">
                {step.title}
              </h3>
              <p className="text-sm text-[#777] leading-relaxed mb-6">
                {step.description}
              </p>

              {/* Visual mockup */}
              <div className="aspect-[4/3]">
                {step.visual}
              </div>

              {/* Connector line */}
              <div className="hidden lg:block absolute top-16 -right-4 w-8 border-t border-dashed border-[#E8B931]/20" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
