import React from "react";
import { ThemeToggle } from "./ThemeToggle";
import { ShieldCheck, Sparkles, Layers } from "lucide-react";

interface NavbarProps {
  isDemoData?: boolean;
}

export function Navbar({ isDemoData }: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-tight text-slate-900 dark:text-white">
                Competitor<span className="text-indigo-600 dark:text-indigo-400">X</span>
              </span>
              <span className="px-1.5 py-0.5 text-[10px] uppercase font-semibold tracking-wider rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/60">
                Agent
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">
              Evidence-based SaaS comparison
            </p>
          </div>
        </div>

        {/* Right side indicators & controls */}
        <div className="flex items-center gap-3">
          {/* Trust Principle Badge */}
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Zero Hallucinations Guarantee</span>
          </div>

          {/* Demo Data indicator */}
          {isDemoData && (
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/70">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              <span>Demo Mode</span>
            </div>
          )}

          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
