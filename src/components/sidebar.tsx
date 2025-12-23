"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Users,
  BarChart3,
  Settings,
  Zap,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { ThemeToggle } from "@/components/theme-toggle";

const navItems = [
  {
    name: "Talent Pool",
    href: "/dashboard",
    icon: Users,
    description: "Manage candidates",
  },
  {
    name: "Readiness Analytics",
    href: "/dashboard/analytics",
    icon: BarChart3,
    description: "View insights",
  },
  {
    name: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
    description: "Configure system",
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <>
      {/* Mobile Toggle */}
      <button
        className="fixed top-4 left-4 z-50 p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 md:hidden"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        {isCollapsed ? (
          <Menu className="h-5 w-5 text-slate-600 dark:text-slate-400" />
        ) : (
          <X className="h-5 w-5 text-slate-600 dark:text-slate-400" />
        )}
      </button>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed md:relative z-40 h-screen bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border-r border-slate-200 dark:border-slate-800 transition-all duration-300",
          isCollapsed ? "-translate-x-full md:translate-x-0 md:w-20" : "w-64",
          "flex flex-col"
        )}
      >
        {/* Logo */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Zap className="h-5 w-5 text-white" />
            </div>
            {!isCollapsed && (
              <div>
                <h1 className="text-lg font-bold text-slate-900 dark:text-white">GCC-Ready</h1>
                <p className="text-xs text-slate-500 dark:text-slate-500">Talent Discovery</p>
              </div>
            )}
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                  isActive
                    ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/50"
                )}
              >
                <item.icon className={cn("h-5 w-5", isActive && "text-indigo-400")} />
                {!isCollapsed && (
                  <div>
                    <span className="font-medium">{item.name}</span>
                    {isActive && (
                      <p className="text-xs text-indigo-400/70">{item.description}</p>
                    )}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer with Theme Toggle */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-center">
            <ThemeToggle />
          </div>
          {!isCollapsed && (
            <div className="px-4 py-3 rounded-xl bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20">
              <p className="text-xs text-slate-500 dark:text-slate-400">GCC Hackathon 2025</p>
              <p className="text-sm font-medium text-indigo-400">X Shift Edition</p>
            </div>
          )}
        </div>

        {/* Collapse Toggle (Desktop) */}
        <button
          className="hidden md:flex absolute -right-3 top-20 w-6 h-6 rounded-full bg-slate-800 border border-slate-700 items-center justify-center hover:bg-slate-700 transition-colors"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          <Menu className="h-3 w-3 text-slate-400" />
        </button>
      </aside>
    </>
  );
}
