"use client";

import { useState, useEffect } from "react";
import { Page } from "@/components/ui/page";
import {
  Type,
  Palette,
  Settings2,
  Download,
  Eye,
  RotateCcw,
  FileText,
  ChevronDown,
} from "lucide-react";

// Available fonts
const FONTS = [
  { id: "roboto", name: "Roboto", style: "sans-serif" },
  { id: "times", name: "Times New Roman", style: "serif" },
  { id: "courier", name: "Courier New", style: "monospace" },
  { id: "arial", name: "Arial", style: "sans-serif" },
  { id: "georgia", name: "Georgia", style: "serif" },
  { id: "verdana", name: "Verdana", style: "sans-serif" },
  { id: "helvetica", name: "Helvetica", style: "sans-serif" },
  { id: "noto-serif-sc", name: "Noto Serif SC", style: "serif" },
  { id: "noto-sans-sc", name: "Noto Sans SC", style: "sans-serif" },
  { id: "lxgw-wenkai", name: "LXGW WenKai", style: "cursive" },
];

// Background presets
const BG_PRESETS = [
  { id: "white", name: "White", color: "#FFFFFF" },
  { id: "cream", name: "Cream", color: "#FDF6E3" },
  { id: "sepia", name: "Sepia", color: "#F4ECD8" },
  { id: "light-gray", name: "Light Gray", color: "#F5F5F5" },
  { id: "parchment", name: "Parchment", color: "#FCF5E5" },
  { id: "lavender", name: "Lavender", color: "#F6F5FF" },
  { id: "mint", name: "Mint", color: "#F0FFF0" },
  { id: "custom", name: "Custom", color: "#FFFFFF" },
];

// Text color presets
const TEXT_COLORS = [
  { id: "black", name: "Black", color: "#000000" },
  { id: "dark-gray", name: "Dark Gray", color: "#333333" },
  { id: "navy", name: "Navy", color: "#1a365d" },
  { id: "brown", name: "Brown", color: "#5D4037" },
  { id: "forest", name: "Forest", color: "#2E4A3E" },
  { id: "custom", name: "Custom", color: "#000000" },
];

interface DesignSettings {
  font: string;
  fontSize: number;
  lineHeight: number;
  letterSpacing: number;
  bgColor: string;
  textColor: string;
  margin: number;
  padding: number;
  textAlign: "left" | "center" | "right" | "justify";
  bold: boolean;
  italic: boolean;
}

const DEFAULT_SETTINGS: DesignSettings = {
  font: "times",
  fontSize: 12,
  lineHeight: 1.6,
  letterSpacing: 0,
  bgColor: "#FFFFFF",
  textColor: "#000000",
  margin: 20,
  padding: 20,
  textAlign: "left",
  bold: false,
  italic: false,
};

