// Génère un QR code sous forme de balise <svg> inline, à partir d'un texte (URL en général).
// Le dessin est noir sur blanc quel que soit le thème, pour rester lisible par les lecteurs de QR codes.
import qrcode from "./vendor/qrcode.js";

export function qrSvg(texte, { taille = 160, marge = 2, titre = "" } = {}) {
  const qr = qrcode(0, "M"); // 0 = taille de symbole choisie automatiquement, M = correction d'erreur moyenne
  qr.addData(texte);
  qr.make();
  const n = qr.getModuleCount();
  const total = n + marge * 2;
  const chemins = [];
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      if (qr.isDark(y, x)) chemins.push(`M${x + marge} ${y + marge}h1v1h-1z`);
    }
  }
  const titreSvg = titre ? `<title>${titre.replace(/[<&>]/g, (c) => ({ "<": "&lt;", "&": "&amp;", ">": "&gt;" })[c])}</title>` : "";
  return `<svg class="qr" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${total} ${total}" width="${taille}" height="${taille}" role="img" shape-rendering="crispEdges">${titreSvg}<rect width="${total}" height="${total}" fill="#fff"/><path d="${chemins.join("")}" fill="#000"/></svg>`;
}
