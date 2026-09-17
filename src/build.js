// Génère le site statique dans dist/ à partir des fichiers apps/*.json.
// Aucune dépendance : uniquement les modules intégrés de Node.js.
//
//   node src/build.js          → construit le site
//   node src/build.js --check  → valide seulement les fichiers JSON

import { readdir, readFile, writeFile, mkdir, rm, cp } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { pageAccueil, pageApplication, page404 } from "./templates.js";

const racine = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dossierApps = path.join(racine, "apps");
const dossierAssets = path.join(racine, "assets");
const dossierSortie = path.join(racine, "dist");
const modeVerification = process.argv.includes("--check");

const CHAMPS_OBLIGATOIRES = ["slug", "nom", "categorie", "siteWeb", "code", "avantagesFilleul", "etapes"];
const CHAMPS_LISTES = ["avantagesFilleul", "avantagesParrain", "etapes", "conditions"];

function valider(app, fichier) {
  const erreurs = [];
  for (const champ of CHAMPS_OBLIGATOIRES) {
    if (app[champ] === undefined || app[champ] === null || app[champ] === "") {
      erreurs.push(`champ obligatoire manquant : "${champ}"`);
    }
  }
  for (const champ of CHAMPS_LISTES) {
    if (app[champ] !== undefined && !Array.isArray(app[champ])) {
      erreurs.push(`le champ "${champ}" doit être une liste`);
    }
  }
  if (typeof app.slug === "string" && !/^[a-z0-9-]+$/.test(app.slug)) {
    erreurs.push(`le slug "${app.slug}" ne doit contenir que des minuscules, chiffres et tirets`);
  }
  if (typeof app.slug === "string" && app.slug !== path.basename(fichier, ".json")) {
    erreurs.push(`le slug "${app.slug}" doit correspondre au nom du fichier "${fichier}"`);
  }
  if (app.applications !== undefined) {
    if (typeof app.applications !== "object" || Array.isArray(app.applications) || app.applications === null) {
      erreurs.push(`le champ "applications" doit être un objet de la forme { "ios": "...", "android": "..." }`);
    } else {
      for (const [cle, url] of Object.entries(app.applications)) {
        if (!["ios", "android"].includes(cle)) erreurs.push(`plateforme inconnue dans "applications" : "${cle}" (attendu : ios, android)`);
        else if (typeof url !== "string" || !/^https?:\/\//.test(url)) erreurs.push(`"applications.${cle}" doit être une URL commençant par http(s)://`);
      }
    }
  }
  for (const champ of ["siteWeb", "lienInscription", "lienParrainage"]) {
    if (app[champ] && !/^https?:\/\//.test(app[champ])) erreurs.push(`"${champ}" doit être une URL commençant par http(s)://`);
  }
  if (app.misAJour !== undefined && !/^\d{4}-\d{2}-\d{2}$/.test(app.misAJour)) {
    erreurs.push(`"misAJour" doit être au format AAAA-MM-JJ`);
  }
  return erreurs;
}

async function chargerApplications() {
  const fichiers = (await readdir(dossierApps)).filter((f) => f.endsWith(".json")).sort();
  const apps = [];
  let nbErreurs = 0;
  for (const fichier of fichiers) {
    const contenu = await readFile(path.join(dossierApps, fichier), "utf8");
    let app;
    try {
      app = JSON.parse(contenu);
    } catch (e) {
      console.error(`✗ apps/${fichier} : JSON invalide (${e.message})`);
      nbErreurs++;
      continue;
    }
    const erreurs = valider(app, fichier);
    if (erreurs.length) {
      nbErreurs += erreurs.length;
      for (const e of erreurs) console.error(`✗ apps/${fichier} : ${e}`);
      continue;
    }
    apps.push({
      avantagesParrain: [],
      conditions: [],
      emoji: "🎁",
      couleur: "#4f46e5",
      lienParrainage: null,
      lienInscription: null,
      applications: {},
      ...app,
    });
  }
  const slugs = new Set();
  for (const app of apps) {
    if (slugs.has(app.slug)) {
      console.error(`✗ slug en double : "${app.slug}"`);
      nbErreurs++;
    }
    slugs.add(app.slug);
  }
  if (nbErreurs) {
    console.error(`\n${nbErreurs} erreur(s) dans les fichiers d'applications.`);
    process.exit(1);
  }
  apps.sort((a, b) => a.nom.localeCompare(b.nom, "fr"));
  return apps;
}

async function construire() {
  const site = JSON.parse(await readFile(path.join(racine, "site.config.json"), "utf8"));
  const apps = await chargerApplications();
  console.log(`✓ ${apps.length} application(s) valide(s) : ${apps.map((a) => a.nom).join(", ")}`);
  if (modeVerification) return;

  await rm(dossierSortie, { recursive: true, force: true });
  await mkdir(dossierSortie, { recursive: true });
  await cp(dossierAssets, path.join(dossierSortie, "assets"), { recursive: true });

  await writeFile(path.join(dossierSortie, "index.html"), pageAccueil({ site, apps }));
  await writeFile(path.join(dossierSortie, "404.html"), page404({ site }));
  for (const app of apps) {
    const dossier = path.join(dossierSortie, app.slug);
    await mkdir(dossier, { recursive: true });
    await writeFile(path.join(dossier, "index.html"), pageApplication({ site, app, apps }));
  }
  await writeFile(path.join(dossierSortie, ".nojekyll"), "");
  // Nom de domaine personnalisé : fichier CNAME attendu par GitHub Pages.
  if (site.domaine) await writeFile(path.join(dossierSortie, "CNAME"), `${site.domaine}\n`);
  console.log(`✓ Site généré dans dist/ (${apps.length + 2} pages)`);
}

construire().catch((e) => {
  console.error(e);
  process.exit(1);
});
