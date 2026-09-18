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

function majuscule(texte) {
  return texte ? texte.charAt(0).toUpperCase() + texte.slice(1) : "";
}

function dateFr(iso, court = false) {
  if (!iso) return "";
  const [a, m, j] = iso.split("-").map(Number);
  return new Date(Date.UTC(a, m - 1, j)).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: court ? "short" : "long",
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

function urlAbsolue(site, chemin) {
  return (site.urlBase || "").replace(/\/?$/, "/") + chemin;
}

// `prefixe` est le chemin relatif vers la racine du site ("" à la racine, "../" dans une sous-page).
function gabarit({ site, titre, description, contenu, prefixe = "", couleur, chemin = "", jsonLd = [] }) {
  const titreComplet = titre ? `${titre} · ${site.titre}` : site.titre;
  const urlPage = site.urlBase ? urlAbsolue(site, chemin) : "";
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
  ${urlPage ? `<link rel="canonical" href="${e(urlPage)}">\n  <meta property="og:url" content="${e(urlPage)}">` : ""}
  <meta name="color-scheme" content="light dark">
  <link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' rx='28' fill='%230f6e56'/%3E%3Ctext x='50' y='68' font-size='52' text-anchor='middle' fill='white' font-family='sans-serif' font-weight='700'%3EP%3C/text%3E%3C/svg%3E">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Manrope:wght@500;600;700;800&display=swap">
  <link rel="stylesheet" href="${prefixe}assets/style.css">
  ${couleur ? `<style>:root{--accent:${e(couleur)}}</style>` : ""}
  ${jsonLd.map((o) => `<script type="application/ld+json">${JSON.stringify(o).replace(/</g, "\\u003c")}</script>`).join("\n  ")}
</head>
<body>
  <header class="entete">
    <div class="conteneur entete__contenu">
      <a class="marque" href="${prefixe}"><span class="marque__icone" aria-hidden="true"></span>${e(site.titre)}</a>
      <nav class="entete__nav" aria-label="Navigation principale">
        <a href="${prefixe}#applications">Applications</a>
        <a class="entete__nav-secondaire" href="${prefixe}#comment-ca-marche">Comment ça marche</a>
      </nav>
    </div>
  </header>
  <main class="conteneur">
${contenu}
  </main>
  <footer class="pied">
    <div class="conteneur">
      <p>${e(site.titre)}${site.auteur ? ` · ${e(site.auteur)}` : ""}. Les offres de parrainage sont définies par chaque service et peuvent changer : vérifiez toujours les conditions sur le site officiel avant de souscrire.</p>
      <p class="pied__credits">Les noms et logos des services appartiennent à leurs propriétaires respectifs. Certains pictogrammes proviennent d'<a href="https://arcticons.com" rel="noopener">Arcticons</a> (CC BY-SA 4.0) et de <a href="https://github.com/0xa3k5/web3icons" rel="noopener">web3icons</a> (MIT).</p>
    </div>
  </footer>
  <script src="${prefixe}assets/script.js" defer></script>
</body>
</html>
`;
}

// Logo SVG inline (pour hériter de la couleur via currentColor), sinon l'émoji de secours, sur une pastille teintée.
function logo(app, classe = "") {
  const contenu = app.logoSvg ? app.logoSvg : `<span class="logo__emoji">${e(app.emoji)}</span>`;
  return `<span class="logo ${classe}" aria-hidden="true">${contenu}</span>`;
}

function carteApplication(app, prefixe = "") {
  return `<a class="carte" href="${prefixe}${e(app.slug)}/" style="--accent:${e(app.couleur)}" data-categorie="${e(app.categorie)}">
      <span class="carte__haut">${logo(app)}<span class="pill">${e(app.categorie)}</span></span>
      <span class="carte__nom">${e(app.nom)}</span>
      <span class="carte__benef">${e(majuscule(app.accroche) || app.avantagesFilleul[0])}</span>
      <span class="carte__bas">
        <span class="carte__code">${e(app.code || "Lien direct")}</span>
        <span class="carte__cta">Voir le code <span aria-hidden="true">→</span></span>
      </span>
    </a>`;
}

// Carte « code du moment » dans le bandeau d'accueil.
function carteVedette(app) {
  if (!app) return "";
  const note = [majuscule(app.accroche), app.misAJour ? `vérifié le ${dateFr(app.misAJour, true)}` : ""].filter(Boolean).join(" · ");
  return `<aside class="vedette" style="--accent:${e(app.couleur)}" aria-label="Code de parrainage ${e(app.nom)}">
      <small class="etiquette">${app.code ? "Mon code de parrainage" : "Mon lien de parrainage"} · ${e(app.nom)}</small>
      ${
        app.code
          ? `<div class="vedette__code">${e(app.code)}</div>
      <button class="bouton bouton--accent bouton--pleine" type="button" data-copier="${e(app.code)}">Copier le code</button>`
          : `<a class="bouton bouton--accent bouton--pleine" href="${e(app.lienParrainage)}" rel="noopener" target="_blank">${e(app.libelleParrainage || `Profiter de l'offre ${app.nom}`)} <span aria-hidden="true">↗</span></a>`
      }
      <a class="bouton bouton--douce bouton--pleine" href="${e(app.slug)}/">Tous les détails ${e(app.nom)} <span aria-hidden="true">→</span></a>
      ${note ? `<small class="vedette__note">${e(note)}</small>` : ""}
    </aside>`;
}

const MAGASINS = {
  ios: { nom: "iPhone et iPad", libelle: "Télécharger sur l'App Store" },
  android: { nom: "Android", libelle: "Disponible sur Google Play" },
};

// Bloc « application mobile » : un QR code vers chaque boutique, plus un bouton pour ceux qui lisent la page sur leur téléphone.
function sectionApplications(app) {
  const entrees = Object.entries(MAGASINS).filter(([cle]) => app.applications?.[cle]);
  if (!entrees.length) return "";
  return `<section class="bloc applis" aria-labelledby="titre-applis">
        <h2 id="titre-applis">📱 L'application mobile ${e(app.nom)}</h2>
        <p class="bloc__intro">Scannez le QR code avec votre téléphone, ou appuyez sur le bouton si vous lisez cette page depuis votre mobile.</p>
        <div class="applis__grille">
          ${entrees
            .map(
              ([cle, m]) => `<div class="appli">
            <a class="appli__qr" href="${e(app.applications[cle])}" rel="noopener" target="_blank" aria-label="${e(m.libelle)} (QR code)">
              ${qrSvg(app.applications[cle], { taille: 120, titre: `QR code : ${m.libelle}` })}
            </a>
            <div class="appli__texte">
              <p class="appli__plateforme">${e(m.nom)}</p>
              <a class="bouton bouton--primaire" href="${e(app.applications[cle])}" rel="noopener" target="_blank">${e(m.libelle)} <span aria-hidden="true">↗</span></a>
            </div>
          </div>`
            )
            .join("\n")}
        </div>
      </section>`;
}

function sectionFaq(app) {
  if (!app.faq.length) return "";
  return `<section class="bloc faq" aria-labelledby="titre-faq">
        <h2 id="titre-faq">❓ Questions fréquentes</h2>
        ${app.faq.map((q) => `<details class="faq__item"><summary>${e(q.question)}</summary><p>${e(q.reponse)}</p></details>`).join("\n        ")}
      </section>`;
}

// Titre SEO d'une page application : « Code parrainage Fortuneo 2026 : prime de bienvenue ».
function titreSeo(app) {
  const annee = app.misAJour ? ` ${app.misAJour.slice(0, 4)}` : "";
  const base = app.code ? `Code parrainage ${app.nom}${annee}` : `Lien parrainage ${app.nom}${annee}`;
  return app.accroche ? `${base} : ${app.accroche}` : base;
}

function descriptionSeo(app) {
  const debut = app.code ? `Code parrainage ${app.nom} : ${app.code}.` : `Lien de parrainage ${app.nom}.`;
  const accroche = app.accroche ? ` ${majuscule(app.accroche)}.` : "";
  const fin = app.misAJour ? ` Étapes et conditions vérifiées le ${dateFr(app.misAJour)}.` : "";
  let d = `${debut}${accroche} ${app.avantagesFilleul[0]}${fin}`;
  if (d.length > 160) d = `${debut}${accroche}${fin}`;
  return d;
}

function jsonLdApplication(site, app) {
  if (!site.urlBase) return [];
  const url = urlAbsolue(site, `${app.slug}/`);
  const donnees = [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Accueil", item: urlAbsolue(site, "") },
        { "@type": "ListItem", position: 2, name: app.nom, item: url },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "HowTo",
      name: app.code ? `Comment utiliser le code de parrainage ${app.nom}` : `Comment profiter du parrainage ${app.nom}`,
      description: descriptionSeo(app),
      inLanguage: site.langue || "fr",
      step: app.etapes.map((texte, i) => ({ "@type": "HowToStep", position: i + 1, text: texte })),
    },
  ];
  if (app.faq.length) {
    donnees.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: app.faq.map((q) => ({ "@type": "Question", name: q.question, acceptedAnswer: { "@type": "Answer", text: q.reponse } })),
    });
  }
  return donnees;
}

export function pageAccueil({ site, apps }) {
  const derniere = apps.map((a) => a.misAJour).filter(Boolean).sort().pop();
  const vedette = apps.find((a) => a.slug === site.applicationVedette) || apps[0];
  const categories = [...new Set(apps.map((a) => a.categorie))].sort((a, b) => a.localeCompare(b, "fr"));
  const contenu = `
    <section class="heros" aria-labelledby="titre-accueil">
      <div class="heros__texte">
        <span class="badge"><b aria-hidden="true"></b>${apps.length} application${apps.length > 1 ? "s" : ""}${derniere ? ` · vérifié le ${e(dateFr(derniere))}` : ""}</span>
        <h1 id="titre-accueil">${e(site.titreAccueil || site.titre)}${site.titreAccueilAccent ? ` <em>${e(site.titreAccueilAccent)}</em>` : ""}</h1>
        <p class="heros__sous">${e(site.slogan)}</p>
        <div class="heros__actions">
          <a class="bouton bouton--primaire" href="#applications">Voir les applications <span aria-hidden="true">↓</span></a>
          <a class="bouton bouton--secondaire" href="#comment-ca-marche">Comment ça marche</a>
        </div>
        <dl class="chiffres">
          <div><dt>${apps.length}</dt><dd>service${apps.length > 1 ? "s" : ""}</dd></div>
          <div><dt>100 %</dt><dd>gratuit</dd></div>
          <div><dt>2 min</dt><dd>pour en profiter</dd></div>
        </dl>
      </div>
      ${carteVedette(vedette)}
    </section>

    <section id="applications" class="section" aria-labelledby="titre-applications">
      <div class="section__entete">
        <h2 id="titre-applications">Applications et services</h2>
        ${
          categories.length > 1
            ? `<div class="filtres" role="group" aria-label="Filtrer par catégorie">
          <button class="filtre filtre--actif" type="button" data-filtre="">Tous</button>
          ${categories.map((c) => `<button class="filtre" type="button" data-filtre="${e(c)}">${e(c)}</button>`).join("\n          ")}
        </div>`
            : ""
        }
      </div>
      ${apps.length ? `<div class="grille">${apps.map((a) => carteApplication(a)).join("\n")}</div>` : `<p class="vide">Aucune application pour le moment.</p>`}
      <p class="vide filtres__vide" hidden>Aucune application dans cette catégorie.</p>
    </section>

    <section id="comment-ca-marche" class="comment" aria-labelledby="titre-comment">
      <h2 id="titre-comment">Comment ça marche</h2>
      <div class="comment__etape"><b aria-hidden="true">1</b><p><strong>Choisissez un service</strong>Chaque page détaille ce que vous gagnez, et ce que je gagne aussi.</p></div>
      <div class="comment__etape"><b aria-hidden="true">2</b><p><strong>Copiez le code ou suivez le lien</strong>Un bouton suffit, ou scannez le QR code pour installer l'application.</p></div>
      <div class="comment__etape"><b aria-hidden="true">3</b><p><strong>Inscrivez-vous et profitez</strong>La prime ou le bonus est appliqué automatiquement une fois les conditions remplies.</p></div>
    </section>`;
  const noms = apps.map((a) => a.nom);
  const titre = noms.length ? `Codes et liens de parrainage ${noms.slice(0, 4).join(", ")}${noms.length > 4 ? "…" : ""}` : site.titreAccueil || site.titre;
  const jsonLd = site.urlBase
    ? [{ "@context": "https://schema.org", "@type": "WebSite", name: site.titre, url: urlAbsolue(site, ""), description: site.description, inLanguage: site.langue || "fr" }]
    : [];
  return gabarit({ site, titre, description: site.description, contenu, chemin: "", jsonLd });
}

export function pageApplication({ site, app, apps }) {
  const prefixe = "../";
  const autres = apps.filter((a) => a.slug !== app.slug);
  const titre = app.code ? `Code de parrainage ${app.nom}` : `Parrainage ${app.nom}`;
  const description = descriptionSeo(app);
  const notes = [
    app.code && app.lienParrainage ? `Le code ${app.code} est pré-rempli en passant par le lien.` : "",
    app.code && app.lienInscription && !app.lienParrainage ? `Pensez à saisir le code ${app.code} pendant l'inscription.` : "",
    app.misAJour ? `Vérifié le ${dateFr(app.misAJour)}.` : "",
  ].filter(Boolean);
  const contenu = `
    <nav class="ariane" aria-label="Fil d'Ariane"><a href="${prefixe}">Accueil</a> › <span>${e(app.nom)}</span></nav>
    <article class="application">
      <div class="app-entete">
        <header class="app-entete__texte">
          <div class="app-entete__ligne">${logo(app, "logo--grand")}<span class="pill">${e(app.categorie)}</span></div>
          <h1>${e(titre)}</h1>
          ${app.accroche ? `<p class="app-entete__accroche">${e(majuscule(app.accroche))}</p>` : ""}
          <p class="app-entete__desc">${e(app.description)}</p>
          <a class="badge" href="${e(app.siteWeb)}" rel="noopener" target="_blank"><b aria-hidden="true"></b>${e(nomDomaine(app.siteWeb))} <span aria-hidden="true">↗</span></a>
        </header>

        <section class="codecard" aria-labelledby="titre-code">
          ${
            app.code
              ? `<small class="etiquette" id="titre-code">Mon code de parrainage</small>
          <div class="codecard__code" id="code-parrainage">${e(app.code)}</div>
          <button class="bouton bouton--accent bouton--pleine" type="button" data-copier="${e(app.code)}">Copier le code</button>`
              : `<small class="etiquette" id="titre-code">Mon lien de parrainage</small>
          <p class="codecard__explication">Pas de code à saisir : l'avantage est appliqué automatiquement en passant par ce lien.</p>`
          }
          ${
            app.lienParrainage
              ? `<a class="bouton ${app.code ? "bouton--douce" : "bouton--accent"} bouton--pleine" href="${e(app.lienParrainage)}" rel="noopener" target="_blank">${e(app.libelleParrainage || (app.code ? "Utiliser mon lien de parrainage" : `Profiter de l'offre ${app.nom}`))} <span aria-hidden="true">↗</span></a>
          ${app.code ? "" : `<button class="bouton bouton--douce bouton--pleine" type="button" data-copier="${e(app.lienParrainage)}">Copier le lien</button>`}`
              : ""
          }
          ${
            app.lienInscription
              ? `<a class="bouton ${app.lienParrainage || app.code ? "bouton--douce" : "bouton--accent"} bouton--pleine" href="${e(app.lienInscription)}" rel="noopener" target="_blank">${e(app.libelleInscription || `Ouvrir un compte ${app.nom}`)} <span aria-hidden="true">↗</span></a>`
              : ""
          }
          ${notes.length ? `<small class="codecard__note">${e(notes.join(" "))}</small>` : ""}
        </section>
      </div>

      <div class="colonnes">
        <section class="bloc">
          <h2>🎉 Ce que vous gagnez</h2>
          ${liste(app.avantagesFilleul, "liste-coche")}
        </section>
        ${
          app.avantagesParrain.length
            ? `<section class="bloc bloc--discret">
          <h2>🤝 Ce que je gagne</h2>
          ${liste(app.avantagesParrain, "liste-coche")}
          <p class="note">Je préfère être transparent : le parrainage me rapporte aussi quelque chose. C'est gagnant-gagnant.</p>
        </section>`
            : ""
        }
      </div>

      <section class="bloc">
        <h2>📝 ${app.code ? "Comment utiliser le code" : "Comment profiter de l'offre"}</h2>
        ${app.etapes.length ? `<ol class="etapes">${app.etapes.map((s) => `<li>${e(s)}</li>`).join("")}</ol>` : ""}
      </section>

      ${sectionApplications(app)}

      ${
        app.conditions.length
          ? `<section class="bloc bloc--conditions">
        <h2>ℹ️ Bon à savoir</h2>
        ${liste(app.conditions)}
      </section>`
          : ""
      }

      ${sectionFaq(app)}
    </article>

    ${
      autres.length
        ? `<section class="autres" aria-labelledby="titre-autres">
      <h2 id="titre-autres">Autres codes de parrainage</h2>
      <div class="grille">${autres.map((a) => carteApplication(a, prefixe)).join("\n")}</div>
    </section>`
        : ""
    }`;
  return gabarit({ site, titre: titreSeo(app), description, contenu, prefixe, couleur: app.couleur, chemin: `${app.slug}/`, jsonLd: jsonLdApplication(site, app) });
}

