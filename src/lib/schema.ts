import { z } from "zod";

export type Confidence = "verified" | "partial" | "not_listed";

export const ConfidenceSchema = z.enum(["verified", "partial", "not_listed"]);

export const ComparisonFieldSchema = z.object({
  value: z.string().describe("The extracted value or 'Not listed on site'"),
  sourceUrl: z.string().describe("Exact source page URL where this was found"),
  snippet: z
    .string()
    .describe(
      "Direct quote or paraphrased evidence snippet, strictly max 25 words"
    ),
  confidence: ConfidenceSchema.describe(
    "'verified' (explicit on page), 'partial' (vague/incomplete), or 'not_listed' (not mentioned)"
  ),
});

export type ComparisonField = z.infer<typeof ComparisonFieldSchema>;

export const PageAnalysisSchema = z.object({
  title: z.string(),
  url: z.string(),
  type: z.enum(["home", "product", "pricing", "about", "other"]),
});

export type PageAnalysis = z.infer<typeof PageAnalysisSchema>;

export const LLMExtractionSchema = z.object({
  companyName: z.string().describe("The company or product name"),
  positioning: ComparisonFieldSchema,
  targetAudience: ComparisonFieldSchema,
  coreFeatures: ComparisonFieldSchema,
  services: ComparisonFieldSchema,
  pricing: ComparisonFieldSchema,
  differentiator: ComparisonFieldSchema,
});

export type LLMExtraction = z.infer<typeof LLMExtractionSchema>;

export const CompanyAnalysisSchema = z.object({
  companyName: z.string(),
  domain: z.string(),
  faviconUrl: z.string().optional(),
  url: z.string(),
  status: z.enum(["success", "failed", "partial"]),
  errorMessage: z.string().optional(),
  isMock: z.boolean().default(false),
  fields: z.object({
    positioning: ComparisonFieldSchema,
    targetAudience: ComparisonFieldSchema,
    coreFeatures: ComparisonFieldSchema,
    services: ComparisonFieldSchema,
    pricing: ComparisonFieldSchema,
    differentiator: ComparisonFieldSchema,
  }),
  pagesAnalyzed: z.array(PageAnalysisSchema),
});

export type CompanyAnalysis = z.infer<typeof CompanyAnalysisSchema>;

export const ComparisonResultSchema = z.object({
  companies: z.array(CompanyAnalysisSchema),
  quickInsights: z.array(z.string()),
  analyzedAt: z.string(),
  isDemoData: z.boolean(),
});

export type ComparisonResult = z.infer<typeof ComparisonResultSchema>;

export const CompareRequestSchema = z.object({
  urls: z
    .array(z.string().min(1, "URL cannot be empty"))
    .min(2, "At least 2 URLs are required")
    .max(3, "At most 3 URLs are allowed"),
});

export type CompareRequest = z.infer<typeof CompareRequestSchema>;

/**
 * Standard progress event payload for live comparison pipeline
 */
export type ProgressStep =
  | "validating"
  | "discovering"
  | "fetching"
  | "extracting"
  | "completed"
  | "failed";

export interface SiteProgress {
  url: string;
  domain: string;
  step: ProgressStep;
  message: string;
  error?: string;
}
