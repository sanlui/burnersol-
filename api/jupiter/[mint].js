export default async function handler(req, res) {
  const allowedOrigin = process.env.ALLOWED_ORIGIN || "https://burnersol.com";
  res.setHeader("Access-Control-Allow-Origin", allowedOrigin);
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  const { mint } = req.query;
  if (!mint || typeof mint !== "string" || !/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(mint)) {
    return res.status(400).json({ error: "invalid mint address" });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const upstream = await fetch(`https://api.jup.ag/tokens/v1/token/${mint}`, {
      signal: controller.signal,
      headers: { "Content-Type": "application/json" },
    });
    clearTimeout(timeout);

    if (!upstream.ok) return res.status(upstream.status).json({ error: "upstream error" });

    const data = await upstream.json();
    res.setHeader("Cache-Control", "public, max-age=300");
    res.json(data);
  } catch {
    clearTimeout(timeout);
    res.status(502).json({ error: "jupiter token proxy failed" });
  }
}
