"use client";

import { useState } from "react";
import {
  Brain,
  Database,
  Eye,
  Layers,
  AlertTriangle,
  RefreshCw,
  ChevronRight,
  Users,
  BookOpen,
  Palette,
  Maximize2,
  Trash2,
  Search,
} from "lucide-react";

type MemoryTab = "overview" | "characters" | "visual" | "panels";

const characters = [
  {
    name: "Kai Nakamura",
    role: "Protagonist",
    comic: "The Last Cyberpunk",
    appearances: 24,
    lastSeen: "Page 24",
    attributes: ["Scar on left eye", "Cybernetic arm (right)", "Silver hair", "Black trench coat"],
    status: "Active",
  },
  {
    name: "Zero",
    role: "Antagonist",
    comic: "The Last Cyberpunk",
    appearances: 18,
    lastSeen: "Page 22",
    attributes: ["White mask", "Red eyes", "Tall silhouette", "No speech"],
    status: "Active",
  },
  {
    name: "Lyra Chen",
    role: "Supporting",
    comic: "Shadow Walker Chronicles",
    appearances: 12,
    lastSeen: "Page 18",
    attributes: ["Short black hair", "Green eyes", "Mechanic outfit", "Wrench weapon"],
    status: "Active",
  },
  {
    name: "Marcus Cole",
    role: "Protagonist",
    comic: "Shadow Walker Chronicles",
    appearances: 18,
    lastSeen: "Page 18",
    attributes: ["Brown skin", "Bald head", "Shadow powers", "Tactical vest"],
    status: "Active",
  },
  {
    name: "Aria Voss",
    role: "Protagonist",
    comic: "Neon Dreams",
    appearances: 8,
    lastSeen: "Page 8",
    attributes: ["Pink hair", "Neon tattoos", "DJ headphones", "Street wear"],
    status: "Active",
  },
  {
    name: "General Thorne",
    role: "Antagonist",
    comic: "Iron Legacy",
    appearances: 14,
    lastSeen: "Page 16",
    attributes: ["Military uniform", "Steel jaw implant", "Gray hair", "Authority aura"],
    status: "Active",
  },
];

const memoryLayers = [
  {
    name: "Story Memory",
    icon: BookOpen,
    description: "Plot arcs, character relationships, dialogue patterns, story beats",
    size: "2.4 MB",
    entries: 847,
    health: 94,
    color: "#E8B931",
  },
  {
    name: "Visual Memory",
    icon: Eye,
    description: "Character designs, art style consistency, color palettes, environment details",
    size: 5.8,
    entries: 1243,
    health: 91,
    color: "#E8B931",
  },
  {
    name: "Panel Memory",
    icon: Layers,
    description: "Layout patterns, panel compositions, pacing rhythm, page flow",
    size: "1.2 MB",
    entries: 412,
    health: 97,
    color: "#E8B931",
  },
];

const recentMemoryEvents = [
  { action: "Character updated", detail: "Kai Nakamura — new scar detail added", time: "2 hours ago", type: "character" },
  { action: "Style locked", detail: "The Last Cyberpunk — noir-cyberpunk palette saved", time: "5 hours ago", type: "visual" },
  { action: "Plot node added", detail: "Shadow Walker — betrayal arc checkpoint", time: "Yesterday", type: "story" },
  { action: "Compression run", detail: "Iron Legacy — 5% memory compressed (32 pages)", time: "2 days ago", type: "system" },
  { action: "New character", detail: "Aria Voss — initial design stored", time: "3 days ago", type: "character" },
  { action: "Layout learned", detail: "Neon Dreams — 3-panel action layout pattern", time: "4 days ago", type: "panel" },
];

