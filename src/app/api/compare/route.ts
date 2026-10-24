import { NextRequest, NextResponse } from "next/server";
import {
  CompareRequestSchema,
  ComparisonResult,
  CompanyAnalysis,
  PageAnalysis,
  SiteProgress,
} from "@/lib/schema";
import {
  normalizeAndValidateUrl,
  getCachedComparison,
  setCachedComparison,
  buildCacheKey,
  checkRateLimit,
} from "@/lib/validate";
import { discoverPages, fetchPage, FetchedPageContent } from "@/lib/tinyfish";
import { extractCompanyData } from "@/lib/extract";
import { getMockComparison, generateInsightsFromCompanies } from "@/lib/mock";

export const maxDuration = 60; // 60s max execution time

export async function POST(req: NextRequest) {
  // 1. Rate Limiting Check
  const clientIp =
    req.headers.get("x-forwarded-for")?.split(",")[0] ||
    req.headers.get("x-real-ip") ||
    "client-default";
  const rateLimit = checkRateLimit(clientIp);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many comparison requests. Please try again in 5 minutes." },
      { status: 429 }
    );
  }

  // 2. Validate Request Body with Zod
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON in request body" }, { status: 400 });
  }

  const parsedRequest = CompareRequestSchema.safeParse(body);
  if (!parsedRequest.success) {
    return NextResponse.json(
      {
        error: "Validation error",
        details: parsedRequest.error.issues.map((i) => i.message),
      },
      { status: 400 }
    );
  }

  const { urls } = parsedRequest.data;

  // 3. Normalize & SSRF Check for each URL
  const validationResults = urls.map((u) => normalizeAndValidateUrl(u));
  const invalidResult = validationResults.find((r) => !r.valid);
  if (invalidResult) {
    return NextResponse.json(
      { error: invalidResult.error || "Invalid URL supplied" },
      { status: 400 }
    );
  }

  const validUrls = validationResults.map((r) => r.url as string);
  const cacheKey = buildCacheKey(validUrls);

  // 4. Check 10-Minute In-Memory Cache
  const cached = getCachedComparison(cacheKey);
  if (cached) {
    return NextResponse.json({ ...cached, isCached: true });
  }

  // 5. Check if Mock Mode is explicitly forced or keys are missing
  const forceMock =
    process.env.USE_MOCK_DATA === "true" ||
    (!process.env.TINYFISH_API_KEY && !process.env.LLM_API_KEY);

  // Prepare SSE Streaming Response
  const encoder = new TextEncoder();
  const stream = new TransformStream();
  const writer = stream.writable.getWriter();

  const sendEvent = async (event: string, data: unknown) => {
    try {
      await writer.write(
        encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
      );
    } catch {
      // Stream writer closed by client
    }
  };

  // Run async processing in background of stream
  (async () => {
    try {
      if (forceMock) {
        // Stream simulated progress for mock demo
        for (const url of validUrls) {
          const domain = new URL(url).hostname.replace(/^www\./, "");
          await sendEvent("progress", {
            url,
            domain,
            step: "discovering",
            message: `Discovering pages on ${domain}...`,
          } as SiteProgress);
        }

        await new Promise((r) => setTimeout(r, 600));

        for (const url of validUrls) {
          const domain = new URL(url).hostname.replace(/^www\./, "");
          await sendEvent("progress", {
            url,
            domain,
            step: "fetching",
            message: `Reading pricing and feature pages for ${domain}...`,
          } as SiteProgress);
        }

        await new Promise((r) => setTimeout(r, 600));

        for (const url of validUrls) {
          const domain = new URL(url).hostname.replace(/^www\./, "");
          await sendEvent("progress", {
            url,
            domain,
            step: "extracting",
            message: `Verifying explicit claims for ${domain}...`,
          } as SiteProgress);
        }

        await new Promise((r) => setTimeout(r, 500));

        const mockResult = getMockComparison(validUrls);
        setCachedComparison(cacheKey, mockResult);

        await sendEvent("result", mockResult);
        await writer.close();
        return;
      }

      // Live Pipeline: Run all sites in parallel using Promise.allSettled
      // One site failing must NEVER break the others.
      const companyPromises = validUrls.map((url) =>
        analyzeSiteWithProgress(url, async (progress) => {
          await sendEvent("progress", progress);
        })
      );

      const settled = await Promise.allSettled(companyPromises);

      const companies: CompanyAnalysis[] = settled.map((res, index) => {
        const targetUrl = validUrls[index];
        const domain = new URL(targetUrl).hostname.replace(/^www\./, "");

        if (res.status === "fulfilled") {
          return res.value;
        }

        // Graceful per-site failure representation
        return createFailedCompanyAnalysis(
          targetUrl,
          domain,
          res.reason instanceof Error
            ? res.reason.message
            : "Analysis failed or timed out"
        );
      });

      // If all sites failed, fall back to mock data with a demo banner
      const allFailed = companies.every((c) => c.status === "failed");
      let finalResult: ComparisonResult;

      if (allFailed) {
        finalResult = getMockComparison(validUrls);
        finalResult.isDemoData = true;
      } else {
        const successfulCompanies = companies.filter((c) => c.status !== "failed");
        const quickInsights = generateInsightsFromCompanies(successfulCompanies);

        finalResult = {
          companies,
          quickInsights,
          analyzedAt: new Date().toISOString(),
          isDemoData: false,
        };
      }

      // Cache successful or fallback result
      setCachedComparison(cacheKey, finalResult);

      await sendEvent("result", finalResult);
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : "Pipeline encountered an unexpected error";
      await sendEvent("error", { message: errorMsg });
    } finally {
      await writer.close();
    }
  })();

  return new Response(stream.readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}

