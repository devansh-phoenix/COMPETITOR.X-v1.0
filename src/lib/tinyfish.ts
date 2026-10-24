/**
 * ==============================================================================
 * TinyFish API Client Integration
 * ==============================================================================
 * This is the ONLY file in the codebase that communicates directly with TinyFish.
 *
 * ENDPOINT CONFIGURATION:
 * - TinyFish Agent Base URL: https://agent.tinyfish.ai
 * - TinyFish Fetch Base URL: https://api.fetch.tinyfish.ai/
 * - To override, set process.env.TINYFISH_BASE_URL
 *
 * AUTHENTICATION:
 * - Header: 'X-API-Key': process.env.TINYFISH_API_KEY
 * - (Optional standard: 'Authorization': `Bearer ${process.env.TINYFISH_API_KEY}`)
 * ==============================================================================
 */

export interface FetchedPageContent {
  url: string;
  finalUrl?: string;
  title?: string;
  description?: string;
  markdown: string;
  links: string[];
}

export interface CandidatePage {
  url: string;
  type: "home" | "product" | "pricing" | "about" | "other";
  title?: string;
}

// ==============================================================================
// EDITABLE ENDPOINT CONSTANTS (Adjust here if TinyFish endpoints change)
// ==============================================================================
// Line 36: Default endpoint for Content Extraction (Fetch API)
const DEFAULT_FETCH_ENDPOINT = "https://api.fetch.tinyfish.ai/";

// Line 39: Default base URL for Agent Automations
const DEFAULT_AGENT_BASE_URL = "https://agent.tinyfish.ai";

// Per-page timeout (20 seconds per specification)
const PAGE_FETCH_TIMEOUT_MS = 20000;

/**
 * Get API Key safely from server environment
 */
function getTinyFishApiKey(): string | undefined {
  return process.env.TINYFISH_API_KEY;
}

/**
 * Get the target fetch endpoint
 */
function getFetchEndpoint(): string {
  if (process.env.TINYFISH_BASE_URL) {
    const base = process.env.TINYFISH_BASE_URL.replace(/\/+$/, "");
    return `${base}/v1/fetch`;
  }
  return DEFAULT_FETCH_ENDPOINT;
}

/**
 * Fetch a single page's rendered content using TinyFish
 * Uses TinyFish Fetch API (browser-capable rendering for JS/SPA websites)
 *
 * @param url The page URL to fetch
 * @returns Clean text/markdown content and extracted page links
 */
export async function fetchPage(url: string): Promise<FetchedPageContent> {
  const apiKey = getTinyFishApiKey();
  const endpoint = getFetchEndpoint();

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), PAGE_FETCH_TIMEOUT_MS);

  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };

    if (apiKey) {
      headers["X-API-Key"] = apiKey;
      headers["Authorization"] = `Bearer ${apiKey}`;
    }

    const requestBody = {
      urls: [url],
      format: "markdown",
      links: true,
      purpose: "extract company features, audience, pricing, and positioning",
    };

    const response = await fetch(endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify(requestBody),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      throw new Error(
        `TinyFish fetch failed for ${url} (HTTP ${response.status}): ${errorText.slice(0, 150)}`
      );
    }

    const data = await response.json();
    const result = data?.results?.[0];

    if (!result) {
      const errorMsg = data?.errors?.[0]?.error || "Empty response from TinyFish";
      throw new Error(`TinyFish error for ${url}: ${errorMsg}`);
    }

    // Clean text: strip extreme whitespace, nav clutter, cap per page
    const rawMarkdown: string =
      typeof result.text === "string"
        ? result.text
        : JSON.stringify(result.text || "");
    const cleanedMarkdown = cleanExtractedText(rawMarkdown);

    return {
      url: result.url || url,
      finalUrl: result.final_url || url,
      title: result.title || undefined,
      description: result.description || undefined,
      markdown: cleanedMarkdown,
      links: Array.isArray(result.links) ? result.links : [],
    };
  } catch (err: unknown) {
    clearTimeout(timeoutId);
    if (err instanceof Error && err.name === "AbortError") {
      throw new Error(`Fetch timed out after 20s for ${url}`);
    }
    throw err;
  }
}

/**
 * Discover candidate pages on the same domain:
 * - Homepage
 * - Product/Features
 * - Pricing
 * - About/Solutions
 * Strictly capped at 4 pages per site.
 *
 * @param rootUrl The initial website URL entered by the user
 */
