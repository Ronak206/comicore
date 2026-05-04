"use client";

import { Brain, Database, Eye, Layers, Shield, Zap } from "lucide-react";

const memoryLayers = [
  {
    icon: Database,
    title: "Story Memory",
    description: "Tracks the full plot arc, chapter structure, and every narrative beat. Older pages get compressed into smart summaries so nothing is lost but context stays lean.",
    detail: "Rolling summaries keep the full picture in view.",
  },
  {
    icon: Eye,
    title: "Visual Memory",
    description: "Stores character designs, poses, expressions, and art style references. Every character looks the same on page 1 and page 50.",
    detail: "Character sheets that evolve with your story.",
  },
  {
    icon: Layers,
    title: "Panel Memory",
    description: "Tracks panel layouts, pacing patterns, and visual flow between pages. The last panel of one page connects naturally to the first panel of the next.",
    detail: "Seamless transitions, every single time.",
  },
];

const memoryStats = [
  { value: "100+", label: "Pages Supported" },
  { value: "3", label: "Memory Layers" },
  { value: "0", label: "Context Leaks" },
  { value: "100%", label: "Consistency" },
];

export function MemorySection() {
  return (
    <section id="memory" className="relative py-32 bg-[#0A0A0A] halftone-bg">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section header */}
        <div className="max-w-2xl mb-20">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-[2px] bg-[#E8B931]" />
            <span className="text-xs text-[#E8B931] tracking-[0.3em] uppercase">Memory System</span>
          </div>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-[#F5F5F0] leading-tight">
            IT REMEMBERS
            <br />
            <span className="text-stroke">EVERYTHING.</span>
          </h2>
          <p className="mt-6 text-[#888] text-lg leading-relaxed">
            The biggest problem with AI-generated long-form content? It forgets. 
            Comicore doesn&apos;t. Our three-layer memory system ensures your comic stays 
            consistent from page one to page one hundred.
          </p>
        </div>

        {/* Memory Layers */}
        <div className="grid md:grid-cols-3 gap-px bg-[#222] mb-20">
          {memoryLayers.map((layer) => (
            <div key={layer.title} className="bg-[#0A0A0A] p-8 page-peel">
              {/* Icon */}
              <div className="w-12 h-12 border border-[#E8B931]/30 flex items-center justify-center mb-6">
                <layer.icon className="w-5 h-5 text-[#E8B931]" />
              </div>

              {/* Content */}
              <h3 className="text-xl font-bold text-[#F5F5F0] mb-3 tracking-tight">
                {layer.title}
              </h3>
              <p className="text-sm text-[#777] leading-relaxed mb-4">
                {layer.description}
              </p>
              <p className="text-xs text-[#E8B931] tracking-wide">
                {layer.detail}
              </p>
            </div>
          ))}
        </div>

        {/* Memory Stats Bar */}
        <div className="border border-[#222] bg-[#111] p-8">
          <div className="flex items-center gap-4 mb-8">
            <Brain className="w-5 h-5 text-[#E8B931]" />
            <span className="text-sm text-[#E8B931] tracking-[0.2em] uppercase">Memory Performance</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {memoryStats.map((stat) => (
              <div key={stat.label}>
                <div className="text-4xl sm:text-5xl font-black text-[#F5F5F0] tracking-tight">
                  {stat.value}
                </div>
                <div className="text-xs text-[#666] tracking-widest uppercase mt-2">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Compression Strategy */}
        <div className="mt-16 grid md:grid-cols-2 gap-16 items-center">
          <div>
            <h3 className="text-2xl font-bold text-[#F5F5F0] mb-4 tracking-tight">
              SMART COMPRESSION
            </h3>
            <p className="text-[#777] leading-relaxed mb-6">
              You can&apos;t fit 100 pages of comic content into any AI&apos;s context window. 
              So we compress intelligently. Recent pages stay in full detail. Older pages get 
              distilled into structured summaries. Character bibles, world rules, and plot 
              threads are always available as structured data — not fuzzy recollections.
            </p>
            <div className="space-y-3">
              {[
                "Recent 5 pages: Full panel detail",
                "Older pages: Semantic summaries",
                "Characters: Structured JSON bible",
                "Art style: Embedding vectors",
                "Plot threads: Active status tracker",
              ].map((item) => (
                <div key={item} className="flex items-center gap-3 text-sm">
                  <Shield className="w-3.5 h-3.5 text-[#E8B931] flex-shrink-0" />
                  <span className="text-[#999]">{item}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-[#111] border border-[#222] p-6">
            <div className="text-[10px] text-[#E8B931] tracking-[0.2em] uppercase mb-4">Memory Architecture</div>
            <div className="space-y-2">
              {["Layer 1: Story Context (Semantic)", "Layer 2: Visual Consistency (Embeddings)", "Layer 3: Panel Continuity (Sequential)"].map((layer, i) => (
                <div key={layer} className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-[#E8B931] text-[#0A0A0A] text-[9px] font-bold flex items-center justify-center">
                    {i + 1}
                  </div>
                  <div className="flex-1 h-8 bg-[#1A1A1A] border border-[#222] flex items-center px-3">
                    <span className="text-[10px] text-[#888]">{layer}</span>
                  </div>
                  <Zap className="w-3 h-3 text-[#E8B931]" />
                </div>
              ))}
            </div>
            <div className="mt-4 border-t border-[#222] pt-4 flex items-center justify-between">
              <span className="text-[9px] text-[#555] tracking-wider uppercase">Total Context Usage</span>
              <span className="text-[9px] text-[#E8B931] font-bold">~40% per page</span>
            </div>
            <div className="mt-2 w-full h-2 bg-[#1A1A1A]">
              <div className="h-full bg-[#E8B931] w-[40%]" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
