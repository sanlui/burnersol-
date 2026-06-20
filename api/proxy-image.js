export default async function handler(req, res) {
  const { url } = req.query;
  if (!url || !url.startsWith("http")) {
    return res.status(400).end();
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const upstream = await fetch(url, {
      signal: controller.signal,
      headers: { "User-Agent": "BurnerSol/1.0" },
    });
    clearTimeout(timeout);

    if (!upstream.ok) return res.status(upstream.status).end();

    const contentType = upstream.headers.get("content-type") || "image/png";
    res.setHeader("Content-Type", contentType);
    res.setHeader("Cache-Control", "public, max-age=86400");

    const buffer = await upstream.arrayBuffer();
    res.send(Buffer.from(buffer));
  } catch {
    clearTimeout(timeout);
    res.status(502).end();
  }
}
