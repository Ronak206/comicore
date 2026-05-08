"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Sparkles,
  BookOpen,
  Users,
  Globe,
  Palette,
  LayoutGrid,
  ChevronRight,
  Check,
  X,
  RotateCcw,
  MessageSquare,
  Loader2,
  Zap,
  AlertTriangle,
  ChevronDown,
  Eye,
  SkipForward,
  Send,
} from "lucide-react";

// ─── Types ───────────────────────────────────────

type WorkspaceTab = "generate" | "chapters" | "characters" | "world" | "style";

interface ProjectData {
  id: string;
  title: string;
  genre: string;
  synopsis: string;
  tone: string;
  status: string;
  pageGoal: number;
  currentPage: number;
  characters: Array<{
    id: string;
    name: string;
    role: string;
    description: string;
    appearance: string;
    personality: string;
  }>;
  world: {
    setting: string;
    timePeriod: string;
    atmosphere: string;
    technology: string;
    keyLocations: string;
    rules: string;
  };
  style: {
    artStyle: string;
    colorPalette: string;
    panelDensity: string;
    speechBubbleStyle: string;
    narrationStyle: string;
    detailLevel: string;
    referenceNotes: string;
  };
  roughOverview: string;
  chapters: Array<{
    id: string;
    number: number;
    title: string;
    description: string;
    pageRange: string;
    pageCount: number;
  }>;
  storyBeats: Array<{
    num: string;
    title: string;
    description: string;
    pageRange: string;
  }>;
  pages: Array<{
    id: string;
    number: number;
    title: string;
    status: string;
    panels: Array<{
      panelNumber: number;
      description: string;
      dialogue: Array<{
        character: string;
        text: string;
        type: string;
      }>;
      cameraAngle: string;
      mood: string;
    }>;
    script: string;
    userInstructions?: string;
    feedback?: string;
    generatedAt: string;
    approvedAt?: string;
  }>;
}

type GenerationState = "idle" | "generating" | "reviewing" | "approved" | "revising" | "complete";

// ─── Component ───────────────────────────────────

