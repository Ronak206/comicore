"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Zap, ArrowLeft, Eye, EyeOff } from "lucide-react";

export default function SignUpPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex">
      {/* Left Panel - Decorative */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-[#111] border-r border-[#222] overflow-hidden">
        <div className="absolute inset-0 halftone-bg" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-[#E8B931]/5 rounded-full blur-[120px]" />
        
        <div className="relative z-10 flex flex-col justify-center px-16">
          <div className="space-y-8">
            <div>
              <div className="text-[10px] text-[#E8B931] tracking-[0.3em] uppercase mb-4">Why Comicore?</div>
              <h2 className="text-4xl font-black text-[#F5F5F0] leading-tight">
                THE ONLY TOOL THAT
                <br />
                <span className="text-stroke">REMEMBERS</span> YOUR STORY.
              </h2>
            </div>
            
            <div className="space-y-6">
              {[
                { num: "01", text: "Page-by-page generation with full creative control" },
                { num: "02", text: "Three-layer memory system for perfect consistency" },
                { num: "03", text: "Review and refine every page before moving on" },
              ].map((item) => (
                <div key={item.num} className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-[#E8B931] text-[#0A0A0A] text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                    {item.num}
                  </div>
                  <p className="text-sm text-[#999] leading-relaxed">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Corner decorations */}
        <div className="absolute top-8 left-8 w-16 h-16 border-l-2 border-t-2 border-[#E8B931]/30" />
        <div className="absolute bottom-8 right-8 w-16 h-16 border-r-2 border-b-2 border-[#E8B931]/30" />
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex flex-col">
        {/* Back button */}
        <div className="p-6">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-[#888]"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="tracking-wide uppercase">Back</span>
          </Link>
        </div>

        {/* Form content */}
        <div className="flex-1 flex items-center justify-center px-6 py-8">
          <div className="w-full max-w-md space-y-10">
            {/* Header */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 lg:hidden mb-6">
                <div className="w-8 h-8 bg-[#E8B931] flex items-center justify-center">
                  <Zap className="w-4 h-4 text-[#0A0A0A]" strokeWidth={2.5} />
                </div>
                <span className="text-lg font-bold tracking-tight">comicore</span>
              </div>
              
              <h1 className="text-3xl font-black text-[#F5F5F0] tracking-tight">
                CREATE YOUR ACCOUNT
              </h1>
              <p className="text-sm text-[#666]">
                Start making comics. Free to begin.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name */}
              <div className="space-y-2">
                <label className="text-xs text-[#E8B931] tracking-[0.15em] uppercase block">
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Your name"
                  className="w-full px-4 py-3 bg-[#111] border border-[#222] text-[#F5F5F0] text-sm placeholder:text-[#444] focus:border-[#E8B931] focus:outline-none transition-colors"
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className="text-xs text-[#E8B931] tracking-[0.15em] uppercase block">
                  Email Address
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 bg-[#111] border border-[#222] text-[#F5F5F0] text-sm placeholder:text-[#444] focus:border-[#E8B931] focus:outline-none transition-colors"
                />
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label className="text-xs text-[#E8B931] tracking-[0.15em] uppercase block">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Min 8 characters"
                    className="w-full px-4 py-3 bg-[#111] border border-[#222] text-[#F5F5F0] text-sm placeholder:text-[#444] focus:border-[#E8B931] focus:outline-none transition-colors pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#555]"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <label className="text-xs text-[#E8B931] tracking-[0.15em] uppercase block">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  placeholder="Repeat your password"
                  className="w-full px-4 py-3 bg-[#111] border border-[#222] text-[#F5F5F0] text-sm placeholder:text-[#444] focus:border-[#E8B931] focus:outline-none transition-colors"
                />
              </div>

              {/* Terms */}
              <div className="flex items-start gap-3 pt-2">
                <input type="checkbox" className="mt-1 accent-[#E8B931]" />
                <p className="text-xs text-[#666] leading-relaxed">
                  I agree to the{" "}
                  <a href="#" className="text-[#E8B931] underline">Terms of Service</a>{" "}
                  and{" "}
                  <a href="#" className="text-[#E8B931] underline">Privacy Policy</a>.
                </p>
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="w-full py-4 bg-[#E8B931] text-[#0A0A0A] font-bold tracking-[0.15em] uppercase text-sm"
              >
                Create Account
              </button>
            </form>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#222]" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-[#0A0A0A] px-4 text-[#555]">OR</span>
              </div>
            </div>

            {/* Social */}
            <button
              type="button"
              onClick={() => router.push("/dashboard")}
              className="w-full py-3 border border-[#333] text-sm text-[#F5F5F0] flex items-center justify-center gap-3 tracking-wide"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>

            {/* Login link */}
            <p className="text-center text-sm text-[#666]">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-[#E8B931] font-semibold"
              >
                Log in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