/**
 * Analyzes a single website with a 45s hard timeout
 */
async function analyzeSiteWithProgress(
  rootUrl: string,
  onProgress: (progress: SiteProgress) => Promise<void>
): Promise<CompanyAnalysis> {
  const domain = new URL(rootUrl).hostname.replace(/^www\./, "");

  // 45s overall timeout per site
  const siteController = new AbortController();
  const siteTimeout = setTimeout(() => siteController.abort(), 45000);

  try {
    // Step 1: Discover candidate pages
    await onProgress({
      url: rootUrl,
      domain,
      step: "discovering",
      message: `Scanning ${domain} for pricing, product, and about pages...`,
    });

    const candidatePages = await discoverPages(rootUrl);

    // Step 2: Fetch rendered content for each page (in parallel, capped at 4 pages)
    await onProgress({
      url: rootUrl,
      domain,
      step: "fetching",
      message: `Fetching ${candidatePages.length} public pages via TinyFish...`,
    });

    const pageFetchResults = await Promise.allSettled(
      candidatePages.map((p) => fetchPage(p.url))
    );

    const fetchedPages: FetchedPageContent[] = [];
    const pagesAnalyzed: PageAnalysis[] = [];

    pageFetchResults.forEach((res, i) => {
      const candidate = candidatePages[i];
      if (res.status === "fulfilled") {
        fetchedPages.push(res.value);
        pagesAnalyzed.push({
          title: res.value.title || candidate.title || "Page",
          url: res.value.url,
          type: candidate.type,
        });
      }
    });

    if (fetchedPages.length === 0) {
      throw new Error(`Could not fetch any readable pages from ${domain}`);
    }

    // Step 3: Extract comparable fields
    await onProgress({
      url: rootUrl,
      domain,
      step: "extracting",
      message: `Extracting verified facts and confidence scores...`,
    });

    const extracted = await extractCompanyData({
      companyDomain: domain,
      pages: fetchedPages,
    });

    clearTimeout(siteTimeout);

    await onProgress({
      url: rootUrl,
      domain,
      step: "completed",
      message: `Analysis completed successfully`,
    });

    return {
      companyName: extracted.companyName || domain.split(".")[0].toUpperCase(),
      domain,
      faviconUrl: `https://www.google.com/s2/favicons?domain=${domain}&sz=64`,
      url: rootUrl,
      status: "success",
      isMock: false,
      fields: {
        positioning: extracted.positioning,
        targetAudience: extracted.targetAudience,
        coreFeatures: extracted.coreFeatures,
        services: extracted.services,
        pricing: extracted.pricing,
        differentiator: extracted.differentiator,
      },
      pagesAnalyzed,
    };
  } catch (err: unknown) {
    clearTimeout(siteTimeout);
    const msg =
      err instanceof Error && err.name === "AbortError"
        ? `Analysis exceeded 45s hard timeout for ${domain}`
        : err instanceof Error
        ? err.message
        : "Failed to analyze site";

    await onProgress({
      url: rootUrl,
      domain,
      step: "failed",
      message: msg,
      error: msg,
    });

    return createFailedCompanyAnalysis(rootUrl, domain, msg);
  }
}

/**
 * Creates a graceful failed company record that preserves the table layout
 */
function createFailedCompanyAnalysis(
  url: string,
  domain: string,
  reason: string
): CompanyAnalysis {
  const notListed = {
    value: "Not listed on site",
    sourceUrl: url,
    snippet: "",
    confidence: "not_listed" as const,
  };

  return {
    companyName: domain.split(".")[0].toUpperCase(),
    domain,
    faviconUrl: `https://www.google.com/s2/favicons?domain=${domain}&sz=64`,
    url,
    status: "failed",
    errorMessage: reason,
    isMock: false,
    fields: {
      positioning: notListed,
      targetAudience: notListed,
      coreFeatures: notListed,
      services: notListed,
      pricing: notListed,
      differentiator: notListed,
    },
    pagesAnalyzed: [],
  };
}
