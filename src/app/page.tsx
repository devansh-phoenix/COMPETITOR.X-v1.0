"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import { Navbar } from "@/components/Navbar";
import { InputCard } from "@/components/InputCard";
import { ProgressCard } from "@/components/ProgressCard";
import { SummaryStrip } from "@/components/SummaryStrip";
import { ActionBar } from "@/components/ActionBar";
import { ComparisonTable } from "@/components/ComparisonTable";
import { MobileCards } from "@/components/MobileCards";
import { CursorGlow } from "@/components/CursorGlow";
import { ComparisonResult, SiteProgress } from "@/lib/schema";
import { ShieldCheck, Search, Sparkles, AlertCircle, ArrowLeft } from "lucide-react";

const HeroScene = dynamic(() => import("@/components/three/HeroScene"), {
  ssr: false,
});

export default function Home() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [progressList, setProgressList] = useState<SiteProgress[]>([]);
  const [activeUrls, setActiveUrls] = useState<string[]>([]);
  const [result, setResult] = useState<ComparisonResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleStartComparison = async (urls: string[]) => {
    setIsLoading(true);
    setError(null);
    setResult(null);
    setActiveUrls(urls);
    setProgressList(
      urls.map((u) => {
        let domain = u;
        try {
          domain = new URL(u).hostname.replace(/^www\./, "");
        } catch {
          // ignore
        }
        return {
          url: u,
          domain,
          step: "validating",
          message: "Initiating analysis...",
        };
      })
    );

    try {
      const response = await fetch("/api/compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ urls }),
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.error || `Server responded with status ${response.status}`);
      }

      // Check if response is JSON (e.g. cached or direct) or SSE stream
      const contentType = response.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        const json = await response.json();
        setResult(json);
        setIsLoading(false);
        return;
      }

      // Read SSE stream
      const reader = response.body?.getReader();
      if (!reader) throw new Error("Could not initialize streaming connection.");

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const events = buffer.split("\n\n");
        buffer = events.pop() || "";

        for (const eventBlock of events) {
          if (!eventBlock.trim()) continue;

          let eventType = "message";
          let dataStr = "";

          const lines = eventBlock.split("\n");
          for (const line of lines) {
            if (line.startsWith("event:")) {
              eventType = line.replace("event:", "").trim();
            } else if (line.startsWith("data:")) {
              dataStr = line.replace("data:", "").trim();
            }
          }

          if (eventType === "progress" && dataStr) {
            try {
              const progress: SiteProgress = JSON.parse(dataStr);
              setProgressList((prev: SiteProgress[]) => {
                const next = prev.filter((p: SiteProgress) => p.url !== progress.url && p.domain !== progress.domain);
                return [...next, progress];
              });
            } catch {
              // ignore json parse error
            }
          } else if (eventType === "result" && dataStr) {
            try {
              const comparisonData: ComparisonResult = JSON.parse(dataStr);
              setResult(comparisonData);
            } catch {
              // ignore
            }
          } else if (eventType === "error" && dataStr) {
            try {
              const errObj = JSON.parse(dataStr);
              setError(errObj.message || "Pipeline error occurred");
            } catch {
              setError("An error occurred during comparison.");
            }
          }
        }
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to run comparison");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetrySite = (urlToRetry: string) => {
    // Re-run comparison with existing URLs
    if (activeUrls.length > 0) {
      handleStartComparison(activeUrls);
    } else {
      handleStartComparison([urlToRetry, "https://coda.io"]);
    }
  };

  const handleReset = () => {
    setResult(null);
    setError(null);
    setProgressList([]);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors relative overflow-hidden">
      <Navbar isDemoData={result?.isDemoData} />

      {/* 3D Interactive Hero Scene (Lazy-loaded, non-blocking decoration) */}
      {!result && !isLoading && <HeroScene />}

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8 relative z-10">
        {/* Hero Section */}
        {!result && !isLoading && (
          <div className="text-center space-y-4 max-w-3xl mx-auto pt-4 sm:pt-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50/90 dark:bg-indigo-950/80 backdrop-blur-sm text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800/80 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Autonomous Competitive Intelligence</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.1] drop-shadow-xs">
              Compare any competitors in <span className="text-indigo-600 dark:text-indigo-400">one minute</span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
              Enter 2 or 3 company URLs. TinyFish visits the live websites, extracts verifiable features & pricing, and delivers side-by-side evidence with zero hallucinations.
            </p>
          </div>
        )}

        {/* Input Card with Interactive Cursor Glow */}
        {!result && (
          <div className="max-w-3xl mx-auto w-full">
            <CursorGlow>
              <InputCard onCompare={handleStartComparison} isLoading={isLoading} />
            </CursorGlow>
          </div>
        )}

        {/* Error Banner */}
        {error && (
          <div className="max-w-3xl mx-auto w-full p-4 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/60 flex items-start gap-3 text-sm text-red-700 dark:text-red-300">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div className="flex-1 space-y-1">
              <p className="font-semibold">Comparison could not be completed</p>
              <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
            </div>
          </div>
        )}

        {/* Progress Card */}
        {isLoading && (
          <div className="max-w-4xl mx-auto w-full pt-4">
            <ProgressCard progressList={progressList} targetUrls={activeUrls} />
          </div>
        )}

        {/* Results View */}
        {result && (
          <div className="space-y-6 pt-2">
            {/* Top Action Bar */}
            <ActionBar result={result} onReset={handleReset} />

            {/* Summary Insights Strip */}
            <SummaryStrip insights={result.quickInsights} />

            {/* Desktop Comparison Table */}
            <div className="hidden md:block">
              <ComparisonTable
                companies={result.companies}
                onRetrySite={handleRetrySite}
              />
            </div>

            {/* Mobile Swipeable Cards */}
            <MobileCards
              companies={result.companies}
              onRetrySite={handleRetrySite}
            />
          </div>
        )}

        {/* Feature Highlights Grid (visible on empty state) */}
        {!result && !isLoading && (
          <div className="pt-10 max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                Trust Over Completeness
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                If a pricing plan or feature is not explicitly on the site, we show &ldquo;Not listed on site&rdquo;. We never guess or hallucinate.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                <Search className="w-4 h-4" />
              </div>
              <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                Direct Source Citation
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Every populated cell links directly to the exact source page with verified evidence snippets up to 25 words.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-2">
              <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                <Sparkles className="w-4 h-4" />
              </div>
              <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                Parallel Resilient Pipeline
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                All competitor websites are analyzed simultaneously. One blocked or unreachable site never breaks the others.
              </p>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-200/80 dark:border-slate-800/80 py-6 text-center text-xs text-slate-500 dark:text-slate-400 mt-auto bg-white/50 dark:bg-slate-950/50 backdrop-blur-sm no-print">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>
            Based only on publicly available information at the time of analysis. Verify before making decisions.
          </p>
          <div className="flex items-center gap-4">
            <span className="text-slate-400 dark:text-slate-600">Built with TinyFish API</span>
            <span className="text-slate-400 dark:text-slate-600">•</span>
            <span>CompetitorX v1.0</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
