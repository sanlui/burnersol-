/**
 * BurnerSol - RPC Resilience & DOS Protection Layer for Solana Mainnet Connection
 * Includes request throttling, concurrency limiting, request deduplication,
 * global retry restrictions, and token payload capping.
 */

// Global constant fallback endpoints
const PRIMARY_SOLANA_RPC = "https://solana-mainnet.g.alchemy.com/v2/XhvbwzXZcW2UhCcCj5cC1";
const FALLBACK_SOLANA_RPC = "https://solana-api.projectserum.com";
const HELIUS_RPC = "https://mainnet.helius-rpc.com/?api-key=228a6dca-c288-4f6a-b85c-23561fb9e946";

// Cache for active requests to allow immediate deduplication
const activePromises = new Map<string, Promise<any>>();

// Simple Concurrency Throttler
class ConcurrencyThrottler {
  private activeCount = 0;
  private maxConcurrency = 6; // Max 6 dual concurrent outstanding requests
  private queue: (() => void)[] = [];

  async run<T>(fn: () => Promise<T>): Promise<T> {
    if (this.activeCount >= this.maxConcurrency) {
      await new Promise<void>((resolve) => {
        this.queue.push(resolve);
      });
    }

    this.activeCount++;
    try {
      return await fn();
    } finally {
      this.activeCount--;
      const next = this.queue.shift();
      if (next) {
        next();
      }
    }
  }
}

const throttler = new ConcurrencyThrottler();

/**
 * Resilient fetch execution wrapper with:
 * 1. Request deduplication
 * 2. Concurrency limiting
 * 3. Retry capping (max 2 retries)
 * 4. Custom abort timeout
 */
export async function executeResilientFetch<T>(
  url: string,
  options: RequestInit = {},
  timeoutMs: number = 2500,
  maxRetries: number = 2
): Promise<T | null> {
  // Use URL + body identifier as deduplication cache key
  const bodyKey = options.body ? String(options.body) : "";
  const dedupKey = `${options.method || "GET"}:${url}:${bodyKey}`;

  const existingPromise = activePromises.get(dedupKey);
  if (existingPromise) {
    return existingPromise;
  }

  const runTaskQuery = async (): Promise<T | null> => {
    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);

      try {
        // Wrap actual fetch within concurrency limit throttler
        const data = await throttler.run(async () => {
          const response = await fetch(url, {
            ...options,
            signal: controller.signal,
          });

          if (!response.ok) {
            throw new Error(`HTTP network error: ${response.status}`);
          }

          return await response.json();
        });

        clearTimeout(timer);
        return data as T;
      } catch (err: any) {
        clearTimeout(timer);
        lastError = err instanceof Error ? err : new Error(String(err));
        console.warn(`Fetch to ${url} failed on attempt ${attempt + 1}/${maxRetries + 1}: ${lastError.message}`);
        
        // Wait a small backoff delay before retrying
        if (attempt < maxRetries) {
          await new Promise((resolve) => setTimeout(resolve, 300 + attempt * 200));
        }
      }
    }

    console.error(`Resilient fetch exhausted all retry avenues for ${url}:`, lastError);
    return null;
  };

  const promise = runTaskQuery().finally(() => {
    activePromises.delete(dedupKey);
  });

  activePromises.set(dedupKey, promise);
  return promise;
}

/**
 * Executes an RPC fetch with timeout constraints, fallback policy, and retry safeguards.
 */
export async function executeResilientRpc(
  method: string,
  params: any[],
  timeoutMs: number = 2500
): Promise<any> {
  // Prevent giant payload processing: limit batch accounts request elements
  // Solana standard calls with raw arrays (like getMultipleAccounts) shouldn't overwhelm connection buffers
  let sanitizedParams = params;
  if (Array.isArray(params[0]) && params[0].length > 150) {
    console.warn(`DOS Guard: Slicing RPC batch array elements from ${params[0].length} down to 150.`);
    sanitizedParams = [params[0].slice(0, 150), ...params.slice(1)];
  }

  const tryNode = async (endpoint: string): Promise<any> => {
    const payload = {
      jsonrpc: "2.0",
      id: Math.floor(Math.random() * 100000) + 1,
      method,
      params: sanitizedParams,
    };

    const data = await executeResilientFetch<any>(
      endpoint,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
      timeoutMs,
      2 // Max 2 retries
    );

    if (data && data.error) {
      throw new Error(`RPC node error: ${data.error.message || JSON.stringify(data.error)}`);
    }

    return data;
  };

  try {
    return await tryNode(PRIMARY_SOLANA_RPC);
  } catch (primaryError) {
    console.warn("Primary Alchemy RPC failed. Trying Helius...");
    try {
      return await tryNode(HELIUS_RPC);
    } catch (heliusError) {
      console.warn("Helius RPC failed. Retrying with Serum public fallback...");
      try {
        return await tryNode(FALLBACK_SOLANA_RPC);
      } catch (fallbackError) {
        console.error("All resilient RPC attempts failed.", fallbackError);
        return null;
      }
    }
  }
}

