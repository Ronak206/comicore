"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Sparkles,
  BookOpen,
  Users,
  Globe,
  Palette,
  MessageSquare,
  LayoutGrid,
  ChevronRight,
  ChevronDown,
  GripVertical,
  X,
  Zap,
  Eye,
  RotateCcw,
  Check,
  FileText,
  Layers,
  Image,
} from "lucide-react";

type WorkspaceTab = "story" | "characters" | "world" | "style" | "pages";

// Dummy project data
const projectData: Record<string, {
  title: string;
  genre: string;
  status: string;
  pages: number;
  totalPages: number;
}> = {
  "1": { title: "The Last Cyberpunk", genre: "Sci-Fi / Noir", status: "In Progress", pages: 24, totalPages: 32 },
  "2": { title: "Shadow Walker Chronicles", genre: "Dark Fantasy", status: "In Progress", pages: 18, totalPages: 24 },
  "3": { title: "Neon Dreams", genre: "Sci-Fi / Slice of Life", status: "Draft", pages: 8, totalPages: 12 },
  "4": { title: "Dark Horizon", genre: "Post-Apocalyptic", status: "Completed", pages: 32, totalPages: 32 },
  "5": { title: "Iron Legacy", genre: "Military Sci-Fi", status: "In Progress", pages: 16, totalPages: 20 },
  "6": { title: "Void Runners", genre: "Space Opera", status: "Completed", pages: 12, totalPages: 12 },
};

