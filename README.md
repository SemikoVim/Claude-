# Mes codes de parrainage

Site statique, en français, pour partager publiquement les codes de parrainage des applications et services que j'utilise. Chaque application a sa propre page qui présente le code, les avantages pour le filleul et la marche à suivre.

Aucune dépendance à installer : seul [Node.js](https://nodejs.org) (version 18 ou plus) est nécessaire.

## Démarrage rapide

```bash
npm run build   # génère le site dans dist/
npm run serve   # génère puis prévisualise sur http://localhost:8080/
npm run check   # valide uniquement les fichiers d'applications
```

## Ajouter une application

C'est le seul travail à faire pour créer une nouvelle page : **un fichier JSON par application** dans le dossier `apps/`.

1. Copiez `apps/_modele.json.exemple` vers `apps/<slug>.json` (par exemple `apps/revolut.json`).
2. Remplissez les champs. Le `slug` doit être identique au nom du fichier, en minuscules, chiffres et tirets uniquement : il devient l'adresse de la page (`/revolut/`).
3. Lancez `npm run check` pour vérifier le fichier, puis `npm run build`.

La page d'accueil liste automatiquement toutes les applications, classées par ordre alphabétique, et chaque page renvoie vers les autres.

### Champs d'un fichier d'application

| Champ | Obligatoire | Description |
|---|---|---|
| `slug` | oui | Identifiant de la page, identique au nom du fichier. |
| `nom` | oui | Nom affiché de l'application. |
| `categorie` | oui | Catégorie courte (Banque en ligne, Streaming, Mobilité...). |
| `siteWeb` | oui | Adresse du site officiel. |
| `code` | oui* | Le code de parrainage. *Facultatif si `lienParrainage` est renseigné (certains services n'ont qu'un lien). |
| `avantagesFilleul` | oui | Liste des avantages pour la personne qui utilise le code. Le premier sert de résumé sur l'accueil. |
| `etapes` | oui | Liste ordonnée des étapes pour utiliser le code. |
| `description` | non | Présentation du service. |
| `avantagesParrain` | non | Ce que le parrain reçoit. Liste vide pour masquer la section. |
| `conditions` | non | Conditions, restrictions ou remarques. |
| `lienInscription` | non | Lien vers la page de création de compte : affiche un gros bouton sous le code. |
| `libelleInscription` | non | Texte du bouton d'inscription (par défaut « Ouvrir un compte <nom> »). |
| `applications` | non | Liens vers l'application mobile : `{ "ios": "...", "android": "..." }`. Un QR code est généré pour chaque lien fourni. |
| `lienParrainage` | non | Lien de parrainage direct, si le service en fournit un. Devient le bouton principal s'il n'y a pas de code. |
| `libelleParrainage` | non | Texte du bouton du lien de parrainage. |
| `logo` | non | Nom d'un fichier SVG dans `assets/logos/`. Par défaut, le fichier `assets/logos/<slug>.svg` est utilisé s'il existe. |
| `emoji` | non | Icône de secours quand aucun logo n'est disponible (par défaut 🎁). |
| `couleur` | non | Couleur d'accent de la page, au format hexadécimal. |
| `accroche` | non | Bénéfice en quelques mots (« prime de bienvenue à l'ouverture »), repris dans le titre de la page pour les moteurs de recherche et sous le titre principal. |
| `faq` | non | Liste de `{ "question": "...", "reponse": "..." }` affichée en bas de page et transmise aux moteurs de recherche (données structurées FAQPage). |
| `misAJour` | non | Date de dernière vérification, au format `AAAA-MM-JJ`. Sert aussi de date de modification dans le sitemap. |

### Logos

Déposez un fichier `assets/logos/<slug>.svg` et il remplace automatiquement l'émoji sur la carte d'accueil et en tête de page. Le SVG est inséré tel quel dans la page : un logo monochrome qui utilise `currentColor` prend la couleur d'accent de l'application (et s'éclaircit en mode sombre).

Sources des logos actuels : Coinbase et Crypto.com viennent de [web3icons](https://github.com/0xa3k5/web3icons) (MIT), Spotify de [gilbarbara/logos](https://github.com/gilbarbara/logos), Fortuneo, Crédit Agricole et Trade Republic d'[Arcticons](https://arcticons.com) (CC BY-SA 4.0, mention obligatoire en pied de page). Les marques restent la propriété de leurs titulaires.

## Personnaliser le site

Le titre, le titre d'accueil (`titreAccueil` + `titreAccueilAccent`, la partie mise en couleur), le slogan, l'application mise en avant dans le bandeau (`applicationVedette`, un slug) et le nom de l'auteur se modifient dans `site.config.json`. Le champ `urlBase` doit contenir l'adresse publique du site (utilisée pour la page 404 et les balises de partage). Le champ `domaine` contient le nom de domaine personnalisé : il génère le fichier `CNAME` dans le site publié. Laissez-le vide si le site est servi sur `<utilisateur>.github.io/<dépôt>/`.

- `assets/style.css` : apparence (thèmes clair et sombre automatiques).
- `assets/script.js` : bouton « Copier le code ».
- `src/templates.js` : structure HTML des pages.
- `src/build.js` : génération et validation.
- `src/qr.js` : QR codes en SVG (s'appuie sur `src/vendor/qrcode.js`, bibliothèque MIT vendue telle quelle).

## Référencement

Le build génère `sitemap.xml` et `robots.txt` (si `urlBase` est renseigné), des balises `title`, `description`, `canonical` et Open Graph par page, et des données structurées schema.org : `WebSite` sur l'accueil, `BreadcrumbList`, `HowTo` (les étapes) et `FAQPage` (le champ `faq`) sur chaque application. Après une mise en ligne, soumettez le sitemap dans Google Search Console et Bing Webmaster Tools.

## Publication

Le site est prêt pour [GitHub Pages](https://pages.github.com/) : le workflow `.github/workflows/deploy.yml` génère et publie `dist/` à chaque push sur `main`. Pour l'activer, allez dans **Settings → Pages** du dépôt et choisissez **GitHub Actions** comme source.

### Nom de domaine personnalisé

Le site est servi sur **https://parrainage.online/**. Le domaine est géré chez OVHcloud et pointe vers GitHub Pages :

| Type | Sous-domaine | Cible |
|---|---|---|
| A | (vide) | 185.199.108.153 |
| A | (vide) | 185.199.109.153 |
| A | (vide) | 185.199.110.153 |
| A | (vide) | 185.199.111.153 |
| CNAME | www | semikovim.github.io. |

Le domaine est déclaré dans le dépôt (Settings → Pages → Custom domain) avec « Enforce HTTPS » activé.

Le dossier `dist/` généré est un site statique classique : il peut aussi être hébergé sur Netlify, Vercel, Cloudflare Pages ou n'importe quel hébergeur de fichiers.

## Structure du projet

```
apps/                  un fichier JSON par application (la seule chose à éditer au quotidien)
assets/                feuille de style et script copiés tels quels dans dist/assets/
src/build.js           génère dist/ à partir de apps/ et site.config.json
src/templates.js       gabarits HTML (accueil, page application, page 404)
src/qr.js              génération des QR codes en SVG
src/vendor/            encodeur QR (qrcode-generator, MIT) copié dans le dépôt
src/serve.js           serveur local de prévisualisation
site.config.json       titre, slogan, introduction du site
.github/workflows/     vérification des JSON et déploiement GitHub Pages
```
