"use client";

import { useState } from "react";
import {
  Download,
  FileText,
  Archive,
  ChevronRight,
  CheckCircle2,
  Clock,
  RefreshCw,
  Settings2,
  Image,
  Loader2,
} from "lucide-react";

type ExportTab = "new" | "history" | "formats";

const comics = [
  { title: "The Last Cyberpunk", pages: 24, status: "Ready", size: "18.4 MB" },
  { title: "Shadow Walker Chronicles", pages: 18, status: "Ready", size: "13.2 MB" },
  { title: "Neon Dreams", pages: 8, status: "Draft", size: "5.1 MB" },
  { title: "Dark Horizon", pages: 32, status: "Ready", size: "24.6 MB" },
  { title: "Iron Legacy", pages: 16, status: "Ready", size: "11.8 MB" },
  { title: "Void Runners", pages: 12, status: "Ready", size: "8.9 MB" },
];

const exportHistory = [
  {
    comic: "Iron Legacy",
    format: "PDF",
    pages: 16,
    size: "11.8 MB",
    date: "2 days ago",
    status: "completed",
  },
  {
    comic: "Dark Horizon",
    format: "CBZ",
    pages: 32,
    size: "24.6 MB",
    date: "3 days ago",
    status: "completed",
  },
  {
    comic: "Dark Horizon",
    format: "PDF",
    pages: 32,
    size: "22.1 MB",
    date: "3 days ago",
    status: "completed",
  },
  {
    comic: "The Last Cyberpunk",
    format: "PDF",
    pages: 20,
    size: "15.3 MB",
    date: "1 week ago",
    status: "completed",
  },
  {
    comic: "Shadow Walker Chronicles",
    format: "CBZ",
    pages: 18,
    size: "13.2 MB",
    date: "1 week ago",
    status: "completed",
  },
  {
    comic: "Void Runners",
    format: "PDF",
    pages: 12,
    size: "8.9 MB",
    date: "2 weeks ago",
    status: "completed",
  },
];

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
  const [selectedComic, setSelectedComic] = useState<string | null>(null);
  const [selectedFormat, setSelectedFormat] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  const handleExport = () => {
    if (!selectedComic || !selectedFormat) return;
    setExporting(true);
    setTimeout(() => setExporting(false), 3000);
  };

  const readyComics = comics.filter((c) => c.status === "Ready");

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div className="space-y-1">
        <h2 className="text-2xl font-black text-[#F5F5F0] tracking-tight">
          <span className="text-stroke">EXPORT</span> Comics
        </h2>
        <p className="text-sm text-[#666]">
          Download your finished comics in multiple formats.
        </p>
      </div>

      {/* Export stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#111] border border-[#222] p-4">
          <div className="text-xs text-[#666] tracking-[0.15em] uppercase mb-1">Total Exports</div>
          <div className="text-2xl font-black text-[#E8B931]">8</div>
          <div className="text-xs text-[#555]">All time</div>
        </div>
        <div className="bg-[#111] border border-[#222] p-4">
          <div className="text-xs text-[#666] tracking-[0.15em] uppercase mb-1">Ready Comics</div>
          <div className="text-2xl font-black text-[#E8B931]">5</div>
          <div className="text-xs text-[#555]">Available now</div>
        </div>
        <div className="bg-[#111] border border-[#222] p-4">
          <div className="text-xs text-[#666] tracking-[0.15em] uppercase mb-1">Storage Used</div>
          <div className="text-2xl font-black text-[#E8B931]">82 MB</div>
          <div className="text-xs text-[#555]">Of 1 GB</div>
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
            <div className="space-y-2">
              {readyComics.map((comic) => (
                <button
                  key={comic.title}
                  onClick={() => setSelectedComic(comic.title)}
                  className={`w-full text-left p-3 border transition-colors ${
                    selectedComic === comic.title
                      ? "border-[#E8B931] bg-[#E8B931]/5"
                      : "border-[#222] bg-[#0A0A0A]"
                  }`}
                >
                  <div className="text-sm font-medium text-[#F5F5F0]">{comic.title}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] text-[#666]">{comic.pages} pages</span>
                    <span className="text-[10px] text-[#555]">{comic.size}</span>
                  </div>
                </button>
              ))}
            </div>
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
                  className={`w-full text-left p-3 border transition-colors ${
                    selectedFormat === format.id
                      ? "border-[#E8B931] bg-[#E8B931]/5"
                      : "border-[#222] bg-[#0A0A0A]"
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

            {selectedComic && selectedFormat ? (
              <div className="space-y-4">
                {/* Summary */}
                <div className="bg-[#0A0A0A] border border-[#222] p-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-xs text-[#666] uppercase tracking-wider">Comic</span>
                    <span className="text-xs text-[#F5F5F0] font-medium">{selectedComic}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-[#666] uppercase tracking-wider">Format</span>
                    <span className="text-xs text-[#F5F5F0] font-medium">
                      {exportFormats.find((f) => f.id === selectedFormat)?.name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-[#666] uppercase tracking-wider">Pages</span>
                    <span className="text-xs text-[#F5F5F0] font-medium">
                      {readyComics.find((c) => c.title === selectedComic)?.pages}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-[#666] uppercase tracking-wider">Est. Size</span>
                    <span className="text-xs text-[#F5F5F0] font-medium">
                      {readyComics.find((c) => c.title === selectedComic)?.size}
                    </span>
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
                  Select a comic and format to start exporting.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "history" && (
        <div className="bg-[#111] border border-[#222] overflow-hidden">
          {/* Table header */}
          <div className="grid grid-cols-5 gap-4 px-6 py-3 border-b border-[#222]">
            <span className="text-[10px] text-[#E8B931] tracking-[0.2em] uppercase">Comic</span>
            <span className="text-[10px] text-[#E8B931] tracking-[0.2em] uppercase">Format</span>
            <span className="text-[10px] text-[#E8B931] tracking-[0.2em] uppercase">Size</span>
            <span className="text-[10px] text-[#E8B931] tracking-[0.2em] uppercase">Date</span>
            <span className="text-[10px] text-[#E8B931] tracking-[0.2em] uppercase text-right">Action</span>
          </div>
          {/* Rows */}
          {exportHistory.map((item, i) => (
            <div key={i} className="grid grid-cols-5 gap-4 px-6 py-4 border-b border-[#222]/50 items-center">
              <div>
                <div className="text-sm text-[#F5F5F0]">{item.comic}</div>
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
