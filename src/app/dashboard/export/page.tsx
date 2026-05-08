"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Download,
  FileText,
  Archive,
  CheckCircle2,
  Image,
  Loader2,
  AlertTriangle,
  ArrowLeft,
} from "lucide-react";

type ExportTab = "new" | "history" | "formats";

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
    description: "Print-ready document with cover page, table of contents, and all pages in order. Best for reading on screens and printing.",
    features: ["Cover page", "Table of contents", "Page numbers", "High quality (300 DPI)", "Single file"],
    recommended: "Reading / Sharing",
    ext: ".pdf",
  },
  {
    id: "cbz",
    name: "CBZ",
    icon: Archive,
    description: "Standard comic archive format. ZIP-based container with numbered page images. Readable by all comic reader apps.",
    features: ["Numbered pages", "High-res images", "Metadata included", "Compatible with CBR/CBZ readers", "Lossless quality"],
    recommended: "Comic Readers / Archive",
    ext: ".cbz",
  },
  {
    id: "images",
    name: "PNG Sequence",
    icon: Image,
    description: "Individual high-resolution PNG images for each page. Maximum quality with transparency support. Ideal for further editing.",
    features: ["Individual PNG files", "300 DPI minimum", "Transparent backgrounds", "Named by page number", "ZIP archive"],
    recommended: "Editing / Print Production",
    ext: ".zip",
  },
];

