"use client";

import React, { useState } from "react";
import { ExternalLink, Quote, AlertTriangle, RefreshCw } from "lucide-react";
import { CompanyAnalysis, ComparisonField } from "@/lib/schema";
import { ConfidenceBadge } from "./ConfidenceBadge";

interface MobileCardsProps {
  companies: CompanyAnalysis[];
  onRetrySite?: (url: string) => void;
}

const FIELD_LABELS: Record<string, string> = {
  positioning: "Positioning",
  targetAudience: "Target Audience",
  coreFeatures: "Core Features",
  services: "Services Offered",
  pricing: "Public Pricing",
  differentiator: "Notable Differentiator",
};

export function MobileCards({ companies, onRetrySite }: MobileCardsProps) {
  const [activeTab, setActiveTab] = useState<number>(0);

  const activeCompany = companies[activeTab] || companies[0];
  if (!activeCompany) return null;

  const fieldKeys = [
    "positioning",
    "targetAudience",
    "coreFeatures",
    "services",
    "pricing",
    "differentiator",
  ] as const;

  return (
    <div className="w-full space-y-4 md:hidden">
      {/* Company Selector Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
        {companies.map((company, index) => (
          <button
            key={index}
            type="button"
            onClick={() => setActiveTab(index)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
              activeTab === index
                ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
            }`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={
                company.faviconUrl ||
                `https://www.google.com/s2/favicons?domain=${company.domain}&sz=32`
              }
              alt={company.companyName}
              className="w-3.5 h-3.5 rounded"
            />
            <span className="truncate">{company.companyName}</span>
          </button>
        ))}
      </div>

      {/* Active Company Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={
                activeCompany.faviconUrl ||
                `https://www.google.com/s2/favicons?domain=${activeCompany.domain}&sz=64`
              }
              alt={activeCompany.companyName}
              className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-800 p-0.5 border border-slate-200 dark:border-slate-700"
            />
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                {activeCompany.companyName}
              </h3>
              <a
                href={activeCompany.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400"
              >
                <span>{activeCompany.domain}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {activeCompany.status === "failed" && onRetrySite && (
            <button
              onClick={() => onRetrySite(activeCompany.url)}
              type="button"
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-red-600 bg-red-50 dark:bg-red-950/40 rounded-lg border border-red-200 dark:border-red-900"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Retry</span>
            </button>
          )}
        </div>

        {/* Failed State */}
        {activeCompany.status === "failed" ? (
          <div className="p-4 rounded-xl border border-dashed border-red-200 dark:border-red-900/60 bg-red-50/40 dark:bg-red-950/20 text-xs text-red-700 dark:text-red-400 space-y-2">
            <div className="flex items-center gap-1.5 font-semibold">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              <span>Could not analyze {activeCompany.domain}</span>
            </div>
            <p>{activeCompany.errorMessage || "Site was unreachable or blocked"}</p>
          </div>
        ) : (
          /* Field Rows */
          <div className="space-y-4 divide-y divide-slate-100 dark:divide-slate-800">
            {fieldKeys.map((key) => {
              const field: ComparisonField = activeCompany.fields[key];
              const isNotListed = field.confidence === "not_listed";

              return (
                <div key={key} className="pt-3 first:pt-0 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      {FIELD_LABELS[key]}
                    </span>
                    <ConfidenceBadge confidence={field.confidence} />
                  </div>

                  {isNotListed ? (
                    <div className="p-3 rounded-xl border border-dashed border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 text-xs text-slate-400 italic">
                      Not listed on site
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-line">
                        {field.value}
                      </p>

                      <div className="flex items-center justify-between text-xs text-slate-500">
                        {field.sourceUrl && (
                          <a
                            href={field.sourceUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-medium hover:underline text-[11px]"
                          >
                            <span>View Source Page</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>

                      {field.snippet && (
                        <div className="flex items-start gap-1.5 p-2 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800/60 text-[11px] italic text-slate-600 dark:text-slate-400">
                          <Quote className="w-3 h-3 text-indigo-500 shrink-0 mt-0.5" />
                          <span>&ldquo;{field.snippet}&rdquo;</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
