// Petit serveur local pour prévisualiser dist/ : node src/serve.js
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const racine = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "dist");
const port = Number(process.env.PORT) || 8080;
const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon",
};

createServer(async (req, res) => {
  let cible = path.join(racine, decodeURIComponent(new URL(req.url, "http://x").pathname));
  if (!cible.startsWith(racine)) return res.writeHead(403).end();
  try {
    if ((await stat(cible)).isDirectory()) cible = path.join(cible, "index.html");
    const corps = await readFile(cible);
    res.writeHead(200, { "content-type": types[path.extname(cible)] || "application/octet-stream" });
    res.end(corps);
  } catch {
    const corps = await readFile(path.join(racine, "404.html")).catch(() => "Page introuvable");
    res.writeHead(404, { "content-type": "text/html; charset=utf-8" });
    res.end(corps);
  }
}).listen(port, () => console.log(`Prévisualisation : http://localhost:${port}/`));
