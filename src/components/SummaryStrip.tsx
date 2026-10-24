import React from "react";
import { Sparkles, TrendingUp, Check } from "lucide-react";

interface SummaryStripProps {
  insights: string[];
}

export function SummaryStrip({ insights }: SummaryStripProps) {
  if (!insights || insights.length === 0) return null;

  return (
    <div className="w-full bg-gradient-to-r from-indigo-50/70 via-slate-50 to-emerald-50/50 dark:from-indigo-950/20 dark:via-slate-900/40 dark:to-emerald-950/20 border border-indigo-100/80 dark:border-indigo-900/40 rounded-2xl p-5 shadow-sm space-y-3">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-700 dark:text-indigo-400">
        <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
        <span>Executive Synthesis (Direct Extracted Facts Only)</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
        {insights.map((insight, idx) => (
          <div
            key={idx}
            className="flex items-start gap-2.5 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border border-slate-200/60 dark:border-slate-800/80 rounded-xl p-3 text-xs leading-relaxed text-slate-800 dark:text-slate-200 shadow-xs"
          >
            <div className="mt-0.5 p-1 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 shrink-0">
              {idx === 0 ? (
                <Check className="w-3 h-3" />
              ) : idx === 1 ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <Sparkles className="w-3 h-3" />
              )}
            </div>
            <span>{insight}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
