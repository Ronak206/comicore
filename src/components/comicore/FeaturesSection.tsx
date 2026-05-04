"use client";

import { 
  Layers, PenTool, Image, Layout, MessageSquare, 
  BookOpen, Wand2, Users, FileText 
} from "lucide-react";

const features = [
  {
    icon: PenTool,
    title: "Story Engine",
    description: "Describe your premise and let AI build structured narratives with proper pacing, dialogue, and panel directions.",
    tag: "CORE",
  },
  {
    icon: Image,
    title: "Panel Artwork",
    description: "Each panel gets AI-generated artwork that respects your art style, character designs, and scene composition.",
    tag: "ART",
  },
  {
    icon: Layout,
    title: "Smart Layouts",
    description: "Dynamic panel layouts that adapt to the mood of each scene — action sequences get kinetic layouts, quiet moments get breathing room.",
    tag: "DESIGN",
  },
  {
    icon: FileText,
    title: "Page-by-Page Review",
    description: "Generate one page at a time. Review it. Approve it or request revisions. You stay in full creative control.",
    tag: "WORKFLOW",
  },
  {
    icon: BookOpen,
    title: "Memory System",
    description: "The AI remembers every character, plot thread, and visual detail across all pages. No inconsistencies, ever.",
    tag: "MEMORY",
  },
  {
    icon: Users,
    title: "Character Bible",
    description: "Define your characters once — appearance, personality, relationships — and they stay consistent across the entire comic.",
    tag: "CHARACTERS",
  },
  {
    icon: MessageSquare,
    title: "Dialogue Writer",
    description: "AI generates natural dialogue that matches each character's voice, the scene tone, and the story's genre.",
    tag: "WRITING",
  },
  {
    icon: Wand2,
    title: "Style Transfer",
    description: "Choose from manga, western comic, indie, superhero, or upload your own style reference. The AI adapts.",
    tag: "STYLE",
  },
  {
    icon: Layers,
    title: "Export Anywhere",
    description: "Download your finished comic as PDF, CBZ, or individual high-res pages. Ready to print or publish digitally.",
    tag: "EXPORT",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="relative py-32 bg-[#0A0A0A]">
      {/* Section header */}
      <div className="max-w-7xl mx-auto px-6 mb-20">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-[2px] bg-[#E8B931]" />
          <span className="text-xs text-[#E8B931] tracking-[0.3em] uppercase">Superpowers</span>
        </div>
        <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-[#F5F5F0] leading-tight">
          EVERYTHING YOU NEED
          <br />
          <span className="text-stroke">TO MAKE COMICS</span>
        </h2>
        <p className="mt-6 text-[#888] max-w-lg text-lg leading-relaxed">
          Nine tools working together. One seamless workflow. From first idea to final page.
        </p>
      </div>

      {/* Feature Grid */}
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-[#222]">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="bg-[#0A0A0A] p-8 group relative"
            >
              {/* Tag */}
              <div className="absolute top-6 right-6">
                <span className="text-[10px] text-[#555] tracking-[0.2em] uppercase">
                  {feature.tag}
                </span>
              </div>

              {/* Icon */}
              <div className="w-12 h-12 border border-[#333] flex items-center justify-center mb-6">
                <feature.icon className="w-5 h-5 text-[#E8B931]" />
              </div>

              {/* Content */}
              <h3 className="text-xl font-bold text-[#F5F5F0] mb-3 tracking-tight">
                {feature.title}
              </h3>
              <p className="text-sm text-[#777] leading-relaxed">
                {feature.description}
              </p>

              {/* Number */}
              <div className="absolute bottom-6 right-6 text-4xl font-black text-[#181818]">
                {String(index + 1).padStart(2, "0")}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