export default function TextToPdfPage() {
  const [text, setText] = useState("");
  const [settings, setSettings] = useState<DesignSettings>(DEFAULT_SETTINGS);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const [activeTab, setActiveTab] = useState<"font" | "color" | "layout">("font");

  // Get font family
  const getFontFamily = () => {
    const font = FONTS.find((f) => f.id === settings.font);
    return font?.name || "Times New Roman";
  };

  // Get font style
  const getFontStyle = (): React.CSSProperties => {
    const font = FONTS.find((f) => f.id === settings.font);
    return {
      fontFamily: `"${getFontFamily()}", ${font?.style || "serif"}`,
      fontSize: `${settings.fontSize}px`,
      lineHeight: settings.lineHeight,
      letterSpacing: `${settings.letterSpacing}px`,
      color: settings.textColor,
      textAlign: settings.textAlign,
      fontWeight: settings.bold ? "bold" : "normal",
      fontStyle: settings.italic ? "italic" : "normal",
    };
  };

  // Reset settings
  const resetSettings = () => {
    setSettings(DEFAULT_SETTINGS);
  };

  // Generate PDF
  const generatePdf = async () => {
    if (!text.trim()) {
      alert("Please enter some text to convert to PDF");
      return;
    }

    setIsGenerating(true);

    try {
      const response = await fetch("/api/text-to-pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: text,
          settings: {
            font: settings.font,
            fontSize: settings.fontSize,
            lineHeight: settings.lineHeight,
            letterSpacing: settings.letterSpacing,
            bgColor: settings.bgColor,
            textColor: settings.textColor,
            margin: settings.margin,
            padding: settings.padding,
            textAlign: settings.textAlign,
            bold: settings.bold,
            italic: settings.italic,
          },
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate PDF");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "document.pdf";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Update settings helper
  const updateSetting = <K extends keyof DesignSettings>(
    key: K,
    value: DesignSettings[K]
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  // Word count
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const charCount = text.length;

  return (
    <div className="h-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#F5F5F0] tracking-tight">
            Text to PDF
          </h1>
          <p className="text-sm text-[#888] mt-1">
            Convert your text to a beautifully formatted PDF
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={resetSettings}
            className="flex items-center gap-2 px-4 py-2 text-sm text-[#999] hover:text-[#F5F5F0] transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </button>
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="flex items-center gap-2 px-4 py-2 text-sm text-[#999] hover:text-[#F5F5F0] transition-colors"
          >
            <Eye className="w-4 h-4" />
            {showPreview ? "Hide Preview" : "Show Preview"}
          </button>
          <button
            onClick={generatePdf}
            disabled={isGenerating || !text.trim()}
            className="flex items-center gap-2 px-6 py-2.5 bg-[#E8B931] text-[#0A0A0A] font-bold text-sm hover:bg-[#d4aa2a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" />
            {isGenerating ? "Generating..." : "Export PDF"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
        {/* Left Panel - Text Input & Settings */}
        <div className="lg:col-span-1 flex flex-col gap-4 overflow-y-auto">
          {/* Text Input */}
          <div className="bg-[#111] border border-[#222] p-4">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-[#F5F5F0] flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Your Text
              </label>
              <div className="text-xs text-[#666]">
                {wordCount} words • {charCount} characters
              </div>
            </div>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste or type your text here..."
              className="w-full h-48 bg-[#0A0A0A] border border-[#333] text-[#F5F5F0] text-sm p-3 resize-none focus:border-[#E8B931] focus:outline-none placeholder:text-[#444]"
            />
          </div>

          {/* Settings Tabs */}
          <div className="bg-[#111] border border-[#222]">
            <div className="flex border-b border-[#222]">
              <button
                onClick={() => setActiveTab("font")}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm transition-colors ${
                  activeTab === "font"
                    ? "text-[#E8B931] border-b-2 border-[#E8B931]"
                    : "text-[#999] hover:text-[#F5F5F0]"
                }`}
              >
                <Type className="w-4 h-4" />
                Font
              </button>
              <button
                onClick={() => setActiveTab("color")}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm transition-colors ${
                  activeTab === "color"
                    ? "text-[#E8B931] border-b-2 border-[#E8B931]"
                    : "text-[#999] hover:text-[#F5F5F0]"
                }`}
              >
                <Palette className="w-4 h-4" />
                Colors
              </button>
              <button
                onClick={() => setActiveTab("layout")}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm transition-colors ${
                  activeTab === "layout"
                    ? "text-[#E8B931] border-b-2 border-[#E8B931]"
                    : "text-[#999] hover:text-[#F5F5F0]"
                }`}
              >
                <Settings2 className="w-4 h-4" />
                Layout
              </button>
            </div>

            <div className="p-4 space-y-4">
              {/* Font Tab */}
              {activeTab === "font" && (
                <>
                  {/* Font Selection */}
                  <div>
                    <label className="block text-xs font-medium text-[#999] mb-2">
                      Font Family
                    </label>
                    <div className="relative">
                      <select
                        value={settings.font}
                        onChange={(e) => updateSetting("font", e.target.value)}
                        className="w-full bg-[#0A0A0A] border border-[#333] text-[#F5F5F0] text-sm p-2.5 pr-10 appearance-none focus:border-[#E8B931] focus:outline-none"
                      >
                        {FONTS.map((font) => (
                          <option key={font.id} value={font.id}>
                            {font.name}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666] pointer-events-none" />
                    </div>
                  </div>

                  {/* Font Size */}
                  <div>
                    <label className="block text-xs font-medium text-[#999] mb-2">
                      Font Size: {settings.fontSize}px
                    </label>
                    <input
                      type="range"
                      min="8"
                      max="32"
                      step="1"
                      value={settings.fontSize}
                      onChange={(e) =>
                        updateSetting("fontSize", Number(e.target.value))
                      }
                      className="w-full accent-[#E8B931]"
                    />
                    <div className="flex justify-between text-xs text-[#666] mt-1">
                      <span>8px</span>
                      <span>32px</span>
                    </div>
                  </div>

                  {/* Line Height */}
                  <div>
                    <label className="block text-xs font-medium text-[#999] mb-2">
                      Line Height: {settings.lineHeight}
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="3"
                      step="0.1"
                      value={settings.lineHeight}
                      onChange={(e) =>
                        updateSetting("lineHeight", Number(e.target.value))
                      }
                      className="w-full accent-[#E8B931]"
                    />
                  </div>

                  {/* Letter Spacing */}
                  <div>
                    <label className="block text-xs font-medium text-[#999] mb-2">
                      Letter Spacing: {settings.letterSpacing}px
                    </label>
                    <input
                      type="range"
                      min="-2"
                      max="10"
                      step="0.5"
                      value={settings.letterSpacing}
                      onChange={(e) =>
                        updateSetting("letterSpacing", Number(e.target.value))
                      }
                      className="w-full accent-[#E8B931]"
                    />
                  </div>

                  {/* Text Style */}
                  <div>
                    <label className="block text-xs font-medium text-[#999] mb-2">
                      Text Style
                    </label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => updateSetting("bold", !settings.bold)}
                        className={`flex-1 py-2 text-sm font-bold border transition-colors ${
                          settings.bold
                            ? "bg-[#E8B931] text-[#0A0A0A] border-[#E8B931]"
                            : "bg-[#0A0A0A] text-[#999] border-[#333] hover:border-[#E8B931]"
                        }`}
                      >
                        B
                      </button>
                      <button
                        onClick={() => updateSetting("italic", !settings.italic)}
                        className={`flex-1 py-2 text-sm italic border transition-colors ${
                          settings.italic
                            ? "bg-[#E8B931] text-[#0A0A0A] border-[#E8B931]"
                            : "bg-[#0A0A0A] text-[#999] border-[#333] hover:border-[#E8B931]"
                        }`}
                      >
                        I
                      </button>
                    </div>
                  </div>
                </>
              )}

              {/* Color Tab */}
              {activeTab === "color" && (
                <>
                  {/* Background Color */}
                  <div>
                    <label className="block text-xs font-medium text-[#999] mb-2">
                      Background Color
                    </label>
                    <div className="grid grid-cols-4 gap-2 mb-2">
                      {BG_PRESETS.map((preset) => (
                        <button
                          key={preset.id}
                          onClick={() => updateSetting("bgColor", preset.color)}
                          className={`aspect-square border-2 transition-all ${
                            settings.bgColor === preset.color
                              ? "border-[#E8B931] scale-110"
                              : "border-transparent hover:border-[#444]"
                          }`}
                          style={{ backgroundColor: preset.color }}
                          title={preset.name}
                        />
                      ))}
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={settings.bgColor}
                        onChange={(e) => updateSetting("bgColor", e.target.value)}
                        className="w-10 h-10 bg-transparent border-0 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={settings.bgColor}
                        onChange={(e) => updateSetting("bgColor", e.target.value)}
                        className="flex-1 bg-[#0A0A0A] border border-[#333] text-[#F5F5F0] text-sm p-2 focus:border-[#E8B931] focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Text Color */}
                  <div>
                    <label className="block text-xs font-medium text-[#999] mb-2">
                      Text Color
                    </label>
                    <div className="grid grid-cols-6 gap-2 mb-2">
                      {TEXT_COLORS.map((color) => (
                        <button
                          key={color.id}
                          onClick={() =>
                            updateSetting("textColor", color.color)
                          }
                          className={`aspect-square border-2 transition-all ${
                            settings.textColor === color.color
                              ? "border-[#E8B931] scale-110"
                              : "border-transparent hover:border-[#444]"
                          }`}
                          style={{ backgroundColor: color.color }}
                          title={color.name}
                        />
                      ))}
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={settings.textColor}
                        onChange={(e) =>
                          updateSetting("textColor", e.target.value)
                        }
                        className="w-10 h-10 bg-transparent border-0 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={settings.textColor}
                        onChange={(e) =>
                          updateSetting("textColor", e.target.value)
                        }
                        className="flex-1 bg-[#0A0A0A] border border-[#333] text-[#F5F5F0] text-sm p-2 focus:border-[#E8B931] focus:outline-none"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Layout Tab */}
              {activeTab === "layout" && (
                <>
                  {/* Text Alignment */}
                  <div>
                    <label className="block text-xs font-medium text-[#999] mb-2">
                      Text Alignment
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {(["left", "center", "right", "justify"] as const).map(
                        (align) => (
                          <button
                            key={align}
                            onClick={() => updateSetting("textAlign", align)}
                            className={`py-2 text-xs border transition-colors ${
                              settings.textAlign === align
                                ? "bg-[#E8B931] text-[#0A0A0A] border-[#E8B931]"
                                : "bg-[#0A0A0A] text-[#999] border-[#333] hover:border-[#E8B931]"
                            }`}
                          >
                            {align.charAt(0).toUpperCase() + align.slice(1)}
                          </button>
                        )
                      )}
                    </div>
                  </div>

                  {/* Margin */}
                  <div>
                    <label className="block text-xs font-medium text-[#999] mb-2">
                      Page Margin: {settings.margin}mm
                    </label>
                    <input
                      type="range"
                      min="5"
                      max="50"
                      step="1"
                      value={settings.margin}
                      onChange={(e) =>
                        updateSetting("margin", Number(e.target.value))
                      }
                      className="w-full accent-[#E8B931]"
                    />
                  </div>

                  {/* Padding */}
                  <div>
                    <label className="block text-xs font-medium text-[#999] mb-2">
                      Content Padding: {settings.padding}mm
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="30"
                      step="1"
                      value={settings.padding}
                      onChange={(e) =>
                        updateSetting("padding", Number(e.target.value))
                      }
                      className="w-full accent-[#E8B931]"
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right Panel - Preview */}
        {showPreview && (
          <div className="lg:col-span-2 bg-[#111] border border-[#222] p-4 overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-[#F5F5F0] flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Live Preview
              </label>
              <span className="text-xs text-[#666]">A4 (210mm x 297mm)</span>
            </div>

            {/* Preview Container */}
            <div className="flex justify-center overflow-y-auto h-[calc(100%-40px)] bg-[#2a2a2a] p-8 rounded">
              <div
                className="w-[595px] min-h-[842px] shadow-2xl transition-all duration-300"
                style={{
                  backgroundColor: settings.bgColor,
                  padding: `${settings.padding}px`,
                }}
              >
                {/* Page content */}
                <div
                  className="h-full overflow-hidden"
                  style={{
                    ...getFontStyle(),
                    whiteSpace: "pre-wrap",
                    wordWrap: "break-word",
                  }}
                >
                  {text || (
                    <span className="text-[#999] italic">
                      Your text will appear here...
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
