export default async function handler(req, res) {
  const { ids } = req.query;
  if (!ids) return res.status(400).json({ error: "missing ids" });

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);

  try {
    const upstream = await fetch(`https://api.jup.ag/price/v2?ids=${encodeURIComponent(ids)}`, {
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!upstream.ok) return res.status(upstream.status).json({ error: "upstream error" });

    const data = await upstream.json();
    res.setHeader("Cache-Control", "public, max-age=15");
    res.json(data);
  } catch {
    clearTimeout(timeout);
    res.status(502).json({ error: "jupiter proxy failed" });
  }
}
