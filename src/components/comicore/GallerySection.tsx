"use client";

import { useEffect, useRef } from "react";

const galleryItems = [
  { src: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&h=800&fit=crop", title: "Neon Dreams", category: "SCIFI", prompt: "Cyberpunk cityscape with neon signs" },
  { src: "https://images.unsplash.com/photo-1635805737707-575885ab0820?w=600&h=400&fit=crop", title: "Dark Forest", category: "FANTASY", prompt: "Enchanted forest with glowing mushrooms" },
  { src: "https://images.unsplash.com/photo-1550684376-efcbd6e3f031?w=600&h=600&fit=crop", title: "Abstract Worlds", category: "EXPERIMENTAL", prompt: "Geometric patterns in space" },
  { src: "https://images.unsplash.com/photo-1563089145-599997674d42?w=600&h=500&fit=crop", title: "Warrior's Path", category: "ACTION", prompt: "Epic battle scene with dramatic lighting" },
  { src: "https://images.unsplash.com/photo-1618336753974-aae8e04506aa?w=600&h=700&fit=crop", title: "Silent Streets", category: "NOIR", prompt: "Rainy alley at midnight, lone figure" },
  { src: "https://images.unsplash.com/photo-1534996858221-380b92700493?w=600&h=450&fit=crop", title: "Color Burst", category: "EXPERIMENTAL", prompt: "Explosion of paint in slow motion" },
];

const marqueeItems = [
  "MANGA", "WESTERN", "INDIE", "SUPERHERO", "HORROR", "ROMANCE",
  "SCIFI", "FANTASY", "NOIR", "ACTION", "SLICE OF LIFE", "COMEDY",
];

export function GallerySection() {
  return (
    <section id="gallery" className="relative py-32 bg-[#0A0A0A]">
      {/* Marquee banner */}
      <div className="overflow-hidden border-y border-[#222] py-4 mb-20">
        <div className="animate-marquee whitespace-nowrap flex">
          {[...marqueeItems, ...marqueeItems].map((item, i) => (
            <span key={i} className="mx-8 text-6xl sm:text-8xl font-black text-[#111] tracking-tighter uppercase">
              {item}
            </span>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6">
        {/* Section header */}
        <div className="mb-16">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-[2px] bg-[#E8B931]" />
            <span className="text-xs text-[#E8B931] tracking-[0.3em] uppercase">Gallery</span>
          </div>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-[#F5F5F0] leading-tight">
            MADE WITH
            <br />
            <span className="text-stroke">COMICORE</span>
          </h2>
        </div>

        {/* Masonry Grid */}
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
          {galleryItems.map((item, index) => (
            <div key={index} className="break-inside-avoid relative group">
              {/* Image */}
              <div className="relative overflow-hidden border border-[#222]">
                <img
                  src={item.src}
                  alt={item.title}
                  className="w-full object-cover"
                />
                {/* Overlay */}
                <div className="absolute inset-0 bg-[#0A0A0A]/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                  <span className="text-[10px] text-[#E8B931] tracking-[0.2em] uppercase mb-1">
                    {item.category}
                  </span>
                  <span className="text-sm font-bold text-[#F5F5F0]">{item.title}</span>
                  <span className="text-xs text-[#888] mt-1">&quot;{item.prompt}&quot;</span>
                </div>
              </div>
              {/* Category tag */}
              <div className="mt-2 flex items-center justify-between">
                <span className="text-[10px] text-[#E8B931] tracking-[0.2em] uppercase">
                  {item.category}
                </span>
                <span className="text-[10px] text-[#555]">Page {index + 1}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Second marquee */}
        <div className="overflow-hidden border-y border-[#222] py-4 mt-20">
          <div className="animate-marquee whitespace-nowrap flex" style={{ animationDirection: "reverse" }}>
            {[...marqueeItems, ...marqueeItems].map((item, i) => (
              <span key={i} className="mx-8 text-6xl sm:text-8xl font-black text-[#111] tracking-tighter uppercase">
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
