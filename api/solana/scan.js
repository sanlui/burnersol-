const HELIUS_RPC = `https://mainnet.helius-rpc.com/?api-key=${process.env.HELIUS_API_KEY || ""}`;
const ALCHEMY_RPC = process.env.ALCHEMY_SOLANA_RPC_URL || "";

const KNOWN_TOKENS = {
  "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v": { name: "USD Coin", symbol: "USDC" },
  "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB": { name: "USDT", symbol: "USDT" },
  "So11111111111111111111111111111111111111112": { name: "Wrapped SOL", symbol: "WSOL" },
  "JUPyiwrYJF2ip9vdJjN2BLm9S85FmP9X9bJ65h6Nzo6": { name: "Jupiter", symbol: "JUP" },
  "DezXAZ8z7PnrnRJjz3wX4mP97EGAtfA6AtC8Zq1A2Uq": { name: "Bonk", symbol: "BONK" },
};

const SPAM_KEYWORDS = ["CLAIM", "FREE", "GIFT", "REWARD", "AIRDROP", "TICKET", "VOUCHER", "WINNER", ".NET", ".COM", ".ORG", ".XYZ", ".CC", ".LINK", "CLICK", "VISIT"];

async function fetchWithRetry(url, body, maxRetries = 3, baseDelay = 500, timeout = 15000) {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(timeout)
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data?.error) throw new Error(data.error.message || "RPC error");
      return data;
    } catch (err) {
      if (attempt === maxRetries) throw err;
      const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 200;
      await new Promise(r => setTimeout(r, delay));
    }
  }
}

const RPC_ENDPOINTS = [
  { url: HELIUS_RPC, name: "helius" },
  { url: ALCHEMY_RPC, name: "alchemy" },
].filter(e => e.url.includes("api-key") || e.url.length > 0);

async function rpcCallWithRetry(method, params, maxRetries = 3) {
  const body = { jsonrpc: "2.0", id: 1, method, params };
  for (const { url, name } of RPC_ENDPOINTS) {
    try {
      return await fetchWithRetry(url, body, maxRetries);
    } catch (e) {
      console.warn(`RPC ${method} failed on ${name}:`, e.message);
    }
  }
  throw new Error("All RPC endpoints failed");
}

