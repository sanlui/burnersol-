export default async function handler(req, res) {
  const { mint } = req.query;
  if (!mint) return res.status(400).json({ error: "missing mint" });

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);

  try {
    const upstream = await fetch(`https://tokens.jup.ag/token/${mint}`, {
      signal: controller.signal,
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
