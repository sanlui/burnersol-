/**
 * BurnerSol - Token Image Resilience & Cache Protection Protocol
 * Supports standard well-known assets, dynamic queries with short-circuit timeouts,
 * and LRU Cache protection against cache-poisoning or memory-overflow.
 */

class SecureLRUCache {
  private cache = new Map<string, string>();
  private readonly maxLimit = 150; // Hard cap storage size

  get(key: string): string | null {
    const cleanKey = this.sanitizeKey(key);
    if (!cleanKey) return null;
    const val = this.cache.get(cleanKey);
    if (val) {
      // LRU refresh access order
      this.cache.delete(cleanKey);
      this.cache.set(cleanKey, val);
      return val;
    }
    return null;
  }

  set(key: string, url: string): void {
    const cleanKey = this.sanitizeKey(key);
    const cleanUrl = this.sanitizeUrl(url);
    if (!cleanKey || !cleanUrl) return;

    if (this.cache.has(cleanKey)) {
      this.cache.delete(cleanKey);
    } else if (this.cache.size >= this.maxLimit) {
      // LRU Eviction: remove the oldest item (first item in insertion order)
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey !== undefined) {
        this.cache.delete(oldestKey);
        try {
          localStorage.removeItem(`burner_img_cache_${oldestKey}`);
        } catch (e) {}
      }
    }
    this.cache.set(cleanKey, cleanUrl);
  }

  private sanitizeKey(key: string): string | null {
    if (typeof key !== "string") return null;
    const clean = key.trim();
    // Verify base58 Solana address structure to prevent path transversal or injections
    if (/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(clean)) {
      return clean;
    }
    return null;
  }

  private sanitizeUrl(url: string): string | null {
    if (typeof url !== "string") return null;
    const clean = url.trim();
    // Strict white-listed pattern for secure images on web
    if (/^https:\/\/[a-zA-Z0-9.\-_~:/?#[\]@!$&'()*+,;=]+$/.test(clean)) {
      return clean;
    }
    return null;
  }
}

// Bounded secure runtime memory cache
const secureImageCache = new SecureLRUCache();

// Hardcoded verified high-quality logos for standard ecosystem assets
const WELL_KNOWN_LOGOS: Record<string, string> = {
  "SOL": "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png",
  "USDC": "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png",
  "USDT": "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB/logo.png",
  "JUP": "https://dd.dexscreener.com/logos/v1/solana/jup9uzrxatpdjv32kwcrgiyvbt6zqg4dpht8ymvttwf.png",
  "BONK": "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/DezXAZ8z7Pnr8jjvrr2WbRi75pU95Aacg96Du59AKi1m/logo.png",
  "SAMO": "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/SigoXm7eYCHb6df7uSgR3scz7F7mZ6p8xQfLscA2b8B/logo.png",
  "BURNER": "https://images.unsplash.com/photo-1608501078713-8e445a709b39?auto=format&fit=crop&w=120&q=80",
};

/**
 * Generate a beautiful, deterministic CSS gradient based on a token symbol.
 */
export function getDeterministicGradient(symbol: string): { from: string; to: string } {
  let hash = 0;
  const safeSymbol = typeof symbol === "string" ? symbol : "TOKEN";
  for (let i = 0; i < safeSymbol.length; i++) {
    hash = safeSymbol.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const colors = [
    { from: "#ef4444", to: "#f97316" }, // Fire/Flame
    { from: "#ec4899", to: "#8b5cf6" }, // Purple/Pink
    { from: "#3b82f6", to: "#06b6d4" }, // Cyber Blue
    { from: "#10b981", to: "#3b82f6" }, // Emerald Ocean
    { from: "#ca8a04", to: "#b91c1c" }, // Gold Lava
    { from: "#8b5cf6", to: "#ec4899" }, // Mystic Sunset
  ];
  
  const index = Math.abs(hash) % colors.length;
  return colors[index];
}

/**
 * Fetch token image from Jupiter API natively with abort guards and bounded caching policies.
 */
export async function fetchJupiterTokenImage(mint: string): Promise<string | null> {
  if (!mint || mint.length < 32 || mint.length > 44 || mint.includes("-")) {
    return null;
  }
  
  // Return cached result if any
  const runtimeCached = secureImageCache.get(mint);
  if (runtimeCached) {
    return runtimeCached;
  }
  
  // Check local storage persistent cache
  try {
    const cached = localStorage.getItem(`burner_img_cache_${mint}`);
    if (cached) {
      secureImageCache.set(mint, cached);
      return cached;
    }
  } catch (e) {
    // Gracefully ignore sandbox storage obstacles
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 1800); // Strict 1.8s response timeout

  try {
    const res = await fetch(`https://tokens.jup.ag/token/${mint}`, {
      signal: controller.signal,
    });
    
    if (res.ok) {
      const data = await res.json();
      if (data && typeof data.logoURI === "string" && data.logoURI.trim().length > 0) {
        const logo = data.logoURI.trim();
        // Set into our secure bounded LRU cache
        secureImageCache.set(mint, logo);
        try {
          localStorage.setItem(`burner_img_cache_${mint}`, logo);
        } catch (e) {}
        return logo;
      }
    }
  } catch (err) {
    // Mute any network and timeout exceptions safely
  } finally {
    clearTimeout(timeoutId);
  }

  return null;
}

/**
 * Main function to resolve primary token image with cascading strategy
 */
export async function resolveTokenImage(
  symbol: string,
  mintAddress?: string,
  providedImageUrl?: string
): Promise<string> {
  const normSymbol = (symbol || "").toUpperCase().trim();
  
  // Case A: Provided image URL is verified
  if (providedImageUrl && typeof providedImageUrl === "string" && providedImageUrl.startsWith("https://")) {
    return providedImageUrl;
  }

  // Case B: Well-known native ecosystems matches
  if (normSymbol && WELL_KNOWN_LOGOS[normSymbol]) {
    return WELL_KNOWN_LOGOS[normSymbol];
  }

  // Case C: Jupiter dynamic API check
  if (mintAddress && mintAddress.length >= 32 && mintAddress.length <= 44) {
    const jupImg = await fetchJupiterTokenImage(mintAddress);
    if (jupImg) {
      return jupImg;
    }
  }

  // Case D: Return placeholder indicator keyword (UI handles the vector/css fallback)
  return `PLACEHOLDER:${symbol}`;
}
