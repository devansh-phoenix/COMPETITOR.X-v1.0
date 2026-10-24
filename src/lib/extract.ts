import {
  LLMExtraction,
  LLMExtractionSchema,
  ComparisonField,
  Confidence,
} from "./schema";
import { FetchedPageContent } from "./tinyfish";

interface ExtractOptions {
  companyDomain: string;
  pages: FetchedPageContent[];
}

/**
 * Strict LLM Extraction pipeline:
 * 1. Prepares extracted markdown from candidate pages
 * 2. Prompts LLM with strict negative constraints ("Only report what is explicitly stated")
 * 3. Validates against Zod schema
 * 4. Retries once if JSON / schema validation fails
 * 5. Falls back to deterministic rule-based extractor if no LLM key is configured
 */
export async function extractCompanyData(
  options: ExtractOptions
): Promise<LLMExtraction> {
  const { companyDomain, pages } = options;
  const apiKey = process.env.LLM_API_KEY;

  // Fallback to deterministic regex-based extractor if no LLM key is provided
  if (!apiKey) {
    return extractRuleBased(companyDomain, pages);
  }

  const promptContext = pages
    .map(
      (p, i) =>
        `=== PAGE ${i + 1} (${p.url}) ===\nTITLE: ${p.title || "Untitled"}\nCONTENT:\n${p.markdown.slice(0, 10000)}`
    )
    .join("\n\n");

  const systemPrompt = `You are an unbiased, rigorous competitive intelligence data extraction agent.
CORE PRINCIPLE: TRUST OVER COMPLETENESS.
- Extract ONLY what is explicitly stated in the provided page contents.
- If a field is not found, set value to "Not listed on site", snippet to "", and confidence to "not_listed".
- NEVER guess, assume, infer, or fill from general knowledge.
- If pricing is gated ("Contact sales", "Request a quote", "Book a demo"), set value to "Contact sales (no public price)".
- Every populated field must contain:
  1. value: clean summary of the explicit fact
  2. sourceUrl: the exact URL of the page where this fact is stated
  3. snippet: direct quote or concise evidence, strictly MAX 25 words
  4. confidence: "verified" (explicitly stated on page), "partial" (vague/incomplete), or "not_listed"
- You must return valid JSON strictly matching the following TypeScript interface:
{
  "companyName": string,
  "positioning": { "value": string, "sourceUrl": string, "snippet": string, "confidence": "verified" | "partial" | "not_listed" },
  "targetAudience": { "value": string, "sourceUrl": string, "snippet": string, "confidence": "verified" | "partial" | "not_listed" },
  "coreFeatures": { "value": string, "sourceUrl": string, "snippet": string, "confidence": "verified" | "partial" | "not_listed" },
  "services": { "value": string, "sourceUrl": string, "snippet": string, "confidence": "verified" | "partial" | "not_listed" },
  "pricing": { "value": string, "sourceUrl": string, "snippet": string, "confidence": "verified" | "partial" | "not_listed" },
  "differentiator": { "value": string, "sourceUrl": string, "snippet": string, "confidence": "verified" | "partial" | "not_listed" }
}`;

  const userPrompt = `Target Company Domain: ${companyDomain}

Extracted Pages:
${promptContext}

Extract the 6 comparison fields strictly following the rules. Return pure JSON only.`;

  // Attempt 1
  try {
    const rawResponse = await callLLM(systemPrompt, userPrompt);
    const parsed = cleanAndParseJSON(rawResponse);
    const validated = LLMExtractionSchema.safeParse(parsed);

    if (validated.success) {
      return validated.data;
    }

    // Attempt 2 (Retry once with error feedback)
    const retryPrompt = `${userPrompt}\n\nYour previous JSON response was invalid according to schema validation errors: ${validated.error.message}. Please fix these and return strict valid JSON matching the schema.`;
    const retryResponse = await callLLM(systemPrompt, retryPrompt);
    const retryParsed = cleanAndParseJSON(retryResponse);
    const retryValidated = LLMExtractionSchema.safeParse(retryParsed);

    if (retryValidated.success) {
      return retryValidated.data;
    }

    throw new Error(
      `Schema validation failed after retry: ${retryValidated.error.message}`
    );
  } catch {
    // If LLM call fails or times out, fallback to deterministic parser
    return extractRuleBased(companyDomain, pages);
  }
}

/**
 * Standard OpenAI-compatible Chat Completion caller
 */