export default function ExportPage() {
  const [activeTab, setActiveTab] = useState<ExportTab>("new");
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedFormat, setSelectedFormat] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exportHistory, setExportHistory] = useState<ExportRecord[]>([]);

  // Fetch projects from database
  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/engine/projects");
      const data = await res.json();
      
      if (data.success) {
        setProjects(data.data || []);
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

  // Handle export
  const handleExport = async () => {
    if (!selectedProject || !selectedFormat) return;
    
    setExporting(true);
    setError(null);

    try {
      let endpoint = "/api/export/pdf";
      if (selectedFormat === "cbz") {
        endpoint = "/api/export/cbz";
      } else if (selectedFormat === "images") {
        endpoint = "/api/export/images";
      }
      
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: selectedProject.id,
          options: {
            title: selectedProject.title,
            metadata: {
              title: selectedProject.title,
              author: "Comicore AI",
            },
          },
        }),
      });
      
      const data = await res.json();
      
      if (data.success) {
        // Add to export history
        const newExport: ExportRecord = {
          id: `export_${Date.now()}`,
          projectId: selectedProject.id,
          comicTitle: selectedProject.title,
          format: selectedFormat.toUpperCase(),
          pages: selectedProject.pages,
          size: data.data.estimatedSize || "Calculating...",
          date: "Just now",
          status: "completed",
        };
        setExportHistory((prev) => [newExport, ...prev]);
        
        // In production, trigger download
        if (data.data.downloadUrl) {
          window.open(data.data.downloadUrl, "_blank");
        }
      } else {
        setError(data.error || "Export failed");
      }
    } catch (err: any) {
      setError(err.message || "Export failed");
    } finally {
      setExporting(false);
    }
  };

  // Get ready comics (completed or has approved pages)
  const readyProjects = projects.filter((p) => p.status === "complete" || p.pages > 0);

  // Stats
  const totalExports = exportHistory.length;
  const readyCount = readyProjects.length;
  const totalPages = projects.reduce((sum, p) => sum + p.pages, 0);

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
      </div>

      {/* Page header */}
      <div className="space-y-1">
        <h2 className="text-2xl font-black text-[#F5F5F0] tracking-tight">
          <span className="text-stroke">EXPORT</span> Comics
        </h2>
        <p className="text-sm text-[#666]">
          Download your finished comics in multiple formats.
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-950/30 border border-red-900/40 p-4 text-sm text-red-400 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          {error}
          <button onClick={() => setError(null)} className="ml-auto text-red-500">✕</button>
        </div>
      )}

      {/* Export stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#111] border border-[#222] p-4">
          <div className="text-xs text-[#666] tracking-[0.15em] uppercase mb-1">Total Exports</div>
          <div className="text-2xl font-black text-[#E8B931]">{totalExports}</div>
          <div className="text-xs text-[#555]">All time</div>
        </div>
        <div className="bg-[#111] border border-[#222] p-4">
          <div className="text-xs text-[#666] tracking-[0.15em] uppercase mb-1">Ready Comics</div>
          <div className="text-2xl font-black text-[#E8B931]">{readyCount}</div>
          <div className="text-xs text-[#555]">Available now</div>
        </div>
        <div className="bg-[#111] border border-[#222] p-4">
          <div className="text-xs text-[#666] tracking-[0.15em] uppercase mb-1">Total Pages</div>
          <div className="text-2xl font-black text-[#E8B931]">{totalPages}</div>
          <div className="text-xs text-[#555]">Across all projects</div>
        </div>
        <div className="bg-[#111] border border-[#222] p-4">
          <div className="text-xs text-[#666] tracking-[0.15em] uppercase mb-1">Formats</div>
          <div className="text-2xl font-black text-[#E8B931]">3</div>
          <div className="text-xs text-[#555]">PDF, CBZ, PNG</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-[#222]">
        {[
          { key: "new" as ExportTab, label: "New Export" },
          { key: "history" as ExportTab, label: "History" },
          { key: "formats" as ExportTab, label: "Formats" },
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
      {activeTab === "new" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Step 1: Select comic */}
          <div className="bg-[#111] border border-[#222] p-6">
            <h3 className="text-xs font-bold text-[#E8B931] tracking-[0.2em] uppercase mb-1">
              Step 1
            </h3>
            <h4 className="text-sm font-bold text-[#F5F5F0] mb-4">Select Comic</h4>
            
            {readyProjects.length > 0 ? (
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {readyProjects.map((project) => (
                  <button
                    key={project.id}
                    onClick={() => setSelectedProject(project)}
                    className={`w-full text-left p-3 border transition-colors ${
                      selectedProject?.id === project.id
                        ? "border-[#E8B931] bg-[#E8B931]/5"
                        : "border-[#222] bg-[#0A0A0A] hover:border-[#333]"
                    }`}
                  >
                    <div className="text-sm font-medium text-[#F5F5F0]">{project.title}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] text-[#666]">{project.pages} / {project.totalPages} pages</span>
                      <span className="text-[10px] text-[#555] border border-[#333] px-1">{project.status}</span>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Download className="w-8 h-8 text-[#333] mx-auto mb-3" />
                <p className="text-sm text-[#555]">No comics ready for export.</p>
                <Link
                  href="/dashboard/create"
                  className="mt-4 inline-block px-4 py-2 text-xs bg-[#E8B931] text-[#0A0A0A] font-bold tracking-wide uppercase"
                >
                  Create Your First Comic
                </Link>
              </div>
            )}
          </div>

          {/* Step 2: Select format */}
          <div className="bg-[#111] border border-[#222] p-6">
            <h3 className="text-xs font-bold text-[#E8B931] tracking-[0.2em] uppercase mb-1">
              Step 2
            </h3>
            <h4 className="text-sm font-bold text-[#F5F5F0] mb-4">Select Format</h4>
            <div className="space-y-2">
              {exportFormats.map((format) => (
                <button
                  key={format.id}
                  onClick={() => setSelectedFormat(format.id)}
                  disabled={!selectedProject}
                  className={`w-full text-left p-3 border transition-colors ${
                    selectedFormat === format.id
                      ? "border-[#E8B931] bg-[#E8B931]/5"
                      : selectedProject
                      ? "border-[#222] bg-[#0A0A0A] hover:border-[#333]"
                      : "border-[#222] bg-[#0A0A0A] opacity-50 cursor-not-allowed"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <format.icon className="w-4 h-4 text-[#E8B931]" />
                    <span className="text-sm font-medium text-[#F5F5F0]">{format.name}</span>
                    <span className="text-[10px] text-[#555] ml-auto">{format.ext}</span>
                  </div>
                  <div className="text-[10px] text-[#666] mt-1">{format.recommended}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Step 3: Export */}
          <div className="bg-[#111] border border-[#222] p-6">
            <h3 className="text-xs font-bold text-[#E8B931] tracking-[0.2em] uppercase mb-1">
              Step 3
            </h3>
            <h4 className="text-sm font-bold text-[#F5F5F0] mb-4">Export</h4>

            {selectedProject && selectedFormat ? (
              <div className="space-y-4">
                {/* Summary */}
                <div className="bg-[#0A0A0A] border border-[#222] p-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-xs text-[#666] uppercase tracking-wider">Comic</span>
                    <span className="text-xs text-[#F5F5F0] font-medium">{selectedProject.title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-[#666] uppercase tracking-wider">Format</span>
                    <span className="text-xs text-[#F5F5F0] font-medium">
                      {exportFormats.find((f) => f.id === selectedFormat)?.name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-[#666] uppercase tracking-wider">Pages</span>
                    <span className="text-xs text-[#F5F5F0] font-medium">{selectedProject.pages}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-[#666] uppercase tracking-wider">Status</span>
                    <span className="text-xs text-[#E8B931] font-medium">{selectedProject.status}</span>
                  </div>
                </div>

                {/* Export options */}
                <div className="space-y-3">
                  <label className="flex items-center gap-3 p-3 bg-[#0A0A0A] border border-[#222]">
                    <input type="checkbox" defaultChecked className="accent-[#E8B931]" />
                    <span className="text-xs text-[#999]">Include cover page</span>
                  </label>
                  <label className="flex items-center gap-3 p-3 bg-[#0A0A0A] border border-[#222]">
                    <input type="checkbox" defaultChecked className="accent-[#E8B931]" />
                    <span className="text-xs text-[#999]">High quality (300 DPI)</span>
                  </label>
                  <label className="flex items-center gap-3 p-3 bg-[#0A0A0A] border border-[#222]">
                    <input type="checkbox" className="accent-[#E8B931]" />
                    <span className="text-xs text-[#999]">Add page numbers</span>
                  </label>
                </div>

                {/* Export button */}
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
                      Export Now
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Download className="w-10 h-10 text-[#333] mb-4" />
                <p className="text-sm text-[#555]">
                  {projects.length === 0 
                    ? "Create a comic first to enable export."
                    : "Select a comic and format to start exporting."}
                </p>
                {projects.length === 0 && (
                  <Link
                    href="/dashboard/create"
                    className="mt-4 px-4 py-2 text-xs bg-[#E8B931] text-[#0A0A0A] font-bold tracking-wide uppercase"
                  >
                    Create Comic
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "history" && (
        <div className="bg-[#111] border border-[#222] overflow-hidden">
          {exportHistory.length > 0 ? (
            <>
              {/* Table header */}
              <div className="grid grid-cols-5 gap-4 px-6 py-3 border-b border-[#222]">
                <span className="text-[10px] text-[#E8B931] tracking-[0.2em] uppercase">Comic</span>
                <span className="text-[10px] text-[#E8B931] tracking-[0.2em] uppercase">Format</span>
                <span className="text-[10px] text-[#E8B931] tracking-[0.2em] uppercase">Size</span>
                <span className="text-[10px] text-[#E8B931] tracking-[0.2em] uppercase">Date</span>
                <span className="text-[10px] text-[#E8B931] tracking-[0.2em] uppercase text-right">Action</span>
              </div>
              {/* Rows */}
              {exportHistory.map((item) => (
                <div key={item.id} className="grid grid-cols-5 gap-4 px-6 py-4 border-b border-[#222]/50 items-center">
                  <div>
                    <div className="text-sm text-[#F5F5F0]">{item.comicTitle}</div>
                    <div className="text-[10px] text-[#555]">{item.pages} pages</div>
                  </div>
                  <div>
                    <span className="text-[10px] tracking-widest uppercase border border-[#E8B931]/30 text-[#E8B931] px-2 py-0.5">
                      {item.format}
                    </span>
                  </div>
                  <div className="text-xs text-[#666]">{item.size}</div>
                  <div className="text-xs text-[#555]">{item.date}</div>
                  <div className="flex justify-end">
                    <button className="flex items-center gap-1 text-xs text-[#E8B931] tracking-wide uppercase">
                      <Download className="w-3 h-3" />
                      Re-download
                    </button>
                  </div>
                </div>
              ))}
            </>
          ) : (
            <div className="text-center py-12">
              <Download className="w-10 h-10 text-[#333] mx-auto mb-4" />
              <p className="text-sm text-[#555]">No export history yet.</p>
              <p className="text-xs text-[#444] mt-1">Your exported comics will appear here.</p>
            </div>
          )}
        </div>
      )}

      {activeTab === "formats" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {exportFormats.map((format) => (
              <div key={format.id} className="bg-[#111] border border-[#222] p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-[#E8B931]/10 flex items-center justify-center">
                    <format.icon className="w-5 h-5 text-[#E8B931]" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-[#F5F5F0]">{format.name}</div>
                    <div className="text-[10px] text-[#E8B931] tracking-widest uppercase">
                      {format.ext}
                    </div>
                  </div>
                </div>

                <p className="text-xs text-[#666] leading-relaxed mb-4">
                  {format.description}
                </p>

                <div className="border-t border-[#222] pt-4">
                  <div className="text-[10px] text-[#555] tracking-widest uppercase mb-3">Features</div>
                  <div className="space-y-2">
                    {format.features.map((feature) => (
                      <div key={feature} className="flex items-center gap-2">
                        <div className="w-1 h-1 bg-[#E8B931] flex-shrink-0" />
                        <span className="text-xs text-[#999]">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-[#222]">
                  <div className="text-[10px] text-[#555] tracking-widest uppercase">
                    Best for: {format.recommended}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