export default function ComicWorkspacePage() {
  const params = useParams();
  const id = params?.id as string || "1";
  const project = projectData[id] || projectData["1"];

  const [activeTab, setActiveTab] = useState<WorkspaceTab>("story");
  const [storyForm, setStoryForm] = useState({
    title: project.title,
    genre: project.genre,
    synopsis: "In a neon-soaked megacity of 2087, a rogue hacker with a cybernetic arm uncovers a conspiracy that threatens to rewrite the memories of every citizen. Armed with forbidden tech and a scar from a war she can't remember, she must race against time before the city forgets who it is.",
    tone: "Dark, gritty, with moments of dark humor",
    targetAudience: "Young Adult / Adult",
    pageGoal: project.totalPages.toString(),
    style: "noir-cyberpunk",
  });

  const [characters, setCharacters] = useState([
    { id: 1, name: "Kai Nakamura", role: "Protagonist", description: "A 28-year-old hacker with a cybernetic right arm and a scar across her left eye. She wears a battered black trench coat over metal-studded armor. Sarcastic exterior, deeply loyal to those she trusts.", appearance: "Silver-white short hair, cybernetic right arm (chrome with gold accents), scar across left eye (vertical), black trench coat, combat boots, red goggles on forehead", personality: "Cynical but caring, brilliant strategist, afraid of losing memories, loves junk food" },
    { id: 2, name: "Zero", role: "Antagonist", description: "A faceless entity that appears as a tall figure in a white porcelain mask. Never speaks directly. Controls the city's memory network and believes erasing painful memories creates a better world.", appearance: "Tall gaunt silhouette, white porcelain mask (no features), flowing dark coat, hands always gloved, eyes emit dim red glow through mask", personality: "Coldly logical, believes suffering is unnecessary, genuinely thinks they are saving people" },
    { id: 3, name: "Doc Mira", role: "Supporting", description: "A street-level cybernetics doctor who runs an underground clinic. She's Kai's oldest friend and the only person who knows about Kai's missing memories. Wears oversized welding goggles.", appearance: "Brown skin, short curly hair (dyed blue tips), oversized welding goggles on head, lab coat covered in tool patches, multiple tool belts, heavy boots", personality: "Warm, motherly, fiercely protective, terrible cook, tells terrible jokes" },
  ]);
  const [nextCharId, setNextCharId] = useState(4);

  const [worldForm, setWorldForm] = useState({
    setting: "Neo-Tokyo 2087 — a massive megacity divided into Upper Districts (corporate towers, clean, sterile) and Lower Districts (neon-lit streets, crowded, dangerous). A massive wall separates them.",
    timePeriod: "Late 21st Century (2087)",
    atmosphere: "Rain-soaked streets, neon reflections on wet pavement, constant surveillance drones, smog layering the sky. Holographic ads everywhere. The rich live above the clouds, the poor below the smog.",
    technology: "Cybernetic implants (arms, eyes, neural links), memory-editing tech (government controlled), AI companions, hover vehicles, holographic displays, neural networks",
    keyLocations: "The Memory Tower (government HQ), Kai's Hideout (abandoned subway station), Neon Market (underground tech bazaar), The Wall (divider between districts), Doc Mira's Clinic (lower district)",
    rules: "Memory tech is government-monitored. Illegal memory editing is punishable by 'full wipe.' The Lower Districts have no official police — ruled by corps. Neural implants have a 10-year lifespan before rejection.",
  });

  const [styleForm, setStyleForm] = useState({
    artStyle: "noir-cyberpunk",
    colorPalette: "dominated-dark",
    panelDensity: "medium",
    speechBubbleStyle: "standard",
    narrationStyle: "present",
    detailLevel: "high",
    referenceNotes: "Inspired by Blade Runner 2049, Ghost in the Shell (1995), Akira. Heavy shadows, rain effects, neon color pops on dark backgrounds. Characters should feel weathered and real.",
  });

  const [pages, setPages] = useState([
    { id: 1, number: 1, title: "The Awakening", status: "approved", panels: 4 },
    { id: 2, number: 2, title: "Neon Streets", status: "approved", panels: 5 },
    { id: 3, number: 3, title: "The Job", status: "approved", panels: 4 },
    { id: 4, number: 4, title: "Flashback — The War", status: "approved", panels: 6 },
    { id: 5, number: 5, title: "Doc's Clinic", status: "approved", panels: 3 },
    { id: 6, number: 6, title: "First Contact", status: "approved", panels: 5 },
    { id: 7, number: 7, title: "The Memory Tower", status: "approved", panels: 4 },
    { id: 8, number: 8, title: "Chase Sequence", status: "approved", panels: 6 },
    { id: 9, number: 9, title: "Revelation", status: "in-review", panels: 4 },
    { id: 10, number: 10, title: "The Betrayal", status: "generating", panels: 5 },
  ]);

  const [selectedPage, setSelectedPage] = useState<number | null>(9);

  const addCharacter = () => {
    setCharacters([...characters, {
      id: nextCharId,
      name: "",
      role: "Supporting",
      description: "",
      appearance: "",
      personality: "",
    }]);
    setNextCharId(nextCharId + 1);
  };

  const removeCharacter = (charId: number) => {
    setCharacters(characters.filter((c) => c.id !== charId));
  };

  const updateCharacter = (charId: number, field: string, value: string) => {
    setCharacters(characters.map((c) => c.id === charId ? { ...c, [field]: value } : c));
  };

  const tabs: { key: WorkspaceTab; label: string; icon: typeof BookOpen }[] = [
    { key: "story", label: "Story", icon: BookOpen },
    { key: "characters", label: "Characters", icon: Users },
    { key: "world", label: "World", icon: Globe },
    { key: "style", label: "Art Style", icon: Palette },
    { key: "pages", label: "Pages", icon: LayoutGrid },
  ];

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-[#666] tracking-wide">
        <Link href="/dashboard" className="uppercase flex items-center gap-1">
          <ArrowLeft className="w-3 h-3" />
          Dashboard
        </Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-[#F5F5F0] uppercase">{project.title}</span>
      </div>

      {/* Project header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-[#F5F5F0] tracking-tight">
            {storyForm.title}
          </h2>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-xs text-[#E8B931] tracking-widest uppercase">{storyForm.genre}</span>
            <span className="text-[10px] text-[#555]">|</span>
            <span className="text-xs text-[#666]">Page {project.pages} of {project.totalPages}</span>
            <span className={`text-[10px] tracking-widest uppercase border px-1.5 py-0.5 ${
              project.status === "Completed" ? "border-[#E8B931]/40 text-[#E8B931]" :
              project.status === "In Progress" ? "border-[#999]/40 text-[#999]" :
              "border-[#555]/40 text-[#555]"
            }`}>
              {project.status}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="px-4 py-2.5 bg-[#E8B931] text-[#0A0A0A] font-bold tracking-[0.1em] uppercase text-xs flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5" />
            Generate Next Page
          </button>
          <button className="px-4 py-2.5 border border-[#333] text-[#F5F5F0] text-xs tracking-wide uppercase flex items-center gap-2">
            <Eye className="w-3.5 h-3.5" />
            Preview
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-[#222] overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-3 text-xs tracking-widest uppercase whitespace-nowrap transition-colors ${
              activeTab === tab.key
                ? "text-[#E8B931] border-b-2 border-[#E8B931]"
                : "text-[#666]"
            }`}
          >
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
            {tab.key === "characters" && (
              <span className="bg-[#E8B931]/10 text-[#E8B931] px-1.5 py-0.5 text-[10px]">{characters.length}</span>
            )}
            {tab.key === "pages" && (
              <span className="bg-[#E8B931]/10 text-[#E8B931] px-1.5 py-0.5 text-[10px]">{pages.length}</span>
            )}
          </button>
        ))}
      </div>

      {/* ========== STORY TAB ========== */}
      {activeTab === "story" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-5">
            <div className="bg-[#111] border border-[#222] p-6 space-y-5">
              <h3 className="text-xs font-bold text-[#E8B931] tracking-[0.2em] uppercase">
                Story Details
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs text-[#E8B931] tracking-[0.15em] uppercase block">Comic Title</label>
                  <input
                    type="text"
                    value={storyForm.title}
                    onChange={(e) => setStoryForm({ ...storyForm, title: e.target.value })}
                    className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#222] text-sm text-[#F5F5F0] focus:border-[#E8B931] focus:outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-[#E8B931] tracking-[0.15em] uppercase block">Genre</label>
                  <input
                    type="text"
                    value={storyForm.genre}
                    onChange={(e) => setStoryForm({ ...storyForm, genre: e.target.value })}
                    className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#222] text-sm text-[#F5F5F0] focus:border-[#E8B931] focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs text-[#E8B931] tracking-[0.15em] uppercase block">Synopsis</label>
                <textarea
                  value={storyForm.synopsis}
                  onChange={(e) => setStoryForm({ ...storyForm, synopsis: e.target.value })}
                  rows={6}
                  className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#222] text-sm text-[#F5F5F0] focus:border-[#E8B931] focus:outline-none resize-none leading-relaxed"
                  placeholder="Describe the overall story, main conflict, and what the reader should feel..."
                />
                <div className="text-[10px] text-[#555]">{storyForm.synopsis.length} characters</div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs text-[#E8B931] tracking-[0.15em] uppercase block">Tone / Mood</label>
                  <input
                    type="text"
                    value={storyForm.tone}
                    onChange={(e) => setStoryForm({ ...storyForm, tone: e.target.value })}
                    className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#222] text-sm text-[#F5F5F0] focus:border-[#E8B931] focus:outline-none"
                    placeholder="Dark, humorous, suspenseful..."
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-[#E8B931] tracking-[0.15em] uppercase block">Target Audience</label>
                  <select
                    value={storyForm.targetAudience}
                    onChange={(e) => setStoryForm({ ...storyForm, targetAudience: e.target.value })}
                    className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#222] text-sm text-[#F5F5F0] focus:border-[#E8B931] focus:outline-none appearance-none"
                  >
                    <option value="All Ages">All Ages</option>
                    <option value="Young Adult">Young Adult (13+)</option>
                    <option value="Young Adult / Adult">Young Adult / Adult (16+)</option>
                    <option value="Adult">Adult (18+)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs text-[#E8B931] tracking-[0.15em] uppercase block">Page Goal</label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    value={storyForm.pageGoal}
                    onChange={(e) => setStoryForm({ ...storyForm, pageGoal: e.target.value })}
                    className="w-24 px-4 py-3 bg-[#0A0A0A] border border-[#222] text-sm text-[#F5F5F0] focus:border-[#E8B931] focus:outline-none"
                    min={1}
                    max={500}
                  />
                  <span className="text-xs text-[#555]">pages total</span>
                  <div className="flex-1 h-1.5 bg-[#222]">
                    <div
                      className="h-full bg-[#E8B931]"
                      style={{ width: `${(project.pages / parseInt(storyForm.pageGoal || "1")) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-[#E8B931] font-bold">{project.pages}/{storyForm.pageGoal}</span>
                </div>
              </div>
            </div>

            {/* Scene breakdown */}
            <div className="bg-[#111] border border-[#222] p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-bold text-[#E8B931] tracking-[0.2em] uppercase">
                  Story Beats / Key Scenes
                </h3>
                <button className="text-[10px] text-[#666] tracking-wide uppercase flex items-center gap-1">
                  <Plus className="w-3 h-3" /> Add Beat
                </button>
              </div>
              <div className="space-y-3">
                {[
                  { num: "01", title: "Inciting Incident", desc: "Kai discovers her memories have been tampered with during a routine hack job", page: "1-3" },
                  { num: "02", title: "Rising Action", desc: "She investigates and finds traces of Zero's network in the city's underground", page: "4-10" },
                  { num: "03", title: "Midpoint Reveal", desc: "Kai learns the Memory Tower is planning a city-wide memory wipe scheduled in 48 hours", page: "11-16" },
                  { num: "04", title: "Dark Moment", desc: "Doc Mira is captured. Kai's own cybernetic arm begins malfunctioning", page: "17-22" },
                  { num: "05", title: "Climax", desc: "Kai infiltrates the Memory Tower and confronts Zero face to face", page: "23-28" },
                  { num: "06", title: "Resolution", desc: "The wipe is stopped but at a cost — Kai's own memories are partially restored", page: "29-32" },
                ].map((beat) => (
                  <div key={beat.num} className="flex items-start gap-3 p-3 bg-[#0A0A0A] border border-[#222]">
                    <div className="w-7 h-7 bg-[#E8B931] text-[#0A0A0A] text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                      {beat.num}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#F5F5F0]">{beat.title}</span>
                        <span className="text-[10px] text-[#555]">Pages {beat.page}</span>
                      </div>
                      <p className="text-[11px] text-[#666] mt-1 leading-relaxed">{beat.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Story sidebar */}
          <div className="space-y-5">
            <div className="bg-[#111] border border-[#222] p-5">
              <h3 className="text-xs font-bold text-[#E8B931] tracking-[0.2em] uppercase mb-4">
                Story Summary
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-[#222]">
                  <span className="text-xs text-[#666]">Characters</span>
                  <span className="text-sm font-bold text-[#F5F5F0]">{characters.length}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-[#222]">
                  <span className="text-xs text-[#666]">Story Beats</span>
                  <span className="text-sm font-bold text-[#F5F5F0]">6</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-[#222]">
                  <span className="text-xs text-[#666]">Pages Done</span>
                  <span className="text-sm font-bold text-[#F5F5F0]">{project.pages}/{project.totalPages}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-[#222]">
                  <span className="text-xs text-[#666]">Memory Health</span>
                  <span className="text-sm font-bold text-[#E8B931]">94%</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-xs text-[#666]">Status</span>
                  <span className="text-[10px] tracking-widest uppercase border border-[#999]/40 text-[#999] px-2 py-0.5">
                    {project.status}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-[#111] border border-[#222] p-5">
              <h3 className="text-xs font-bold text-[#E8B931] tracking-[0.2em] uppercase mb-4">
                Generation Prompt
              </h3>
              <p className="text-[10px] text-[#555] mb-3">This prompt will be used for the next page generation.</p>
              <div className="bg-[#0A0A0A] border border-[#222] p-3">
                <p className="text-xs text-[#999] leading-relaxed">
                  Continue &quot;{storyForm.title}&quot; — After the confrontation with Zero, Kai escapes into the Lower Districts with a damaged cybernetic arm. She finds Doc Mira&apos;s clinic locked down. Mood: tense, urgent. Style: noir-cyberpunk with heavy rain.
                </p>
              </div>
              <textarea
                className="w-full mt-3 px-3 py-2 bg-[#0A0A0A] border border-[#222] text-xs text-[#F5F5F0] focus:border-[#E8B931] focus:outline-none resize-none"
                rows={4}
                placeholder="Edit the generation prompt or add specific instructions..."
              />
            </div>

            <div className="bg-[#111] border border-[#222] p-5">
              <h3 className="text-xs font-bold text-[#E8B931] tracking-[0.2em] uppercase mb-4">
                Dialogue Input
              </h3>
              <p className="text-[10px] text-[#555] mb-3">Add specific dialogue for the next page.</p>
              <textarea
                className="w-full px-3 py-2 bg-[#0A0A0A] border border-[#222] text-xs text-[#F5F5F0] focus:border-[#E8B931] focus:outline-none resize-none"
                rows={4}
                placeholder={`KAI: "We need to move. Now."\nDOC MIRA: "Your arm is sparking again."\nKAI: "I know. I know."`}
              />
            </div>
          </div>
        </div>
      )}

      {/* ========== CHARACTERS TAB ========== */}
      {activeTab === "characters" && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-[#E8B931] tracking-[0.2em] uppercase">
              Characters ({characters.length})
            </h3>
            <button
              onClick={addCharacter}
              className="px-4 py-2.5 bg-[#E8B931] text-[#0A0A0A] font-bold tracking-[0.1em] uppercase text-xs flex items-center gap-2"
            >
              <Plus className="w-3.5 h-3.5" /> Add Character
            </button>
          </div>

          {characters.map((char) => (
            <div key={char.id} className="bg-[#111] border border-[#222] p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#222] flex items-center justify-center text-xs font-bold text-[#E8B931]">
                    {char.name ? char.name.split(" ").map((n) => n[0]).join("") : "?"}
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={char.role}
                      onChange={(e) => updateCharacter(char.id, "role", e.target.value)}
                      className="text-[10px] tracking-widest uppercase border px-2 py-0.5 bg-[#0A0A0A] border-[#E8B931]/30 text-[#E8B931] appearance-none focus:outline-none"
                    >
                      <option value="Protagonist">Protagonist</option>
                      <option value="Antagonist">Antagonist</option>
                      <option value="Deuteragonist">Deuteragonist</option>
                      <option value="Supporting">Supporting</option>
                      <option value="Minor">Minor</option>
                    </select>
                  </div>
                </div>
                {characters.length > 1 && (
                  <button
                    onClick={() => removeCharacter(char.id)}
                    className="text-[#555] p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="space-y-2">
                  <label className="text-xs text-[#E8B931] tracking-[0.15em] uppercase block">Name</label>
                  <input
                    type="text"
                    value={char.name}
                    onChange={(e) => updateCharacter(char.id, "name", e.target.value)}
                    placeholder="Character name"
                    className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#222] text-sm text-[#F5F5F0] focus:border-[#E8B931] focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <label className="text-xs text-[#E8B931] tracking-[0.15em] uppercase block">Description / Backstory</label>
                <textarea
                  value={char.description}
                  onChange={(e) => updateCharacter(char.id, "description", e.target.value)}
                  rows={2}
                  className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#222] text-sm text-[#F5F5F0] focus:border-[#E8B931] focus:outline-none resize-none"
                  placeholder="Who is this character? What drives them?"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs text-[#E8B931] tracking-[0.15em] uppercase block">Visual Appearance</label>
                  <textarea
                    value={char.appearance}
                    onChange={(e) => updateCharacter(char.id, "appearance", e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#222] text-sm text-[#F5F5F0] focus:border-[#E8B931] focus:outline-none resize-none"
                    placeholder="Hair, eyes, build, clothing, distinguishing features..."
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-[#E8B931] tracking-[0.15em] uppercase block">Personality & Traits</label>
                  <textarea
                    value={char.personality}
                    onChange={(e) => updateCharacter(char.id, "personality", e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#222] text-sm text-[#F5F5F0] focus:border-[#E8B931] focus:outline-none resize-none"
                    placeholder="Personality traits, fears, habits, relationships..."
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ========== WORLD TAB ========== */}
      {activeTab === "world" && (
        <div className="space-y-5">
          <div className="bg-[#111] border border-[#222] p-6 space-y-5">
            <h3 className="text-xs font-bold text-[#E8B931] tracking-[0.2em] uppercase">
              World Building
            </h3>

            <div className="space-y-2">
              <label className="text-xs text-[#E8B931] tracking-[0.15em] uppercase block">Setting Description</label>
              <textarea
                value={worldForm.setting}
                onChange={(e) => setWorldForm({ ...worldForm, setting: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#222] text-sm text-[#F5F5F0] focus:border-[#E8B931] focus:outline-none resize-none leading-relaxed"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs text-[#E8B931] tracking-[0.15em] uppercase block">Time Period</label>
                <input
                  type="text"
                  value={worldForm.timePeriod}
                  onChange={(e) => setWorldForm({ ...worldForm, timePeriod: e.target.value })}
                  className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#222] text-sm text-[#F5F5F0] focus:border-[#E8B931] focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs text-[#E8B931] tracking-[0.15em] uppercase block">Atmosphere & Mood</label>
              <textarea
                value={worldForm.atmosphere}
                onChange={(e) => setWorldForm({ ...worldForm, atmosphere: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#222] text-sm text-[#F5F5F0] focus:border-[#E8B931] focus:outline-none resize-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs text-[#E8B931] tracking-[0.15em] uppercase block">Technology & Magic Systems</label>
              <textarea
                value={worldForm.technology}
                onChange={(e) => setWorldForm({ ...worldForm, technology: e.target.value })}
                rows={2}
                className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#222] text-sm text-[#F5F5F0] focus:border-[#E8B931] focus:outline-none resize-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs text-[#E8B931] tracking-[0.15em] uppercase block">Key Locations</label>
              <textarea
                value={worldForm.keyLocations}
                onChange={(e) => setWorldForm({ ...worldForm, keyLocations: e.target.value })}
                rows={2}
                className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#222] text-sm text-[#F5F5F0] focus:border-[#E8B931] focus:outline-none resize-none"
                placeholder="Name — brief description, separated by commas or new lines"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs text-[#E8B931] tracking-[0.15em] uppercase block">World Rules & Laws</label>
              <textarea
                value={worldForm.rules}
                onChange={(e) => setWorldForm({ ...worldForm, rules: e.target.value })}
                rows={2}
                className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#222] text-sm text-[#F5F5F0] focus:border-[#E8B931] focus:outline-none resize-none"
                placeholder="Any rules, laws, or constraints that exist in this world..."
              />
            </div>
          </div>
        </div>
      )}

      {/* ========== ART STYLE TAB ========== */}
      {activeTab === "style" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-[#111] border border-[#222] p-6 space-y-5">
            <h3 className="text-xs font-bold text-[#E8B931] tracking-[0.2em] uppercase">
              Visual Style
            </h3>

            <div className="space-y-2">
              <label className="text-xs text-[#E8B931] tracking-[0.15em] uppercase block">Art Style</label>
              <select
                value={styleForm.artStyle}
                onChange={(e) => setStyleForm({ ...styleForm, artStyle: e.target.value })}
                className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#222] text-sm text-[#F5F5F0] focus:border-[#E8B931] focus:outline-none appearance-none"
              >
                <option value="noir-cyberpunk">Noir-Cyberpunk</option>
                <option value="dark-fantasy">Dark Fantasy</option>
                <option value="synthwave-pop">Synthwave Pop</option>
                <option value="military-realism">Military Realism</option>
                <option value="manga">Manga (Japanese)</option>
                <option value="manhwa">Manhwa (Korean)</option>
                <option value="watercolor">Watercolor</option>
                <option value="comic-book">Classic Comic Book</option>
                <option value="minimalist">Minimalist</option>
                <option value="photorealistic">Photorealistic</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs text-[#E8B931] tracking-[0.15em] uppercase block">Color Palette</label>
              <select
                value={styleForm.colorPalette}
                onChange={(e) => setStyleForm({ ...styleForm, colorPalette: e.target.value })}
                className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#222] text-sm text-[#F5F5F0] focus:border-[#E8B931] focus:outline-none appearance-none"
              >
                <option value="dominated-dark">Dark Dominated (Shadows, neon accents)</option>
                <option value="full-color">Full Color (Vibrant, saturated)</option>
                <option value="muted-pastel">Muted / Pastel</option>
                <option value="monochrome">Monochrome / Grayscale</option>
                <option value="sepia">Sepia / Vintage</option>
                <option value="high-contrast">High Contrast (Bold blacks, bright highlights)</option>
              </select>
              {/* Color preview */}
              <div className="flex gap-1 mt-2">
                {["#0D0D0D", "#1A1A2E", "#E8B931", "#C73E1D", "#4A4A6A"].map((c, i) => (
                  <div key={i} className="flex-1 h-6 border border-[#333]" style={{ backgroundColor: c }} />
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs text-[#E8B931] tracking-[0.15em] uppercase block">Panel Density</label>
              <select
                value={styleForm.panelDensity}
                onChange={(e) => setStyleForm({ ...styleForm, panelDensity: e.target.value })}
                className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#222] text-sm text-[#F5F5F0] focus:border-[#E8B931] focus:outline-none appearance-none"
              >
                <option value="sparse">Sparse (1-3 panels per page, cinematic)</option>
                <option value="medium">Medium (3-5 panels, balanced)</option>
                <option value="dense">Dense (5-8 panels, detailed)</option>
                <option value="variable">Variable (AI decides per scene)</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs text-[#E8B931] tracking-[0.15em] uppercase block">Detail Level</label>
                <select
                  value={styleForm.detailLevel}
                  onChange={(e) => setStyleForm({ ...styleForm, detailLevel: e.target.value })}
                  className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#222] text-sm text-[#F5F5F0] focus:border-[#E8B931] focus:outline-none appearance-none"
                >
                  <option value="high">High (Detailed)</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low (Stylized)</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs text-[#E8B931] tracking-[0.15em] uppercase block">Narration Style</label>
                <select
                  value={styleForm.narrationStyle}
                  onChange={(e) => setStyleForm({ ...styleForm, narrationStyle: e.target.value })}
                  className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#222] text-sm text-[#F5F5F0] focus:border-[#E8B931] focus:outline-none appearance-none"
                >
                  <option value="present">Present Tense</option>
                  <option value="past">Past Tense</option>
                  <option value="first-person">First Person</option>
                  <option value="no-narration">No Narration (Dialogue only)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-5">
            <div className="bg-[#111] border border-[#222] p-6 space-y-5">
              <h3 className="text-xs font-bold text-[#E8B931] tracking-[0.2em] uppercase">
                Speech Bubble Style
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: "standard", label: "Standard", desc: "Classic rounded bubbles" },
                  { id: "jagged", label: "Jagged / Explosive", desc: "For shouting, action" },
                  { id: "square", label: "Square / Rectangular", desc: "For AI, robots, narration" },
                  { id: "thought", label: "Thought Bubbles", desc: "Cloudy, for inner thoughts" },
                ].map((style) => (
                  <button
                    key={style.id}
                    className={`p-3 border text-left ${
                      styleForm.speechBubbleStyle === style.id ? "border-[#E8B931] bg-[#E8B931]/5" : "border-[#222] bg-[#0A0A0A]"
                    }`}
                    onClick={() => setStyleForm({ ...styleForm, speechBubbleStyle: style.id })}
                  >
                    <div className="text-xs font-medium text-[#F5F5F0]">{style.label}</div>
                    <div className="text-[10px] text-[#555] mt-0.5">{style.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-[#111] border border-[#222] p-6 space-y-4">
              <h3 className="text-xs font-bold text-[#E8B931] tracking-[0.2em] uppercase">
                Reference Notes
              </h3>
              <textarea
                value={styleForm.referenceNotes}
                onChange={(e) => setStyleForm({ ...styleForm, referenceNotes: e.target.value })}
                rows={6}
                className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#222] text-sm text-[#F5F5F0] focus:border-[#E8B931] focus:outline-none resize-none leading-relaxed"
                placeholder="Add visual references, inspirations, mood boards, or specific art directions..."
              />
              <p className="text-[10px] text-[#555]">
                Tip: Mention specific artists, movies, games, or comic series as style references. The more specific, the better the output.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ========== PAGES TAB ========== */}
      {activeTab === "pages" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Page list */}
          <div className="bg-[#111] border border-[#222] overflow-hidden">
            <div className="px-4 py-3 border-b border-[#222] flex items-center justify-between">
              <span className="text-xs font-bold text-[#E8B931] tracking-[0.2em] uppercase">All Pages</span>
              <span className="text-[10px] text-[#555]">{pages.length} pages</span>
            </div>
            <div className="max-h-[calc(100vh-280px)] overflow-y-auto">
              {pages.map((page) => (
                <button
                  key={page.id}
                  onClick={() => setSelectedPage(page.number)}
                  className={`w-full text-left px-4 py-3 border-b border-[#222]/50 flex items-center gap-3 ${
                    selectedPage === page.number ? "bg-[#E8B931]/5 border-l-2 border-l-[#E8B931]" : ""
                  }`}
                >
                  <div className={`w-7 h-7 flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${
                    page.status === "approved" ? "bg-[#E8B931]/20 text-[#E8B931]" :
                    page.status === "in-review" ? "bg-[#999]/20 text-[#999]" :
                    "bg-[#555]/20 text-[#555]"
                  }`}>
                    {page.number}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-[#F5F5F0] truncate">{page.title}</div>
                    <div className="text-[10px] text-[#555]">{page.panels} panels</div>
                  </div>
                  <span className={`text-[9px] tracking-widest uppercase px-1.5 py-0.5 border ${
                    page.status === "approved" ? "border-[#E8B931]/30 text-[#E8B931]" :
                    page.status === "in-review" ? "border-[#999]/30 text-[#999]" :
                    "border-[#555]/30 text-[#555]"
                  }`}>
                    {page.status === "in-review" ? "Review" : page.status === "generating" ? "Gen..." : "Done"}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Page preview */}
          <div className="lg:col-span-2 bg-[#111] border border-[#222] p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xs font-bold text-[#E8B931] tracking-[0.2em] uppercase">
                  Page {selectedPage} Preview
                </h3>
                <div className="text-xs text-[#666] mt-1">
                  {pages.find((p) => p.number === selectedPage)?.title}
                </div>
              </div>
              {pages.find((p) => p.number === selectedPage)?.status === "in-review" && (
                <div className="flex items-center gap-2">
                  <button className="px-4 py-2 border border-[#333] text-[#F5F5F0] text-xs tracking-wide uppercase flex items-center gap-1">
                    <RotateCcw className="w-3 h-3" /> Revise
                  </button>
                  <button className="px-4 py-2 bg-[#E8B931] text-[#0A0A0A] font-bold text-xs tracking-wide uppercase flex items-center gap-1">
                    <Check className="w-3 h-3" /> Approve
                  </button>
                </div>
              )}
            </div>

            {/* Comic page mockup */}
            <div className="border-2 border-[#222] bg-[#0A0A0A] aspect-[3/4] relative overflow-hidden">
              {/* Simulated comic panels */}
              <div className="absolute inset-3 grid grid-cols-3 grid-rows-3 gap-1.5">
                <div className="col-span-2 row-span-2 bg-[#1A1A1A] relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#1A1A2E] to-[#0D0D0D] flex items-end p-3">
                    <div className="space-y-1">
                      <div className="text-[10px] text-[#E8B931] font-bold">KAI</div>
                      <div className="w-32 h-4 bg-[#222] rounded-sm" />
                      <div className="w-24 h-4 bg-[#222] rounded-sm" />
                    </div>
                  </div>
                </div>
                <div className="bg-[#1A1A1A] relative">
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A2E] to-[#222]" />
                </div>
                <div className="bg-[#1A1A1A] relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#252015] to-[#1A1A1A]" />
                </div>
                <div className="col-span-2 bg-[#1A1A1A] relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-[#0D0D0D] to-[#1A1A2E] flex items-center justify-center">
                    <div className="text-[10px] text-[#555] tracking-widest uppercase">Panel 3 — City Skyline</div>
                  </div>
                </div>
                <div className="row-span-2 bg-[#1A1A1A] relative">
                  <div className="absolute inset-0 bg-gradient-to-b from-[#1A1A22] to-[#0D0D0D]" />
                </div>
                <div className="bg-[#1A1A1A] relative">
                  <div className="absolute inset-0 bg-gradient-to-l from-[#201A1A] to-[#1A1A1A]" />
                </div>
              </div>

              {/* Page number */}
              <div className="absolute bottom-2 right-3 w-6 h-6 border border-[#E8B931] flex items-center justify-center text-[8px] text-[#E8B931]">
                {selectedPage}
              </div>
            </div>

            {/* Panel details */}
            <div className="mt-4 grid grid-cols-4 gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-[#0A0A0A] border border-[#222] p-2 text-center">
                  <div className="text-[10px] text-[#555] uppercase tracking-wider">Panel {i + 1}</div>
                  <div className="w-full h-1 bg-[#222] mt-1">
                    <div className="h-full bg-[#E8B931] w-full" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
