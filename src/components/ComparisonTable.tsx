"use client";

import React from "react";
import { ExternalLink, Quote, RefreshCw, AlertTriangle } from "lucide-react";
import { CompanyAnalysis, ComparisonField } from "@/lib/schema";
import { ConfidenceBadge } from "./ConfidenceBadge";

interface ComparisonTableProps {
  companies: CompanyAnalysis[];
  onRetrySite?: (url: string) => void;
}

interface RowConfig {
  key: keyof CompanyAnalysis["fields"];
  label: string;
  description: string;
}

const ROWS: RowConfig[] = [
  {
    key: "positioning",
    label: "Positioning",
    description: "One-line description of what it is",
  },
  {
    key: "targetAudience",
    label: "Target Audience",
    description: "Explicitly stated target customers & buyer personas",
  },
  {
    key: "coreFeatures",
    label: "Core Features",
    description: "Key product capabilities explicitly highlighted",
  },
  {
    key: "services",
    label: "Services Offered",
    description: "Support tiers, onboarding, community, and integrations",
  },
  {
    key: "pricing",
    label: "Public Pricing",
    description: "Plans, price, billing interval, and free tier status",
  },
  {
    key: "differentiator",
    label: "Notable Differentiator",
    description: "Explicit competitive edge stated on page",
  },
];

export function ComparisonTable({ companies, onRetrySite }: ComparisonTableProps) {
  return (
    <div className="w-full overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 shadow-sm">
      <table className="w-full text-left border-collapse min-w-[700px]">
        {/* Sticky Header with Companies */}
        <thead className="sticky top-16 z-30 bg-slate-50/95 dark:bg-slate-950/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
          <tr>
            <th className="w-1/4 p-5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 bg-slate-50/90 dark:bg-slate-950/90">
              Evaluation Criteria
            </th>
            {companies.map((company, idx) => (
              <th
                key={idx}
                className="p-5 align-top border-l border-slate-200/80 dark:border-slate-800/80 bg-slate-50/90 dark:bg-slate-950/90"
                style={{ width: `${75 / companies.length}%` }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    {/* Favicon */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={
                        company.faviconUrl ||
                        `https://www.google.com/s2/favicons?domain=${company.domain}&sz=64`
                      }
                      alt={`${company.companyName} logo`}
                      className="w-7 h-7 rounded-lg bg-white dark:bg-slate-800 p-0.5 border border-slate-200 dark:border-slate-700 shrink-0 shadow-xs"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = "none";
                      }}
                    />
                    <div>
                      <h4 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                        {company.companyName}
                      </h4>
                      <a
                        href={company.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
                      >
                        <span>{company.domain}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>

                  {company.status === "failed" && onRetrySite && (
                    <button
                      type="button"
                      onClick={() => onRetrySite(company.url)}
                      className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/60 rounded-lg hover:bg-red-100 transition-colors"
                      title="Retry analyzing this website"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Retry</span>
                    </button>
                  )}
                </div>

                {/* Scanned pages count */}
                <div className="mt-2 text-[11px] text-slate-400 dark:text-slate-500">
                  {company.status === "failed" ? (
                    <span className="text-red-500 font-medium flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      Analysis Failed
                    </span>
                  ) : (
                    <span>
                      {company.pagesAnalyzed.length} public {company.pagesAnalyzed.length === 1 ? "page" : "pages"} scanned
                    </span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>

        {/* Rows */}
        <tbody className="divide-y divide-slate-200/80 dark:divide-slate-800/80 text-sm">
          {ROWS.map((row) => (
            <tr
              key={row.key}
              className="hover:bg-slate-50/60 dark:hover:bg-slate-800/20 transition-colors group"
            >
              {/* Row Label */}
              <td className="p-5 align-top bg-slate-50/40 dark:bg-slate-950/30">
                <div className="font-semibold text-slate-900 dark:text-slate-100">
                  {row.label}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                  {row.description}
                </div>
              </td>

              {/* Company Data Cells */}
              {companies.map((company, colIndex) => {
                if (company.status === "failed") {
                  return (
                    <td
                      key={colIndex}
                      className="p-5 align-top border-l border-slate-200/80 dark:border-slate-800/80 bg-red-50/20 dark:bg-red-950/10"
                    >
                      <div className="p-3 rounded-xl border border-dashed border-red-200 dark:border-red-900/40 text-xs text-red-600 dark:text-red-400 space-y-1">
                        <p className="font-semibold">Could not analyze page</p>
                        <p className="text-[11px] opacity-80">
                          {company.errorMessage || "Site was unreachable or blocked"}
                        </p>
                      </div>
                    </td>
                  );
                }

                const field: ComparisonField = company.fields[row.key];
                const isNotListed = field.confidence === "not_listed";

                return (
                  <td
                    key={colIndex}
                    className="p-5 align-top border-l border-slate-200/80 dark:border-slate-800/80 relative"
                  >
                    {isNotListed ? (
                      /* Not listed cell: visually muted with dashed border and gray italic text */
                      <div className="p-3.5 rounded-xl border border-dashed border-slate-300 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30 space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-medium italic text-slate-400 dark:text-slate-500">
                            Not listed on site
                          </span>
                          <ConfidenceBadge confidence="not_listed" />
                        </div>
                        <p className="text-[11px] text-slate-400 dark:text-slate-600 italic">
                          No explicit statement found on analyzed public pages.
                        </p>
                      </div>
                    ) : (
                      /* Populated cell */
                      <div className="space-y-3">
                        {/* Header of cell: Confidence badge + Source Link */}
                        <div className="flex items-center justify-between gap-2">
                          <ConfidenceBadge confidence={field.confidence} />

                          {field.sourceUrl && (
                            <a
                              href={field.sourceUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
                              title={`View exact source: ${field.sourceUrl}`}
                            >
                              <span>Source</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>

                        {/* Cell Value */}
                        <div className="text-slate-800 dark:text-slate-200 text-sm leading-relaxed whitespace-pre-line font-normal">
                          {field.value}
                        </div>

                        {/* Supporting Snippet Box / Tooltip Hover */}
                        {field.snippet && (
                          <div className="pt-2 border-t border-slate-100 dark:border-slate-800/70">
                            <div className="group/snippet relative">
                              <div className="flex items-start gap-1.5 p-2 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800/60 text-xs text-slate-600 dark:text-slate-400 cursor-help">
                                <Quote className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
                                <span className="line-clamp-2 italic text-[11px]">
                                  &ldquo;{field.snippet}&rdquo;
                                </span>
                              </div>

                              {/* Hover Popover showing full snippet */}
                              <div className="absolute bottom-full left-0 mb-2 hidden group-hover/snippet:block z-50 w-72 p-3 bg-slate-900 dark:bg-slate-950 text-white rounded-xl shadow-xl border border-slate-800 text-xs space-y-1.5 pointer-events-none">
                                <div className="flex items-center gap-1 text-[10px] uppercase font-semibold text-indigo-400">
                                  <Quote className="w-3 h-3" />
                                  <span>Verified Evidence Snippet</span>
                                </div>
                                <p className="italic leading-relaxed">
                                  &ldquo;{field.snippet}&rdquo;
                                </p>
                                <div className="text-[10px] text-slate-400 truncate pt-1 border-t border-slate-800">
                                  Source: {field.sourceUrl}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
