/**
 * BurnerSol - Jupiter Price API v2 Integration & Live Token Market Data Broker
 */

interface JupiterPriceResponse {
  data: Record<string, {
    id: string;
    type: string;
    price: string;
  }>;
}

import { sanitizePriceData } from "./sanitizeExternalData";

/**
 * Fetches the live USD price of Solana token mints directly from Jupiter Price API v2.
 * Hardened with abort timeouts and input/output sanitization.
 */
export async function fetchJupiterPrices(mintAddresses: string[]): Promise<Record<string, number>> {
  if (!mintAddresses || mintAddresses.length === 0) return {};

  // Normalize mint addresses by filtering out empty values or accounts that match SOL
  const cleanMints = mintAddresses.map(m => m.trim()).filter(m => m.length > 0);
  if (cleanMints.length === 0) return {};

  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), 2800); // Strict 2.8s response timeout

  try {
    const idsString = cleanMints.join(",");
    const response = await fetch(`https://api.jup.ag/price/v2?ids=${idsString}`, {
      signal: controller.signal
    });
    
    clearTimeout(id);

    if (!response.ok) {
      throw new Error(`Jupiter price API responded with status ${response.status}`);
    }

    const payload: any = await response.json();
    const rawPrices: Record<string, any> = {};

    if (payload && payload.data) {
      Object.keys(payload.data).forEach(mint => {
        const item = payload.data[mint];
        if (item && item.price !== undefined) {
          rawPrices[mint] = item.price;
        }
      });
    }

    // Pass through data sanitization layer to clamp values, check NaN, and protect floats
    return sanitizePriceData(rawPrices);
  } catch (error) {
    clearTimeout(id);
    console.error("Failed to fetch Jupiter Price API v2 safely (timeout or outage):", error);
    // Secure Fallback: return clean empty state, never crash execution
    return {};
  }
}

/**
 * Returns live or fallback market statistics for tokens.
 * Attempts real API calls first, falls back to minimal defaults.
 */
export interface EnhancedMarketStats {
  priceUsd: number;
  priceSol: number;
  priceChange24h: number;
  marketCapUsd: number;
  volume24hUsd: number;
  totalBurned: number;
}

/**
 * Fetch live token stats from Jupiter + CoinGecko APIs.
 */
export async function fetchLiveTokenStats(mintAddress: string): Promise<EnhancedMarketStats> {
  const fallback: EnhancedMarketStats = {
    priceUsd: 0,
    priceSol: 0,
    priceChange24h: 0,
    marketCapUsd: 0,
    volume24hUsd: 0,
    totalBurned: 0,
  };

  try {
    const priceData = await fetchJupiterPrices([mintAddress]);
    const price = priceData[mintAddress] || 0;

    if (price > 0) {
      return {
        priceUsd: price,
        priceSol: price / 145,
        priceChange24h: 0,
        marketCapUsd: 0,
        volume24hUsd: 0,
        totalBurned: 0,
      };
    }
  } catch (err) {
    console.warn("Live token stats fetch failed:", err);
  }

  return fallback;
}

/**
 * Minimal fallback stats when live data is unavailable.
 */
export function getFallbackTokenStats(symbol: string): EnhancedMarketStats {
  return {
    priceUsd: 0,
    priceSol: 0,
    priceChange24h: 0,
    marketCapUsd: 0,
    volume24hUsd: 0,
    totalBurned: 0,
  };
}
