import React from "react";
import { CheckCircle2, Clock, Loader2, XCircle, Search, FileText, Cpu } from "lucide-react";
import { SiteProgress, ProgressStep } from "@/lib/schema";

interface ProgressCardProps {
  progressList: SiteProgress[];
  targetUrls: string[];
}

const STEPS: { id: ProgressStep; label: string; icon: React.ElementType }[] = [
  { id: "discovering", label: "Discover Pages", icon: Search },
  { id: "fetching", label: "Read Pricing & Features", icon: FileText },
  { id: "extracting", label: "Extract Verified Facts", icon: Cpu },
  { id: "completed", label: "Done", icon: CheckCircle2 },
];

export function ProgressCard({ progressList, targetUrls }: ProgressCardProps) {
  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Loader2 className="w-4 h-4 text-indigo-600 animate-spin" />
          Analyzing competitors via TinyFish...
        </h3>
        <span className="text-xs text-slate-500 dark:text-slate-400">
          Parallel scraping & strict LLM extraction
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {targetUrls.map((url) => {
          let domain = "site";
          try {
            domain = new URL(url.startsWith("http") ? url : `https://${url}`).hostname.replace(/^www\./, "");
          } catch {
            domain = url;
          }

          const progress = progressList.find((p) => p.url === url || p.domain === domain);
          const currentStep = progress?.step || "discovering";
          const isFailed = progress?.step === "failed";
          const isCompleted = progress?.step === "completed";

          const getStepStatus = (stepId: ProgressStep) => {
            if (isFailed) return "failed";
            if (isCompleted) return "done";

            const order: ProgressStep[] = ["validating", "discovering", "fetching", "extracting", "completed"];
            const currentIndex = order.indexOf(currentStep);
            const stepIndex = order.indexOf(stepId);

            if (stepIndex < currentIndex) return "done";
            if (stepIndex === currentIndex) return "active";
            return "pending";
          };

          return (
            <div
              key={url}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4"
            >
              {/* Site Header */}
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2.5 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`https://www.google.com/s2/favicons?domain=${domain}&sz=32`}
                    alt={domain}
                    className="w-5 h-5 rounded shrink-0 bg-slate-100 dark:bg-slate-800"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = "none";
                    }}
                  />
                  <span className="font-semibold text-sm text-slate-900 dark:text-slate-100 truncate">
                    {domain}
                  </span>
                </div>

                {isCompleted ? (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Complete
                  </span>
                ) : isFailed ? (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-red-600 dark:text-red-400">
                    <XCircle className="w-3.5 h-3.5" />
                    Failed
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 dark:text-indigo-400 animate-pulse">
                    <Clock className="w-3.5 h-3.5" />
                    In progress
                  </span>
                )}
              </div>

              {/* Steps timeline */}
              <div className="space-y-2.5">
                {STEPS.map((step) => {
                  const status = getStepStatus(step.id);
                  const Icon = step.icon;

                  return (
                    <div key={step.id} className="flex items-center gap-2.5 text-xs">
                      {status === "done" ? (
                        <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </div>
                      ) : status === "active" ? (
                        <div className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 animate-spin">
                          <Loader2 className="w-3.5 h-3.5" />
                        </div>
                      ) : status === "failed" ? (
                        <div className="w-5 h-5 rounded-full bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0">
                          <XCircle className="w-3.5 h-3.5" />
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center shrink-0">
                          <Icon className="w-3 h-3" />
                        </div>
                      )}

                      <span
                        className={`font-medium ${
                          status === "done"
                            ? "text-slate-700 dark:text-slate-300"
                            : status === "active"
                            ? "text-indigo-600 dark:text-indigo-400 font-semibold"
                            : status === "failed"
                            ? "text-red-600 dark:text-red-400"
                            : "text-slate-400 dark:text-slate-600"
                        }`}
                      >
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Status Message or Skeletons */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                  {progress?.message || `Waiting to scan ${domain}...`}
                </p>

                {/* Micro-skeletons */}
                <div className="mt-2 space-y-1.5 opacity-60">
                  <div className="h-1.5 bg-slate-200 dark:bg-slate-800 rounded w-full animate-pulse" />
                  <div className="h-1.5 bg-slate-200 dark:bg-slate-800 rounded w-3/4 animate-pulse" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
