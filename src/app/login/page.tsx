"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Zap, ArrowLeft, Eye, EyeOff, Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (data.success) {
        router.push("/dashboard");
      } else {
        setError(data.error || "Login failed. Please try again.");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex">
      {/* Left Panel - Decorative */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-[#111] border-r border-[#222] overflow-hidden">
        <div className="absolute inset-0 stripe-bg" />
        <div className="absolute top-1/3 right-0 w-[300px] h-[300px] bg-[#E8B931]/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-20 left-20 w-[200px] h-[200px] bg-[#E8B931]/3 rounded-full blur-[80px]" />

        <div className="relative z-10 flex flex-col justify-center px-16">
          <div className="space-y-8">
            <div>
              <div className="text-[10px] text-[#E8B931] tracking-[0.3em] uppercase mb-4">Welcome Back</div>
              <h2 className="text-5xl font-black text-[#F5F5F0] leading-tight">
                YOUR STORIES
                <br />
                <span className="text-stroke">ARE WAITING.</span>
              </h2>
            </div>

            <div className="space-y-6">
              <p className="text-sm text-[#999] leading-relaxed max-w-sm">
                Pick up where you left off. Every comic, every page, every character — 
                exactly as you left them.
              </p>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 pt-4">
                <div>
                  <div className="text-3xl font-black text-[#E8B931]">3</div>
                  <div className="text-[10px] text-[#666] tracking-widest uppercase mt-1">Active Comics</div>
                </div>
                <div>
                  <div className="text-3xl font-black text-[#E8B931]">24</div>
                  <div className="text-[10px] text-[#666] tracking-widest uppercase mt-1">Pages Made</div>
                </div>
                <div>
                  <div className="text-3xl font-black text-[#E8B931]">7</div>
                  <div className="text-[10px] text-[#666] tracking-widest uppercase mt-1">Characters</div>
                </div>
              </div>
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
                WELCOME BACK
              </h1>
              <p className="text-sm text-[#666]">
                Log in to continue creating.
              </p>
            </div>

            {/* Error message */}
            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
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
                  required
                  disabled={loading}
                  className="w-full px-4 py-3 bg-[#111] border border-[#222] text-[#F5F5F0] text-sm placeholder:text-[#444] focus:border-[#E8B931] focus:outline-none transition-colors disabled:opacity-50"
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
                    placeholder="Enter your password"
                    required
                    disabled={loading}
                    className="w-full px-4 py-3 bg-[#111] border border-[#222] text-[#F5F5F0] text-sm placeholder:text-[#444] focus:border-[#E8B931] focus:outline-none transition-colors pr-12 disabled:opacity-50"
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

              {/* Forgot password */}
              <div className="flex justify-end">
                <a href="#" className="text-xs text-[#E8B931] tracking-wide">
                  Forgot password?
                </a>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-[#E8B931] text-[#0A0A0A] font-bold tracking-[0.15em] uppercase text-sm disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Logging in...
                  </>
                ) : (
                  "Log In"
                )}
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
              disabled={loading}
              className="w-full py-3 border border-[#333] text-sm text-[#F5F5F0] flex items-center justify-center gap-3 tracking-wide disabled:opacity-50"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>

            {/* Signup link */}
            <p className="text-center text-sm text-[#666]">
              Don&apos;t have an account?{" "}
              <Link
                href="/signup"
                className="text-[#E8B931] font-semibold"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
