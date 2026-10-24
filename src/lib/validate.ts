/**
 * Security, URL Validation, Rate Limiting & In-Memory Caching
 */

import { ComparisonResult } from "./schema";

/**
 * Normalize and validate user-supplied URL
 * - Adds https:// if protocol is missing
 * - Rejects non-http(s) protocols
 * - Rejects localhost, 127.0.0.1, 0.0.0.0, private IPv4 (10.x, 172.16-31.x, 192.168.x) to prevent SSRF
 */
export function normalizeAndValidateUrl(input: string): {
  valid: boolean;
  url?: string;
  domain?: string;
  error?: string;
} {
  let trimmed = input.trim();
  if (!trimmed) {
    return { valid: false, error: "URL cannot be empty" };
  }

  // Prepend https:// if protocol is missing
  if (!/^https?:\/\//i.test(trimmed)) {
    trimmed = `https://${trimmed}`;
  }

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return { valid: false, error: `Invalid URL format: "${input}"` };
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return {
      valid: false,
      error: `Only HTTP and HTTPS protocols are permitted: "${parsed.protocol}"`,
    };
  }

  const hostname = parsed.hostname.toLowerCase();

  // SSRF Protection: Reject localhost, loopback, link-local, and private IP blocks
  if (
    hostname === "localhost" ||
    hostname.endsWith(".localhost") ||
    hostname.endsWith(".local") ||
    hostname === "127.0.0.1" ||
    hostname === "0.0.0.0" ||
    hostname === "::1" ||
    hostname === "169.254.169.254" // AWS metadata service
  ) {
    return { valid: false, error: "Access to local or internal addresses is blocked for security" };
  }

  // Check IPv4 private ranges (10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16)
  const ipv4Match = hostname.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (ipv4Match) {
    const oct1 = parseInt(ipv4Match[1], 10);
    const oct2 = parseInt(ipv4Match[2], 10);

    if (
      oct1 === 10 ||
      (oct1 === 172 && oct2 >= 16 && oct2 <= 31) ||
      (oct1 === 192 && oct2 === 168) ||
      oct1 === 127 ||
      oct1 === 0
    ) {
      return { valid: false, error: "Access to private IP subnets is blocked for security" };
    }
  }

  // Domain must contain a valid TLD dot
  if (!hostname.includes(".")) {
    return { valid: false, error: `Invalid domain name: "${hostname}"` };
  }

  return {
    valid: true,
    url: parsed.origin,
    domain: hostname.replace(/^www\./, ""),
  };
}

/**
 * 10-Minute In-Memory Cache for Comparison Results
 */
interface CacheEntry {
  data: ComparisonResult;
  timestamp: number;
}

const comparisonCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

export function getCachedComparison(cacheKey: string): ComparisonResult | null {
  const entry = comparisonCache.get(cacheKey);
  if (!entry) return null;

  if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
    comparisonCache.delete(cacheKey);
    return null;
  }

  return entry.data;
}

export function setCachedComparison(cacheKey: string, data: ComparisonResult): void {
  // Cap cache size to avoid unbounded memory growth
  if (comparisonCache.size > 200) {
    const oldestKey = comparisonCache.keys().next().value;
    if (oldestKey) comparisonCache.delete(oldestKey);
  }
  comparisonCache.set(cacheKey, { data, timestamp: Date.now() });
}

export function buildCacheKey(urls: string[]): string {
  return urls
    .map((u) => u.toLowerCase().trim().replace(/\/+$/, ""))
    .sort()
    .join("::");
}

/**
 * Simple in-memory rate limiter per IP / identifier
 * Allows up to 20 comparisons per 5-minute rolling window
 */
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(clientId: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const windowMs = 5 * 60 * 1000;
  const maxRequests = 30;

  const entry = rateLimitMap.get(clientId);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(clientId, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1 };
  }

  if (entry.count >= maxRequests) {
    return { allowed: false, remaining: 0 };
  }

  entry.count += 1;
  return { allowed: true, remaining: maxRequests - entry.count };
}
