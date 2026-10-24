import { ComparisonResult } from "./schema";

const FIELD_LABELS: Record<string, string> = {
  positioning: "Positioning / What it is",
  targetAudience: "Target Audience",
  coreFeatures: "Core Features",
  services: "Services Offered",
  pricing: "Public Pricing",
  differentiator: "Notable Differentiator",
};

/**
 * Generate clean GitHub-flavored Markdown comparison table
 */
export function formatAsMarkdown(result: ComparisonResult): string {
  const companies = result.companies;
  let md = `# CompetitorX Comparison Report\n\n`;
  md += `*Generated on ${new Date(result.analyzedAt).toLocaleString()} — ${result.isDemoData ? "Demo Data" : "Live Verified Findings"}*\n\n`;

  if (result.quickInsights.length > 0) {
    md += `## Key Takeaways\n`;
    result.quickInsights.forEach((insight) => {
      md += `- ${insight}\n`;
    });
    md += `\n`;
  }

  // Header row
  const headerCols = ["Feature / Field", ...companies.map((c) => c.companyName)];
  md += `| ${headerCols.join(" | ")} |\n`;
  md += `| ${headerCols.map(() => "---").join(" | ")} |\n`;

  // Field rows
  const fieldKeys = [
    "positioning",
    "targetAudience",
    "coreFeatures",
    "services",
    "pricing",
    "differentiator",
  ] as const;

  for (const key of fieldKeys) {
    const label = FIELD_LABELS[key] || key;
    const values = companies.map((c) => {
      if (c.status === "failed") return `*(Analysis failed: ${c.errorMessage || "unreachable"})*`;
      const field = c.fields[key];
      // Clean up multiline bullets for markdown table cell
      const cleanVal = field.value.replace(/\n+/g, "<br/>").replace(/\|/g, "\\|");
      const badge = field.confidence === "verified" ? "✅" : field.confidence === "partial" ? "⚠️" : "❌";
      const source = field.confidence !== "not_listed" ? ` ([source](${field.sourceUrl}))` : "";
      return `${badge} ${cleanVal}${source}`;
    });

    md += `| **${label}** | ${values.join(" | ")} |\n`;
  }

  md += `\n---\n*Disclaimer: Based strictly on publicly available information at the time of analysis. Verify before making decisions.*`;
  return md;
}

/**
 * Download Comparison as CSV file
 */
export function downloadAsCsv(result: ComparisonResult): void {
  const companies = result.companies;
  const headers = ["Comparison Field", ...companies.map((c) => `${c.companyName} (${c.domain})`), "Confidence Indicator", "Source URL"];
  
  const fieldKeys = [
    "positioning",
    "targetAudience",
    "coreFeatures",
    "services",
    "pricing",
    "differentiator",
  ] as const;

  const rows: string[][] = [headers];

  for (const key of fieldKeys) {
    const label = FIELD_LABELS[key] || key;
    const row = [
      label,
      ...companies.map((c) => {
        if (c.status === "failed") return `Failed: ${c.errorMessage || "error"}`;
        return c.fields[key].value.replace(/\n/g, "; ");
      }),
      companies.map((c) => c.fields[key].confidence).join(" / "),
      companies.map((c) => c.fields[key].sourceUrl).join(" | "),
    ];
    rows.push(row);
  }

  const csvContent = rows
    .map((r) =>
      r
        .map((cell) => `"${cell.replace(/"/g, '""')}"`)
        .join(",")
    )
    .join("\r\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `competitorx-comparison-${Date.now()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
