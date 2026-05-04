"use client";

import { Zap } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-[#222] bg-[#0A0A0A]">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-4 gap-12 mb-16">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-[#E8B931] flex items-center justify-center">
                <Zap className="w-4 h-4 text-[#0A0A0A]" strokeWidth={2.5} />
              </div>
              <span className="text-lg font-bold tracking-tight">comicore</span>
            </div>
            <p className="text-sm text-[#666] leading-relaxed">
              AI-powered comic generation. Page by page, with memory, consistency, and creative control.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-xs text-[#E8B931] tracking-[0.2em] uppercase mb-4">Product</h4>
            <ul className="space-y-2">
              {["Features", "How It Works", "Gallery", "Pricing"].map((item) => (
                <li key={item}>
                  <a href="#" className="text-sm text-[#666]">{item}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-xs text-[#E8B931] tracking-[0.2em] uppercase mb-4">Company</h4>
            <ul className="space-y-2">
              {["About", "Blog", "Careers", "Contact"].map((item) => (
                <li key={item}>
                  <a href="#" className="text-sm text-[#666]">{item}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-xs text-[#E8B931] tracking-[0.2em] uppercase mb-4">Legal</h4>
            <ul className="space-y-2">
              {["Privacy Policy", "Terms of Service", "Cookie Policy"].map((item) => (
                <li key={item}>
                  <a href="#" className="text-sm text-[#666]">{item}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-[#222] pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[#444]">
            &copy; 2026 Comicore. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            {["Twitter", "GitHub", "Discord"].map((social) => (
              <a key={social} href="#" className="text-xs text-[#555] tracking-wide uppercase">
                {social}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