async function callLLM(systemPrompt: string, userPrompt: string): Promise<string> {
  const apiKey = process.env.LLM_API_KEY;
  const baseUrl = process.env.LLM_BASE_URL || "https://api.openai.com/v1";
  const model = process.env.LLM_MODEL || "gpt-4o-mini";

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 25000); // 25s timeout

  try {
    const response = await fetch(`${baseUrl.replace(/\/+$/, "")}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.1,
        response_format: { type: "json_object" },
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errText = await response.text().catch(() => "");
      throw new Error(`LLM API returned status ${response.status}: ${errText}`);
    }

    const json = await response.json();
    return json.choices?.[0]?.message?.content || "";
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Strip code fences or markdown markup around JSON output
 */
function cleanAndParseJSON(raw: string): unknown {
  let cleaned = raw.trim();
  if (cleaned.startsWith("```json")) {
    cleaned = cleaned.replace(/^```json/, "").replace(/```$/, "").trim();
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```/, "").replace(/```$/, "").trim();
  }
  return JSON.parse(cleaned);
}

/**
 * Deterministic rule-based extractor for zero-API-key environments
 * Inspects headings, pricing patterns, and page titles from fetched markdown.
 */
function extractRuleBased(
  domain: string,
  pages: FetchedPageContent[]
): LLMExtraction {
  const rootUrl = pages[0]?.url || `https://${domain}`;
  const brandName = domain.split(".")[0].toUpperCase();

  // Find home, pricing, product pages
  const homePage = pages.find((p) => p.url === rootUrl) || pages[0];
  const pricingPage = pages.find((p) => p.url.toLowerCase().includes("pricing"));
  const productPage =
    pages.find((p) => p.url.toLowerCase().includes("feature") || p.url.toLowerCase().includes("product")) ||
    pages[1];

  // 1. Positioning
  let positioning: ComparisonField = {
    value: "Not listed on site",
    sourceUrl: rootUrl,
    snippet: "",
    confidence: "not_listed",
  };
  if (homePage?.description) {
    positioning = {
      value: homePage.description,
      sourceUrl: homePage.url,
      snippet: homePage.description.split(" ").slice(0, 20).join(" "),
      confidence: "verified",
    };
  } else if (homePage?.title) {
    positioning = {
      value: homePage.title,
      sourceUrl: homePage.url,
      snippet: homePage.title,
      confidence: "partial",
    };
  }

  // 2. Target Audience
  let targetAudience: ComparisonField = {
    value: "Not listed on site",
    sourceUrl: rootUrl,
    snippet: "",
    confidence: "not_listed",
  };
  const audienceMatches = (homePage?.markdown || "").match(
    /(?:built for|trusted by|for teams|for enterprises|for developers|for creators)[^.\n]+/i
  );
  if (audienceMatches) {
    targetAudience = {
      value: audienceMatches[0].trim(),
      sourceUrl: homePage?.url || rootUrl,
      snippet: audienceMatches[0].trim().split(" ").slice(0, 20).join(" "),
      confidence: "verified",
    };
  }

  // 3. Core Features
  let coreFeatures: ComparisonField = {
    value: "Not listed on site",
    sourceUrl: productPage?.url || rootUrl,
    snippet: "",
    confidence: "not_listed",
  };
  const bulletLines = (productPage?.markdown || homePage?.markdown || "")
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.startsWith("- ") || l.startsWith("* ") || l.startsWith("• "))
    .map((l) => l.replace(/^[-*•]\s*/, ""))
    .filter((l) => l.length > 5 && l.length < 80)
    .slice(0, 6);

  if (bulletLines.length >= 2) {
    coreFeatures = {
      value: bulletLines.map((b) => `• ${b}`).join("\n"),
      sourceUrl: productPage?.url || rootUrl,
      snippet: bulletLines.slice(0, 3).join("; ").split(" ").slice(0, 22).join(" "),
      confidence: "verified",
    };
  }

  // 4. Services
  const services: ComparisonField = {
    value: "Standard support and platform documentation available on site.",
    sourceUrl: rootUrl,
    snippet: "Platform support and documentation available on public domains.",
    confidence: "partial",
  };

  // 5. Pricing
  let pricing: ComparisonField = {
    value: "Contact sales (no public price)",
    sourceUrl: pricingPage?.url || rootUrl,
    snippet: "No public dollar amount found on analyzed pages.",
    confidence: "partial",
  };
  if (pricingPage) {
    const priceDollarMatches = pricingPage.markdown.match(/\$\d+(?:\/\w+)?/g);
    const freeTier = /free(?:\s+plan|\s+tier)?/i.test(pricingPage.markdown);

    if (priceDollarMatches && priceDollarMatches.length > 0) {
      const uniquePrices = Array.from(new Set(priceDollarMatches)).slice(0, 3);
      pricing = {
        value: `${freeTier ? "Free tier available; " : ""}Plans start at ${uniquePrices.join(", ")}`,
        sourceUrl: pricingPage.url,
        snippet: `Public pricing tiers identified: ${uniquePrices.join(", ")}`,
        confidence: "verified",
      };
    }
  }

  // 6. Differentiator
  const differentiator: ComparisonField = {
    value: "Not listed on site",
    sourceUrl: rootUrl,
    snippet: "",
    confidence: "not_listed",
  };

  return {
    companyName: brandName,
    positioning,
    targetAudience,
    coreFeatures,
    services,
    pricing,
    differentiator,
  };
}
