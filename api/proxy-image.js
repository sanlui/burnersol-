const ALLOWED_HOSTS = [
  "arweave.net",
  "img.youtube.com",
  "picsum.photos",
  "ipfs.io",
  "cloudflare-ipfs.com",
  "nftstorage.link",
  "quicknode.xyz",
  "helius.xyz",
];

export default async function handler(req, res) {
  const allowedOrigin = process.env.ALLOWED_ORIGIN || "https://burnersol.com";
  res.setHeader("Access-Control-Allow-Origin", allowedOrigin);
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  const { url } = req.query;
  if (!url || typeof url !== "string") {
    return res.status(400).end();
  }

  let parsedUrl;
  try {
    parsedUrl = new URL(url);
  } catch {
    return res.status(400).end();
  }

  if (!ALLOWED_HOSTS.includes(parsedUrl.hostname)) {
    return res.status(403).end();
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
