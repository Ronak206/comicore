"use client";

import Link from "next/link";
import {
  ChevronRight,
  Play,
  Plus,
  Download,
  Brain,
} from "lucide-react";

const projects = [
  {
    id: "1",
    title: "The Last Cyberpunk",
    pages: "24/32",
    status: "In Progress",
    edited: "2 hours ago",
    gradient: "from-[#1A1A1A] to-[#222]",
  },
  {
    id: "2",
    title: "Shadow Walker Chronicles",
    pages: "18/24",
    status: "In Progress",
    edited: "5 hours ago",
    gradient: "from-[#1A1A1A] to-[#252015]",
  },
  {
    id: "3",
    title: "Neon Dreams",
    pages: "8/12",
    status: "Draft",
    edited: "Yesterday",
    gradient: "from-[#1A1A1A] to-[#1F1A22]",
  },
  {
    id: "4",
    title: "Dark Horizon",
    pages: "32/32",
    status: "Completed",
    edited: "3 days ago",
    gradient: "from-[#1A1A1A] to-[#1A1F1A]",
  },
  {
    id: "5",
    title: "Iron Legacy",
    pages: "16/20",
    status: "In Progress",
    edited: "4 days ago",
    gradient: "from-[#1A1A1A] to-[#201A1A]",
  },
  {
    id: "6",
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
  { label: "Total Comics", value: "12", sub: "\u2191 3 this week" },
  { label: "Pages Created", value: "147", sub: "\u2191 24 this week" },
  { label: "Characters Tracked", value: "38", sub: "Memory active" },
  { label: "Exported Files", value: "8", sub: "PDF, CBZ" },
];

const quickActions = [
  { icon: Plus, label: "New Comic", href: "/dashboard" },
  { icon: Play, label: "Resume Last", href: "/dashboard" },
  { icon: Download, label: "Export All", href: "/dashboard/export" },
  { icon: Brain, label: "Memory Bank", href: "/dashboard/memory" },
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
  return (
    <div className="space-y-8">
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
            <Link
              key={project.id}
              href={`/dashboard/comic/${project.id}`}
              className="bg-[#111] border border-[#222] overflow-hidden block"
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
            </Link>
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
              <Link
                key={action.label}
                href={action.href}
                className="flex flex-col items-center justify-center gap-2 p-4 bg-[#0A0A0A] border border-[#222] text-center"
              >
                <action.icon className="w-5 h-5 text-[#E8B931]" />
                <span className="text-[10px] text-[#999] tracking-wider uppercase">
                  {action.label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