export async function discoverPages(rootUrl: string): Promise<CandidatePage[]> {
  const parsedRoot = new URL(rootUrl);
  const rootHostname = parsedRoot.hostname.toLowerCase();

  const candidatePages: CandidatePage[] = [
    {
      url: rootUrl,
      type: "home",
      title: "Homepage",
    },
  ];

  try {
    // 1. Fetch homepage to get extracted links via TinyFish
    const homeResult = await fetchPage(rootUrl);

    if (homeResult.links && homeResult.links.length > 0) {
      const internalLinks: string[] = [];

      for (const rawLink of homeResult.links) {
        try {
          const resolved = new URL(rawLink, rootUrl);
          // Same hostname or primary domain
          if (
            resolved.protocol.startsWith("http") &&
            (resolved.hostname.toLowerCase() === rootHostname ||
              resolved.hostname.toLowerCase().endsWith("." + rootHostname))
          ) {
            // Strip hashes and tracking params
            resolved.hash = "";
            resolved.search = "";
            const cleanUrl = resolved.toString().replace(/\/+$/, "");
            if (
              cleanUrl !== rootUrl.replace(/\/+$/, "") &&
              !internalLinks.includes(cleanUrl)
            ) {
              internalLinks.push(cleanUrl);
            }
          }
        } catch {
          // Ignore invalid link URLs
        }
      }

      // Keyword categorizers
      const pricingPatterns = [
        /\/pricing/i,
        /\/plans/i,
        /\/tier/i,
        /\/pricing-plans/i,
      ];
      const productPatterns = [
        /\/product/i,
        /\/features/i,
        /\/platform/i,
        /\/solutions/i,
        /\/tour/i,
      ];
      const aboutPatterns = [
        /\/about/i,
        /\/company/i,
        /\/why/i,
        /\/overview/i,
      ];

      // Find best match for Pricing
      const pricingMatch = internalLinks.find((link) =>
        pricingPatterns.some((pattern) => pattern.test(link))
      );
      if (pricingMatch) {
        candidatePages.push({
          url: pricingMatch,
          type: "pricing",
          title: "Pricing",
        });
      }

      // Find best match for Product/Features
      const productMatch = internalLinks.find(
        (link) =>
          link !== pricingMatch &&
          productPatterns.some((pattern) => pattern.test(link))
      );
      if (productMatch) {
        candidatePages.push({
          url: productMatch,
          type: "product",
          title: "Features & Product",
        });
      }

      // Find best match for About/Solutions
      const aboutMatch = internalLinks.find(
        (link) =>
          link !== pricingMatch &&
          link !== productMatch &&
          aboutPatterns.some((pattern) => pattern.test(link))
      );
      if (aboutMatch) {
        candidatePages.push({
          url: aboutMatch,
          type: "about",
          title: "About / Company",
        });
      }
    }
  } catch {
    // If homepage fetch failed during discovery, we can provide standard heuristic routes
    // on the same origin (e.g., /pricing, /product, /about)
  }

  // Fallback heuristics if specific pages weren't found from links
  const origin = parsedRoot.origin;
  const hasPricing = candidatePages.some((p) => p.type === "pricing");
  const hasProduct = candidatePages.some((p) => p.type === "product");
  const hasAbout = candidatePages.some((p) => p.type === "about");

  if (!hasPricing && candidatePages.length < 4) {
    candidatePages.push({
      url: `${origin}/pricing`,
      type: "pricing",
      title: "Pricing",
    });
  }
  if (!hasProduct && candidatePages.length < 4) {
    candidatePages.push({
      url: `${origin}/features`,
      type: "product",
      title: "Features",
    });
  }
  if (!hasAbout && candidatePages.length < 4) {
    candidatePages.push({
      url: `${origin}/about`,
      type: "about",
      title: "About",
    });
  }

  // Strict cap: max 4 pages per site
  return candidatePages.slice(0, 4);
}

/**
 * Text cleaner: strips nav/footer repetitive tokens, cookie notices,
 * and caps page length to prevent prompt blowout.
 */
function cleanExtractedText(text: string): string {
  if (!text) return "";

  let cleaned = text
    // Remove cookie banner notices
    .replace(/cookie policy|privacy settings|accept all cookies|terms of service/gi, "")
    // Normalize repetitive newlines
    .replace(/\n{3,}/g, "\n\n")
    // Remove data URIs
    .replace(/data:image\/[a-zA-Z]+;base64,[^\s)]+/g, "")
    .trim();

  // Cap length per page (approx 15,000 characters per page is plenty for LLM extraction)
  if (cleaned.length > 15000) {
    cleaned = cleaned.slice(0, 15000) + "\n\n...[content truncated for extraction]...";
  }

  return cleaned;
}
