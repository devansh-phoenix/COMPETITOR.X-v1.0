import React from "react";
import { CheckCircle2, AlertCircle, HelpCircle } from "lucide-react";
import { Confidence } from "@/lib/schema";

interface ConfidenceBadgeProps {
  confidence: Confidence;
  className?: string;
}

export function ConfidenceBadge({ confidence, className = "" }: ConfidenceBadgeProps) {
  if (confidence === "verified") {
    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium tracking-tight bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60 ${className}`}
        title="Explicitly stated on page"
      >
        <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
        Verified
      </span>
    );
  }

  if (confidence === "partial") {
    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium tracking-tight bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60 ${className}`}
        title="Vague or incomplete on page"
      >
        <AlertCircle className="w-3 h-3 text-amber-600 dark:text-amber-400 shrink-0" />
        Partial
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium tracking-tight bg-slate-100 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700/60 ${className}`}
      title="Not listed on public site"
    >
      <HelpCircle className="w-3 h-3 text-slate-400 dark:text-slate-500 shrink-0" />
      Not listed
    </span>
  );
}
