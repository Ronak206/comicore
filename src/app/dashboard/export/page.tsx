"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Download,
  FileText,
  Archive,
  Image,
  Loader2,
  AlertTriangle,
  ArrowLeft,
  Eye,
  Check,
  Type,
  Settings2,
  ChevronRight,
  BookOpen,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

type ExportStep = "select" | "preview" | "customize" | "download";

interface Project {
  id: string;
  title: string;
  genre: string;
  status: string;
  pages: number;
  totalPages: number;
  synopsis?: string;
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

interface ExportRecord {
  id: string;
  projectId: string;
  comicTitle: string;
  format: string;
  pages: number;
  size: string;
  date: string;
  status: string;
}

const exportFormats = [
  {
    id: "pdf",
    name: "PDF",
    icon: FileText,
    description: "Print-ready document with cover page and table of contents.",
    ext: ".pdf",
  },
  {
    id: "cbz",
    name: "CBZ",
    icon: Archive,
    description: "Standard comic archive format for comic reader apps.",
    ext: ".cbz",
  },
  {
    id: "images",
    name: "PNG Images",
    icon: Image,
    description: "Individual high-resolution PNG images in ZIP.",
    ext: ".zip",
  },
];

const fontOptions = [
  { id: "helvetica", name: "Helvetica", description: "Clean, modern sans-serif" },
  { id: "times", name: "Times Roman", description: "Classic, elegant serif" },
  { id: "courier", name: "Courier", description: "Monospace, typewriter style" },
];

export default function ExportPage() {
  const [step, setStep] = useState<ExportStep>("select");
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<ProjectDetail | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [selectedFormat, setSelectedFormat] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingProject, setLoadingProject] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [exportHistory, setExportHistory] = useState<ExportRecord[]>([]);
  const [expandedPage, setExpandedPage] = useState<string | null>(null);

  // PDF customization settings
  const [pdfSettings, setPdfSettings] = useState({
    font: "helvetica",
    fontSize: 10,
    includeCover: true,
    includeToc: true,
    includePageNumbers: true,
  });

  // Fetch completed projects from database
  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/engine/projects");
      const data = await res.json();