// Input validation
function isValidSolanaAddress(addr) {
  return typeof addr === "string" && /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(addr);
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", process.env.ALLOWED_ORIGIN || "https://burnersol.com");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { walletAddress } = req.body;
    if (!walletAddress || typeof walletAddress !== "string") {
      return res.status(400).json({ error: "walletAddress is required", success: false, items: [] });
    }

    if (!isValidSolanaAddress(walletAddress)) {
      return res.status(400).json({ error: "Invalid Solana address format", success: false, items: [] });
    }

    const activeAddress = walletAddress.trim();

    // Primary: Helius DAS API (getAssetsByOwner) with retry
    let assets = [];
    let page = 1;
    const PAGE_SIZE = 50;

    try {
      while (true) {
        const payload = {
          jsonrpc: "2.0",
          id: 1,
          method: "getAssetsByOwner",
          params: {
            ownerAddress: activeAddress,
            page,
            limit: PAGE_SIZE,
          }
        };

        let data;
        let callSuccess = false;

        for (const { url, name } of RPC_ENDPOINTS) {
          try {
            const rpcRes = await fetchWithRetry(url, payload, 2, 500, 15000);
            if (rpcRes?.result?.items) {
              data = rpcRes;
              callSuccess = true;
              break;
            }
          } catch (e) {
            console.warn(`getAssetsByOwner page ${page} failed on ${name}:`, e.message);
          }
        }

        if (!callSuccess || !data?.result?.items) break;

        assets = [...assets, ...data.result.items];
        if (data.result.items.length < PAGE_SIZE) break;
        page++;
        if (page > 5) break;
      }
    } catch (err) {
      console.warn("Helius DAS failed, trying Alchemy getTokenAccountsByOwner:", err.message);

      // Fallback: Alchemy RPC
      if (ALCHEMY_RPC) {
        try {
          const makeRpc = async (programId) => {
            const payload = {
              jsonrpc: "2.0",
              id: 1,
              method: "getTokenAccountsByOwner",
              params: [activeAddress, { programId }, { encoding: "jsonParsed" }]
            };
            return fetchWithRetry(ALCHEMY_RPC, payload, 2, 400, 10000);
          };

          const [res1, res2] = await Promise.all([
            makeRpc("TokenkegQfeZyiNwAJbV6tndq2AwtXdfS2zks7g9K"),
            makeRpc("TokenzQdBNbMcq6D7gcoA9uCYCkpBi2vh3teF6G29")
          ]);

          const v1 = res1?.result?.value || [];
          const v2 = res2?.result?.value || [];
          const fallbackItems = [...v1, ...v2].map((acc) => {
            const pubkey = acc.pubkey;
            const info = acc.account?.data?.parsed?.info;
            const mint = info?.mint || "UnknownMint";
            const amtInfo = info?.tokenAmount;
            const uiAmount = amtInfo ? Number(amtInfo.uiAmount || 0) : 0;
            const decimals = amtInfo ? Number(amtInfo.decimals || 0) : 0;
            const lamports = acc.account?.lamports || 2039280;
            const reclaimableSol = lamports / 1e9;

            let type = "token";
            let rawName = `SPL Asset (${mint.slice(0, 4)}...${mint.slice(-4)})`;
            let rawSymbol = `SPL-${mint.slice(0, 3).toUpperCase()}`;

            if (uiAmount === 0) { type = "account"; rawName = `Defunct SPL Token Account (${mint.slice(0, 4)}...${mint.slice(-4)})`; rawSymbol = "EMPTY"; }
            else if (decimals === 0 && uiAmount === 1) { type = "nft"; rawName = `Collectible Artifact #${mint.slice(0, 4)}`; rawSymbol = "NFT"; }

            if (KNOWN_TOKENS[mint]) { rawName = KNOWN_TOKENS[mint].name; rawSymbol = KNOWN_TOKENS[mint].symbol; }

            const isSpam = SPAM_KEYWORDS.some(kw => rawName.toUpperCase().includes(kw) || rawSymbol.toUpperCase().includes(kw));
            const descriptor = type === "account"
              ? `Defunct empty SPL Token account. Safe to close to reclaim ${reclaimableSol.toFixed(5)} SOL rent.`
              : isSpam ? `Malicious spam/airdrop asset.` : `Token balance active.`;

            return { id: pubkey, name: rawName, symbol: rawSymbol, type, amount: uiAmount, valueUsd: 0, reclaimableSol, mintAddress: mint, programId: acc.account?.owner || "TokenkegQfeZyiNwAJbV6tndq2AwtXdfS2zks7g9K", imageUrl: type === "nft" ? `https://picsum.photos/seed/${mint.slice(0, 6)}/300/300` : undefined, isScam: isSpam, descriptor, selected: isSpam || type === "account" };
          });

          if (fallbackItems.length > 0) {
            return res.json({ success: true, source: "alchemy-fallback", items: fallbackItems });
          }
        } catch (fbErr) {
          console.error("Alchemy fallback also failed:", fbErr.message);
        }
      }
    }

    if (assets.length === 0) {
      return res.json({ success: true, source: "helius-das", items: [] });
    }

    // Convert Helius DAS items to TrashItem format
    const trashItems = assets.map((asset) => {
      const mint = asset.id;
      const name = asset.content?.metadata?.name || `Asset (${mint.slice(0, 4)}...${mint.slice(-4)})`;
      const symbol = asset.content?.metadata?.symbol || "";
      const description = asset.content?.metadata?.description || "";
      const image = asset.content?.links?.image || "";
      const interface_ = asset.interface;
      const tokenInfo = asset.token_info;

      let type = "token";
      let uiAmount = 0;
      let decimals = 0;
      let reclaimableSol = 0.002039;
      let lamports = 0;

      if (tokenInfo) {
        uiAmount = Number(tokenInfo.balance || 0);
        decimals = tokenInfo.decimals || 0;
        lamports = tokenInfo.amount ? Number(tokenInfo.amount) : (asset.account_data?.lamports || 0);
        reclaimableSol = lamports / 1e9;
      } else {
        lamports = asset.account_data?.lamports || 2039280;
        reclaimableSol = lamports / 1e9;
      }

      if (interface_ === "NFT" || interface_ === "FungibleAsset" || interface_ === "ProgrammableNFT") {
        if (decimals === 0 && (uiAmount === 1 || interface_ === "NFT" || interface_ === "ProgrammableNFT")) {
          type = "nft";
        } else if (uiAmount === 0) {
          type = "account";
        } else {
          type = "token";
        }
      } else {
        if (uiAmount === 0) {
          type = "account";
        } else {
          type = "token";
        }
      }

      const isSpam = SPAM_KEYWORDS.some(kw =>
        name.toUpperCase().includes(kw) || symbol.toUpperCase().includes(kw)
      );

      const descriptor = type === "account"
        ? `Defunct empty account. Safe to close to reclaim ${reclaimableSol.toFixed(5)} SOL rent.`
        : isSpam
          ? `Malicious spam/airdrop asset detected.`
          : description
            ? `${description.slice(0, 120)}`
            : `${symbol || name} - Token balance active.`;

      return {
        id: mint,
        name: KNOWN_TOKENS[mint]?.name || name,
        symbol: KNOWN_TOKENS[mint]?.symbol || symbol || `T-${mint.slice(0, 3).toUpperCase()}`,
        type,
        amount: uiAmount,
        decimals,
        valueUsd: 0,
        reclaimableSol,
        mintAddress: mint,
        imageUrl: image || (type === "nft" ? `https://picsum.photos/seed/${mint.slice(0, 6)}/300/300` : undefined),
        isScam: isSpam,
        descriptor,
        selected: isSpam || type === "account",
      };
    });

    return res.json({
      success: true,
      source: "helius-das",
      items: trashItems
    });

  } catch (e) {
    console.error("Scan API error:", e);
    return res.status(500).json({ success: false, error: e.message || "Scan failed", items: [] });
  }
}