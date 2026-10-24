"use client";

import React, { useState } from "react";
import { Plus, Trash2, ArrowRight, Globe, AlertCircle, Sparkles } from "lucide-react";
import { normalizeAndValidateUrl } from "@/lib/validate";

interface InputCardProps {
  onCompare: (urls: string[]) => void;
  isLoading: boolean;
}

const PRESET_EXAMPLES = [
  {
    label: "Notion vs Coda vs Airtable",
    urls: ["https://notion.so", "https://coda.io", "https://airtable.com"],
  },
  {
    label: "Linear vs Jira",
    urls: ["https://linear.app", "https://atlassian.com/software/jira"],
  },
  {
    label: "Stripe vs Adyen",
    urls: ["https://stripe.com", "https://adyen.com"],
  },
];

export function InputCard({ onCompare, isLoading }: InputCardProps) {
  const [urls, setUrls] = useState<string[]>([
    "https://notion.so",
    "https://coda.io",
    "https://airtable.com",
  ]);
  const [errors, setErrors] = useState<string[]>(["", "", ""]);

  const handleUrlChange = (index: number, value: string) => {
    const updated = [...urls];
    updated[index] = value;
    setUrls(updated);

    // Validate inline
    const updatedErrors = [...errors];
    if (value.trim()) {
      const validation = normalizeAndValidateUrl(value);
      updatedErrors[index] = validation.valid ? "" : (validation.error || "Invalid URL");
    } else {
      updatedErrors[index] = "";
    }
    setErrors(updatedErrors);
  };

  const handleAddSite = () => {
    if (urls.length < 3) {
      setUrls([...urls, ""]);
      setErrors([...errors, ""]);
    }
  };

  const handleRemoveSite = (index: number) => {
    if (urls.length > 2) {
      setUrls(urls.filter((_, i) => i !== index));
      setErrors(errors.filter((_, i) => i !== index));
    }
  };

  const handleApplyPreset = (presetUrls: string[]) => {
    setUrls(presetUrls);
    setErrors(presetUrls.map(() => ""));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Check all URLs
    let hasError = false;
    const newErrors = urls.map((u) => {
      if (!u.trim()) {
        hasError = true;
        return "URL cannot be empty";
      }
      const validation = normalizeAndValidateUrl(u);
      if (!validation.valid) {
        hasError = true;
        return validation.error || "Invalid URL";
      }
      return "";
    });

    setErrors(newErrors);

    if (!hasError && !isLoading) {
      onCompare(urls.map((u) => u.trim()));
    }
  };

  return (
    <div className="w-full bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800/90 rounded-2xl p-6 sm:p-8 shadow-xl shadow-slate-200/50 dark:shadow-none transition-all">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-3">
          {urls.map((url, index) => (
            <div key={index} className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Globe className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={url}
                    onChange={(e) => handleUrlChange(index, e.target.value)}
                    placeholder={`e.g. https://${index === 0 ? "notion.so" : index === 1 ? "coda.io" : "airtable.com"}`}
                    disabled={isLoading}
                    aria-label={`Competitor URL ${index + 1}`}
                    className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950/60 border rounded-xl text-sm font-medium text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${
                      errors[index]
                        ? "border-red-400 dark:border-red-500 focus:ring-red-400"
                        : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                    }`}
                  />
                </div>

                {urls.length > 2 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveSite(index)}
                    disabled={isLoading}
                    aria-label={`Remove site ${index + 1}`}
                    className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-red-500 hover:border-red-200 dark:hover:border-red-900/60 hover:bg-red-50/50 dark:hover:bg-red-950/30 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              {errors[index] && (
                <div className="flex items-center gap-1.5 text-xs text-red-600 dark:text-red-400 pl-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errors[index]}</span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Action Controls & Preset Chips */}
        <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            {urls.length < 3 && (
              <button
                type="button"
                onClick={handleAddSite}
                disabled={isLoading}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 bg-slate-100/80 dark:bg-slate-800/80 hover:bg-slate-200/80 dark:hover:bg-slate-700/80 transition-colors border border-slate-200/60 dark:border-slate-700/60"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add 3rd competitor</span>
              </button>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] transition-all shadow-md shadow-indigo-600/20 disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Comparing with TinyFish...</span>
              </>
            ) : (
              <>
                <span>Compare Competitors</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

        {/* Preset Chips */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800/70 flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <span className="font-medium flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            Quick presets:
          </span>
          {PRESET_EXAMPLES.map((preset, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleApplyPreset(preset.urls)}
              disabled={isLoading}
              className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/70 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60 transition-colors hover:text-indigo-600 dark:hover:text-indigo-400"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </form>
    </div>
  );
}
