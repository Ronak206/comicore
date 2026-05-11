"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Brain,
  Database,
  ChevronRight,
  Users,
  BookOpen,
  Palette,
  Search,
  FileText,
  Archive,
  Image,
  Loader2,
  Download,
  RefreshCw,
  Globe,
  ChevronLeft,
  Layers,
} from "lucide-react";

type MemoryTab = "overview" | "characters" | "visual" | "panels" | "world";

interface ExportItem {
  id: string;
  bookId: string;
  title: string;
  format: string;
  status: string;
  pageCount: number;
  originalSize: string;
  compressedSize: string;
  compressionRatio: string;
  createdAt: string;
  downloadUrl: string;
}

interface ExportStats {
  totalExports: number;
  totalSize: string;
}

interface Pagination {
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

interface MemoryCharacter {
  id: string;
  bookId: string;
  bookTitle: string;
  name: string;
  role: string;
  description: string;
  appearance: string;
  personality: string;
}

interface VisualStyle {
  id: string;
  bookTitle: string;
  artStyle: string;
  colorPalette: string;
  panelDensity: string;
  speechBubbleStyle: string;
  narrationStyle: string;
  detailLevel: string;
  referenceNotes: string;
}

interface PanelLayout {
  id: string;
  bookId: string;
  bookTitle: string;
  pageNumber: number;
  title: string;
  description: string;
  chapter: string;
  chapterNumber: number;
  chapterTitle: string;
  keyEvents: string[];
}

interface WorldInfo {
  id: string;
  bookId: string;
  bookTitle: string;
  setting: string;
  timePeriod: string;
  atmosphere: string;
  technology: string;
  keyLocations: string;
  rules: string;
}

interface OverviewItem {
  id: string;
  title: string;
  genre: string;
  synopsis: string;
  tone: string;
  status: string;
  chapterCount: number;
  pageCount: number;
}

interface MemoryStats {
  totalBooks: number;
  totalCharacters: number;
  totalWorlds: number;
  totalPages: number;
  totalChapters: number;
}

export default function MemoryBankPage() {
  const [activeTab, setActiveTab] = useState<MemoryTab>("overview");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Exports state with pagination
  const [exports, setExports] = useState<ExportItem[]>([]);
  const [exportStats, setExportStats] = useState<ExportStats>({ totalExports: 0, totalSize: "0 KB" });
  const [pagination, setPagination] = useState<Pagination>({ page: 1, pageSize: 5, totalPages: 1, hasNextPage: false, hasPrevPage: false });
  const [loadingExports, setLoadingExports] = useState(true);
  
  // Memory data state
  const [overview, setOverview] = useState<OverviewItem[]>([]);
  const [characters, setCharacters] = useState<MemoryCharacter[]>([]);
  const [visualStyles, setVisualStyles] = useState<VisualStyle[]>([]);
  const [panelLayouts, setPanelLayouts] = useState<PanelLayout[]>([]);
  const [worldInfo, setWorldInfo] = useState<WorldInfo[]>([]);
  const [memoryStats, setMemoryStats] = useState<MemoryStats>({ totalBooks: 0, totalCharacters: 0, totalWorlds: 0, totalPages: 0, totalChapters: 0 });
  const [loadingMemory, setLoadingMemory] = useState(true);

  // Fetch exports with pagination
  const fetchExports = async (page: number = 1) => {
    try {
      setLoadingExports(true);
      const res = await fetch(`/api/exports?page=${page}&pageSize=${pagination.pageSize}`);
      const data = await res.json();
      if (data.success) {
        setExports(data.data || []);
        setExportStats(data.stats || { totalExports: 0, totalSize: "0 KB" });
        setPagination(data.pagination || pagination);
      }
    } catch (error) {
      console.error("Failed to fetch exports:", error);
    } finally {
      setLoadingExports(false);
    }
  };

  // Fetch memory bank data
  const fetchMemoryData = async () => {
    try {
      setLoadingMemory(true);
      const res = await fetch("/api/memory/bank");
      const data = await res.json();
      if (data.success) {
        setOverview(data.data.overview || []);
        setCharacters(data.data.characters || []);
        setVisualStyles(data.data.visualStyles || []);
        setPanelLayouts(data.data.panelLayouts || []);
        setWorldInfo(data.data.worldInfo || []);
        setMemoryStats(data.stats || memoryStats);
      }
    } catch (error) {
      console.error("Failed to fetch memory data:", error);
    } finally {
      setLoadingMemory(false);
    }
  };

  useEffect(() => {
    fetchExports(1);
    fetchMemoryData();
  }, []);

  const filteredCharacters = characters.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.bookTitle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredWorlds = worldInfo.filter((w) =>
    w.bookTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
    w.setting.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const getFormatIcon = (format: string) => {
    switch (format.toLowerCase()) {
      case "pdf":
        return FileText;
      case "cbz":
        return Archive;
      case "images":
        return Image;
      default:
        return FileText;
    }
  };

  const handlePageChange = (newPage: number) => {
    fetchExports(newPage);
  };

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div className="space-y-1">
        <h2 className="text-2xl font-black text-[#F5F5F0] tracking-tight">
          <span className="text-stroke">MEMORY</span> Bank
        </h2>
        <p className="text-sm text-[#666]">
          View your comics&apos; memory data: Overview, Characters, Visual Styles, Panel Layouts, and World Info.
        </p>
      </div>

      {/* Generated Exports Section */}
      <div className="bg-[#111] border border-[#222] p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <Database className="w-5 h-5 text-[#E8B931]" />
            <h3 className="text-xs font-bold text-[#E8B931] tracking-[0.2em] uppercase">
              Generated Exports
            </h3>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-xs text-[#666]">
              {exportStats.totalExports} exports • {exportStats.totalSize} total
            </div>
            <Link
              href="/dashboard/export"
              className="text-xs text-[#E8B931] tracking-wide uppercase flex items-center gap-1 hover:underline"
            >
              Create New <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {loadingExports ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 text-[#E8B931] animate-spin" />
          </div>
        ) : exports.length > 0 ? (
          <div className="space-y-3">
            {exports.map((exp) => {
              const FormatIcon = getFormatIcon(exp.format);
              return (
                <div
                  key={exp.id}
                  className="bg-[#0A0A0A] border border-[#222] p-4 flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-[#E8B931]/10 flex items-center justify-center">
                      <FormatIcon className="w-5 h-5 text-[#E8B931]" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-[#F5F5F0]">{exp.title}</div>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-[10px] text-[#E8B931] uppercase tracking-wider border border-[#E8B931]/30 px-1.5 py-0.5">
                          {exp.format}
                        </span>
                        <span className="text-[10px] text-[#555]">{exp.pageCount} pages</span>
                        <span className="text-[10px] text-[#555]">{exp.originalSize}</span>
                        <span className="text-[10px] text-[#555]">({exp.compressionRatio} compressed)</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] text-[#555]">{formatDate(exp.createdAt)}</span>
                    <a
                      href={exp.downloadUrl}
                      className="p-2 bg-[#E8B931] text-[#0A0A0A] hover:bg-[#c9a020] transition-colors"
                      title="Download"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              );
            })}
            
            {/* Pagination Controls */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between pt-4 border-t border-[#222]">
                <div className="text-xs text-[#666]">
                  Page {pagination.page} of {pagination.totalPages}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={!pagination.hasPrevPage}
                    className={`p-2 border border-[#222] transition-colors ${
                      pagination.hasPrevPage
                        ? "text-[#F5F5F0] hover:border-[#E8B931] hover:text-[#E8B931]"
                        : "text-[#333] cursor-not-allowed"
                    }`}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={!pagination.hasNextPage}
                    className={`p-2 border border-[#222] transition-colors ${
                      pagination.hasNextPage
                        ? "text-[#F5F5F0] hover:border-[#E8B931] hover:text-[#E8B931]"
                        : "text-[#333] cursor-not-allowed"
                    }`}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8 text-[#555]">
            <Archive className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No exports yet</p>
            <Link
              href="/dashboard/export"
              className="text-xs text-[#E8B931] hover:underline mt-2 inline-block"
            >
              Create your first export →
            </Link>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-[#222] overflow-x-auto">
        {[
          { key: "overview" as MemoryTab, label: "Overview", icon: BookOpen },
          { key: "characters" as MemoryTab, label: "Characters", icon: Users },
          { key: "visual" as MemoryTab, label: "Visual Style", icon: Palette },
          { key: "panels" as MemoryTab, label: "Panel Layouts", icon: Layers },
          { key: "world" as MemoryTab, label: "World Info", icon: Globe },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-3 text-xs tracking-widest uppercase transition-colors flex items-center gap-2 whitespace-nowrap ${
              activeTab === tab.key
                ? "text-[#E8B931] border-b-2 border-[#E8B931]"
                : "text-[#666]"
            }`}
          >
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Loading State */}
      {loadingMemory && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-[#E8B931] animate-spin" />
        </div>
      )}

      {/* Tab Content */}
      {!loadingMemory && activeTab === "overview" && (
        <div className="space-y-6">
          {/* Stats row */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-[#111] border border-[#222] p-4">
              <div className="text-xs text-[#666] tracking-[0.15em] uppercase mb-1">Total Projects</div>
              <div className="text-2xl font-black text-[#E8B931]">{memoryStats.totalBooks}</div>
              <div className="text-xs text-[#555]">Comics created</div>
            </div>
            <div className="bg-[#111] border border-[#222] p-4">
              <div className="text-xs text-[#666] tracking-[0.15em] uppercase mb-1">Characters</div>
              <div className="text-2xl font-black text-[#E8B931]">{memoryStats.totalCharacters}</div>
              <div className="text-xs text-[#555]">Fully tracked</div>
            </div>
            <div className="bg-[#111] border border-[#222] p-4">
              <div className="text-xs text-[#666] tracking-[0.15em] uppercase mb-1">Worlds</div>
              <div className="text-2xl font-black text-[#E8B931]">{memoryStats.totalWorlds}</div>
              <div className="text-xs text-[#555]">World settings</div>
            </div>
            <div className="bg-[#111] border border-[#222] p-4">
              <div className="text-xs text-[#666] tracking-[0.15em] uppercase mb-1">Pages</div>
              <div className="text-2xl font-black text-[#E8B931]">{memoryStats.totalPages}</div>
              <div className="text-xs text-[#555]">Total pages</div>
            </div>
            <div className="bg-[#111] border border-[#222] p-4">
              <div className="text-xs text-[#666] tracking-[0.15em] uppercase mb-1">Chapters</div>
              <div className="text-2xl font-black text-[#E8B931]">{memoryStats.totalChapters}</div>
              <div className="text-xs text-[#555]">Story chapters</div>
            </div>
          </div>

          {/* Projects List */}
          <div className="bg-[#111] border border-[#222] p-6">
            <h3 className="text-xs font-bold text-[#E8B931] tracking-[0.2em] uppercase mb-4">
              Your Projects
            </h3>
            {overview.length > 0 ? (
              <div className="space-y-3">
                {overview.map((project) => (
                  <Link
                    key={project.id}
                    href={`/dashboard/comic/${project.id}`}
                    className="block bg-[#0A0A0A] border border-[#222] p-4 hover:border-[#E8B931]/50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-sm font-bold text-[#F5F5F0]">{project.title}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] text-[#E8B931] uppercase tracking-wider">
                            {project.genre}
                          </span>
                          <span className="text-[10px] text-[#555]">•</span>
                          <span className="text-[10px] text-[#555]">{project.tone}</span>
                        </div>
                        <p className="text-xs text-[#666] mt-2 line-clamp-2">{project.synopsis}</p>
                      </div>
                      <div className="text-right">
                        <span className={`text-[10px] uppercase tracking-wider border px-2 py-1 ${
                          project.status === "complete" ? "border-green-500/30 text-green-400" :
                          project.status === "generating" ? "border-[#E8B931]/30 text-[#E8B931]" :
                          "border-[#555] text-[#555]"
                        }`}>
                          {project.status}
                        </span>
                        <div className="text-[10px] text-[#555] mt-2">
                          {project.chapterCount} ch • {project.pageCount} pages
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-[#555]">
                <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No projects yet</p>
                <Link
                  href="/dashboard/create"
                  className="text-xs text-[#E8B931] hover:underline mt-2 inline-block"
                >
                  Create your first project →
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {!loadingMemory && activeTab === "characters" && (
        <div className="space-y-4">
          {/* Search */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#555]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search characters by name or project..."
              className="w-full pl-10 pr-4 py-3 bg-[#111] border border-[#222] text-sm text-[#F5F5F0] placeholder:text-[#444] focus:border-[#E8B931] focus:outline-none"
            />
          </div>

          {/* Characters list */}
          {filteredCharacters.length > 0 ? (
            <div className="space-y-3">
              {filteredCharacters.map((char) => (
                <div key={char.id} className="bg-[#111] border border-[#222] p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#222] flex items-center justify-center text-xs font-bold text-[#E8B931]">
                        {char.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-[#F5F5F0]">{char.name}</div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] text-[#E8B931] tracking-widest uppercase border border-[#E8B931]/30 px-1.5 py-0.5">
                            {char.role}
                          </span>
                          <span className="text-[10px] text-[#555]">
                            {char.bookTitle}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Details */}
                  {char.description && (
                    <p className="text-xs text-[#888] mb-3">{char.description}</p>
                  )}

                  {/* Appearance & Personality */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    {char.appearance && (
                      <div className="bg-[#0A0A0A] border border-[#222] p-3">
                        <div className="text-[10px] text-[#E8B931] uppercase tracking-wider mb-1">Appearance</div>
                        <p className="text-[#999]">{char.appearance}</p>
                      </div>
                    )}
                    {char.personality && (
                      <div className="bg-[#0A0A0A] border border-[#222] p-3">
                        <div className="text-[10px] text-[#E8B931] uppercase tracking-wider mb-1">Personality</div>
                        <p className="text-[#999]">{char.personality}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-[#555]">
              <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">{searchQuery ? "No characters found" : "No characters yet"}</p>
            </div>
          )}
        </div>
      )}

      {!loadingMemory && activeTab === "visual" && (
        <div className="space-y-6">
          {/* Visual styles per comic */}
          {visualStyles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {visualStyles.map((style) => (
                <div key={style.id} className="bg-[#111] border border-[#222] p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <div className="text-sm font-bold text-[#F5F5F0]">{style.bookTitle}</div>
                      <div className="text-[10px] text-[#E8B931] tracking-widest uppercase mt-0.5">
                        {style.artStyle}
                      </div>
                    </div>
                  </div>

                  {/* Style details */}
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <div className="bg-[#0A0A0A] border border-[#222] p-2">
                      <div className="text-[9px] text-[#555] uppercase tracking-wider">Color Palette</div>
                      <div className="text-xs text-[#F5F5F0] mt-1">{style.colorPalette}</div>
                    </div>
                    <div className="bg-[#0A0A0A] border border-[#222] p-2">
                      <div className="text-[9px] text-[#555] uppercase tracking-wider">Panel Density</div>
                      <div className="text-xs text-[#F5F5F0] mt-1">{style.panelDensity}</div>
                    </div>
                    <div className="bg-[#0A0A0A] border border-[#222] p-2">
                      <div className="text-[9px] text-[#555] uppercase tracking-wider">Speech Bubbles</div>
                      <div className="text-xs text-[#F5F5F0] mt-1">{style.speechBubbleStyle}</div>
                    </div>
                    <div className="bg-[#0A0A0A] border border-[#222] p-2">
                      <div className="text-[9px] text-[#555] uppercase tracking-wider">Detail Level</div>
                      <div className="text-xs text-[#F5F5F0] mt-1">{style.detailLevel}</div>
                    </div>
                  </div>

                  {style.referenceNotes && (
                    <div className="text-[10px] text-[#666] border-t border-[#222] pt-3">
                      <span className="text-[#555] uppercase tracking-wider">Notes: </span>
                      {style.referenceNotes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-[#555]">
              <Palette className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No visual styles yet</p>
            </div>
          )}
        </div>
      )}

      {!loadingMemory && activeTab === "panels" && (
        <div className="space-y-6">
          {/* Layout templates */}
          {panelLayouts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {panelLayouts.slice(0, 20).map((layout) => (
                <div key={layout.id} className="bg-[#111] border border-[#222] p-4">
                  {/* Mini layout preview */}
                  <div className="h-20 bg-[#0A0A0A] border border-[#222] mb-3 flex items-center justify-center p-3">
                    <div className="w-full h-full grid grid-cols-3 gap-1">
                      <div className="bg-[#222]/60 col-span-2" />
                      <div className="bg-[#222]/60" />
                      <div className="bg-[#222]/60" />
                      <div className="bg-[#222]/60" />
                    </div>
                  </div>
                  <div className="text-sm font-bold text-[#F5F5F0]">Page {layout.pageNumber}: {layout.title}</div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-[10px] text-[#555]">{layout.bookTitle}</span>
                    <span className="text-[10px] text-[#E8B931]">Ch. {layout.chapterNumber || 1}</span>
                  </div>
                  {layout.description && (
                    <p className="text-[10px] text-[#666] mt-2 line-clamp-2">{layout.description}</p>
                  )}
                  {layout.keyEvents && layout.keyEvents.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {layout.keyEvents.slice(0, 3).map((event, i) => (
                        <span key={i} className="text-[8px] text-[#888] bg-[#0A0A0A] border border-[#222] px-1.5 py-0.5">
                          {event}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-[#555]">
              <Layers className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No panel layouts yet</p>
            </div>
          )}
        </div>
      )}

      {!loadingMemory && activeTab === "world" && (
        <div className="space-y-4">
          {/* Search */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#555]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search worlds by project or setting..."
              className="w-full pl-10 pr-4 py-3 bg-[#111] border border-[#222] text-sm text-[#F5F5F0] placeholder:text-[#444] focus:border-[#E8B931] focus:outline-none"
            />
          </div>

          {/* World info list */}
          {filteredWorlds.length > 0 ? (
            <div className="space-y-4">
              {filteredWorlds.map((world) => (
                <div key={world.id} className="bg-[#111] border border-[#222] p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-[#222] flex items-center justify-center">
                      <Globe className="w-5 h-5 text-[#E8B931]" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-[#F5F5F0]">{world.bookTitle}</div>
                      <div className="text-[10px] text-[#E8B931] tracking-widest uppercase">
                        World Settings
                      </div>
                    </div>
                  </div>

                  {/* World details grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {world.setting && (
                      <div className="bg-[#0A0A0A] border border-[#222] p-3">
                        <div className="text-[10px] text-[#E8B931] uppercase tracking-wider mb-1">Setting</div>
                        <p className="text-xs text-[#999]">{world.setting}</p>
                      </div>
                    )}
                    {world.timePeriod && (
                      <div className="bg-[#0A0A0A] border border-[#222] p-3">
                        <div className="text-[10px] text-[#E8B931] uppercase tracking-wider mb-1">Time Period</div>
                        <p className="text-xs text-[#999]">{world.timePeriod}</p>
                      </div>
                    )}
                    {world.atmosphere && (
                      <div className="bg-[#0A0A0A] border border-[#222] p-3">
                        <div className="text-[10px] text-[#E8B931] uppercase tracking-wider mb-1">Atmosphere</div>
                        <p className="text-xs text-[#999]">{world.atmosphere}</p>
                      </div>
                    )}
                    {world.technology && (
                      <div className="bg-[#0A0A0A] border border-[#222] p-3">
                        <div className="text-[10px] text-[#E8B931] uppercase tracking-wider mb-1">Technology</div>
                        <p className="text-xs text-[#999]">{world.technology}</p>
                      </div>
                    )}
                    {world.keyLocations && (
                      <div className="bg-[#0A0A0A] border border-[#222] p-3 md:col-span-2">
                        <div className="text-[10px] text-[#E8B931] uppercase tracking-wider mb-1">Key Locations</div>
                        <p className="text-xs text-[#999]">{world.keyLocations}</p>
                      </div>
                    )}
                    {world.rules && (
                      <div className="bg-[#0A0A0A] border border-[#222] p-3 md:col-span-2">
                        <div className="text-[10px] text-[#E8B931] uppercase tracking-wider mb-1">World Rules</div>
                        <p className="text-xs text-[#999]">{world.rules}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-[#555]">
              <Globe className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">{searchQuery ? "No worlds found" : "No world info yet"}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