export default function MemoryBankPage() {
  const [activeTab, setActiveTab] = useState<MemoryTab>("overview");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCharacters = characters.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.comic.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div className="space-y-1">
        <h2 className="text-2xl font-black text-[#F5F5F0] tracking-tight">
          <span className="text-stroke">MEMORY</span> Bank
        </h2>
        <p className="text-sm text-[#666]">
          Three-layer memory system keeping your comics consistent across every page.
        </p>
      </div>

      {/* Memory health overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {memoryLayers.map((layer) => (
          <div key={layer.name} className="bg-[#111] border border-[#222] p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-[#E8B931]/10 flex items-center justify-center">
                  <layer.icon className="w-4 h-4 text-[#E8B931]" />
                </div>
                <div>
                  <div className="text-sm font-bold text-[#F5F5F0]">{layer.name}</div>
                  <div className="text-[10px] text-[#555] tracking-widest uppercase">
                    {layer.entries} entries
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-black text-[#E8B931]">{layer.health}%</div>
                <div className="text-[10px] text-[#555] uppercase">Health</div>
              </div>
            </div>
            {/* Health bar */}
            <div className="w-full h-1.5 bg-[#222] mb-3">
              <div
                className="h-full bg-[#E8B931]"
                style={{ width: `${layer.health}%` }}
              />
            </div>
            <div className="text-xs text-[#666] leading-relaxed">
              {layer.description}
            </div>
            <div className="mt-3 pt-3 border-t border-[#222] flex items-center justify-between">
              <span className="text-[10px] text-[#555] uppercase tracking-wider">
                Size: {layer.size}
              </span>
              <span className="text-[10px] text-[#555] uppercase tracking-wider flex items-center gap-1">
                Active <div className="w-1.5 h-1.5 bg-[#E8B931] rounded-full" />
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#111] border border-[#222] p-4">
          <div className="text-xs text-[#666] tracking-[0.15em] uppercase mb-1">Total Memory</div>
          <div className="text-2xl font-black text-[#E8B931]">9.4 MB</div>
          <div className="text-xs text-[#555]">Across all comics</div>
        </div>
        <div className="bg-[#111] border border-[#222] p-4">
          <div className="text-xs text-[#666] tracking-[0.15em] uppercase mb-1">Characters</div>
          <div className="text-2xl font-black text-[#E8B931]">38</div>
          <div className="text-xs text-[#555]">Fully tracked</div>
        </div>
        <div className="bg-[#111] border border-[#222] p-4">
          <div className="text-xs text-[#666] tracking-[0.15em] uppercase mb-1">Compression</div>
          <div className="text-2xl font-black text-[#E8B931]">5%</div>
          <div className="text-xs text-[#555]">Auto-optimized</div>
        </div>
        <div className="bg-[#111] border border-[#222] p-4">
          <div className="text-xs text-[#666] tracking-[0.15em] uppercase mb-1">Consistency</div>
          <div className="text-2xl font-black text-[#E8B931]">94%</div>
          <div className="text-xs text-[#555]">Cross-page score</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-[#222]">
        {[
          { key: "overview" as MemoryTab, label: "Overview" },
          { key: "characters" as MemoryTab, label: "Characters" },
          { key: "visual" as MemoryTab, label: "Visual Style" },
          { key: "panels" as MemoryTab, label: "Panel Layouts" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-3 text-xs tracking-widest uppercase transition-colors ${
              activeTab === tab.key
                ? "text-[#E8B931] border-b-2 border-[#E8B931]"
                : "text-[#666]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Memory timeline */}
          <div className="bg-[#111] border border-[#222] p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-xs font-bold text-[#E8B931] tracking-[0.2em] uppercase">
                Memory Activity
              </h3>
              <button className="text-xs text-[#666] tracking-wide uppercase flex items-center gap-1">
                View All <ChevronRight className="w-3 h-3" />
              </button>
            </div>
            <div className="space-y-4">
              {recentMemoryEvents.map((event, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className={`w-2 h-2 mt-1.5 flex-shrink-0 rounded-full ${
                    event.type === "character" ? "bg-[#E8B931]" :
                    event.type === "visual" ? "bg-[#999]" :
                    event.type === "story" ? "bg-[#E8B931]/60" :
                    "bg-[#555]"
                  }`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-[#F5F5F0]">{event.action}</span>
                      <span className="text-[10px] text-[#555] tracking-widest uppercase border border-[#333] px-1.5 py-0.5">
                        {event.type}
                      </span>
                    </div>
                    <p className="text-xs text-[#666] mt-0.5">{event.detail}</p>
                    <p className="text-[10px] text-[#555] mt-0.5">{event.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Compression info */}
          <div className="bg-[#111] border border-[#222] p-6">
            <h3 className="text-xs font-bold text-[#E8B931] tracking-[0.2em] uppercase mb-4">
              Compression Engine
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-[#0A0A0A] border border-[#222] p-4">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="w-4 h-4 text-[#E8B931]" />
                  <span className="text-xs text-[#F5F5F0] font-bold uppercase tracking-wider">Trigger</span>
                </div>
                <p className="text-xs text-[#666] leading-relaxed">
                  Automatically compresses oldest memory entries when a comic exceeds 50 pages. Story beats are summarized, visual references are deduplicated, and panel patterns are averaged.
                </p>
              </div>
              <div className="bg-[#0A0A0A] border border-[#222] p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Database className="w-4 h-4 text-[#E8B931]" />
                  <span className="text-xs text-[#F5F5F0] font-bold uppercase tracking-wider">Strategy</span>
                </div>
                <p className="text-xs text-[#666] leading-relaxed">
                  Story memory uses narrative summarization. Visual memory keeps a reference image set with style vectors. Panel memory stores layout templates as compressed JSON blueprints.
                </p>
              </div>
              <div className="bg-[#0A0A0A] border border-[#222] p-4">
                <div className="flex items-center gap-2 mb-3">
                  <RefreshCw className="w-4 h-4 text-[#E8B931]" />
                  <span className="text-xs text-[#F5F5F0] font-bold uppercase tracking-wider">Retention</span>
                </div>
                <p className="text-xs text-[#666] leading-relaxed">
                  Character core traits and key story events are never compressed. Only redundant visual details and repeated panel layouts are optimized. First and last 10 pages always fully preserved.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "characters" && (
        <div className="space-y-4">
          {/* Search */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#555]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search characters by name or comic..."
              className="w-full pl-10 pr-4 py-3 bg-[#111] border border-[#222] text-sm text-[#F5F5F0] placeholder:text-[#444] focus:border-[#E8B931] focus:outline-none"
            />
          </div>

          {/* Characters list */}
          <div className="space-y-3">
            {filteredCharacters.map((char) => (
              <div key={char.name} className="bg-[#111] border border-[#222] p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#222] flex items-center justify-center text-xs font-bold text-[#E8B931]">
                      {char.name.split(" ").map((n) => n[0]).join("")}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-[#F5F5F0]">{char.name}</div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-[#E8B931] tracking-widest uppercase border border-[#E8B931]/30 px-1.5 py-0.5">
                          {char.role}
                        </span>
                        <span className="text-[10px] text-[#555]">
                          {char.comic}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-[#E8B931]">{char.appearances}</div>
                    <div className="text-[10px] text-[#555]">Pages</div>
                  </div>
                </div>

                {/* Attributes */}
                <div className="flex flex-wrap gap-2 mb-3">
                  {char.attributes.map((attr) => (
                    <span
                      key={attr}
                      className="text-[10px] text-[#999] bg-[#0A0A0A] border border-[#222] px-2 py-1 tracking-wide"
                    >
                      {attr}
                    </span>
                  ))}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-[#222]">
                  <span className="text-[10px] text-[#555]">
                    Last seen: {char.lastSeen}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-[#555] uppercase tracking-wider flex items-center gap-1">
                      Tracked <div className="w-1.5 h-1.5 bg-[#E8B931] rounded-full" />
                    </span>
                    <button className="text-[#555] p-1">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "visual" && (
        <div className="space-y-6">
          {/* Art styles per comic */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                title: "The Last Cyberpunk",
                style: "Noir-Cyberpunk",
                palette: ["#0D0D0D", "#1A1A2E", "#E8B931", "#C73E1D", "#4A4A6A"],
                panels: 24,
                locked: true,
              },
              {
                title: "Shadow Walker Chronicles",
                style: "Dark Fantasy",
                palette: ["#0A0A0A", "#1C1C2E", "#7B68EE", "#2F4F4F", "#8B4513"],
                panels: 18,
                locked: true,
              },
              {
                title: "Neon Dreams",
                style: "Synthwave Pop",
                palette: ["#0A0A0A", "#FF006E", "#00F5FF", "#FEE440", "#8338EC"],
                panels: 8,
                locked: false,
              },
              {
                title: "Iron Legacy",
                style: "Military Realism",
                palette: ["#1A1A1A", "#3B3B3B", "#8B7355", "#556B2F", "#B8860B"],
                panels: 16,
                locked: true,
              },
            ].map((comic) => (
              <div key={comic.title} className="bg-[#111] border border-[#222] p-5">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="text-sm font-bold text-[#F5F5F0]">{comic.title}</div>
                    <div className="text-[10px] text-[#E8B931] tracking-widest uppercase mt-0.5">
                      {comic.style}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] tracking-widest uppercase border px-1.5 py-0.5 ${
                      comic.locked ? "border-[#E8B931]/30 text-[#E8B931]" : "border-[#555] text-[#555]"
                    }`}>
                      {comic.locked ? "Locked" : "Draft"}
                    </span>
                  </div>
                </div>

                {/* Color palette */}
                <div className="flex gap-2 mb-3">
                  {comic.palette.map((color, i) => (
                    <div key={i} className="flex-1">
                      <div
                        className="w-full h-8 border border-[#333]"
                        style={{ backgroundColor: color }}
                      />
                      <div className="text-[8px] text-[#555] text-center mt-1 font-mono">{color}</div>
                    </div>
                  ))}
                </div>

                <div className="text-[10px] text-[#555]">
                  {comic.panels} panels referenced
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "panels" && (
        <div className="space-y-6">
          {/* Layout templates */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { name: "Standard 3-Panel", uses: 42, comic: "The Last Cyberpunk" },
              { name: "Action Splash", uses: 28, comic: "Shadow Walker" },
              { name: "Dialogue 2-Panel", uses: 35, comic: "The Last Cyberpunk" },
              { name: "Wide Establishing", uses: 18, comic: "Neon Dreams" },
              { name: "Grid 6-Panel", uses: 22, comic: "Iron Legacy" },
              { name: "Vertical Stack", uses: 15, comic: "Shadow Walker" },
              { name: "Asymmetric Split", uses: 12, comic: "Neon Dreams" },
              { name: "Double Splash", uses: 8, comic: "The Last Cyberpunk" },
              { name: "Inset Overlay", uses: 10, comic: "Iron Legacy" },
            ].map((layout) => (
              <div key={layout.name} className="bg-[#111] border border-[#222] p-4">
                {/* Mini layout preview */}
                <div className="h-24 bg-[#0A0A0A] border border-[#222] mb-3 flex items-center justify-center p-3">
                  <div className="w-full h-full grid grid-cols-3 gap-1">
                    <div className="bg-[#222]/60 col-span-2" />
                    <div className="bg-[#222]/60" />
                    <div className="bg-[#222]/60" />
                    <div className="bg-[#222]/60" />
                  </div>
                </div>
                <div className="text-sm font-bold text-[#F5F5F0]">{layout.name}</div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-[10px] text-[#555]">{layout.comic}</span>
                  <span className="text-[10px] text-[#E8B931]">{layout.uses} uses</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
