"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ChevronRight,
  Play,
  Plus,
  Download,
  Brain,
  Loader2,
  FolderOpen,
  Eye,
  X,
  BookOpen,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

// ─── Types ───────────────────────────────────────

interface Project {
  id: string;
  title: string;
  genre: string;
  status: string;
  pages: number;
  totalPages: number;
  createdAt: string;
  updatedAt: string;
}

interface ProjectDetail {
  id: string;
  title: string;
  genre: string;
  synopsis: string;
  tone: string;
  status: string;
  pageGoal: number;
  currentPage: number;
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
  }>;
}

// ─── Helpers ─────────────────────────────────────

function timeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return "Just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function getStatusColor(status: string) {
  switch (status) {
    case "complete":
      return "border-[#E8B931]/40 text-[#E8B931]";
    case "generating":
      return "border-[#999]/40 text-[#999]";
    case "reviewing":
      return "border-blue-400/40 text-blue-400";
    case "chapters":
    case "overview":
    case "setup":
      return "border-[#555]/40 text-[#555]";
    default:
      return "border-[#555]/40 text-[#555]";
  }
}

function getStatusLabel(status: string) {
  switch (status) {
    case "complete": return "Completed";
    case "generating": return "In Progress";
    case "reviewing": return "Reviewing";
    case "chapters": return "Planned";
    case "overview": return "Draft";
    case "setup": return "Setup";
    default: return status;
  }
}

function getGradient(genre: string): string {
  const gradients: Record<string, string> = {
    "Sci-Fi": "from-[#0A1628] to-[#1A1A1A]",
    "Fantasy": "from-[#1A1A0A] to-[#1A1A1A]",
    "Dark Fantasy": "from-[#1A0A0A] to-[#1A1A1A]",
    "Horror": "from-[#1A0A0A] to-[#0A0A0A]",
    "Noir": "from-[#0A0A0A] to-[#151515]",
    "Superhero": "from-[#0A1028] to-[#1A1A1A]",
    "Romance": "from-[#1A0A18] to-[#1A1A1A]",
    "Comedy": "from-[#1A1A05] to-[#1A1A1A]",
    "Thriller": "from-[#1A0F0A] to-[#1A1A1A]",
    "Mystery": "from-[#0F0A1A] to-[#1A1A1A]",
    "Post-Apocalyptic": "from-[#1A150A] to-[#0A0A0A]",
    "Space Opera": "from-[#0A0A28] to-[#1A1A1A]",
    "Manga": "from-[#0A1A1A] to-[#1A1A1A]",
  };
  return gradients[genre] || "from-[#1A1A1A] to-[#151515]";
}

