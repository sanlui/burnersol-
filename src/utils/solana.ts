/**
 * BurnerSol - RPC Resilience & DOS Protection Layer for Solana Mainnet Connection
 * Includes request throttling, concurrency limiting, request deduplication,
 * global retry restrictions, and token payload capping.
 */

// Global constant fallback endpoints
const PRIMARY_SOLANA_RPC = import.meta.env.VITE_SOLANA_RPC_URL || "https://solana-mainnet.g.alchemy.com/v2/XhvbwzXZcW2UhCcCj5cC1";
const FALLBACK_SOLANA_RPC = "https://solana-api.projectserum.com";
const HELIUS_RPC = `https://mainnet.helius-rpc.com/?api-key=${import.meta.env.VITE_HELIUS_API_KEY || ""}`;

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
 * Fetch ALL digital assets owned by a wallet using Helius DAS (getAssetsByOwner).
 * Returns full metadata: name, symbol, description, image, collection, attributes, token info.
 */
export interface HeliusDASAsset {
  id: string;
  name: string;
  symbol: string;
  description: string;
  image: string;
  collection: string;
  collectionName: string;
  attributes: Array<{ trait_type: string; value: string }>;
  interface: string;
  type: string;
  decimals: number;
  supply: number;
  creators: Array<{ address: string; verified: boolean; share: number }>;
  owner: string;
  royalty: number;
  compressed: boolean;
  froze: boolean;
  tokenInfo?: {
    balance: number;
    supply: number;
    decimals: number;
    tokenProgram: string;
  };
  accountInfo?: {
    lamports: number;
  };
}

export async function fetchHeliusAllAssetsDAS(walletAddress: string): Promise<HeliusDASAsset[]> {
  if (!walletAddress || walletAddress.length < 32) return [];

  const allAssets: HeliusDASAsset[] = [];
  let page = 1;
  const PAGE_SIZE = 50;
  const MAX_PAGES = 10;

  try {
    while (page <= MAX_PAGES) {
      const response = await executeResilientFetch<any>(
        HELIUS_RPC,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            jsonrpc: "2.0",
            id: 1,
            method: "getAssetsByOwner",
            params: {
              ownerAddress: walletAddress,
              page,
              limit: PAGE_SIZE,
              sortBy: { sortBy: "created", sortDirection: "desc" },
            }
          }),
        },
        12000,
        2
      );

      if (!response?.result?.items || response.result.items.length === 0) break;

      // === FULL HELIUS DAS LOG ===
      console.log("[DAS] getAssetsByOwner PAGE", page, "- Total items in response:", response.result.items.length);
      if (page === 1 && response.result.items.length > 0) {
        console.log("[DAS] === FULL RAW ITEM #0 (complete object) ===");
        console.log(JSON.stringify(response.result.items[0], null, 2));
        console.log("[DAS] === FIELD-BY-FIELD EXTRACTION for item #0 ===");
        const sample = response.result.items[0];
        console.log({
          "item.id": sample.id,
          "item.interface": sample.interface,
          "item.content": sample.content,
          "item.content.links": sample.content?.links,
          "item.content.metadata": sample.content?.metadata,
          "item.content.metadata.name": sample.content?.metadata?.name,
          "item.content.metadata.symbol": sample.content?.metadata?.symbol,
          "item.content.metadata.description": sample.content?.metadata?.description,
          "item.content.metadata.attributes": sample.content?.metadata?.attributes,
          "item.content.links.image": sample.content?.links?.image,
          "item.token_info": sample.token_info,
          "item.token_info.decimals": sample.token_info?.decimals,
          "item.token_info.balance": sample.token_info?.balance,
          "item.token_info.supply": sample.token_info?.supply,
          "item.token_info.token_program": sample.token_info?.token_program,
          "item.account_info": sample.account_info,
          "item.account_info.lamports": sample.account_info?.lamports,
          "item.grouping": sample.grouping,
          "item.compression": sample.compression,
          "item.creators": sample.creators,
          "item.seller_fee_basis_points": sample.seller_fee_basis_points,
          "item.supply": sample.supply,
          "item.frozen": sample.frozen,
        });
        // Log ALL top-level keys
        console.log("[DAS] All top-level keys of item:", Object.keys(sample));
        if (sample.content) console.log("[DAS] All keys of content:", Object.keys(sample.content));
        if (sample.content?.metadata) console.log("[DAS] All keys of metadata:", Object.keys(sample.content.metadata));
        if (sample.content?.links) console.log("[DAS] All keys of links:", Object.keys(sample.content.links));
      }
      // === END LOG ===

      for (const item of response.result.items) {
        const content = item.content || {};
        const metadata = content.metadata || {};
        const links = content.links || {};
        const tokenInfo = item.token_info || {};
        const accountInfo = item.account_info || {};
        const grouping = item.grouping || [];

        let collectionName = "";
        let collectionAddress = "";
        for (const group of grouping) {
          if (group.group_key === "collection") {
            collectionAddress = group.group_value || "";
            collectionName = group.collection_metadata?.name || "";
          }
        }

        const attrs: Array<{ trait_type: string; value: string }> = [];
        if (metadata.attributes && Array.isArray(metadata.attributes)) {
          for (const attr of metadata.attributes) {
            attrs.push({ trait_type: attr.trait_type || "", value: String(attr.value || "") });
          }
        }

        const decimals = tokenInfo.decimals ?? 0;
        const balance = tokenInfo.balance ? Number(tokenInfo.balance) : 0;
        const supply = tokenInfo.supply ? Number(tokenInfo.supply) : (item.supply ? Number(item.supply) : 0);
        const lamports = accountInfo.lamports || 0;

        allAssets.push({
          id: item.id,
          name: metadata.name || `Asset (${item.id.slice(0, 4)}...${item.id.slice(-4)})`,
          symbol: metadata.symbol || "",
          description: metadata.description || "",
          image: links.image || "",
          collection: collectionAddress,
          collectionName,
          attributes: attrs,
          interface: item.interface || "Unknown",
          type: item.compression?.compressed ? "compressed" : (item.interface || "unknown"),
          decimals,
          supply,
          creators: item.creators || [],
          owner: walletAddress,
          royalty: item.seller_fee_basis_points || 0,
          compressed: item.compression?.compressed || false,
          froze: item.frozen || false,
          tokenInfo: tokenInfo.balance !== undefined ? {
            balance,
            supply,
            decimals,
            tokenProgram: tokenInfo.token_program || "",
          } : undefined,
          accountInfo: lamports > 0 ? { lamports } : undefined,
        });
      }

      if (response.result.items.length < PAGE_SIZE) break;
      page++;
    }
  } catch (error) {
    console.error("Helius DAS fetchAssetsByOwner failed:", error);
  }

  return allAssets;
}