export default function ComicWorkspacePage() {
  const params = useParams();
  const id = params?.id as string;

  const [project, setProject] = useState<ProjectData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<WorkspaceTab>("generate");

  // Generation state
  const [genState, setGenState] = useState<GenerationState>("idle");
  const [currentGenPage, setCurrentGenPage] = useState<any>(null);
  const [validation, setValidation] = useState<string>("");
  const [userInstructions, setUserInstructions] = useState("");
  const [feedback, setFeedback] = useState("");
  const [showInstructions, setShowInstructions] = useState(false);

  // Load project from API
  const loadProject = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/engine/project/${id}`);
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Project not found");
      setProject(data.data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadProject();
  }, [loadProject]);

  // ─── Generate Page ─────────────────────────────
  const handleGeneratePage = async () => {
    if (!project) return;

    setGenState("generating");
    setError(null);
    setShowInstructions(false);

    try {
      const res = await fetch("/api/engine/generate-page", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: id,
          userInstructions: userInstructions.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      setCurrentGenPage(data.data.page);
      setValidation(data.data.validation);
      setGenState("reviewing");
      setUserInstructions("");
      setFeedback("");
    } catch (err: any) {
      setError(err.message || "Generation failed");
      setGenState("idle");
    }
  };

  // ─── Approve Page ──────────────────────────────
  const handleApprovePage = async () => {
    if (!currentGenPage) return;

    setGenState("approved");
    try {
      const res = await fetch("/api/engine/review-page", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: id,
          pageId: currentGenPage.id,
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      if (data.data.storyComplete) {
        setGenState("complete");
      } else {
        // Ask for next page instructions
        setShowInstructions(true);
        setGenState("idle");
        setCurrentGenPage(null);
      }
    } catch (err: any) {
      setError(err.message);
      setGenState("reviewing");
    }
  };

  // ─── Revise Page ───────────────────────────────
  const handleRevisePage = async () => {
    if (!currentGenPage || !feedback.trim()) return;

    setGenState("revising");
    try {
      const res = await fetch("/api/engine/revise-page", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: id,
          pageId: currentGenPage.id,
          feedback: feedback.trim(),
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      setCurrentGenPage(data.data.page);
      setValidation(data.data.validation);
      setGenState("reviewing");
      setFeedback("");
    } catch (err: any) {
      setError(err.message);
      setGenState("reviewing");
    }
  };

  // ─── Skip (approve without review) ─────────────
  const handleSkipPage = async () => {
    if (!currentGenPage) return;
    await handleApprovePage();
  };

  const tabs: { key: WorkspaceTab; label: string; icon: typeof BookOpen }[] = [
    { key: "generate", label: "Generate", icon: Sparkles },
    { key: "chapters", label: "Chapters", icon: LayoutGrid },
    { key: "characters", label: "Characters", icon: Users },
    { key: "world", label: "World", icon: Globe },
    { key: "style", label: "Art Style", icon: Palette },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-[#E8B931] animate-spin" />
      </div>
    );
  }

  const approvedCount = project?.pages?.filter((p) => p.status === "approved").length || 0;
  const totalPages = project?.pageGoal || 24;
  const isComplete = approvedCount >= totalPages;

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-[#666] tracking-wide">
        <Link href="/dashboard" className="uppercase flex items-center gap-1">
          <ArrowLeft className="w-3 h-3" />
          Dashboard
        </Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-[#F5F5F0] uppercase">{project?.title || "Comic Workspace"}</span>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-[#F5F5F0] tracking-tight">
            {project?.title || "Loading..."}
          </h2>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-xs text-[#E8B931] tracking-widest uppercase">{project?.genre || "—"}</span>
            <span className="text-[10px] text-[#555]">|</span>
            <span className="text-xs text-[#666]">Page {approvedCount} of {totalPages}</span>
            <div className="w-24 h-1.5 bg-[#222]">
              <div className="h-full bg-[#E8B931]" style={{ width: `${(approvedCount / totalPages) * 100}%` }} />
            </div>
            <span className="text-xs text-[#E8B931] font-bold">{Math.round((approvedCount / totalPages) * 100)}%</span>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-950/30 border border-red-900/40 p-4 text-sm text-red-400 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          {error}
          <button onClick={() => setError(null)} className="ml-auto text-red-500"><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 border-b border-[#222] overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-3 text-xs tracking-widest uppercase whitespace-nowrap ${
              activeTab === tab.key ? "text-[#E8B931] border-b-2 border-[#E8B931]" : "text-[#666]"
            }`}
          >
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* ========== GENERATE TAB (Main Loop) ========== */}
      {activeTab === "generate" && (
        <div className="space-y-6">
          {/* Story complete banner */}
          {genState === "complete" && (
            <div className="bg-[#E8B931]/10 border border-[#E8B931]/30 p-8 text-center">
              <Zap className="w-12 h-12 text-[#E8B931] mx-auto mb-4" />
              <h3 className="text-xl font-black text-[#F5F5F0] mb-2">Story Complete!</h3>
              <p className="text-sm text-[#999] mb-4">All {totalPages} pages have been generated and approved.</p>
              <div className="flex items-center justify-center gap-3">
                <Link
                  href="/dashboard"
                  className="px-6 py-3 border border-[#333] text-[#F5F5F0] text-xs tracking-wide uppercase"
                >
                  Back to Dashboard
                </Link>
                <Link
                  href="/dashboard/export"
                  className="px-6 py-3 bg-[#E8B931] text-[#0A0A0A] font-bold tracking-[0.1em] uppercase text-xs"
                >
                  Export Comic
                </Link>
              </div>
            </div>
          )}

          {/* Instructions input (shown after approve, before next gen) */}
          {genState === "idle" && showInstructions && (
            <div className="bg-[#111] border border-[#E8B931]/30 p-6">
              <div className="flex items-center gap-2 mb-3">
                <MessageSquare className="w-4 h-4 text-[#E8B931]" />
                <h3 className="text-xs font-bold text-[#E8B931] tracking-[0.2em] uppercase">
                  Any specific instructions for the next page?
                </h3>
              </div>
              <p className="text-xs text-[#555] mb-3">
                Optional — leave empty to let AI decide based on the story flow.
              </p>
              <textarea
                value={userInstructions}
                onChange={(e) => setUserInstructions(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#222] text-sm text-[#F5F5F0] focus:border-[#E8B931] focus:outline-none resize-none"
                placeholder='E.g., "Make this page action-heavy", "Focus on dialogue between Kai and Doc Mira", "Add a cliffhanger ending"...'
              />
              <div className="flex items-center justify-end gap-3 mt-3">
                <button
                  onClick={() => {
                    setUserInstructions("");
                    setShowInstructions(false);
                  }}
                  className="px-4 py-2.5 text-xs text-[#666] tracking-wide uppercase"
                >
                  Skip
                </button>
                <button
                  onClick={handleGeneratePage}
                  className="px-6 py-2.5 bg-[#E8B931] text-[#0A0A0A] font-bold tracking-[0.1em] uppercase text-xs flex items-center gap-2"
                >
                  <Sparkles className="w-3.5 h-3.5" /> Generate Page {approvedCount + 1}
                </button>
              </div>
            </div>
          )}

          {/* Initial generate button */}
          {genState === "idle" && !showInstructions && (
            <div className="bg-[#111] border border-[#222] p-12 text-center">
              <Sparkles className="w-12 h-12 text-[#E8B931] mx-auto mb-4" />
              <h3 className="text-lg font-black text-[#F5F5F0] mb-2">Ready to Generate</h3>
              <p className="text-sm text-[#666] mb-2 max-w-md mx-auto">
                Page {approvedCount + 1} of {totalPages}. The AI will write a detailed page script with panels and dialogue.
              </p>
              <p className="text-xs text-[#555] mb-6">
                You can review each page, give feedback, and approve before moving to the next.
              </p>
              <div className="max-w-md mx-auto">
                <textarea
                  value={userInstructions}
                  onChange={(e) => setUserInstructions(e.target.value)}
                  rows={2}
                  className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#222] text-sm text-[#F5F5F0] focus:border-[#E8B931] focus:outline-none resize-none mb-3"
                  placeholder="Optional: any specific instructions for this page..."
                />
                <button
                  onClick={handleGeneratePage}
                  disabled={genState === "generating"}
                  className="w-full px-6 py-3 bg-[#E8B931] text-[#0A0A0A] font-bold tracking-[0.1em] uppercase text-xs flex items-center justify-center gap-2"
                >
                  {genState === "generating" ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Generating Page {approvedCount + 1}...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" /> Generate Page {approvedCount + 1}
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Generating spinner */}
          {genState === "generating" && (
            <div className="bg-[#111] border border-[#222] p-12 text-center">
              <Loader2 className="w-12 h-12 text-[#E8B931] animate-spin mx-auto mb-4" />
              <h3 className="text-lg font-black text-[#F5F5F0] mb-2">Generating Page {approvedCount + 1}</h3>
              <p className="text-sm text-[#666]">
                Claude is writing the page script... then Gemini will validate consistency.
              </p>
            </div>
          )}

          {/* Revising spinner */}
          {genState === "revising" && (
            <div className="bg-[#111] border border-[#222] p-12 text-center">
              <RotateCcw className="w-12 h-12 text-[#E8B931] animate-spin mx-auto mb-4" />
              <h3 className="text-lg font-black text-[#F5F5F0] mb-2">Revising Page {approvedCount + 1}</h3>
              <p className="text-sm text-[#666]">
                Claude is rewriting the page based on your feedback...
              </p>
            </div>
          )}

          {/* Page Review */}
          {(genState === "reviewing" || genState === "approved") && currentGenPage && (
            <div className="space-y-5">
              {/* Page header */}
              <div className="bg-[#111] border border-[#222] p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#E8B931]/10 text-[#E8B931] text-sm font-bold flex items-center justify-center">
                        {currentGenPage.number}
                      </div>
                      <div>
                        <h3 className="text-lg font-black text-[#F5F5F0]">{currentGenPage.title}</h3>
                        <p className="text-xs text-[#555]">
                          {currentGenPage.panels?.length || 0} panels — {currentGenPage.panels?.[0]?.mood || project?.tone}
                        </p>
                      </div>
                    </div>
                  </div>
                  <span className={`text-[10px] tracking-widest uppercase border px-2 py-0.5 ${
                    genState === "approved" ? "border-[#E8B931]/40 text-[#E8B931]" : "border-[#999]/40 text-[#999]"
                  }`}>
                    {genState === "approved" ? "Approved" : "In Review"}
                  </span>
                </div>

                {/* Page script summary */}
                <div className="mt-4 p-4 bg-[#0A0A0A] border border-[#222]">
                  <p className="text-xs text-[#E8B931] tracking-[0.15em] uppercase mb-2">Page Script</p>
                  <p className="text-sm text-[#ccc] leading-relaxed">{currentGenPage.script}</p>
                </div>
              </div>

              {/* Panels */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {currentGenPage.panels?.map((panel: any) => (
                  <div key={panel.panelNumber} className="bg-[#111] border border-[#222] p-5">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold text-[#E8B931] tracking-[0.15em] uppercase">
                        Panel {panel.panelNumber}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] text-[#555] uppercase tracking-wider">{panel.cameraAngle}</span>
                        <span className="text-[9px] text-[#555] uppercase tracking-wider">{panel.mood}</span>
                      </div>
                    </div>

                    {/* Panel placeholder */}
                    <div className="w-full h-40 bg-[#0A0A0A] border border-[#222] mb-3 flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-12 h-12 mx-auto mb-2 border border-[#333] flex items-center justify-center">
                          <Eye className="w-6 h-6 text-[#333]" />
                        </div>
                        <p className="text-[10px] text-[#444] uppercase tracking-wider">Panel Art</p>
                      </div>
                    </div>

                    {/* Panel description */}
                    <p className="text-xs text-[#999] leading-relaxed mb-3">{panel.description}</p>

                    {/* Dialogue */}
                    {panel.dialogue?.length > 0 && (
                      <div className="space-y-2">
                        {panel.dialogue.map((d: any, di: number) => (
                          <div key={di} className={`p-2 border ${
                            d.type === "thought" ? "border-[#333] bg-[#0A0A0A] border-dashed" :
                            d.type === "narration" ? "border-[#444] bg-[#0A0A0A]" :
                            "border-[#333] bg-[#0A0A0A]"
                          }`}>
                            <span className={`text-[10px] font-bold uppercase tracking-wider ${
                              d.type === "thought" ? "text-[#999]" :
                              d.type === "narration" ? "text-[#777]" :
                              "text-[#E8B931]"
                            }`}>
                              {d.type === "narration" ? "NARRATOR" : d.character}
                            </span>
                            <p className="text-xs text-[#ccc] mt-0.5 italic">&quot;{d.text}&quot;</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Validation result */}
              {validation && (
                <div className={`p-4 border ${
                  validation.toUpperCase().includes("APPROVED")
                    ? "border-green-900/40 bg-green-950/20"
                    : "border-yellow-900/40 bg-yellow-950/20"
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className={`w-4 h-4 ${
                      validation.toUpperCase().includes("APPROVED") ? "text-green-500" : "text-yellow-500"
                    }`} />
                    <span className="text-xs font-bold text-[#E8B931] tracking-[0.15em] uppercase">Gemini Validation</span>
                  </div>
                  <p className="text-xs text-[#999] leading-relaxed">{validation}</p>
                </div>
              )}

              {/* Feedback / Actions */}
              {genState === "reviewing" && (
                <div className="bg-[#111] border border-[#222] p-6">
                  <h3 className="text-xs font-bold text-[#E8B931] tracking-[0.2em] uppercase mb-3">
                    Review &amp; Decide
                  </h3>
                  <p className="text-xs text-[#555] mb-3">
                    Approve this page to move to the next one, or provide feedback to revise it.
                  </p>
                  <textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#222] text-sm text-[#F5F5F0] focus:border-[#E8B931] focus:outline-none resize-none mb-3"
                    placeholder="What would you like changed? Be specific — e.g., 'Make the dialogue more dramatic', 'Change the camera angle in panel 2', 'Add more action'..."
                  />
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleApprovePage}
                      className="px-6 py-3 bg-[#E8B931] text-[#0A0A0A] font-bold tracking-[0.1em] uppercase text-xs flex items-center gap-2"
                    >
                      <Check className="w-4 h-4" /> Approve &amp; Continue
                    </button>
                    <button
                      onClick={handleRevisePage}
                      disabled={!feedback.trim()}
                      className={`px-6 py-3 text-xs tracking-[0.1em] uppercase flex items-center gap-2 ${
                        feedback.trim()
                          ? "border border-[#333] text-[#F5F5F0]"
                          : "border border-[#222] text-[#444] cursor-not-allowed"
                      }`}
                    >
                      <RotateCcw className="w-4 h-4" /> Revise with Feedback
                    </button>
                    <button
                      onClick={handleSkipPage}
                      className="px-4 py-3 text-xs text-[#555] tracking-wide uppercase flex items-center gap-1 ml-auto"
                    >
                      <SkipForward className="w-3.5 h-3.5" /> Skip
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Progress tracker */}
          {project?.pages && project.pages.length > 0 && (
            <div className="bg-[#111] border border-[#222] p-6">
              <h3 className="text-xs font-bold text-[#E8B931] tracking-[0.2em] uppercase mb-4">
                Page Progress
              </h3>
              <div className="flex flex-wrap gap-2">
                {Array.from({ length: totalPages }, (_, i) => {
                  const page = project.pages[i];
                  const isApproved = page?.status === "approved";
                  const isCurrent = page?.status === "in-review";
                  return (
                    <div
                      key={i}
                      className={`w-8 h-8 flex items-center justify-center text-[10px] font-bold border ${
                        isApproved
                          ? "border-[#E8B931]/40 text-[#E8B931] bg-[#E8B931]/10"
                          : isCurrent
                          ? "border-[#999]/40 text-[#999] bg-[#999]/10"
                          : "border-[#222] text-[#333]"
                      }`}
                    >
                      {i + 1}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========== CHAPTERS TAB ========== */}
      {activeTab === "chapters" && project && (
        <div className="space-y-4">
          {project.chapters.length > 0 ? (
            <>
              {project.chapters.map((ch) => (
                <div key={ch.id} className="bg-[#111] border border-[#222] p-5">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-[#E8B931]/10 text-[#E8B931] text-xs font-bold flex items-center justify-center flex-shrink-0">
                      {ch.number}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-[#F5F5F0]">{ch.title}</span>
                        <span className="text-[10px] text-[#555] border border-[#333] px-2 py-0.5">
                          Pages {ch.pageRange}
                        </span>
                      </div>
                      <p className="text-xs text-[#666] mt-1">{ch.description}</p>
                    </div>
                  </div>
                </div>
              ))}
              {project.storyBeats && project.storyBeats.length > 0 && (
                <div className="bg-[#111] border border-[#222] p-6 mt-6">
                  <h3 className="text-xs font-bold text-[#E8B931] tracking-[0.2em] uppercase mb-4">Story Beats</h3>
                  <div className="space-y-2">
                    {project.storyBeats.map((beat) => (
                      <div key={beat.num} className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-[#222] text-[#E8B931] text-[9px] font-bold flex items-center justify-center flex-shrink-0">{beat.num}</div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-[#F5F5F0]">{beat.title}</span>
                            <span className="text-[10px] text-[#555]">{beat.pageRange}</span>
                          </div>
                          <p className="text-[11px] text-[#666]">{beat.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="bg-[#111] border border-[#222] p-8 text-center">
              <p className="text-sm text-[#555]">No chapters generated yet. Complete the creation wizard first.</p>
            </div>
          )}
        </div>
      )}

      {/* ========== CHARACTERS TAB ========== */}
      {activeTab === "characters" && project && (
        <div className="space-y-4">
          {project.characters.length > 0 ? project.characters.map((char) => (
            <div key={char.id} className="bg-[#111] border border-[#222] p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-[#222] flex items-center justify-center text-xs font-bold text-[#E8B931]">
                  {char.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
                </div>
                <div>
                  <span className="text-sm font-bold text-[#F5F5F0]">{char.name}</span>
                  <span className="text-[10px] tracking-widest uppercase border border-[#E8B931]/30 text-[#E8B931] px-1.5 py-0.5 ml-2">
                    {char.role}
                  </span>
                </div>
              </div>
              {char.description && <p className="text-xs text-[#666] mb-2">{char.description}</p>}
              <div className="grid grid-cols-2 gap-4">
                {char.appearance && (
                  <div>
                    <span className="text-[10px] text-[#E8B931] tracking-wider uppercase">Appearance</span>
                    <p className="text-xs text-[#999] mt-0.5">{char.appearance}</p>
                  </div>
                )}
                {char.personality && (
                  <div>
                    <span className="text-[10px] text-[#E8B931] tracking-wider uppercase">Personality</span>
                    <p className="text-xs text-[#999] mt-0.5">{char.personality}</p>
                  </div>
                )}
              </div>
            </div>
          )) : (
            <div className="bg-[#111] border border-[#222] p-8 text-center">
              <p className="text-sm text-[#555]">No characters defined yet.</p>
            </div>
          )}
        </div>
      )}

      {/* ========== WORLD TAB ========== */}
      {activeTab === "world" && project && (
        <div className="bg-[#111] border border-[#222] p-6 space-y-4">
          <h3 className="text-xs font-bold text-[#E8B931] tracking-[0.2em] uppercase">World Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { label: "Setting", value: project.world.setting },
              { label: "Time Period", value: project.world.timePeriod },
              { label: "Atmosphere", value: project.world.atmosphere },
              { label: "Technology", value: project.world.technology },
              { label: "Key Locations", value: project.world.keyLocations },
              { label: "World Rules", value: project.world.rules },
            ].map((item) => (
              item.value ? (
                <div key={item.label}>
                  <span className="text-[10px] text-[#E8B931] tracking-wider uppercase block mb-1">{item.label}</span>
                  <p className="text-xs text-[#999]">{item.value}</p>
                </div>
              ) : null
            ))}
          </div>
          {project.roughOverview && (
            <div className="border-t border-[#222] pt-4 mt-4">
              <span className="text-[10px] text-[#E8B931] tracking-wider uppercase block mb-2">Story Overview</span>
              <p className="text-xs text-[#999] leading-relaxed">{project.roughOverview}</p>
            </div>
          )}
        </div>
      )}

      {/* ========== ART STYLE TAB ========== */}
      {activeTab === "style" && project && (
        <div className="bg-[#111] border border-[#222] p-6">
          <h3 className="text-xs font-bold text-[#E8B931] tracking-[0.2em] uppercase mb-4">Art Style</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { label: "Art Style", value: project.style.artStyle },
              { label: "Color Palette", value: project.style.colorPalette },
              { label: "Panel Density", value: project.style.panelDensity },
              { label: "Speech Bubbles", value: project.style.speechBubbleStyle },
              { label: "Narration", value: project.style.narrationStyle },
              { label: "Detail Level", value: project.style.detailLevel },
            ].map((item) => (
              <div key={item.label} className="p-3 bg-[#0A0A0A] border border-[#222]">
                <span className="text-[10px] text-[#555] uppercase tracking-wider block">{item.label}</span>
                <span className="text-xs text-[#F5F5F0] font-medium capitalize">{item.value}</span>
              </div>
            ))}
          </div>
          {project.style.referenceNotes && (
            <div className="mt-4 p-3 bg-[#0A0A0A] border border-[#222]">
              <span className="text-[10px] text-[#555] uppercase tracking-wider block mb-1">Reference Notes</span>
              <p className="text-xs text-[#999]">{project.style.referenceNotes}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