/**
 * DOS Guard: Sanitizes scanned account list, discarding elements beyond 150 count
 * to avoid browser freeze and volumetric RPC bans.
 */
export function enforceSpamThresholdCapping<T>(items: T[]): T[] {
  if (!items || !Array.isArray(items)) return [];
  if (items.length > 150) {
    console.warn(`DOS Protection: Wallet possesses ${items.length} accounts. Active scans are capped at the first 150 to guarantee performance.`);
    return items.slice(0, 150);
  }
  return items;
}

/**
 * Resiliently fetches the balance of a Solana account.
 */
export async function getResilientBalance(walletAddress: string): Promise<number | null> {
  if (!walletAddress || walletAddress.length < 32) return null;

  try {
    const response = await executeResilientRpc("getBalance", [walletAddress]);
    if (response && response.result && response.result.value !== undefined) {
      return response.result.value / 1e9;
    }
  } catch (error) {
    console.error(`Resilient balance lookup failed:`, error);
  }

  return null;
}

// ============================================================
// HELIUS RPC: Token Accounts, NFTs & Metadata (Fast/Mempool)
// ============================================================

export interface HeliusTokenAccount {
  mint: string;
  amount: string;
  decimals: number;
  tokenAmount: {
    amount: string;
    decimals: number;
    uiAmount: number;
    uiAmountString: string;
  };
  owner: string;
}

export interface HeliusNFT {
  mint: string;
  name: string;
  symbol: string;
  uri: string;
  image?: string;
  description?: string;
  sellerFeeBasisPoints: number;
  creators: Array<{ address: string; verified: boolean; share: number }>;
}

/**
 * Fetch all SPL token accounts for a wallet using Helius RPC (fast).
 */
export async function fetchHeliusTokenAccounts(walletAddress: string): Promise<HeliusTokenAccount[]> {
  if (!walletAddress || walletAddress.length < 32) return [];

  try {
    const payload = {
      jsonrpc: "2.0",
      id: 1,
      method: "getTokenAccountsByOwner",
      params: [
        walletAddress,
        { programId: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA" },
        { encoding: "jsonParsed" }
      ]
    };

    const data = await executeResilientFetch<any>(
      HELIUS_RPC,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
      5000,
      2
    );

    if (data?.result?.value) {
      return data.result.value.map((item: any) => ({
        mint: item.pubkey,
        amount: item.account.data.parsed.info.tokenAmount.amount,
        decimals: item.account.data.parsed.info.tokenAmount.decimals,
        tokenAmount: item.account.data.parsed.info.tokenAmount,
        owner: item.account.data.parsed.info.owner,
      }));
    }
  } catch (error) {
    console.error("Helius token accounts fetch failed:", error);
  }

  return [];
}

/**
 * Fetch NFTs owned by a wallet using Helius Digital Asset API.
 */
export async function fetchHeliusNFTs(walletAddress: string): Promise<HeliusNFT[]> {
  if (!walletAddress || walletAddress.length < 32) return [];

  try {
    const response = await executeResilientFetch<any>(
      `https://mainnet.helius-rpc.com/?api-key=228a6dca-c288-4f6a-b85c-23561fb9e946`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method: "getAssetsByOwner",
          params: {
            ownerAddress: walletAddress,
            page: 1,
            limit: 50,
            sortBy: { sortBy: "created", sortDirection: "desc" },
            interface: "Digital Asset",
          }
        }),
      },
      8000,
      2
    );

    if (response?.result?.items) {
      return response.result.items.map((item: any) => ({
        mint: item.id,
        name: item.content?.metadata?.name || "Unknown NFT",
        symbol: item.content?.metadata?.symbol || "",
        uri: item.content?.metadata?.uri || "",
        image: item.content?.links?.image || "",
        description: item.content?.metadata?.description || "",
        sellerFeeBasisPoints: item.sellerFeeBasisPoints || 0,
        creators: item.creators || [],
      }));
    }
  } catch (error) {
    console.error("Helius NFTs fetch failed:", error);
  }

  return [];
}

/**
 * Fetch token metadata from Helius for a list of mints.
 */
export async function fetchHeliusTokenMetadata(mints: string[]): Promise<Record<string, { name: string; symbol: string; image?: string; description?: string }>> {
  if (!mints || mints.length === 0) return {};

  const metadataMap: Record<string, { name: string; symbol: string; image?: string; description?: string }> = {};

  try {
    const response = await executeResilientFetch<any>(
      HELIUS_RPC,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method: "getAssetBatch",
          params: { ids: mints.slice(0, 100) },
        }),
      },
      8000,
      2
    );

    if (response?.result?.items) {
      for (const item of response.result.items) {
        metadataMap[item.id] = {
          name: item.content?.metadata?.name || "Unknown",
          symbol: item.content?.metadata?.symbol || "",
          image: item.content?.links?.image,
          description: item.content?.metadata?.description,
        };
      }
    }
  } catch (error) {
    console.error("Helius batch metadata fetch failed:", error);
  }

  return metadataMap;
}
