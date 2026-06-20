export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  let parsedBody = {};

  try {
    if (req.body) {
      if (typeof req.body === "object" && !Array.isArray(req.body) && req.body !== null) {
        parsedBody = req.body;
      } else if (typeof req.body === "string" && req.body.trim()) {
        parsedBody = JSON.parse(req.body);
      } else if (Buffer.isBuffer(req.body)) {
        parsedBody = JSON.parse(req.body.toString());
      }
    }

    if (Object.keys(parsedBody).length === 0 && req.body) {
      try {
        const text = typeof req.body.text === "function" ? await req.body.text() : String(req.body);
        if (text.trim()) parsedBody = JSON.parse(text);
      } catch {}
    }
  } catch (e) {
    return res.status(400).json({ error: "Invalid request body" });
  }

  const { items, burnIntensity } = parsedBody;

  if (!items || !Array.isArray(items)) {
    return res.status(400).json({ error: "Items array is required." });
  }

  if (items.length > 100) {
    return res.status(400).json({ error: "Payload limit exceeded." });
  }

  const rawIntensity = parseInt(String(burnIntensity), 10);
  const cleanIntensity = isNaN(rawIntensity) ? 1 : Math.min(3, Math.max(1, rawIntensity));

  const FEE_PERCENT = 1.5;

  const previewItems = items.map((item, idx) => {
    const riskScore = item.riskReport?.score ?? (item.isScam ? 90 : 10);
    const reclaimSol = parseFloat(String(item.reclaimableSol)) || 0.00204;
    const protocolFee = reclaimSol * FEE_PERCENT / 100;

    return {
      id: String(item.id || `item-${idx}`).slice(0, 50),
      name: String(item.name || "Unknown").slice(0, 100),
      symbol: String(item.symbol || "TOKEN").slice(0, 20),
      type: ["nft", "lp", "account"].includes(item.type) ? item.type : "token",
      reclaimableSol: Math.max(0, reclaimSol),
      protocolFeeSol: protocolFee,
      netReclaimSol: reclaimSol - protocolFee,
      riskScore,
      riskLevel: item.riskReport?.level || (item.isScam ? "SCAM" : "SAFE"),
    };
  });

  const rawReclaimSol = previewItems.reduce((acc, curr) => acc + curr.reclaimableSol, 0);
  const baseProtocolFeeSol = previewItems.reduce((acc, curr) => acc + curr.protocolFeeSol, 0);
  const burnIntensityBonusPct = Math.min(0.15, cleanIntensity * 0.03);
  const totalProtocolFeeSol = Math.max(0, baseProtocolFeeSol * (1 - burnIntensityBonusPct));
  const totalNetReclaimSol = rawReclaimSol - totalProtocolFeeSol;

  return res.json({
    items: previewItems,
    totalItems: items.length,
    rawReclaimSol,
    totalProtocolFeeSol,
    totalNetReclaimSol,
    estimatedSolanaTxFee: 0.000005 * items.length,
    burnIntensityBonusPct,
  });
}