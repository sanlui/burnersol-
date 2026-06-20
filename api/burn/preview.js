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

  try {
    const body = typeof req.body === "object" ? req.body : JSON.parse(req.body || "{}");
    const { items, burnIntensity } = body;

    if (!items || !Array.isArray(items)) {
      return res.status(400).json({ error: "Items array is required." });
    }

    if (items.length > 100) {
      return res.status(400).json({ error: "Payload limit exceeded: Maximum 100 items." });
    }

    const rawIntensity = parseInt(String(burnIntensity), 10);
    const cleanIntensity = isNaN(rawIntensity) ? 1 : Math.min(3, Math.max(1, rawIntensity));

    const FEE_PERCENT = 1.5;

    const previewItems = items.map(item => {
      const riskScore = item.riskReport?.score ?? (item.isScam ? 90 : 10);
      const protocolFee = (item.reclaimableSol * FEE_PERCENT) / 100;

      return {
        id: String(item.id || "").slice(0, 50),
        name: String(item.name || "Unknown").slice(0, 100),
        symbol: String(item.symbol || "TOKEN").slice(0, 20),
        type: ["nft", "lp", "account"].includes(item.type) ? item.type : "token",
        reclaimableSol: Math.max(0, parseFloat(String(item.reclaimableSol)) || 0.00204),
        protocolFeeSol: protocolFee,
        netReclaimSol: item.reclaimableSol - protocolFee,
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

  } catch (error) {
    console.error("Burn preview API error:", error);
    return res.status(500).json({ error: "Burn preview calculation failed." });
  }
}