      if (data.success) {
        const completed = (data.data || []).filter(
          (p: Project) => p.status === "complete" || p.pages > 0
        );
        setProjects(completed);
      } else {
        setError(data.error || "Failed to load projects");
      }
    } catch (err: any) {
      setError(err.message || "Failed to load projects");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // Fetch full project details for preview
  const fetchProjectDetail = async (projectId: string) => {
    try {
      setLoadingProject(true);
      const res = await fetch(`/api/engine/project/${projectId}`);
      const data = await res.json();

      if (data.success) {
        setSelectedProject(data.data);
        setSelectedProjectId(projectId);
        setStep("preview");
      } else {
        setError(data.error || "Failed to load project");
      }
    } catch (err: any) {
      setError(err.message || "Failed to load project");
    } finally {
      setLoadingProject(false);
    }
  };

  // Handle project selection
  const handleSelectProject = (project: Project) => {
    fetchProjectDetail(project.id);
  };

  // Handle format selection and move to customize step
  const handleSelectFormat = (formatId: string) => {
    setSelectedFormat(formatId);
    setStep("customize");
  };

  // Handle export
  const handleExport = async () => {
    if (!selectedProject || !selectedFormat) return;

    setExporting(true);
    setError(null);

    try {
      let endpoint = "/api/export/pdf";
      let filename = `${selectedProject.title.replace(/\s+/g, "-").toLowerCase()}.pdf`;

      if (selectedFormat === "cbz") {
        endpoint = "/api/export/cbz";
        filename = `${selectedProject.title.replace(/\s+/g, "-").toLowerCase()}.cbz`;
      } else if (selectedFormat === "images") {
        endpoint = "/api/export/images";
        filename = `${selectedProject.title.replace(/\s+/g, "-").toLowerCase()}-pages.zip`;
      }

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: selectedProject.id,
          options: {
            title: selectedProject.title,
            font: pdfSettings.font,
            fontSize: pdfSettings.fontSize,
            includeCover: pdfSettings.includeCover,
            includeToc: pdfSettings.includeToc,
            includePageNumbers: pdfSettings.includePageNumbers,
            metadata: {
              title: selectedProject.title,
              author: "Comicore AI",
            },
          },
        }),
      });

      // Check for errors
      if (!res.ok) {
        const contentType = res.headers.get("content-type") || "";
        if (contentType.includes("application/json")) {
          const data = await res.json();
          setError(data.error || "Export failed");
          return;
        }
        setError("Export failed. Please try again.");
        return;
      }

      // Get the blob and download
      const blob = await res.blob();
      const sizeMB = (blob.size / (1024 * 1024)).toFixed(1);

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      // Add to export history
      const newExport: ExportRecord = {
        id: `export_${Date.now()}`,
        projectId: selectedProject.id,
        comicTitle: selectedProject.title,
        format: selectedFormat.toUpperCase(),
        pages: selectedProject.pages?.filter((p) => p.status === "approved").length || 0,
        size: `${sizeMB} MB`,
        date: "Just now",
        status: "completed",
      };
      setExportHistory((prev) => [newExport, ...prev]);

      setStep("download");
    } catch (err: any) {
      setError(err.message || "Export failed");
    } finally {
      setExporting(false);
    }
  };

  // Reset to select step
  const handleReset = () => {
    setStep("select");
    setSelectedProject(null);
    setSelectedProjectId(null);
    setSelectedFormat(null);
    setError(null);
    setExpandedPage(null);
  };

  // Get approved pages count
  const getApprovedPagesCount = () => {
    if (!selectedProject?.pages) return 0;
    return selectedProject.pages.filter((p) => p.status === "approved").length;
  };

  // Toggle page expansion
  const togglePageExpand = (pageId: string) => {
    setExpandedPage(expandedPage === pageId ? null : pageId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-[#E8B931] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-[#666] tracking-wide">
        <Link href="/dashboard" className="uppercase flex items-center gap-1">
          <ArrowLeft className="w-3 h-3" />
          Dashboard
        </Link>
        {selectedProject && (
          <>
            <ChevronRight className="w-3 h-3" />
            <span className="text-[#F5F5F0]">{selectedProject.title}</span>
          </>
        )}
      </div>

      {/* Page header */}
      <div className="space-y-1">
        <h2 className="text-2xl font-black text-[#F5F5F0] tracking-tight">
          <span className="text-stroke">EXPORT</span> Comics
        </h2>
        <p className="text-sm text-[#666]">
          Download your finished comics in multiple formats with preview.
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-950/30 border border-red-900/40 p-4 text-sm text-red-400 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          {error}
          <button onClick={() => setError(null)} className="ml-auto text-red-500">
            ✕
          </button>
        </div>
      )}

      {/* Progress Steps */}
      <div className="flex items-center gap-2">
        {["select", "preview", "customize", "download"].map((s, i) => (
          <div key={s} className="flex items-center">
            <div
              className={`w-8 h-8 flex items-center justify-center text-xs font-bold border ${
                step === s
                  ? "border-[#E8B931] text-[#E8B931] bg-[#E8B931]/10"
                  : i < ["select", "preview", "customize", "download"].indexOf(step)
                  ? "border-[#E8B931]/40 text-[#E8B931]"
                  : "border-[#333] text-[#555]"
              }`}
            >
              {i + 1}
            </div>
            {i < 3 && (
              <div
                className={`w-8 h-0.5 ${
                  i < ["select", "preview", "customize", "download"].indexOf(step)
                    ? "bg-[#E8B931]/40"
                    : "bg-[#333]"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* ========== STEP 1: SELECT PROJECT ========== */}
      {step === "select" && (
        <div className="space-y-6">
          <div className="bg-[#111] border border-[#222] p-6">
            <h3 className="text-xs font-bold text-[#E8B931] tracking-[0.2em] uppercase mb-4">
              Select a Completed Project
            </h3>

            {projects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {projects.map((project) => (
                  <button
                    key={project.id}
                    onClick={() => handleSelectProject(project)}
                    disabled={loadingProject}
                    className={`text-left p-4 border transition-all hover:border-[#E8B931]/50 ${
                      selectedProjectId === project.id
                        ? "border-[#E8B931] bg-[#E8B931]/5"
                        : "border-[#222] bg-[#0A0A0A]"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="text-sm font-bold text-[#F5F5F0]">{project.title}</h4>
                      <span
                        className={`text-[10px] tracking-widest uppercase border px-2 py-0.5 ${
                          project.status === "complete"
                            ? "border-[#E8B931]/40 text-[#E8B931]"
                            : "border-[#555]/40 text-[#555]"
                        }`}
                      >
                        {project.status === "complete" ? "Completed" : "In Progress"}
                      </span>
                    </div>
                    <div className="text-xs text-[#666] mb-1">{project.genre}</div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-[#555]">
                        {project.pages}/{project.totalPages} pages
                      </span>
                      <span className="text-xs text-[#444]">
                        Updated {new Date(project.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <BookOpen className="w-12 h-12 text-[#333] mx-auto mb-4" />
                <p className="text-sm text-[#555] mb-2">No completed projects available for export.</p>
                <Link
                  href="/dashboard/create"
                  className="mt-4 inline-block px-6 py-3 bg-[#E8B931] text-[#0A0A0A] font-bold tracking-wide uppercase text-xs"
                >
                  Create New Comic
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========== STEP 2: PREVIEW ========== */}
      {step === "preview" && selectedProject && (
        <div className="space-y-6">
          {/* Project Info */}
          <div className="bg-[#111] border border-[#222] p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-[#F5F5F0]">{selectedProject.title}</h3>
                <p className="text-xs text-[#666]">
                  {selectedProject.genre} • {getApprovedPagesCount()} approved pages
                </p>
              </div>
              <button onClick={handleReset} className="text-xs text-[#666] tracking-wide uppercase">
                Change Project
              </button>
            </div>
            {selectedProject.synopsis && (
              <p className="text-sm text-[#999]">{selectedProject.synopsis}</p>
            )}
          </div>

          {/* Page Preview with Content */}
          <div className="bg-[#111] border border-[#222] p-6">
            <div className="flex items-center gap-2 mb-4">
              <Eye className="w-4 h-4 text-[#E8B931]" />
              <h3 className="text-xs font-bold text-[#E8B931] tracking-[0.2em] uppercase">
                Page Preview (Click to expand)
              </h3>
            </div>

            <div className="space-y-3">
              {selectedProject.pages
                ?.filter((p) => p.status === "approved")
                .sort((a, b) => a.number - b.number)
                .map((page) => {
                  const isExpanded = expandedPage === page.id;
                  return (
                    <div key={page.id} className="bg-[#0A0A0A] border border-[#222] overflow-hidden">
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
                            <div className="text-sm font-bold text-[#F5F5F0]">{page.title}</div>
                            <div className="text-[10px] text-[#555]">{page.panels?.length || 0} panels</div>
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
                              <p className="text-xs text-[#999] leading-relaxed">{page.script}</p>
                            </div>
                          )}

                          {/* Panels */}
                          {page.panels && page.panels.length > 0 && (
                            <div className="space-y-4">
                              <div className="text-[10px] text-[#E8B931] uppercase tracking-wider mb-2">
                                Panels
                              </div>
                              {page.panels.map((panel, idx) => (
                                <div key={idx} className="bg-[#111] border border-[#222] p-3">
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
                                  <p className="text-[11px] text-[#888] mb-2">{panel.description}</p>

                                  {/* Dialogue */}
                                  {panel.dialogue && panel.dialogue.length > 0 && (
                                    <div className="space-y-2 mt-3 border-t border-[#222] pt-3">
                                      {panel.dialogue.map((d, di) => (
                                        <div key={di} className="text-[11px]">
                                          <span className="text-[#E8B931] font-bold">
                                            {d.type === "narration" ? "NARRATOR" : d.character}:
                                          </span>{" "}
                                          <span className="text-[#999] italic">"{d.text}"</span>
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
            </div>
          </div>

          {/* Format Selection */}
          <div className="bg-[#111] border border-[#222] p-6">
            <h3 className="text-xs font-bold text-[#E8B931] tracking-[0.2em] uppercase mb-4">
              Select Export Format
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {exportFormats.map((format) => (
                <button
                  key={format.id}
                  onClick={() => handleSelectFormat(format.id)}
                  className={`text-left p-4 border transition-all hover:border-[#E8B931]/50 ${
                    selectedFormat === format.id
                      ? "border-[#E8B931] bg-[#E8B931]/5"
                      : "border-[#222] bg-[#0A0A0A]"
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <format.icon className="w-5 h-5 text-[#E8B931]" />
                    <span className="text-sm font-bold text-[#F5F5F0]">{format.name}</span>
                    <span className="text-[10px] text-[#555] ml-auto">{format.ext}</span>
                  </div>
                  <p className="text-xs text-[#666]">{format.description}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========== STEP 3: CUSTOMIZE ========== */}
      {step === "customize" && selectedProject && selectedFormat && (
        <div className="space-y-6">
          <button
            onClick={() => setStep("preview")}
            className="flex items-center gap-2 text-xs text-[#666] tracking-wide uppercase"
          >
            <ArrowLeft className="w-3 h-3" /> Back to Preview
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* PDF Settings */}
            {selectedFormat === "pdf" && (
              <div className="bg-[#111] border border-[#222] p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Settings2 className="w-4 h-4 text-[#E8B931]" />
                  <h3 className="text-xs font-bold text-[#E8B931] tracking-[0.2em] uppercase">
                    PDF Settings
                  </h3>
                </div>

                {/* Font Selection */}
                <div className="mb-6">
                  <label className="text-xs text-[#999] tracking-wider uppercase mb-3 block flex items-center gap-2">
                    <Type className="w-3 h-3" /> Font Style
                  </label>
                  <div className="space-y-2">
                    {fontOptions.map((font) => (
                      <button
                        key={font.id}
                        onClick={() => setPdfSettings((prev) => ({ ...prev, font: font.id }))}
                        className={`w-full text-left p-3 border transition-colors ${
                          pdfSettings.font === font.id
                            ? "border-[#E8B931] bg-[#E8B931]/5"
                            : "border-[#222] bg-[#0A0A0A] hover:border-[#333]"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-sm text-[#F5F5F0]">{font.name}</div>
                            <div className="text-[10px] text-[#555]">{font.description}</div>
                          </div>
                          {pdfSettings.font === font.id && <Check className="w-4 h-4 text-[#E8B931]" />}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Options */}
                <div className="space-y-3">
                  <label className="flex items-center gap-3 p-3 bg-[#0A0A0A] border border-[#222]">
                    <input
                      type="checkbox"
                      checked={pdfSettings.includeCover}
                      onChange={(e) =>
                        setPdfSettings((prev) => ({ ...prev, includeCover: e.target.checked }))
                      }
                      className="accent-[#E8B931]"
                    />
                    <span className="text-xs text-[#999]">Include cover page</span>
                  </label>
                  <label className="flex items-center gap-3 p-3 bg-[#0A0A0A] border border-[#222]">
                    <input
                      type="checkbox"
                      checked={pdfSettings.includeToc}
                      onChange={(e) =>
                        setPdfSettings((prev) => ({ ...prev, includeToc: e.target.checked }))
                      }
                      className="accent-[#E8B931]"
                    />
                    <span className="text-xs text-[#999]">Include table of contents</span>
                  </label>
                  <label className="flex items-center gap-3 p-3 bg-[#0A0A0A] border border-[#222]">
                    <input
                      type="checkbox"
                      checked={pdfSettings.includePageNumbers}
                      onChange={(e) =>
                        setPdfSettings((prev) => ({ ...prev, includePageNumbers: e.target.checked }))
                      }
                      className="accent-[#E8B931]"
                    />
                    <span className="text-xs text-[#999]">Include page numbers</span>
                  </label>
                </div>
              </div>
            )}

            {/* Export Summary */}
            <div className="space-y-4">
              <div className="bg-[#111] border border-[#222] p-6">
                <h3 className="text-xs font-bold text-[#E8B931] tracking-[0.2em] uppercase mb-4">
                  Export Summary
                </h3>

                <div className="space-y-3">
                  <div className="flex justify-between py-2 border-b border-[#222]">
                    <span className="text-xs text-[#666] uppercase tracking-wider">Comic Title</span>
                    <span className="text-xs text-[#F5F5F0] font-medium">{selectedProject.title}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-[#222]">
                    <span className="text-xs text-[#666] uppercase tracking-wider">Format</span>
                    <span className="text-xs text-[#F5F5F0] font-medium">
                      {exportFormats.find((f) => f.id === selectedFormat)?.name}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-[#222]">
                    <span className="text-xs text-[#666] uppercase tracking-wider">Pages</span>
                    <span className="text-xs text-[#F5F5F0] font-medium">{getApprovedPagesCount()} pages</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-[#222]">
                    <span className="text-xs text-[#666] uppercase tracking-wider">Genre</span>
                    <span className="text-xs text-[#F5F5F0] font-medium">{selectedProject.genre}</span>
                  </div>
                  {selectedFormat === "pdf" && (
                    <div className="flex justify-between py-2 border-b border-[#222]">
                      <span className="text-xs text-[#666] uppercase tracking-wider">Font</span>
                      <span className="text-xs text-[#F5F5F0] font-medium">
                        {fontOptions.find((f) => f.id === pdfSettings.font)?.name}
                      </span>
                    </div>
                  )}
                </div>

                <div className="mt-6 pt-4 border-t border-[#222]">
                  <button
                    onClick={handleExport}
                    disabled={exporting}
                    className="w-full py-4 bg-[#E8B931] text-[#0A0A0A] font-bold tracking-[0.15em] uppercase text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {exporting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Exporting...
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4" />
                        Generate & Download
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========== STEP 4: DOWNLOAD COMPLETE ========== */}
      {step === "download" && selectedProject && selectedFormat && (
        <div className="space-y-6">
          <div className="bg-[#111] border border-[#E8B931]/30 p-8 text-center">
            <div className="w-16 h-16 bg-[#E8B931]/10 mx-auto mb-4 flex items-center justify-center">
              <Check className="w-8 h-8 text-[#E8B931]" />
            </div>
            <h3 className="text-xl font-black text-[#F5F5F0] mb-2">Export Complete!</h3>
            <p className="text-sm text-[#666] mb-6">
              Your comic has been exported as {exportFormats.find((f) => f.id === selectedFormat)?.name}.
            </p>

            <div className="flex items-center justify-center gap-3">
              <button onClick={handleReset} className="px-6 py-3 border border-[#333] text-[#F5F5F0] text-xs tracking-wide uppercase">
                Export Another
              </button>
              <Link
                href="/dashboard"
                className="px-6 py-3 bg-[#E8B931] text-[#0A0A0A] font-bold tracking-[0.1em] uppercase text-xs"
              >
                Back to Dashboard
              </Link>
            </div>
          </div>

          {/* Export History */}
          {exportHistory.length > 0 && (
            <div className="bg-[#111] border border-[#222] overflow-hidden">
              <div className="px-6 py-4 border-b border-[#222]">
                <h3 className="text-xs font-bold text-[#E8B931] tracking-[0.2em] uppercase">
                  Recent Exports
                </h3>
              </div>
              {exportHistory.slice(0, 5).map((item) => (
                <div key={item.id} className="px-6 py-3 border-b border-[#222]/50 flex items-center justify-between">
                  <div>
                    <div className="text-sm text-[#F5F5F0]">{item.comicTitle}</div>
                    <div className="text-[10px] text-[#555]">
                      {item.pages} pages • {item.size}
                    </div>
                  </div>
                  <span className="text-[10px] text-[#E8B931] tracking-widest uppercase border border-[#E8B931]/30 px-2 py-0.5">
                    {item.format}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
