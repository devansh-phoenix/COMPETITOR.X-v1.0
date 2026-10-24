"use client";

import React, { useState } from "react";
import { Copy, Check, Download, Printer, RotateCcw } from "lucide-react";
import { ComparisonResult } from "@/lib/schema";
import { formatAsMarkdown, downloadAsCsv } from "@/lib/export";

interface ActionBarProps {
  result: ComparisonResult;
  onReset: () => void;
}

export function ActionBar({ result, onReset }: ActionBarProps) {
  const [copied, setCopied] = useState<boolean>(false);

  const handleCopyMarkdown = async () => {
    try {
      const markdown = formatAsMarkdown(result);
      await navigator.clipboard.writeText(markdown);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      alert("Unable to copy to clipboard automatically.");
    }
  };

  const handleDownloadCsv = () => {
    downloadAsCsv(result);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 no-print">
      <div className="flex items-center gap-2">
        <button
          onClick={onReset}
          type="button"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-xs"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
          <span>New Comparison</span>
        </button>

        <span className="text-xs text-slate-400 dark:text-slate-500 hidden sm:inline">
          Analyzed {new Date(result.analyzedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={handleCopyMarkdown}
          type="button"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-xs"
          title="Copy comparison table formatted as Markdown"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span className="text-emerald-700 dark:text-emerald-400 font-semibold">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-slate-500" />
              <span>Copy as Markdown</span>
            </>
          )}
        </button>

        <button
          onClick={handleDownloadCsv}
          type="button"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-xs"
          title="Download data as CSV file"
        >
          <Download className="w-3.5 h-3.5 text-slate-500" />
          <span>Download CSV</span>
        </button>

        <button
          onClick={handlePrint}
          type="button"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-xs"
          title="Print or save as PDF"
        >
          <Printer className="w-3.5 h-3.5 text-slate-500" />
          <span>Print / PDF</span>
        </button>
      </div>
    </div>
  );
}
