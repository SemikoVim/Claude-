// Gabarits HTML du site. Chaque fonction reçoit des données et renvoie une page complète.
import { qrSvg } from "./qr.js";

export function echapper(valeur) {
  return String(valeur ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const e = echapper;

function liste(items, classe = "") {
  if (!items?.length) return "";
  return `<ul${classe ? ` class="${classe}"` : ""}>${items.map((i) => `<li>${e(i)}</li>`).join("")}</ul>`;
}

function dateFr(iso) {
  if (!iso) return "";
  const [a, m, j] = iso.split("-").map(Number);
  return new Date(Date.UTC(a, m - 1, j)).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

function nomDomaine(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

// `prefixe` est le chemin relatif vers la racine du site ("" à la racine, "../" dans une sous-page).
function gabarit({ site, titre, description, contenu, prefixe = "", couleur }) {
  const titreComplet = titre ? `${titre} · ${site.titre}` : site.titre;
  return `<!doctype html>
<html lang="${e(site.langue || "fr")}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${e(titreComplet)}</title>
  <meta name="description" content="${e(description)}">
  <meta property="og:title" content="${e(titreComplet)}">
  <meta property="og:description" content="${e(description)}">
  <meta property="og:type" content="website">
  <meta name="color-scheme" content="light dark">
  <link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='.9em' font-size='90'%3E🎁%3C/text%3E%3C/svg%3E">
  <link rel="stylesheet" href="${prefixe}assets/style.css">
  ${couleur ? `<style>:root{--accent:${e(couleur)}}</style>` : ""}
</head>
<body>
  <header class="entete">
    <div class="conteneur entete__contenu">
      <a class="entete__marque" href="${prefixe}">🎁 ${e(site.titre)}</a>
      <nav class="entete__nav"><a href="${prefixe}#applications">Applications</a></nav>
    </div>
  </header>
  <main class="conteneur">
${contenu}
  </main>
  <footer class="pied">
    <div class="conteneur">
      <p>${e(site.titre)}${site.auteur ? ` · ${e(site.auteur)}` : ""}. Les offres de parrainage sont définies par chaque service et peuvent changer : vérifiez toujours les conditions sur le site officiel avant de souscrire.</p>
    </div>
  </footer>
  <script src="${prefixe}assets/script.js" defer></script>
</body>
</html>
`;
}

function carteApplication(app, prefixe = "") {
  return `<a class="carte" href="${prefixe}${e(app.slug)}/" style="--accent:${e(app.couleur)}">
      <span class="carte__emoji" aria-hidden="true">${e(app.emoji)}</span>
      <span class="carte__corps">
        <span class="carte__categorie">${e(app.categorie)}</span>
        <span class="carte__nom">${e(app.nom)}</span>
        <span class="carte__resume">${e(app.avantagesFilleul[0])}</span>
      </span>
      <span class="carte__fleche" aria-hidden="true">→</span>
    </a>`;
}

const MAGASINS = {
  ios: { nom: "iPhone et iPad", libelle: "Télécharger sur l'App Store" },
  android: { nom: "Android", libelle: "Disponible sur Google Play" },
};

// Cartes « application mobile » : un QR code vers chaque boutique, plus un bouton pour ceux qui lisent la page sur leur téléphone.
function sectionApplications(app) {
  const entrees = Object.entries(MAGASINS).filter(([cle]) => app.applications?.[cle]);
  if (!entrees.length) return "";
  return `<section class="bloc applis" aria-labelledby="titre-applis">
        <h2 id="titre-applis">📱 L'application mobile ${e(app.nom)}</h2>
        <p class="applis__intro">Scannez le QR code avec votre téléphone, ou appuyez sur le bouton si vous lisez cette page depuis votre mobile.</p>
        <div class="applis__grille">
          ${entrees
            .map(
              ([cle, m]) => `<div class="appli">
            <a class="appli__qr" href="${e(app.applications[cle])}" rel="noopener" target="_blank" aria-label="${e(m.libelle)} (QR code)">
              ${qrSvg(app.applications[cle], { taille: 150, titre: `QR code : ${m.libelle}` })}
            </a>
            <p class="appli__plateforme">${e(m.nom)}</p>
            <a class="bouton bouton--magasin" href="${e(app.applications[cle])}" rel="noopener" target="_blank">${e(m.libelle)} <span aria-hidden="true">↗</span></a>
          </div>`
            )
            .join("\n")}
        </div>
      </section>`;
}

export function pageAccueil({ site, apps }) {
  const contenu = `
    <section class="heros">
      <h1>${e(site.titre)}</h1>
      <p class="heros__slogan">${e(site.slogan)}</p>
      <p class="heros__intro">${e(site.introduction)}</p>
    </section>
    <section id="applications">
      <h2>Applications et services <span class="compteur">${apps.length}</span></h2>
      ${
        apps.length
          ? `<div class="grille">${apps.map((a) => carteApplication(a)).join("\n")}</div>`
          : `<p class="vide">Aucune application pour le moment.</p>`
      }
    </section>`;
  return gabarit({ site, description: site.description, contenu });
}

export function pageApplication({ site, app, apps }) {
  const prefixe = "../";
  const autres = apps.filter((a) => a.slug !== app.slug);
  const description = `Code de parrainage ${app.nom} : ${app.code}. ${app.avantagesFilleul[0]}`;
  const contenu = `
    <nav class="ariane" aria-label="Fil d'Ariane"><a href="${prefixe}">Accueil</a> › <span>${e(app.nom)}</span></nav>
    <article class="application">
      <header class="application__entete">
        <span class="application__emoji" aria-hidden="true">${e(app.emoji)}</span>
        <div>
          <p class="application__categorie">${e(app.categorie)}</p>
          <h1>Code de parrainage ${e(app.nom)}</h1>
          <p class="application__description">${e(app.description)}</p>
          <p><a class="lien-externe" href="${e(app.siteWeb)}" rel="noopener" target="_blank">${e(nomDomaine(app.siteWeb))} ↗</a></p>
        </div>
      </header>

      <section class="code" aria-labelledby="titre-code">
        <h2 id="titre-code">Mon code de parrainage</h2>
        <div class="code__bloc">
          <code class="code__valeur" id="code-parrainage">${e(app.code)}</code>
          <button class="bouton" type="button" data-copier="${e(app.code)}">Copier le code</button>
        </div>
        ${
          app.lienInscription
            ? `<div class="cta">
          <a class="bouton bouton--grand" href="${e(app.lienInscription)}" rel="noopener" target="_blank">${e(app.libelleInscription || `Ouvrir un compte ${app.nom}`)} <span aria-hidden="true">↗</span></a>
          <p class="cta__aide">Pensez à saisir le code <strong>${e(app.code)}</strong> pendant l'inscription.</p>
        </div>`
            : ""
        }
        ${
          app.lienParrainage
            ? `<p class="code__lien">Ou passez directement par mon lien de parrainage : <a class="bouton bouton--secondaire" href="${e(app.lienParrainage)}" rel="noopener" target="_blank">Ouvrir le lien ↗</a></p>`
            : ""
        }
        ${app.misAJour ? `<p class="code__maj">Vérifié le ${e(dateFr(app.misAJour))}</p>` : ""}
      </section>

      ${sectionApplications(app)}

      <div class="colonnes">
        <section class="bloc">
          <h2>🎉 Ce que vous gagnez</h2>
          ${liste(app.avantagesFilleul, "liste-coche")}
        </section>
        ${
          app.avantagesParrain.length
            ? `<section class="bloc bloc--discret">
          <h2>🤝 Ce que je gagne</h2>
          ${liste(app.avantagesParrain)}
          <p class="note">Je préfère être transparent : le parrainage me rapporte aussi quelque chose. C'est gagnant-gagnant.</p>
        </section>`
            : ""
        }
      </div>

      <section class="bloc">
        <h2>📝 Comment utiliser le code</h2>
        ${app.etapes.length ? `<ol class="etapes">${app.etapes.map((s) => `<li>${e(s)}</li>`).join("")}</ol>` : ""}
      </section>

      ${
        app.conditions.length
          ? `<section class="bloc bloc--conditions">
        <h2>ℹ️ Bon à savoir</h2>
        ${liste(app.conditions)}
      </section>`
          : ""
      }
    </article>

    ${
      autres.length
        ? `<section class="autres">
      <h2>Autres codes de parrainage</h2>
      <div class="grille">${autres.map((a) => carteApplication(a, prefixe)).join("\n")}</div>
    </section>`
        : ""
    }`;
  return gabarit({ site, titre: `Code de parrainage ${app.nom}`, description, contenu, prefixe, couleur: app.couleur });
}

export function page404({ site }) {
  const contenu = `
    <section class="heros">
      <h1>Page introuvable</h1>
      <p class="heros__intro">Cette page n'existe pas ou a été déplacée.</p>
      <p><a class="bouton" href="/">Retour à l'accueil</a></p>
    </section>`;
  return gabarit({ site, titre: "Page introuvable", description: site.description, contenu });
}
