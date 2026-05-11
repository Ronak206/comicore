"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import {
  LayoutDashboard,
  BookOpen,
  Plus,
  Brain,
  Download,
  Settings,
  HelpCircle,
  LogOut,
  Menu,
  Search,
  Bell,
  ChevronRight,
  Zap,
  Loader2,
  FileText,
} from "lucide-react";

const sidebarItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: BookOpen, label: "My Comics", href: "/dashboard" },
  { icon: Plus, label: "Create New", href: "/dashboard/create", highlight: true },
  { icon: Brain, label: "Memory Bank", href: "/dashboard/memory" },
  { icon: FileText, label: "Text to PDF", href: "/dashboard/text-to-pdf" },
  { icon: Download, label: "Export", href: "/dashboard/export" },
  { icon: Settings, label: "Settings", href: "/dashboard/settings" },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, logout } = useAuth();

  // Logout handler
  const handleLogout = async () => {
    await logout();
  };

  // Get user initials for avatar
  const getInitials = (name: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Get display name - show actual name from database
  const displayName = user?.name || user?.email?.split("@")[0] || "User";

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#E8B931] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-[#0A0A0A] border-r border-[#222] flex flex-col transition-transform lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-[#222]">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#E8B931] flex items-center justify-center">
              <Zap className="w-4 h-4 text-[#0A0A0A]" strokeWidth={2.5} />
            </div>
            <span className="text-lg font-bold tracking-tight text-[#F5F5F0]">
              comicore
            </span>
          </Link>
        </div>

        {/* Nav items */}
        <nav className="flex-1 p-4 space-y-1">
          {sidebarItems.map((item) => {
            const isActive = pathname === item.href;
            return item.highlight ? (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-sm bg-[#E8B931] text-[#0A0A0A] font-bold tracking-wide"
              >
                <item.icon className="w-4 h-4" />
                <span className="uppercase">{item.label}</span>
                <ChevronRight className="w-4 h-4 ml-auto" />
              </Link>
            ) : (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm tracking-wide transition-colors ${
                  isActive
                    ? "text-[#E8B931] bg-[#E8B931]/10 border-l-2 border-[#E8B931]"
                    : "text-[#999]"
                }`}
              >
                <item.icon className="w-4 h-4" />
                <span className="uppercase">{item.label}</span>
              </Link>
            );
          })}

          <div className="border-t border-[#222] my-4" />

          <Link
            href="/"
            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-[#999] tracking-wide"
          >
            <HelpCircle className="w-4 h-4" />
            <span className="uppercase">Help &amp; Support</span>
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-[#999] tracking-wide hover:text-red-400 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="uppercase">Log Out</span>
          </button>
        </nav>

        {/* Sidebar footer - User info */}
        <div className="p-4 border-t border-[#222]">
          <Link href="/dashboard/settings" className="flex items-center gap-3 px-2 py-2 -mx-2 rounded hover:bg-[#111] transition-colors">
            <div className="w-10 h-10 bg-gradient-to-br from-[#E8B931] to-[#c9a020] flex items-center justify-center text-sm font-bold text-[#0A0A0A] rounded">
              {user ? getInitials(displayName) : <Zap className="w-5 h-5" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-[#F5F5F0] truncate">
                {displayName}
              </div>
              <div className="text-xs text-[#888] truncate">
                {user?.email || "No email"}
              </div>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="text-[10px] text-[#E8B931] font-medium uppercase tracking-wider">
                  {user?.plan?.toUpperCase() || "FREE"}
                </span>
                <span className="text-[10px] text-[#555]">Plan</span>
              </div>
            </div>
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-[#0A0A0A]/90 backdrop-blur-md border-b border-[#222]">
          <div className="flex items-center justify-between px-6 py-4">
            {/* Left: hamburger + title */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-[#999]"
              >
                <Menu className="w-5 h-5" />
              </button>
              <h1 className="text-lg font-bold text-[#F5F5F0] tracking-tight hidden sm:block">
                {pathname === "/dashboard/memory" && "Memory Bank"}
                {pathname === "/dashboard/export" && "Export"}
                {pathname === "/dashboard/settings" && "Settings"}
                {pathname === "/dashboard/create" && "Create New Comic"}
                {pathname === "/dashboard/text-to-pdf" && "Text to PDF"}
                {pathname === "/dashboard" && "Dashboard"}
                {pathname.startsWith("/dashboard/comic/") && "Comic Workspace"}
              </h1>
            </div>

            {/* Center: search */}
            <div className="hidden md:flex items-center flex-1 max-w-md mx-8">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#555]" />
                <input
                  type="text"
                  placeholder="Search comics, characters..."
                  className="w-full pl-10 pr-4 py-2.5 bg-[#111] border border-[#222] text-sm text-[#F5F5F0] placeholder:text-[#444] focus:border-[#E8B931] focus:outline-none"
                />
              </div>
            </div>

            {/* Right: actions */}
            <div className="flex items-center gap-3">
              <button className="relative text-[#999] p-2">
                <Bell className="w-5 h-5" />
                <div className="absolute top-1 right-1 w-2 h-2 bg-[#E8B931]" />
              </button>
              <div className="w-8 h-8 bg-[#E8B931] flex items-center justify-center text-xs font-bold text-[#0A0A0A]">
                {user ? getInitials(displayName) : <Zap className="w-4 h-4" />}
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