// ─── Component ───────────────────────────────────

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Preview modal state
  const [showPreview, setShowPreview] = useState(false);
  const [previewProject, setPreviewProject] = useState<ProjectDetail | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [expandedPage, setExpandedPage] = useState<string | null>(null);

  // Fetch real projects from DB
  useEffect(() => {
    async function fetchProjects() {
      try {
        setLoading(true);
        const res = await fetch("/api/engine/projects");
        const data = await res.json();
        if (!data.success) throw new Error(data.error || "Failed to load projects");
        setProjects(data.data || []);
        setError(null);
      } catch (err: any) {
        setError(err.message || "Failed to load projects");
      } finally {
        setLoading(false);
      }
    }
    fetchProjects();
  }, []);

  // Handle project click
  const handleProjectClick = async (project: Project) => {
    // For completed projects, show preview
    if (project.status === "complete" || project.pages > 0) {
      await openPreview(project.id);
    }
  };

  // Open preview modal
  const openPreview = async (projectId: string) => {
    try {
      setLoadingPreview(true);
      setShowPreview(true);
      setExpandedPage(null);
      const res = await fetch(`/api/engine/project/${projectId}`);
      const data = await res.json();
      if (data.success) {
        setPreviewProject(data.data);
      } else {
        setError(data.error || "Failed to load preview");
        setShowPreview(false);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load preview");
      setShowPreview(false);
    } finally {
      setLoadingPreview(false);
    }
  };

  // Close preview modal
  const closePreview = () => {
    setShowPreview(false);
    setPreviewProject(null);
    setExpandedPage(null);
  };

  // Compute stats from real data
  const totalComics = projects.length;
  const totalPagesCreated = projects.reduce((sum, p) => sum + p.pages, 0);
  const completedComics = projects.filter((p) => p.status === "complete").length;
  const inProgress = projects.filter((p) => p.status === "generating" || p.status === "reviewing").length;

  const stats = [
    { label: "Total Comics", value: String(totalComics), sub: completedComics > 0 ? `${completedComics} completed` : "Start creating" },
    { label: "Pages Created", value: String(totalPagesCreated), sub: inProgress > 0 ? `${inProgress} in progress` : "All approved" },
    { label: "In Progress", value: String(inProgress), sub: "Active projects" },
    { label: "Completed", value: String(completedComics), sub: totalComics > 0 ? `${Math.round((completedComics / totalComics) * 100)}%` : "—" },
  ];

  const quickActions = [
    { icon: Plus, label: "New Comic", href: "/dashboard/create" },
    { icon: Play, label: "Resume Last", href: projects.length > 0 && inProgress > 0 ? `/dashboard/comic/${projects.find(p => p.status === "generating" || p.status === "reviewing")?.id}` : "/dashboard/create" },
    { icon: Download, label: "Export All", href: "/dashboard/export" },
    { icon: Brain, label: "Memory Bank", href: "/dashboard/memory" },
  ];

  // Build activity from project data
  const activities: Array<{ text: string; time: string }> = [];
  for (const p of projects.slice(0, 5)) {
    const label = getStatusLabel(p.status);
    activities.push({
      text: `"${p.title}" — ${label} (${p.pages}/${p.totalPages} pages)`,
      time: timeAgo(p.updatedAt),
    });
  }

  // Get approved pages count for preview
  const getApprovedPagesCount = () => {
    if (!previewProject?.pages) return 0;
    return previewProject.pages.filter((p) => p.status === "approved").length;
  };

  // Toggle page expansion
  const togglePageExpand = (pageId: string) => {
    setExpandedPage(expandedPage === pageId ? null : pageId);
  };

  return (
    <>
      <div className="space-y-8">
        {/* Page header */}
        <div className="space-y-1">
          <h2 className="text-2xl font-black text-[#F5F5F0] tracking-tight">
            Your Comics
          </h2>
          <p className="text-sm text-[#666]">
            {loading ? "Loading projects..." : projects.length > 0 ? `${projects.length} project${projects.length !== 1 ? "s" : ""} — pick up where you left off.` : "No projects yet. Create your first comic!"}
          </p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="bg-[#111] border border-[#222] p-5"
            >
              <div className="text-xs text-[#666] tracking-[0.15em] uppercase mb-2">
                {stat.label}
              </div>
              <div className="text-3xl font-black text-[#E8B931] mb-1">
                {stat.value}
              </div>
              <div className="text-xs text-[#555]">{stat.sub}</div>
            </div>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-950/30 border border-red-900/40 p-4 text-sm text-red-400 flex items-center gap-2">
            {error}
            <button onClick={() => setError(null)} className="ml-auto text-red-500">✕</button>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 text-[#E8B931] animate-spin" />
            <span className="text-sm text-[#666] ml-3">Loading projects...</span>
          </div>
        )}

        {/* Recent projects */}
        {!loading && projects.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-xs font-bold text-[#E8B931] tracking-[0.2em] uppercase">
                Your Projects
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.map((project) => {
                const isCompleted = project.status === "complete" || project.pages > 0;
                return isCompleted ? (
                  // Completed project - show preview on click
                  <button
                    key={project.id}
                    onClick={() => handleProjectClick(project)}
                    className="bg-[#111] border border-[#222] overflow-hidden block text-left w-full"
                  >
                    {/* Thumbnail area */}
                    <div className={`h-36 bg-gradient-to-br ${getGradient(project.genre)} relative`}>
                      {/* Comic panel grid pattern */}
                      <div className="absolute inset-3 grid grid-cols-3 grid-rows-2 gap-1">
                        <div className="bg-[#222]/40 col-span-2 row-span-2 rounded-sm" />
                        <div className="bg-[#222]/40 rounded-sm" />
                        <div className="bg-[#222]/40 rounded-sm" />
                      </div>
                      {/* Genre badge */}
                      <div className="absolute top-3 right-3 text-[9px] tracking-widest uppercase text-[#666] border border-[#333]/60 px-2 py-0.5 bg-[#0A0A0A]/60">
                        {project.genre}
                      </div>
                      {/* Preview indicator */}
                      <div className="absolute bottom-3 left-3 flex items-center gap-1 text-[9px] text-[#E8B931] bg-[#0A0A0A]/80 px-2 py-1">
                        <Eye className="w-3 h-3" /> Preview
                      </div>
                    </div>

                    {/* Info */}
                    <div className="p-4 space-y-2">
                      <h4 className="text-sm font-bold text-[#F5F5F0]">
                        {project.title}
                      </h4>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-[#666]">
                          {project.pages}/{project.totalPages} pages
                        </span>
                        <span
                          className={`text-[10px] tracking-widest uppercase border px-2 py-0.5 ${getStatusColor(
                            project.status
                          )}`}
                        >
                          {getStatusLabel(project.status)}
                        </span>
                      </div>
                      <div className="text-[10px] text-[#555]">
                        Updated {timeAgo(project.updatedAt)}
                      </div>
                    </div>
                  </button>
                ) : (
                  // In-progress project - link to workspace
                  <Link
                    key={project.id}
                    href={`/dashboard/comic/${project.id}`}
                    className="bg-[#111] border border-[#222] overflow-hidden block"
                  >
                    {/* Thumbnail area */}
                    <div className={`h-36 bg-gradient-to-br ${getGradient(project.genre)} relative`}>
                      {/* Comic panel grid pattern */}
                      <div className="absolute inset-3 grid grid-cols-3 grid-rows-2 gap-1">
                        <div className="bg-[#222]/40 col-span-2 row-span-2 rounded-sm" />
                        <div className="bg-[#222]/40 rounded-sm" />
                        <div className="bg-[#222]/40 rounded-sm" />
                      </div>
                      {/* Genre badge */}
                      <div className="absolute top-3 right-3 text-[9px] tracking-widest uppercase text-[#666] border border-[#333]/60 px-2 py-0.5 bg-[#0A0A0A]/60">
                        {project.genre}
                      </div>
                    </div>

                    {/* Info */}
                    <div className="p-4 space-y-2">
                      <h4 className="text-sm font-bold text-[#F5F5F0]">
                        {project.title}
                      </h4>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-[#666]">
                          {project.pages}/{project.totalPages} pages
                        </span>
                        <span
                          className={`text-[10px] tracking-widest uppercase border px-2 py-0.5 ${getStatusColor(
                            project.status
                          )}`}
                        >
                          {getStatusLabel(project.status)}
                        </span>
                      </div>
                      <div className="text-[10px] text-[#555]">
                        Updated {timeAgo(project.updatedAt)}
                      </div>
                    </div>
                  </Link>
                );
              })}

              {/* New project card */}
              <Link
                href="/dashboard/create"
                className="bg-[#111] border border-dashed border-[#333] overflow-hidden block"
              >
                <div className="h-36 flex items-center justify-center">
                  <Plus className="w-8 h-8 text-[#333]" />
                </div>
                <div className="p-4">
                  <h4 className="text-sm font-bold text-[#555]">
                    Create New Comic
                  </h4>
                  <div className="text-xs text-[#444] mt-1">
                    Start a new story from scratch
                  </div>
                </div>
              </Link>
            </div>
          </div>
        )}

        {/* Empty state */}
        {!loading && projects.length === 0 && (
          <div className="bg-[#111] border border-[#222] p-12 text-center">
            <FolderOpen className="w-12 h-12 text-[#333] mx-auto mb-4" />
            <h3 className="text-lg font-black text-[#F5F5F0] mb-2">No Projects Yet</h3>
            <p className="text-sm text-[#666] mb-6 max-w-md mx-auto">
              Create your first comic book with AI. Set up your story, characters, and world — then generate pages one by one.
            </p>
            <Link
              href="/dashboard/create"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#E8B931] text-[#0A0A0A] font-bold tracking-[0.1em] uppercase text-xs"
            >
              <Plus className="w-4 h-4" /> Create Your First Comic
            </Link>
          </div>
        )}

        {/* Bottom row: Activity + Quick Actions */}
        {!loading && projects.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Activity Timeline */}
            <div className="lg:col-span-2 bg-[#111] border border-[#222] p-6">
              <h3 className="text-xs font-bold text-[#E8B931] tracking-[0.2em] uppercase mb-5">
                Recent Activity
              </h3>
              <div className="space-y-4">
                {activities.map((activity, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-[#E8B931] mt-1.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-[#F5F5F0]">{activity.text}</p>
                      <p className="text-xs text-[#555] mt-0.5">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-[#111] border border-[#222] p-6">
              <h3 className="text-xs font-bold text-[#E8B931] tracking-[0.2em] uppercase mb-5">
                Quick Actions
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {quickActions.map((action) => (
                  <Link
                    key={action.label}
                    href={action.href}
                    className="flex flex-col items-center justify-center gap-2 p-4 bg-[#0A0A0A] border border-[#222] text-center"
                  >
                    <action.icon className="w-5 h-5 text-[#E8B931]" />
                    <span className="text-[10px] text-[#999] tracking-wider uppercase">
                      {action.label}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Preview Modal - Preview Only */}
      {showPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
          <div className="bg-[#0A0A0A] border border-[#222] w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-[#222]">
              <div className="flex items-center gap-3">
                <Eye className="w-5 h-5 text-[#E8B931]" />
                <h3 className="text-lg font-bold text-[#F5F5F0]">
                  {previewProject?.title || "Preview"}
                </h3>
                {previewProject && (
                  <span className="text-xs text-[#666]">
                    {previewProject.genre} • {getApprovedPagesCount()} pages
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href="/dashboard/export"
                  className="px-4 py-2 bg-[#E8B931] text-[#0A0A0A] font-bold text-xs tracking-wide uppercase flex items-center gap-2"
                >
                  <Download className="w-3 h-3" />
                  Export
                </Link>
                <button
                  onClick={closePreview}
                  className="text-[#666] hover:text-[#F5F5F0] p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {loadingPreview ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="w-8 h-8 text-[#E8B931] animate-spin" />
                </div>
              ) : previewProject ? (
                <div className="space-y-4">
                  {/* Project Info */}
                  {previewProject.synopsis && (
                    <div className="bg-[#111] border border-[#222] p-4 mb-4">
                      <div className="text-[10px] text-[#E8B931] uppercase tracking-wider mb-2">
                        Synopsis
                      </div>
                      <p className="text-sm text-[#999]">{previewProject.synopsis}</p>
                    </div>
                  )}

                  {/* Page List with Content */}
                  <h4 className="text-xs font-bold text-[#E8B931] tracking-[0.15em] uppercase">
                    All Pages (Click to expand)
                  </h4>
                  
                  {previewProject.pages
                    ?.filter((p) => p.status === "approved")
                    .sort((a, b) => a.number - b.number)
                    .map((page) => {
                      const isExpanded = expandedPage === page.id;
                      return (
                        <div
                          key={page.id}
                          className="bg-[#111] border border-[#222] overflow-hidden"
                        >
                          {/* Page Header - Clickable */}
                          <button
                            onClick={() => togglePageExpand(page.id)}
                            className="w-full p-4 flex items-center justify-between hover:bg-[#1A1A1A] transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-[#E8B931]/10 text-[#E8B931] text-sm font-bold flex items-center justify-center">
                                {page.number}
                              </div>
                              <div className="text-left">
                                <div className="text-sm font-bold text-[#F5F5F0]">
                                  {page.title}
                                </div>
                                <div className="text-[10px] text-[#555]">
                                  {page.panels?.length || 0} panels
                                </div>
                              </div>
                            </div>
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4 text-[#666]" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-[#666]" />
                            )}
                          </button>

                          {/* Expanded Content */}
                          {isExpanded && (
                            <div className="px-4 pb-4 border-t border-[#222] pt-4">
                              {/* Script */}
                              {page.script && (
                                <div className="mb-4">
                                  <div className="text-[10px] text-[#E8B931] uppercase tracking-wider mb-2">
                                    Script Summary
                                  </div>
                                  <p className="text-xs text-[#999] leading-relaxed">
                                    {page.script}
                                  </p>
                                </div>
                              )}

                              {/* Panels */}
                              {page.panels && page.panels.length > 0 && (
                                <div className="space-y-4">
                                  <div className="text-[10px] text-[#E8B931] uppercase tracking-wider mb-2">
                                    Panels
                                  </div>
                                  {page.panels.map((panel, idx) => (
                                    <div
                                      key={idx}
                                      className="bg-[#0A0A0A] border border-[#222] p-3"
                                    >
                                      <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs font-bold text-[#F5F5F0]">
                                          Panel {panel.panelNumber || idx + 1}
                                        </span>
                                        <div className="flex items-center gap-2">
                                          {panel.cameraAngle && (
                                            <span className="text-[9px] text-[#555] bg-[#1A1A1A] px-2 py-0.5">
                                              {panel.cameraAngle}
                                            </span>
                                          )}
                                          {panel.mood && (
                                            <span className="text-[9px] text-[#555] bg-[#1A1A1A] px-2 py-0.5">
                                              {panel.mood}
                                            </span>
                                          )}
                                        </div>
                                      </div>

                                      {/* Description */}
                                      <p className="text-[11px] text-[#888] mb-2">
                                        {panel.description}
                                      </p>

                                      {/* Dialogue */}
                                      {panel.dialogue && panel.dialogue.length > 0 && (
                                        <div className="space-y-2 mt-3 border-t border-[#222] pt-3">
                                          {panel.dialogue.map((d, di) => (
                                            <div key={di} className="text-[11px]">
                                              <span className="text-[#E8B931] font-bold">
                                                {d.type === "narration" ? "NARRATOR" : d.character}:
                                              </span>{" "}
                                              <span className="text-[#999] italic">
                                                "{d.text}"
                                              </span>
                                            </div>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}

                  {/* No pages message */}
                  {(!previewProject.pages || previewProject.pages.filter((p) => p.status === "approved").length === 0) && (
                    <div className="text-center py-8 text-[#666]">
                      <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No approved pages yet</p>
                    </div>
                  )}
                </div>
              ) : null}
            </div>

            {/* Modal Footer */}
            {previewProject && (
              <div className="p-4 border-t border-[#222] flex items-center justify-between">
                <div className="text-xs text-[#555]">
                  To download, go to Export page
                </div>
                <div className="flex items-center gap-3">
                  <Link
                    href={`/dashboard/comic/${previewProject.id}`}
                    onClick={closePreview}
                    className="px-4 py-2 border border-[#333] text-[#F5F5F0] text-xs tracking-wide uppercase"
                  >
                    Continue Editing
                  </Link>
                  <Link
                    href="/dashboard/export"
                    className="px-4 py-2 bg-[#E8B931] text-[#0A0A0A] font-bold text-xs tracking-wide uppercase flex items-center gap-2"
                  >
                    <Download className="w-3 h-3" />
                    Go to Export
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