export interface FungibleTokenAccount {
  mint: string;
  amount: string;
  decimals: number;
  uiAmount: number;
  owner: string;
}

export async function fetchHeliusFungibleTokens(walletAddress: string): Promise<FungibleTokenAccount[]> {
  if (!walletAddress || walletAddress.length < 32) return [];

  const allTokens: FungibleTokenAccount[] = [];

  const PROGRAMS = [
    "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
    "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb",
  ];

  for (const programId of PROGRAMS) {
    try {
      const data = await executeResilientFetch<any>(
        HELIUS_RPC,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            jsonrpc: "2.0",
            id: 1,
            method: "getTokenAccountsByOwner",
            params: [
              walletAddress,
              { programId },
              { encoding: "jsonParsed" }
            ]
          }),
        },
        8000,
        2
      );

      if (data?.result?.value) {
        for (const item of data.result.value) {
          const info = item.account.data.parsed.info;
          const ta = info.tokenAmount;
          allTokens.push({
            mint: info.mint,
            amount: ta.amount,
            decimals: ta.decimals,
            uiAmount: ta.uiAmount || 0,
            owner: info.owner,
          });
        }
      }
    } catch (err) {
      console.error(`Fungible tokens fetch failed for program ${programId}:`, err);
    }
  }

  return allTokens;
}

/**
 * Fetch NFTs owned by a wallet using Helius Digital Asset API.
 */
export async function fetchHeliusNFTs(walletAddress: string): Promise<HeliusNFT[]> {
  if (!walletAddress || walletAddress.length < 32) return [];

  try {
    const response = await executeResilientFetch<any>(
      HELIUS_RPC,
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
