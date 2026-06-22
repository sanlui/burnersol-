const HELIUS_RPC = `https://mainnet.helius-rpc.com/?api-key=${process.env.HELIUS_API_KEY || ""}`;
const ALCHEMY_RPC = process.env.ALCHEMY_SOLANA_RPC_URL || "";

const KNOWN_MINTS = {
  "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v": "USDC",
  "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB": "USDT",
  "So11111111111111111111111111111111111111112": "Wrapped SOL",
  "DezXAZ8z7PnrnRJjz3wX4mP97EGAtfA6AtC8Zq1A2Uq": "BONK",
  "JUPyiwrYJF2ip9vdJjN2BLm9S85FmP9X9bJ65h6Nzo6": "JUP",
  "mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So": "mSOL",
  "7dHbWXmci3dT8UFYWYZweBLXgycu7Y3iL6trKn1Y7ARj": "stSOL",
  "orcaEKTdK7LKz57vaAYr9QeNsVEPfiu6QeMU1kektZE": "ORCA",
};

async function fetchWithRetry(url, body, maxRetries = 3, baseDelay = 600, timeout = 12000) {
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

async function rpcCallWithRetry(rpcUrl, method, params, maxRetries = 3) {
  const body = { jsonrpc: "2.0", id: 1, method, params };
  return fetchWithRetry(rpcUrl, body, maxRetries);
}

async function rpcCall(method, params, timeout = 8000) {
  const res = await fetch(HELIUS_RPC, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
    signal: AbortSignal.timeout(timeout)
  });
  if (!res.ok) throw new Error(`RPC ${res.status}`);
  return await res.json();
}

function resolveMintName(mint) {
  return KNOWN_MINTS[mint] || `${mint.slice(0, 4)}..${mint.slice(-4)}`;
}

function buildItem(sig, signer, asset, amount, solReclaimed, fee, slot, ageLabel) {
  return {
    id: `live-${sig.slice(0, 8)}`,
    address: `${signer.slice(0, 4)}...${signer.slice(-4)}`,
    fullAddress: signer,
    asset,
    amount,
    solReclaimed: Number(solReclaimed.toFixed(5)),
    time: ageLabel,
    isScam: false,
    countryFlag: "🌐",
    server: { city: "Solana", countryCode: "NET", flag: "🌐", ip: "mainnet", ping: "---" },
    txHash: sig,
    gasCost: fee,
    slot,
  };
}

export default async function handler(req, res) {
  const allowedOrigin = process.env.ALLOWED_ORIGIN || "https://burnersol.com";
  res.setHeader("Access-Control-Allow-Origin", allowedOrigin);
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  const RPC_ENDPOINTS = [
    { url: HELIUS_RPC, name: "helius" },
    { url: ALCHEMY_RPC, name: "alchemy" },
  ];

  try {
    let currentSlot = null;

    for (const { url, name } of RPC_ENDPOINTS) {
      try {
        const slotData = await rpcCallWithRetry(url, "getSlot", []);
        currentSlot = slotData.result;
        break;
      } catch (e) {
        console.warn(`getSlot failed on ${name}:`, e.message);
      }
    }

    if (currentSlot === null) {
      return res.json({ items: [], liveCount: 0, error: "All RPC endpoints failed" });
    }

    const items = [];
    const seen = new Set();

    for (let offset = 1; offset <= 10 && items.length < 10; offset++) {
      let blockData = null;
      let blockError = null;

      for (const { url, name } of RPC_ENDPOINTS) {
        try {
          blockData = await rpcCallWithRetry(
            url,
            "getBlock",
            [
              currentSlot - offset,
              {
                encoding: "jsonParsed",
                transactionDetails: "full",
                rewards: false,
                maxSupportedTransactionVersion: 0
              }
            ],
            2
          );
          blockError = null;
          break;
        } catch (e) {
          blockError = e;
        }
      }

      if (!blockData?.result?.transactions) continue;

      for (const tx of blockData.result.transactions) {
        if (items.length >= 10) break;
        if (tx.meta?.err !== null) continue;

        const sig = tx.transaction.signatures[0];
        if (seen.has(sig)) continue;
        seen.add(sig);

        const signer = tx.transaction.message.accountKeys[0].pubkey;
        const fee = tx.meta.fee / 1e9;
        const preToken = tx.meta.preTokenBalances || [];
        const postToken = tx.meta.postTokenBalances || [];
        const preBal = tx.meta.preBalances || [];
        const postBal = tx.meta.postBalances || [];

        let asset = null;
        let amount = "";
        let solReclaimed = 0;
        let ageLabel = offset === 1 ? "Just now" : `${offset}m ago`;

        if (preToken.length > postToken.length) {
          for (const pre of preToken) {
            if (!postToken.find(q => q.mint === pre.mint)) {
              const mintName = resolveMintName(pre.mint);
              const closedAmt = pre.uiTokenAmount?.uiAmountString || "0";
              asset = `Closed ${mintName}`;
              amount = closedAmt;

              for (let i = 0; i < preBal.length; i++) {
                const diff = (postBal[i] || 0) - preBal[i];
                if (diff > 0) solReclaimed += diff / 1e9;
              }
              if (solReclaimed === 0) solReclaimed = 0.00204;
              break;
            }
          }
        }

        if (!asset) continue;

        items.push(buildItem(sig, signer, asset, amount, solReclaimed, fee, currentSlot - offset, ageLabel));
      }
    }

    return res.json({ items: items.slice(0, 10), liveCount: items.length });

  } catch (e) {
    console.error("Recent txs API error:", e);
    return res.json({ items: [], liveCount: 0, error: e.message });
  }
}