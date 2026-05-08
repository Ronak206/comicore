"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Plus,
  Trash2,
  Sparkles,
  BookOpen,
  Users,
  Globe,
  Palette,
  LayoutGrid,
  Check,
  Loader2,
  Zap,
  ChevronRight,
  Eye,
  RefreshCw,
} from "lucide-react";

// ─── Types ───────────────────────────────────────

type WizardStep = "story" | "characters" | "world" | "style" | "overview" | "chapters" | "pageIndex";

interface Character {
  name: string;
  role: string;
  description: string;
  appearance: string;
  personality: string;
}

// ─── Step Config ─────────────────────────────────

// Workflow: Story → Characters → World → Style → Overview → Page Index → Chapters → Build
const steps: { key: WizardStep; label: string; icon: typeof BookOpen }[] = [
  { key: "story", label: "Story", icon: BookOpen },
  { key: "characters", label: "Characters", icon: Users },
  { key: "world", label: "World", icon: Globe },
  { key: "style", label: "Art Style", icon: Palette },
  { key: "overview", label: "Overview", icon: Eye },
  { key: "pageIndex", label: "Page Index", icon: BookOpen },
  { key: "chapters", label: "Chapters", icon: LayoutGrid },
];

export default function CreateComicPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<WizardStep>("story");
  const [projectId, setProjectId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ─── Story Form ────────────────────────────────
  const [storyForm, setStoryForm] = useState({
    title: "",
    genre: "Sci-Fi",
    synopsis: "",
    tone: "Dark, dramatic",
    targetAudience: "Young Adult / Adult",
    pageGoal: "24",
  });

  // ─── Characters ────────────────────────────────
  const [characters, setCharacters] = useState<Character[]>([
    { name: "", role: "Protagonist", description: "", appearance: "", personality: "" },
  ]);

  const addCharacter = () => {
    setCharacters([...characters, { name: "", role: "Supporting", description: "", appearance: "", personality: "" }]);
  };

  const removeCharacter = (idx: number) => {
    if (characters.length > 1) setCharacters(characters.filter((_, i) => i !== idx));
  };

  const updateCharacter = (idx: number, field: keyof Character, value: string) => {
    setCharacters(characters.map((c, i) => (i === idx ? { ...c, [field]: value } : c)));
  };

  // ─── World Form ────────────────────────────────
  const [worldForm, setWorldForm] = useState({
    setting: "",
    timePeriod: "",
    atmosphere: "",
    technology: "",
    keyLocations: "",
    rules: "",
  });

  // ─── Style Form ────────────────────────────────
  const [styleForm, setStyleForm] = useState({
    artStyle: "noir-cyberpunk",
    colorPalette: "dominated-dark",
    panelDensity: "medium",
    speechBubbleStyle: "standard",
    narrationStyle: "present",
    detailLevel: "high",
    referenceNotes: "",
  });

  // ─── AI Results ────────────────────────────────
  const [overview, setOverview] = useState("");
  const [chapters, setChapters] = useState<Array<{
    number: number;
    title: string;
    description: string;
    pageRange: string;
    pageCount: number;
  }>>([]);
  const [storyBeats, setStoryBeats] = useState<Array<{
    num: string;
    title: string;
    description: string;
    pageRange: string;
  }>>([]);
  const [pageIndex, setPageIndex] = useState<Array<{
    pageNumber: number;
    title: string;
    description: string;
    chapter: string;
    keyEvents: string[];
  }>>([]);

  // ─── Navigation ────────────────────────────────
  const stepIndex = steps.findIndex((s) => s.key === currentStep);
  const canGoNext = (): boolean => {
    switch (currentStep) {
      case "story":
        return storyForm.title.trim().length > 0 && storyForm.synopsis.trim().length > 20;
      case "characters":
        return characters.some((c) => c.name.trim().length > 0);
      case "world":
        return worldForm.setting.trim().length > 0;
      case "style":
        return true;
      case "overview":
        return overview.length > 0;
      case "chapters":
        return chapters.length > 0;
      case "pageIndex":
        return pageIndex.length > 0;
      default:
        return false;
    }
  };

  const goNext = () => {
    const nextStep = steps[stepIndex + 1]?.key;
    if (nextStep) setCurrentStep(nextStep);
  };

  const goBack = () => {
    const prevStep = steps[stepIndex - 1]?.key;
    if (prevStep) setCurrentStep(prevStep);
  };

  // ─── Save Project (steps 1-3) ──────────────────
  // Returns the project ID on success, or null on failure.
  // Uses a local ref to avoid React state race conditions.
  const projectIdRef = useRef<string | null>(null);

  const saveProject = async (): Promise<string | null> => {
    // Use ref first (always up-to-date), fall back to state
    if (projectIdRef.current) return projectIdRef.current;

    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/engine/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...storyForm,
          pageGoal: parseInt(storyForm.pageGoal) || 24,
          characters: characters.filter((c) => c.name.trim()),
          world: worldForm,
          style: styleForm,
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      const id = data.data.id;
      projectIdRef.current = id;
      setProjectId(id);
      return id;
    } catch (err: any) {
      setError(err.message || "Failed to save project");
      return null;
    } finally {
      setLoading(false);
    }
  };

  // ─── Generate Overview (step 4) ────────────────
  const handleGenerateOverview = async () => {
    // Always get a fresh projectId from saveProject (uses ref internally)
    const id = await saveProject();
    if (!id) return;

    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/engine/overview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId: id }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      setOverview(data.data.overview);
    } catch (err: any) {
      setError(err.message || "Failed to generate overview");
    } finally {
      setLoading(false);
    }
  };

  // ─── Generate Chapters (step 5) ────────────────
  const handleGenerateChapters = async () => {
    const id = projectIdRef.current;
    if (!id) return;

    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/engine/chapters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId: id }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      setChapters(data.data.chapters);
      setStoryBeats(data.data.storyBeats);
    } catch (err: any) {
      setError(err.message || "Failed to generate chapters");
    } finally {
      setLoading(false);
    }
  };

  // ─── Generate Page Index (step 6) ────────────────
  const handleGeneratePageIndex = async () => {
    const id = projectIdRef.current;
    if (!id) return;

    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/engine/page-index", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId: id }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      setPageIndex(data.data.pageIndex);
    } catch (err: any) {
      setError(err.message || "Failed to generate page index");
    } finally {
      setLoading(false);
    }
  };

  // ─── Start Building (finish) ──────────────────
  const handleStartBuilding = () => {
    const id = projectIdRef.current || projectId;
    if (id) {
      router.push(`/dashboard/comic/${id}`);
    }
  };

  // ─── Handle Next with side-effects ─────────────
  // Workflow: Overview → Page Index → Chapters → Build
  const handleNext = async () => {
    if (currentStep === "style") {
      // Save project before overview — saveProject returns the ID directly
      const id = await saveProject();
      if (id) {
        setCurrentStep("overview");
        // Auto-generate overview (it will use ref, so safe to call)
        handleGenerateOverview();
      }
    } else if (currentStep === "overview" && overview) {
      setCurrentStep("pageIndex");
      // Auto-generate page index FIRST
      handleGeneratePageIndex();
    } else if (currentStep === "pageIndex" && pageIndex.length > 0) {
      setCurrentStep("chapters");
      // Auto-generate chapters AFTER page index
      handleGenerateChapters();
    } else {
      goNext();
    }
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-[#666] tracking-wide">
        <Link href="/dashboard" className="uppercase flex items-center gap-1">
          <ArrowLeft className="w-3 h-3" />
          Dashboard
        </Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-[#F5F5F0] uppercase">Create New Comic</span>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-[#F5F5F0] tracking-tight">
            Create New Comic
          </h2>
          <p className="text-sm text-[#666] mt-1">
            Set up your story, characters, world — then let AI build it page by page.
          </p>
        </div>
      </div>

      {/* Step Progress */}
      <div className="flex gap-1 border-b border-[#222] overflow-x-auto">
        {steps.map((step, i) => (
          <button
            key={step.key}
            onClick={() => {
              // Can only go to steps we've passed or current
              // New order: Overview → Page Index → Chapters
              if (i <= stepIndex || (step.key === "overview" && projectId) || (step.key === "pageIndex" && overview) || (step.key === "chapters" && pageIndex.length > 0)) {
                setCurrentStep(step.key);
              }
            }}
            className={`flex items-center gap-2 px-4 py-3 text-xs tracking-widest uppercase whitespace-nowrap ${
              i === stepIndex
                ? "text-[#E8B931] border-b-2 border-[#E8B931]"
                : i < stepIndex
                ? "text-[#999]"
                : "text-[#444]"
            }`}
          >
            <div className={`w-5 h-5 flex items-center justify-center text-[9px] font-bold border ${
              i === stepIndex
                ? "border-[#E8B931] text-[#E8B931]"
                : i < stepIndex
                ? "border-[#666] text-[#999] bg-[#666]/20"
                : "border-[#333] text-[#444]"
            }`}>
              {i < stepIndex ? <Check className="w-3 h-3" /> : i + 1}
            </div>
            <step.icon className="w-3.5 h-3.5" />
            {step.label}
          </button>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-950/30 border border-red-900/40 p-4 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* ========== STORY STEP ========== */}
      {currentStep === "story" && (
        <div className="max-w-3xl space-y-5">
          <div className="bg-[#111] border border-[#222] p-6 space-y-5">
            <h3 className="text-xs font-bold text-[#E8B931] tracking-[0.2em] uppercase">
              Story Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs text-[#E8B931] tracking-[0.15em] uppercase block">Comic Title *</label>
                <input
                  type="text"
                  value={storyForm.title}
                  onChange={(e) => setStoryForm({ ...storyForm, title: e.target.value })}
                  className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#222] text-sm text-[#F5F5F0] focus:border-[#E8B931] focus:outline-none"
                  placeholder="Your comic's title"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-[#E8B931] tracking-[0.15em] uppercase block">Genre</label>
                <select
                  value={storyForm.genre}
                  onChange={(e) => setStoryForm({ ...storyForm, genre: e.target.value })}
                  className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#222] text-sm text-[#F5F5F0] focus:border-[#E8B931] focus:outline-none appearance-none"
                >
                  {["Sci-Fi", "Fantasy", "Dark Fantasy", "Horror", "Noir", "Superhero", "Romance", "Comedy", "Slice of Life", "Mystery", "Thriller", "Western", "Historical", "Space Opera", "Post-Apocalyptic"].map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs text-[#E8B931] tracking-[0.15em] uppercase block">Synopsis * (min 20 chars)</label>
              <textarea
                value={storyForm.synopsis}
                onChange={(e) => setStoryForm({ ...storyForm, synopsis: e.target.value })}
                rows={5}
                className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#222] text-sm text-[#F5F5F0] focus:border-[#E8B931] focus:outline-none resize-none leading-relaxed"
                placeholder="Describe the overall story, main conflict, and what the reader should feel. The more detail, the better the AI will understand your vision."
              />
              <div className="text-[10px] text-[#555]">{storyForm.synopsis.length} characters</div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  <option value="Young Adult (13+)">Young Adult (13+)</option>
                  <option value="Young Adult / Adult">Young Adult / Adult (16+)</option>
                  <option value="Adult (18+)">Adult (18+)</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs text-[#E8B931] tracking-[0.15em] uppercase block">Page Goal</label>
                <input
                  type="number"
                  value={storyForm.pageGoal}
                  onChange={(e) => setStoryForm({ ...storyForm, pageGoal: e.target.value })}
                  className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#222] text-sm text-[#F5F5F0] focus:border-[#E8B931] focus:outline-none"
                  min={4}
                  max={200}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========== CHARACTERS STEP ========== */}
      {currentStep === "characters" && (
        <div className="max-w-3xl space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-[#E8B931] tracking-[0.2em] uppercase">
                Characters
              </h3>
              <p className="text-xs text-[#555] mt-1">Define the people in your story. At least one character is required.</p>
            </div>
            <button
              onClick={addCharacter}
              className="px-4 py-2.5 border border-[#E8B931] text-[#E8B931] font-bold tracking-[0.1em] uppercase text-xs flex items-center gap-2"
            >
              <Plus className="w-3.5 h-3.5" /> Add Character
            </button>
          </div>

          {characters.map((char, idx) => (
            <div key={idx} className="bg-[#111] border border-[#222] p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#222] flex items-center justify-center text-xs font-bold text-[#E8B931]">
                    {char.name ? char.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) : `C${idx + 1}`}
                  </div>
                  <select
                    value={char.role}
                    onChange={(e) => updateCharacter(idx, "role", e.target.value)}
                    className="text-[10px] tracking-widest uppercase border px-2 py-0.5 bg-[#0A0A0A] border-[#E8B931]/30 text-[#E8B931] appearance-none focus:outline-none"
                  >
                    <option value="Protagonist">Protagonist</option>
                    <option value="Antagonist">Antagonist</option>
                    <option value="Deuteragonist">Deuteragonist</option>
                    <option value="Supporting">Supporting</option>
                    <option value="Minor">Minor</option>
                  </select>
                </div>
                {characters.length > 1 && (
                  <button onClick={() => removeCharacter(idx)} className="text-[#555] p-1">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="space-y-2">
                  <label className="text-xs text-[#E8B931] tracking-[0.15em] uppercase block">Name *</label>
                  <input
                    type="text"
                    value={char.name}
                    onChange={(e) => updateCharacter(idx, "name", e.target.value)}
                    placeholder="Character name"
                    className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#222] text-sm text-[#F5F5F0] focus:border-[#E8B931] focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <label className="text-xs text-[#E8B931] tracking-[0.15em] uppercase block">Description / Backstory</label>
                <textarea
                  value={char.description}
                  onChange={(e) => updateCharacter(idx, "description", e.target.value)}
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
                    onChange={(e) => updateCharacter(idx, "appearance", e.target.value)}
                    rows={2}
                    className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#222] text-sm text-[#F5F5F0] focus:border-[#E8B931] focus:outline-none resize-none"
                    placeholder="Hair, eyes, build, clothing, distinguishing features..."
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-[#E8B931] tracking-[0.15em] uppercase block">Personality & Traits</label>
                  <textarea
                    value={char.personality}
                    onChange={(e) => updateCharacter(idx, "personality", e.target.value)}
                    rows={2}
                    className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#222] text-sm text-[#F5F5F0] focus:border-[#E8B931] focus:outline-none resize-none"
                    placeholder="Personality traits, fears, habits, speech patterns..."
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ========== WORLD STEP ========== */}
      {currentStep === "world" && (
        <div className="max-w-3xl space-y-5">
          <div className="bg-[#111] border border-[#222] p-6 space-y-5">
            <h3 className="text-xs font-bold text-[#E8B931] tracking-[0.2em] uppercase">
              World Building
            </h3>
            <p className="text-xs text-[#555]">Define the world your story takes place in. The AI will use these details to maintain consistency across all pages.</p>

            <div className="space-y-2">
              <label className="text-xs text-[#E8B931] tracking-[0.15em] uppercase block">Setting Description *</label>
              <textarea
                value={worldForm.setting}
                onChange={(e) => setWorldForm({ ...worldForm, setting: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#222] text-sm text-[#F5F5F0] focus:border-[#E8B931] focus:outline-none resize-none leading-relaxed"
                placeholder="Describe the world — city, country, planet, realm. What does it look like? How is it structured?"
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
                  placeholder="Modern day, Medieval, Year 3000..."
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-[#E8B931] tracking-[0.15em] uppercase block">Atmosphere & Mood</label>
                <input
                  type="text"
                  value={worldForm.atmosphere}
                  onChange={(e) => setWorldForm({ ...worldForm, atmosphere: e.target.value })}
                  className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#222] text-sm text-[#F5F5F0] focus:border-[#E8B931] focus:outline-none"
                  placeholder="Rain-soaked neon streets, dark forests, etc."
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs text-[#E8B931] tracking-[0.15em] uppercase block">Technology & Magic Systems</label>
              <textarea
                value={worldForm.technology}
                onChange={(e) => setWorldForm({ ...worldForm, technology: e.target.value })}
                rows={2}
                className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#222] text-sm text-[#F5F5F0] focus:border-[#E8B931] focus:outline-none resize-none"
                placeholder="Cybernetic implants, magic spells, advanced AI, etc."
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs text-[#E8B931] tracking-[0.15em] uppercase block">Key Locations</label>
              <textarea
                value={worldForm.keyLocations}
                onChange={(e) => setWorldForm({ ...worldForm, keyLocations: e.target.value })}
                rows={2}
                className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#222] text-sm text-[#F5F5F0] focus:border-[#E8B931] focus:outline-none resize-none"
                placeholder="The Memory Tower, Doc Mira's Clinic, The Wall..."
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs text-[#E8B931] tracking-[0.15em] uppercase block">World Rules & Laws</label>
              <textarea
                value={worldForm.rules}
                onChange={(e) => setWorldForm({ ...worldForm, rules: e.target.value })}
                rows={2}
                className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#222] text-sm text-[#F5F5F0] focus:border-[#E8B931] focus:outline-none resize-none"
                placeholder="Rules that govern this world. What's possible? What's forbidden?"
              />
            </div>
          </div>
        </div>
      )}

      {/* ========== STYLE STEP ========== */}
      {currentStep === "style" && (
        <div className="max-w-3xl grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="bg-[#111] border border-[#222] p-6 space-y-5">
            <h3 className="text-xs font-bold text-[#E8B931] tracking-[0.2em] uppercase">Visual Style</h3>

            <div className="space-y-2">
              <label className="text-xs text-[#E8B931] tracking-[0.15em] uppercase block">Art Style</label>
              <select
                value={styleForm.artStyle}
                onChange={(e) => setStyleForm({ ...styleForm, artStyle: e.target.value })}
                className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#222] text-sm text-[#F5F5F0] focus:border-[#E8B931] focus:outline-none appearance-none"
              >
                {["noir-cyberpunk", "dark-fantasy", "manga", "manhwa", "comic-book", "watercolor", "synthwave-pop", "military-realism", "minimalist", "photorealistic"].map((s) => (
                  <option key={s} value={s}>{s.split("-").map((w) => w[0].toUpperCase() + w.slice(1)).join(" ")}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs text-[#E8B931] tracking-[0.15em] uppercase block">Color Palette</label>
              <select
                value={styleForm.colorPalette}
                onChange={(e) => setStyleForm({ ...styleForm, colorPalette: e.target.value })}
                className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#222] text-sm text-[#F5F5F0] focus:border-[#E8B931] focus:outline-none appearance-none"
              >
                {["dominated-dark", "full-color", "muted-pastel", "monochrome", "sepia", "high-contrast"].map((c) => (
                  <option key={c} value={c}>{c.split("-").map((w) => w[0].toUpperCase() + w.slice(1)).join(" ")}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs text-[#E8B931] tracking-[0.15em] uppercase block">Panel Density</label>
                <select
                  value={styleForm.panelDensity}
                  onChange={(e) => setStyleForm({ ...styleForm, panelDensity: e.target.value })}
                  className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#222] text-sm text-[#F5F5F0] focus:border-[#E8B931] focus:outline-none appearance-none"
                >
                  <option value="sparse">Sparse (1-3 panels)</option>
                  <option value="medium">Medium (3-5 panels)</option>
                  <option value="dense">Dense (5-8 panels)</option>
                  <option value="variable">Variable (AI decides)</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs text-[#E8B931] tracking-[0.15em] uppercase block">Detail Level</label>
                <select
                  value={styleForm.detailLevel}
                  onChange={(e) => setStyleForm({ ...styleForm, detailLevel: e.target.value })}
                  className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#222] text-sm text-[#F5F5F0] focus:border-[#E8B931] focus:outline-none appearance-none"
                >
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low (Stylized)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-5">
            <div className="bg-[#111] border border-[#222] p-6 space-y-4">
              <h3 className="text-xs font-bold text-[#E8B931] tracking-[0.2em] uppercase">Narration & Bubbles</h3>
              <div className="grid grid-cols-2 gap-4">
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
                    <option value="no-narration">No Narration</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-[#E8B931] tracking-[0.15em] uppercase block">Speech Bubbles</label>
                  <select
                    value={styleForm.speechBubbleStyle}
                    onChange={(e) => setStyleForm({ ...styleForm, speechBubbleStyle: e.target.value })}
                    className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#222] text-sm text-[#F5F5F0] focus:border-[#E8B931] focus:outline-none appearance-none"
                  >
                    <option value="standard">Standard</option>
                    <option value="jagged">Jagged / Explosive</option>
                    <option value="square">Square / Rectangular</option>
                    <option value="thought">Thought Bubbles</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="bg-[#111] border border-[#222] p-6 space-y-4">
              <h3 className="text-xs font-bold text-[#E8B931] tracking-[0.2em] uppercase">Reference Notes</h3>
              <textarea
                value={styleForm.referenceNotes}
                onChange={(e) => setStyleForm({ ...styleForm, referenceNotes: e.target.value })}
                rows={4}
                className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#222] text-sm text-[#F5F5F0] focus:border-[#E8B931] focus:outline-none resize-none leading-relaxed"
                placeholder="Mention specific artists, movies, games, or comic series as style references..."
              />
            </div>
          </div>
        </div>
      )}

      {/* ========== OVERVIEW STEP ========== */}
      {currentStep === "overview" && (
        <div className="max-w-3xl space-y-5">
          <div className="bg-[#111] border border-[#222] p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold text-[#E8B931] tracking-[0.2em] uppercase">
                AI Story Overview
              </h3>
              {!loading && overview && (
                <button
                  onClick={handleGenerateOverview}
                  className="text-xs text-[#666] tracking-wide uppercase flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" /> Regenerate
                </button>
              )}
            </div>

            {loading && !overview ? (
              <div className="flex flex-col items-center justify-center py-12 gap-4">
                <Loader2 className="w-8 h-8 text-[#E8B931] animate-spin" />
                <p className="text-sm text-[#666]">Claude is crafting your story overview...</p>
              </div>
            ) : overview ? (
              <div className="prose prose-invert max-w-none">
                <p className="text-sm text-[#ccc] leading-relaxed whitespace-pre-wrap">{overview}</p>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-sm text-[#555]">Click &quot;Generate Overview&quot; to let AI write your story overview.</p>
                <button
                  onClick={handleGenerateOverview}
                  className="mt-4 px-6 py-3 bg-[#E8B931] text-[#0A0A0A] font-bold tracking-[0.1em] uppercase text-xs flex items-center gap-2 mx-auto"
                >
                  <Sparkles className="w-4 h-4" /> Generate Overview
                </button>
              </div>
            )}
          </div>

          {overview && (
            <div className="bg-[#111] border border-[#222] p-5">
              <h3 className="text-xs font-bold text-[#E8B931] tracking-[0.2em] uppercase mb-3">Summary</h3>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-black text-[#F5F5F0]">{storyForm.pageGoal}</div>
                  <div className="text-[10px] text-[#555] uppercase tracking-wider">Total Pages</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-[#F5F5F0]">{characters.filter((c) => c.name.trim()).length}</div>
                  <div className="text-[10px] text-[#555] uppercase tracking-wider">Characters</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-[#F5F5F0]">{storyForm.genre}</div>
                  <div className="text-[10px] text-[#555] uppercase tracking-wider">Genre</div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========== CHAPTERS STEP ========== */}
      {currentStep === "chapters" && (
        <div className="max-w-3xl space-y-5">
          <div className="bg-[#111] border border-[#222] p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold text-[#E8B931] tracking-[0.2em] uppercase">
                Chapter Plan
              </h3>
              {!loading && chapters.length > 0 && (
                <button
                  onClick={handleGenerateChapters}
                  className="text-xs text-[#666] tracking-wide uppercase flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" /> Regenerate
                </button>
              )}
            </div>

            {loading && chapters.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 gap-4">
                <Loader2 className="w-8 h-8 text-[#E8B931] animate-spin" />
                <p className="text-sm text-[#666]">Claude is planning your chapters...</p>
              </div>
            ) : chapters.length > 0 ? (
              <div className="space-y-3">
                {chapters.map((ch) => (
                  <div key={ch.number} className="flex items-start gap-4 p-4 bg-[#0A0A0A] border border-[#222]">
                    <div className="w-10 h-10 bg-[#E8B931]/10 text-[#E8B931] text-xs font-bold flex items-center justify-center flex-shrink-0">
                      {ch.number}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-[#F5F5F0]">{ch.title}</span>
                        <span className="text-[10px] text-[#555] border border-[#333] px-2 py-0.5">
                          Pages {ch.pageRange} ({ch.pageCount}p)
                        </span>
                      </div>
                      <p className="text-xs text-[#666] mt-1 leading-relaxed">{ch.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-sm text-[#555]">Click &quot;Generate Chapters&quot; to break your story into chapters.</p>
                <button
                  onClick={handleGenerateChapters}
                  className="mt-4 px-6 py-3 bg-[#E8B931] text-[#0A0A0A] font-bold tracking-[0.1em] uppercase text-xs flex items-center gap-2 mx-auto"
                >
                  <Sparkles className="w-4 h-4" /> Generate Chapters
                </button>
              </div>
            )}
          </div>

          {/* Story Beats */}
          {storyBeats.length > 0 && (
            <div className="bg-[#111] border border-[#222] p-6">
              <h3 className="text-xs font-bold text-[#E8B931] tracking-[0.2em] uppercase mb-4">
                Story Beats
              </h3>
              <div className="space-y-2">
                {storyBeats.map((beat) => (
                  <div key={beat.num} className="flex items-start gap-3 p-2">
                    <div className="w-6 h-6 bg-[#222] text-[#E8B931] text-[9px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                      {beat.num}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-[#F5F5F0]">{beat.title}</span>
                        <span className="text-[10px] text-[#555]">Pages {beat.pageRange}</span>
                      </div>
                      <p className="text-[11px] text-[#666] mt-0.5">{beat.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========== PAGE INDEX STEP ========== */}
      {currentStep === "pageIndex" && (
        <div className="max-w-4xl space-y-5">
          <div className="bg-[#111] border border-[#222] p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold text-[#E8B931] tracking-[0.2em] uppercase">
                Page Index — Review &amp; Approve
              </h3>
              {!loading && pageIndex.length > 0 && (
                <button
                  onClick={handleGeneratePageIndex}
                  className="text-xs text-[#666] tracking-wide uppercase flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" /> Regenerate
                </button>
              )}
            </div>

            <p className="text-xs text-[#555] mb-4">
              Review the planned page-by-page breakdown below. Once approved, click &quot;Start Building&quot; to begin generating actual pages.
            </p>

            {loading && pageIndex.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 gap-4">
                <Loader2 className="w-8 h-8 text-[#E8B931] animate-spin" />
                <p className="text-sm text-[#666]">Claude is planning your page index...</p>
              </div>
            ) : pageIndex.length > 0 ? (
              <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-2">
                {pageIndex.map((page) => (
                  <div key={page.pageNumber} className="flex items-start gap-4 p-3 bg-[#0A0A0A] border border-[#222] hover:border-[#333] transition-colors">
                    <div className="w-10 h-10 bg-[#E8B931]/10 text-[#E8B931] text-sm font-bold flex items-center justify-center flex-shrink-0">
                      {page.pageNumber}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-bold text-[#F5F5F0] truncate">{page.title}</span>
                        <span className="text-[10px] text-[#555] border border-[#333] px-2 py-0.5 flex-shrink-0">
                          {page.chapter}
                        </span>
                      </div>
                      <p className="text-xs text-[#666] mt-1 leading-relaxed">{page.description}</p>
                      {page.keyEvents && page.keyEvents.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {page.keyEvents.map((event, i) => (
                            <span key={i} className="text-[10px] text-[#E8B931]/70 bg-[#E8B931]/5 px-1.5 py-0.5 border border-[#E8B931]/20">
                              {event}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-sm text-[#555]">Click &quot;Generate Index&quot; to create a page-by-page breakdown.</p>
                <button
                  onClick={handleGeneratePageIndex}
                  className="mt-4 px-6 py-3 bg-[#E8B931] text-[#0A0A0A] font-bold tracking-[0.1em] uppercase text-xs flex items-center gap-2 mx-auto"
                >
                  <Sparkles className="w-4 h-4" /> Generate Page Index
                </button>
              </div>
            )}
          </div>

          {/* Summary */}
          {pageIndex.length > 0 && (
            <div className="bg-[#111] border border-[#222] p-5">
              <h3 className="text-xs font-bold text-[#E8B931] tracking-[0.2em] uppercase mb-3">Summary</h3>
              <div className="grid grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl font-black text-[#F5F5F0]">{pageIndex.length}</div>
                  <div className="text-[10px] text-[#555] uppercase tracking-wider">Total Pages</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-[#F5F5F0]">{chapters.length}</div>
                  <div className="text-[10px] text-[#555] uppercase tracking-wider">Chapters</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-[#F5F5F0]">{characters.filter((c) => c.name.trim()).length}</div>
                  <div className="text-[10px] text-[#555] uppercase tracking-wider">Characters</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-[#E8B931]">{storyForm.genre.split("-")[0]}</div>
                  <div className="text-[10px] text-[#555] uppercase tracking-wider">Genre</div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========== Navigation Buttons ========== */}
      <div className="flex items-center justify-between pt-4 border-t border-[#222]">
        <button
          onClick={goBack}
          disabled={stepIndex === 0}
          className={`px-6 py-3 text-xs tracking-[0.1em] uppercase flex items-center gap-2 ${
            stepIndex === 0 ? "text-[#333] cursor-not-allowed" : "text-[#999] border border-[#333]"
          }`}
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back
        </button>

        {currentStep === "pageIndex" && pageIndex.length > 0 ? (
          <button
            onClick={handleStartBuilding}
            className="px-6 py-3 bg-[#E8B931] text-[#0A0A0A] font-bold tracking-[0.1em] uppercase text-xs flex items-center gap-2"
          >
            <Zap className="w-4 h-4" /> Start Building Pages
          </button>
        ) : (
          <button
            onClick={handleNext}
            disabled={!canGoNext() || loading}
            className={`px-6 py-3 text-xs tracking-[0.1em] uppercase flex items-center gap-2 ${
              canGoNext() && !loading
                ? "bg-[#E8B931] text-[#0A0A0A] font-bold"
                : "bg-[#222] text-[#444] cursor-not-allowed"
            }`}
          >
            {loading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <>
                {currentStep === "style" || currentStep === "overview" || currentStep === "chapters" ? (
                  <>
                    <Sparkles className="w-3.5 h-3.5" /> Generate &amp; Next
                  </>
                ) : (
                  <>
                    Next <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
