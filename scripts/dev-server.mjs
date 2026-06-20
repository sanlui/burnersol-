import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");

async function startDevServer() {
  const express = (await import("express")).default;
  const app = express();
  const PORT = 3000;

  try {
    const dotenv = await import("dotenv");
    dotenv.config();
  } catch {}

  app.use((req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-XSS-Protection", "1; mode=block");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    res.setHeader("X-Frame-Options", "SAMEORIGIN");
    res.setHeader("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
    res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=(), interest-cohort=()");
    res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
    next();
  });

  app.use(express.json());

  // Jupiter Price API proxy
  app.get("/api/jupiter/price", async (req, res) => {
    try {
      const ids = req.query.ids;
      if (!ids) return res.status(400).json({ error: "missing ids" });
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      const upstream = await fetch(`https://api.jup.ag/price/v2?ids=${encodeURIComponent(ids)}`, {
        signal: controller.signal,
      });
      clearTimeout(timeout);
      if (!upstream.ok) return res.status(upstream.status).json({ error: "upstream error" });
      const data = await upstream.json();
      res.setHeader("Cache-Control", "public, max-age=15");
      res.json(data);
    } catch (err) {
      res.status(502).json({ error: "jupiter proxy failed" });
    }
  });

  // Jupiter Token Metadata proxy (returns JSON with logoURI)
  app.get("/api/jupiter/token/:mint", async (req, res) => {
    try {
      const { mint } = req.params;
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      const upstream = await fetch(`https://tokens.jup.ag/token/${mint}`, {
        signal: controller.signal,
      });
      clearTimeout(timeout);
      if (!upstream.ok) return res.status(upstream.status).json({ error: "upstream error" });
      const data = await upstream.json();
      res.setHeader("Cache-Control", "public, max-age=300");
      res.json(data);
    } catch {
      res.status(502).json({ error: "jupiter token proxy failed" });
    }
  });

  // Generic image proxy — fetches external images and serves same-origin
  // Bypasses CORP/CORS blocks from IPFS, Arweave, Irys, etc.
  app.get("/api/proxy-image", async (req, res) => {
    try {
      const url = req.query.url;
      if (!url || !url.startsWith("http")) {
        return res.status(400).end();
      }
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);
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
      res.status(502).end();
    }
  });

  const apiRoutes = [
    { route: "/api/solana/scan", file: "api/solana/scan.js" },
    { route: "/api/solana/recent-txs", file: "api/solana/recent-txs.js" },
    { route: "/api/solana/gas-fee", file: "api/solana/gas-fee.js" },
    { route: "/api/burn/preview", file: "api/burn/preview.js" },
    { route: "/api/burn/history", file: "api/burn/history.js" },
  ];

  for (const { route, file } of apiRoutes) {
    try {
      const fileUrl = pathToFileURL(path.join(rootDir, file)).href;
      const handler = (await import(fileUrl)).default;
      app.all(route, (req, res) => handler(req, res));
    } catch (e) {
      console.warn(`Could not mount ${route}: ${e.message}`);
    }
  }

  const publicPath = path.join(rootDir, "public");
  app.use(express.static(publicPath));

  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: "spa",
  });
  app.use(vite.middlewares);

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Dev server running on http://localhost:${PORT}`);
  });
}

startDevServer();