export function page404({ site }) {
  const racine = site.urlBase ? site.urlBase.replace(/\/?$/, "/") : "/";
  const contenu = `
    <section class="heros heros--simple">
      <div class="heros__texte">
        <h1>Page introuvable</h1>
        <p class="heros__sous">Cette page n'existe pas ou a été déplacée.</p>
        <p><a class="bouton bouton--primaire" href="${e(racine)}">Retour à l'accueil</a></p>
      </div>
    </section>`;
  return gabarit({ site, titre: "Page introuvable", description: site.description, contenu, prefixe: racine });
}

export function sitemap({ site, apps }) {
  const derniere = apps.map((a) => a.misAJour).filter(Boolean).sort().pop();
  const entree = (chemin, lastmod, priorite) =>
    `  <url><loc>${e(urlAbsolue(site, chemin))}</loc>${lastmod ? `<lastmod>${lastmod}</lastmod>` : ""}<priority>${priorite}</priority></url>`;
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[entree("", derniere, "1.0"), ...apps.map((a) => entree(`${a.slug}/`, a.misAJour, "0.8"))].join("\n")}
</urlset>
`;
}

export function robots({ site }) {
  return `User-agent: *
Allow: /

Sitemap: ${urlAbsolue(site, "sitemap.xml")}
`;
}
