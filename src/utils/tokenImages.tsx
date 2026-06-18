// ============================================================
// TOKEN IMAGE RESILIENCE
// Fallback chain: Jupiter Token List → On-chain → External URI → Placeholder
// In-memory LRU cache with TTL support
// ============================================================

import React from "react";

// ============================================================
// IMAGE CACHE (LRU + TTL)
// ============================================================

interface CacheEntry {
  uri: string;
  timestamp: number;
  valid: boolean;
}

const IMAGE_CACHE = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 5 * 60 * 1000;
const MAX_CACHE_SIZE = 500;

function getCachedUri(mint: string): string | null {
  const entry = IMAGE_CACHE.get(mint);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
    IMAGE_CACHE.delete(mint);
    return null;
  }
  if (!entry.valid) return null;
  // LRU: delete + re-set moves entry to end (most recently used)
  IMAGE_CACHE.delete(mint);
  IMAGE_CACHE.set(mint, entry);
  return entry.uri;
}

function setCacheEntry(mint: string, uri: string, valid: boolean): void {
  // Evict oldest (LRU) when full
  if (IMAGE_CACHE.size >= MAX_CACHE_SIZE) {
    const oldest = IMAGE_CACHE.keys().next().value;
    if (oldest !== undefined) IMAGE_CACHE.delete(oldest);
  }
  IMAGE_CACHE.set(mint, { uri, timestamp: Date.now(), valid });
}

// ============================================================
// JUPITER TOKEN LIST (cached fetch, 2s timeout, retry on failure)
// ============================================================

interface JupiterToken {
  address: string;
  name: string;
  symbol: string;
  logoURI?: string;
  decimals: number;
}

let jupiterListPromise: Promise<Map<string, JupiterToken>> | null = null;

function fetchJupiterTokenList(): Promise<Map<string, JupiterToken>> {
  if (jupiterListPromise) return jupiterListPromise;

  jupiterListPromise = (async () => {
    const map = new Map<string, JupiterToken>();
    try {
      const res = await fetch("https://token.jup.ag/all/strict", {
        signal: AbortSignal.timeout(2_000),
      });
      if (!res.ok) {
        jupiterListPromise = null;
        return map;
      }
      const tokens: JupiterToken[] = await res.json();
      for (const token of tokens) {
        map.set(token.address, token);
      }
    } catch {
      jupiterListPromise = null;
    }
    return map;
  })();

  return jupiterListPromise;
}

// ============================================================
// IMAGE URI RESOLUTION
// ============================================================

const PLACEHOLDER_URI = "data:image/svg+xml," + encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" fill="none">
    <rect width="40" height="40" fill="#1a1a1a"/>
    <circle cx="20" cy="20" r="12" stroke="#555" stroke-width="1.5" fill="none"/>
    <text x="20" y="24" text-anchor="middle" fill="#666" font-size="10" font-family="monospace">?</text>
  </svg>`
);

/**
 * Resolve the best available image URI for a token mint.
 * Priority: Jupiter Token List → caller-provided URI → placeholder.
 * Jupiter failures never block — immediate fallback to next source.
 */
export async function resolveTokenImage(
  mint: string,
  fallbackUri?: string,
): Promise<string> {
  const cached = getCachedUri(mint);
  if (cached) return cached;

  // 1. Jupiter Token List (2s timeout, never blocks)
  try {
    const jupiterMap = await fetchJupiterTokenList();
    const jupiterToken = jupiterMap.get(mint);
    if (jupiterToken?.logoURI) {
      setCacheEntry(mint, jupiterToken.logoURI, true);
      return jupiterToken.logoURI;
    }
  } catch {
    // continue immediately
  }

  // 2. Caller-provided fallback
  if (fallbackUri && fallbackUri.length > 0) {
    setCacheEntry(mint, fallbackUri, true);
    return fallbackUri;
  }

  // 3. Placeholder (always renders)
  setCacheEntry(mint, PLACEHOLDER_URI, true);
  return PLACEHOLDER_URI;
}

/**
 * Synchronous resolution from cache only. Returns null if not cached.
 */
export function getCachedImage(mint: string): string | null {
  return getCachedUri(mint);
}

/**
 * Check if an image URI is loadable. 2s timeout, no memory leaks.
 */
export function probeImage(uri: string): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image();
    let resolved = false;
    const done = (result: boolean) => {
      if (resolved) return;
      resolved = true;
      img.onload = null;
      img.onerror = null;
      img.src = "";
      resolve(result);
    };
    img.onload = () => done(true);
    img.onerror = () => done(false);
    img.src = uri;
    setTimeout(() => done(false), 2_000);
  });
}

// ============================================================
// REACT COMPONENT: IMAGEFALLBACK
// ============================================================

interface ImageFallbackProps {
  mint: string;
  uri?: string;
  alt: string;
  className?: string;
  size?: number;
}

interface ImageFallbackState {
  currentUri: string | null;
  hasError: boolean;
}

/**
 * Resilient token image component with full fallback chain.
 * Never shows a broken image — always degrades gracefully.
 */
export function ImageFallback({
  mint,
  uri,
  alt,
  className = "w-8 h-8 object-contain",
  size = 40,
}: ImageFallbackProps) {
  const [state, setState] = React.useState<ImageFallbackState>({
    currentUri: null,
    hasError: false,
  });

  React.useEffect(() => {
    let cancelled = false;

    (async () => {
      const resolved = await resolveTokenImage(mint, uri);
      if (!cancelled) {
        setState({ currentUri: resolved, hasError: false });
      }
    })();

    return () => { cancelled = true; };
  }, [mint, uri]);

  // On image load error, fallback to placeholder — single attempt only
  const handleError = React.useCallback(() => {
    if (state.hasError) return;
    setCacheEntry(mint, PLACEHOLDER_URI, true);
    setState({ currentUri: PLACEHOLDER_URI, hasError: true });
  }, [mint, state.hasError]);

  if (!state.currentUri) {
    return (
      <div
        className={`bg-white/5 animate-pulse ${className}`}
        style={{ width: size, height: size, borderRadius: 2 }}
      />
    );
  }

  return (
    <img
      src={state.currentUri}
      alt={alt}
      className={className}
      style={{ width: size, height: size }}
      onError={handleError}
      loading="lazy"
    />
  );
}

export { PLACEHOLDER_URI };
