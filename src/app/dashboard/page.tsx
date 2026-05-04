"use client";

import { useState } from "react";
import Link from "next/link";
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
  X,
  Search,
  Bell,
  ChevronRight,
  Play,
  Zap,
} from "lucide-react";

const projects = [
  {
    title: "The Last Cyberpunk",
    pages: "24/32",
    status: "In Progress",
    edited: "2 hours ago",
    gradient: "from-[#1A1A1A] to-[#222]",
  },
  {
    title: "Shadow Walker Chronicles",
    pages: "18/24",
    status: "In Progress",
    edited: "5 hours ago",
    gradient: "from-[#1A1A1A] to-[#252015]",
  },
  {
    title: "Neon Dreams",
    pages: "8/12",
    status: "Draft",
    edited: "Yesterday",
    gradient: "from-[#1A1A1A] to-[#1F1A22]",
  },
  {
    title: "Dark Horizon",
    pages: "32/32",
    status: "Completed",
    edited: "3 days ago",
    gradient: "from-[#1A1A1A] to-[#1A1F1A]",
  },
  {
    title: "Iron Legacy",
    pages: "16/20",
    status: "In Progress",
    edited: "4 days ago",
    gradient: "from-[#1A1A1A] to-[#201A1A]",
  },
  {
    title: "Void Runners",
    pages: "12/12",
    status: "Completed",
    edited: "1 week ago",
    gradient: "from-[#1A1A1A] to-[#1A1A22]",
  },
];

const activities = [
  { text: "Generated Page 24 of The Last Cyberpunk", time: "2 hours ago" },
  { text: "Approved Page 18 of Shadow Walker", time: "5 hours ago" },
  { text: "Created new comic: Neon Dreams", time: "Yesterday" },
  { text: "Exported PDF for Iron Legacy", time: "2 days ago" },
  { text: "Revised Page 12 of Dark Horizon", time: "3 days ago" },
];

const stats = [
  { label: "Total Comics", value: "12", sub: "↑ 3 this week" },
  { label: "Pages Created", value: "147", sub: "↑ 24 this week" },
  { label: "Characters Tracked", value: "38", sub: "Memory active" },
  { label: "Exported Files", value: "8", sub: "PDF, CBZ" },
];

const quickActions = [
  { icon: Plus, label: "New Comic" },
  { icon: Play, label: "Resume Last" },
  { icon: Download, label: "Export All" },
  { icon: Brain, label: "Memory Bank" },
];

const sidebarItems = [
  { icon: LayoutDashboard, label: "Dashboard" },
  { icon: BookOpen, label: "My Comics" },
  { icon: Plus, label: "Create New", highlight: true },
  { icon: Brain, label: "Memory Bank" },
  { icon: Download, label: "Export" },
  { icon: Settings, label: "Settings" },
];

function getStatusColor(status: string) {
  switch (status) {
    case "Completed":
      return "border-[#E8B931]/40 text-[#E8B931]";
    case "In Progress":
      return "border-[#999]/40 text-[#999]";
    default:
      return "border-[#555]/40 text-[#555]";
  }
}

export default function DashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
          {sidebarItems.map((item) => (
            <button
              key={item.label}
              className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm tracking-wide transition-colors ${
                item.highlight
                  ? "bg-[#E8B931] text-[#0A0A0A] font-bold"
                  : "text-[#999] hover:text-[#F5F5F0]"
              }`}
            >
              <item.icon className="w-4 h-4" />
              <span className="uppercase">{item.label}</span>
              {item.highlight && (
                <ChevronRight className="w-4 h-4 ml-auto" />
              )}
            </button>
          ))}

          <div className="border-t border-[#222] my-4" />

          <Link
            href="/"
            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-[#999] tracking-wide"
          >
            <HelpCircle className="w-4 h-4" />
            <span className="uppercase">Help &amp; Support</span>
          </Link>

          <Link
            href="/"
            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-[#999] tracking-wide"
          >
            <LogOut className="w-4 h-4" />
            <span className="uppercase">Log Out</span>
          </Link>
        </nav>

        {/* Sidebar footer */}
        <div className="p-4 border-t border-[#222]">
          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 bg-[#222] flex items-center justify-center text-xs font-bold text-[#E8B931]">
              JD
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-[#F5F5F0] truncate">John Doe</div>
              <div className="text-xs text-[#555] truncate">Free Plan</div>
            </div>
          </div>
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
                Dashboard
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
              <div className="w-8 h-8 bg-[#222] flex items-center justify-center text-xs font-bold text-[#E8B931]">
                JD
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 space-y-8 overflow-y-auto">
          {/* Page header */}
          <div className="space-y-1">
            <h2 className="text-2xl font-black text-[#F5F5F0] tracking-tight">
              Welcome back, <span className="text-stroke">John</span>
            </h2>
            <p className="text-sm text-[#666]">
              Here&apos;s what&apos;s happening with your comics.
            </p>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="bg-[#111] border border-[#222] p-5"
              >
                <div className="text-xs text-[#666] tracking-[0.15em] uppercase mb-2">
                  {stat.label}
                </div>
                <div className="text-3xl font-black text-[#E8B931] mb-1">
                  {stat.value}
                </div>
                <div className="text-xs text-[#555]">{stat.sub}</div>
              </div>
            ))}
          </div>

          {/* Recent projects */}
          <div>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-xs font-bold text-[#E8B931] tracking-[0.2em] uppercase">
                Recent Projects
              </h3>
              <button className="text-xs text-[#666] tracking-wide uppercase flex items-center gap-1">
                View All <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.map((project) => (
                <div
                  key={project.title}
                  className="bg-[#111] border border-[#222] overflow-hidden"
                >
                  {/* Thumbnail area */}
                  <div className={`h-36 bg-gradient-to-br ${project.gradient} relative`}>
                    {/* Comic panel grid pattern */}
                    <div className="absolute inset-3 grid grid-cols-3 grid-rows-2 gap-1">
                      <div className="bg-[#222]/40 col-span-2 row-span-2 rounded-sm" />
                      <div className="bg-[#222]/40 rounded-sm" />
                      <div className="bg-[#222]/40 rounded-sm" />
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-4 space-y-2">
                    <h4 className="text-sm font-bold text-[#F5F5F0]">
                      {project.title}
                    </h4>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-[#666]">
                        {project.pages} pages
                      </span>
                      <span
                        className={`text-[10px] tracking-widest uppercase border px-2 py-0.5 ${getStatusColor(
                          project.status
                        )}`}
                      >
                        {project.status}
                      </span>
                    </div>
                    <div className="text-[10px] text-[#555]">
                      Edited {project.edited}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom row: Activity + Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Activity Timeline */}
            <div className="lg:col-span-2 bg-[#111] border border-[#222] p-6">
              <h3 className="text-xs font-bold text-[#E8B931] tracking-[0.2em] uppercase mb-5">
                Activity
              </h3>
              <div className="space-y-4">
                {activities.map((activity, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-[#E8B931] mt-1.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-[#F5F5F0]">{activity.text}</p>
                      <p className="text-xs text-[#555] mt-0.5">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-[#111] border border-[#222] p-6">
              <h3 className="text-xs font-bold text-[#E8B931] tracking-[0.2em] uppercase mb-5">
                Quick Actions
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {quickActions.map((action) => (
                  <button
                    key={action.label}
                    className="flex flex-col items-center justify-center gap-2 p-4 bg-[#0A0A0A] border border-[#222] text-center"
                  >
                    <action.icon className="w-5 h-5 text-[#E8B931]" />
                    <span className="text-[10px] text-[#999] tracking-wider uppercase">
                      {action.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
