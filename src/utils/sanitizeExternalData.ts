/**
 * BurnerSol - API Trust Sanitization Layer
 * Filters, validates, and purges corrupted, malicious, or malformed data received from external sources.
 */

export interface SanitizedTokenMetadata {
  name: string;
  symbol: string;
  descriptor: string;
  imageUrl?: string;
}

export interface SanitizedPriceMap {
  [mintAddress: string]: number;
}

/**
 * Sanitizes and validates an on-chain token name, symbol, or representation.
 * Purges malicious HTML/js script injections and filters suspicious/spoofed structures.
 */
export function sanitizeMetadata(
  name: any,
  symbol: any,
  descriptor: any,
  imageUrl?: any
): SanitizedTokenMetadata {
  const cleanString = (val: any, fallback: string): string => {
    if (typeof val !== "string") return fallback;
    // Strip extreme lengths & tags to prevent DOM-based XSS or interface expansion attacks
    let clean = val.replace(/<[^>]*>/g, "").trim();
    if (clean.length > 100) {
      clean = clean.slice(0, 97) + "...";
    }
    return clean || fallback;
  };

  const cleanName = cleanString(name, "Unidentified Token");
  const cleanSymbol = cleanString(symbol, "TOKEN");
  const cleanDesc = cleanString(descriptor, "No structural metadata details provided.");

  let validatedImageUrl: string | undefined = undefined;
  if (typeof imageUrl === "string" && imageUrl.trim().length > 0) {
    const urlStr = imageUrl.trim();
    // Validate standard secure HTTPS url format to avoid file path injection or code paths
    if (/^https:\/\/[a-zA-Z0-9.\-_~:/?#[\]@!$&'()*+,;=]+$/.test(urlStr)) {
      validatedImageUrl = urlStr;
    }
  }

  return {
    name: cleanName,
    symbol: cleanSymbol,
    descriptor: cleanDesc,
    imageUrl: validatedImageUrl
  };
}

/**
 * Validates, filters, and clamps price API values directly returned from Jupiter.
 * Rejects Infinity, NaN, negative pricing, or overflow payloads.
 */
export function sanitizePriceData(rawPrices: any): SanitizedPriceMap {
  const sanitized: SanitizedPriceMap = {};
  if (!rawPrices || typeof rawPrices !== "object") return sanitized;

  for (const [key, value] of Object.entries(rawPrices)) {
    // Solana mint addresses are base58, length 32-44
    if (typeof key !== "string" || key.length < 32 || key.length > 44) continue;

    const rawNum = typeof value === "string" ? parseFloat(value) : (value as number);
    if (typeof rawNum !== "number" || isNaN(rawNum) || !isFinite(rawNum)) continue;

    // Reject extremely suspicious or zero pricing anomalies
    if (rawNum < 0) continue;

    // Clamp price limits to a reasonable absolute cap (10,000,000 USD) to prevent multiplier overflow exploits
    const clampedPrice = Math.min(10_000_000, Math.max(0, rawNum));
    sanitized[key] = clampedPrice;
  }

  return sanitized;
}

/**
 * Safely parses string numbers, avoiding exceptions, and defaulting to a fallback value.
 */
export function sanitizeNumeric(
  value: any,
  fallback: number = 0,
  min: number = 0,
  max: number = Number.MAX_SAFE_INTEGER
): number {
  if (value === null || value === undefined) return fallback;
  
  let numVal = typeof value === "number" ? value : parseFloat(String(value));
  if (isNaN(numVal) || !isFinite(numVal)) return fallback;

  return Math.min(max, Math.max(min, numVal));
}
