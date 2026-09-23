# Parrainage.online : dossier de reprise

Ce document résume tout ce qu'il faut savoir pour maintenir, mettre à jour ou faire évoluer le site, avec un autre assistant d'intelligence artificielle ou seul. Il complète le `README.md`, qui reste la documentation technique de référence.

Dernière mise à jour : 23 septembre 2026.

---

## 1. Le projet en bref

- **Objectif** : partager publiquement les codes et liens de parrainage des applications utilisées par le propriétaire, pour que n'importe qui profite des avantages filleul (primes, bonus, mois offerts).
- **Langue** : tout le site est en français.
- **Principe** : une page par application, générée automatiquement à partir d'un fichier JSON. Ajouter une application ne demande aucune modification du code.
- **Adresse publique** : https://parrainage.online/
- **Ancienne adresse** (redirige vers le domaine) : https://semikovim.github.io/Claude-/

## 2. Où se trouve quoi

| Élément | Emplacement |
|---|---|
| Code source | Dépôt GitHub `SemikoVim/Claude-` |
| Branche de travail | `claude/referral-codes-website-sxvp8w` |
| Branche publiée | `main` (contient le même historique) |
| Hébergement | GitHub Pages, source « GitHub Actions » |
| Nom de domaine | `parrainage.online`, acheté chez OVHcloud |
| Certificat HTTPS | Fourni gratuitement par GitHub Pages, « Enforce HTTPS » activé |

## 3. Technique

Site **statique**, généré par un petit script Node.js **sans aucune dépendance** à installer (Node 18 ou plus suffit).

```bash
npm run build   # génère le site dans dist/
npm run serve   # génère puis prévisualise sur http://localhost:8080/
npm run check   # valide uniquement les fichiers apps/*.json
```

### Arborescence

```
apps/                      un fichier JSON par application (le seul endroit à éditer au quotidien)
apps/_modele.json.exemple  modèle à copier pour une nouvelle application
assets/style.css           apparence (modes clair et sombre automatiques)
assets/script.js           boutons « Copier le code / le lien » et filtres par catégorie
assets/logos/<slug>.svg    logo de chaque application (remplace l'émoji s'il existe)
src/build.js               génération + validation des JSON, sitemap, robots, CNAME
src/templates.js           gabarits HTML (accueil, page application, 404), SEO, données structurées
src/qr.js                  QR codes en SVG générés au build
src/vendor/qrcode.js       encodeur QR (qrcode-generator 1.4.4, licence MIT), copié dans le dépôt
src/serve.js               serveur local de prévisualisation
site.config.json           titre, slogan, adresse, domaine, application mise en avant
.github/workflows/         check.yml (validation) et deploy.yml (publication Pages)
```

### Configuration du site (`site.config.json`)

| Champ | Valeur actuelle | Rôle |
|---|---|---|
| `titre` | Parrainage.online | Nom du site |
| `titreAccueil` + `titreAccueilAccent` | « Des codes de parrainage » + « pour tout le monde » | Grand titre d'accueil, la 2e partie en dégradé vert |
| `slogan` | Primes de bienvenue, bonus… | Sous-titre de l'accueil |
| `description` | Codes et liens de parrainage Fortuneo… | Description pour les moteurs de recherche |
| `urlBase` | https://parrainage.online/ | Adresse publique (sitemap, canonical, page 404) |
| `domaine` | parrainage.online | Génère le fichier `CNAME` pour GitHub Pages |
| `applicationVedette` | fortuneo | Slug de l'application affichée dans la carte du bandeau d'accueil |
| `auteur` | (vide) | Nom affiché en pied de page si renseigné |

### Champs d'un fichier d'application (`apps/<slug>.json`)

| Champ | Obligatoire | Rôle |
|---|---|---|
| `slug` | oui | Identifiant = nom du fichier = adresse de la page (`/slug/`). Minuscules, chiffres, tirets. |
| `nom`, `categorie`, `siteWeb` | oui | Nom affiché, catégorie (sert aux filtres), site officiel |
| `code` | oui* | Code de parrainage. *Facultatif si `lienParrainage` existe. |
| `lienParrainage` | non | Lien de parrainage. Devient le bouton principal s'il n'y a pas de code. |
| `libelleParrainage` | non | Texte du bouton du lien de parrainage |
| `lienInscription`, `libelleInscription` | non | Bouton vers la page de création de compte |
| `applications` | non | `{ "ios": "...", "android": "..." }` : un QR code et un bouton par boutique |
| `accroche` | non | Bénéfice en quelques mots, repris dans le titre SEO et sur les cartes |
| `description` | non | Présentation du service |
| `avantagesFilleul` | oui | Liste des avantages pour la personne parrainée |
| `avantagesParrain` | non | Ce que le parrain reçoit (transparence) |
| `etapes` | oui | Étapes pour utiliser le code |
| `conditions` | non | Bloc « Bon à savoir » |
| `faq` | non | Liste de `{ "question", "reponse" }`, aussi envoyée à Google (FAQPage) |
| `couleur` | non | Couleur de marque (hexadécimal) |
| `emoji` | non | Icône de secours si aucun logo SVG |
| `logo` | non | Nom d'un autre fichier dans `assets/logos/` |
| `misAJour` | non | Date de vérification `AAAA-MM-JJ`, affichée, et utilisée dans le titre SEO (année) et le sitemap |

## 4. Les applications en ligne

| Application | Code | Lien de parrainage / inscription |
|---|---|---|
| Fortuneo | 12943425 | Inscription : https://www.fortuneo.fr/compte-bancaire |
| Crédit Agricole | 9N9KDC6 | https://www.credit-agricole.fr/ca-pyrenees-gascogne/particulier/campagnes/parrainage.html?code-parrainage=9N9KDC6&offre=parrainagenatio |
| Crypto.com | xqp6yvffm7 | https://crypto.com/app/xqp6yvffm7 |
| Coinbase | 5EFVAAY | https://coinbase.com/join/5EFVAAY?src=ios-link |
| Trade Republic | (lien seul) | https://refnocode.trade.re/5h2z4qf4 |
| Spotify | (lien seul, 3 mois Premium) | https://open.spotify.com/referral/0039885d652f8c97dc0f85fbb57e26139b8f50b7333b1dffc1fa0a?si=xb8o-yWiTRqfOfSF9wbskA&utm_source=copy-link&locale=fr |

Le lien App Store de Fortuneo a été fourni par le propriétaire : https://apps.apple.com/fr/app/fortuneo-ma-banque-en-ligne/id385730327

## 5. Publication et déploiement

- **Normalement** : tout push sur `main` déclenche le workflow « Déployer sur GitHub Pages », qui construit et publie le site en environ une minute.
- **Point important** : l'environnement GitHub `github-pages` n'accepte que les déploiements depuis la **branche par défaut** du dépôt. Au moment de la rédaction, la branche par défaut était encore `claude/referral-codes-website-sxvp8w`. Tant que ce n'est pas changé, un push sur `main` échoue à l'étape « deploy » et il faut lancer le workflow à la main depuis l'onglet Actions en choisissant cette branche.
- **Correction recommandée (une seule fois)** : Settings du dépôt → General → Default branch → choisir `main`. Ensuite, travailler uniquement sur `main`, et la branche `claude/...` peut être supprimée.
- **Méthode utilisée jusqu'ici** : pousser sur les deux branches en même temps, puis lancer le déploiement manuellement :

```bash
git push origin claude/referral-codes-website-sxvp8w claude/referral-codes-website-sxvp8w:main
```

## 6. Nom de domaine (zone DNS chez OVHcloud)

Enregistrements ajoutés pour pointer vers GitHub Pages :

| Type | Sous-domaine | Cible |
|---|---|---|
| A | (vide) | 185.199.108.153 |
| A | (vide) | 185.199.109.153 |
| A | (vide) | 185.199.110.153 |
| A | (vide) | 185.199.111.153 |
| CNAME | www | semikovim.github.io. |

Enregistrements supprimés : les A et AAAA d'OVH (51.91.236.255 et 2001:41d0:301::29) sur la racine et `www`, et le TXT « 3|welcome » sur `www`.

Enregistrements conservés et à ne pas toucher : NS, MX, SPF, SRV, et tous les CNAME liés à la messagerie (`mail`, `smtp`, `imap`, `pop3`, `autoconfig`, `autodiscover`, `_domainkey`).

Dans GitHub : Settings → Pages → Custom domain = `parrainage.online`, « Enforce HTTPS » coché.

## 7. Historique des étapes réalisées

1. Création du site statique, page Fortuneo, bouton de copie, thème sombre automatique.
2. Bouton d'inscription, QR codes iOS et Android, optimisation téléphone.
3. Mise en ligne sur GitHub Pages, puis domaine `parrainage.online` avec HTTPS.
4. Ajout de Crédit Agricole, Crypto.com, Coinbase, Trade Republic et Spotify ; gestion des services qui n'ont qu'un lien.
5. Fonds gris léger (clair) et gris foncé (sombre), contrastes vérifiés selon les règles WCAG AA.
6. Logos des applications à la place des émojis.
7. Référencement : sitemap, robots.txt, titres et descriptions optimisés, données structurées (WebSite, BreadcrumbList, HowTo, FAQPage), FAQ par application.
8. Refonte graphique « moderne » validée sur maquette : bandeau d'accueil avec carte vedette, cartes enrichies, filtres par catégorie, bloc « Comment ça marche », page application revue, police Manrope.

## 8. Reste à faire (par ordre de priorité)

1. **Passer `main` en branche par défaut** (voir section 5).
2. **Déclarer le site à Google Search Console** : propriété de type « Domaine » `parrainage.online`, validation par un enregistrement TXT chez OVH, puis soumettre `https://parrainage.online/sitemap.xml`. Faire de même sur Bing Webmaster Tools (import possible depuis Search Console).
3. **Protéger le domaine sur GitHub** : https://github.com/settings/pages → Add a domain → créer chez OVH le TXT `_github-pages-challenge-semikovim` fourni par GitHub.
4. **Relire les contenus rédigés sans vérification** (le réseau de l'assistant bloquait les sites officiels) : réponses de FAQ, étapes, liens des boutiques d'applications. Points sensibles : délai de conservation de l'action Trade Republic, éligibilité Spotify, validité de l'offre Crédit Agricole selon la caisse régionale.
5. **Ajouter les montants réels des primes** et les tenir à jour, en modifiant `misAJour` à chaque vérification.
6. **Logos officiels** pour Fortuneo, Crédit Agricole et Trade Republic : les actuels sont des pictogrammes simplifiés (Arcticons). Déposer le SVG officiel dans `assets/logos/<slug>.svg`.
7. **Lien App Store du Crédit Agricole** : seul Android est renseigné.
8. **Faire connaître le site** : liens dans les profils publics, réponses sur Dealabs et forums finance (en respectant leurs règles sur les liens de parrainage), un post à chaque nouvelle application.

## 9. Recettes courantes

**Ajouter une application**
1. Copier `apps/_modele.json.exemple` vers `apps/<slug>.json` et le remplir.
2. Optionnel : déposer `assets/logos/<slug>.svg`.
3. `npm run check`, puis `npm run build` et `npm run serve` pour vérifier.
4. Commit, push sur `main`, vérifier le déploiement dans l'onglet Actions.

**Mettre à jour une offre** : modifier le fichier JSON concerné et la date `misAJour`.

**Changer l'application mise en avant sur l'accueil** : modifier `applicationVedette` dans `site.config.json`.

**Retirer une application** : supprimer `apps/<slug>.json` (et son logo). La page disparaît au prochain build.

## 10. Règles et préférences du propriétaire

- Tout en français.
- Site lisible et fonctionnel sur téléphone avant tout : boutons d'au moins 48 px, aucun défilement horizontal.
- Modes clair et sombre automatiques selon l'appareil.
- Ne rien publier ni modifier sur le site sans accord quand il s'agit d'une simple demande d'aperçu.
- Les propositions générées par Canva ont été écartées (textes erronés, logos faux) ; la maquette HTML réalisée à la main a été retenue et appliquée.
- Transparence : chaque page indique ce que le parrain gagne aussi.
- Mentions obligatoires en pied de page : les marques appartiennent à leurs propriétaires ; pictogrammes Arcticons (CC BY-SA 4.0) et web3icons (MIT).

## 11. Texte à donner à un nouvel assistant

> Je maintiens le site statique https://parrainage.online/, dont le code est dans le dépôt GitHub `SemikoVim/Claude-`. Lis d'abord les fichiers `REPRISE.md` et `README.md` à la racine du dépôt : ils décrivent l'architecture (générateur Node.js sans dépendance, un fichier JSON par application dans `apps/`, gabarits dans `src/templates.js`, styles dans `assets/style.css`), la publication via GitHub Pages et la configuration DNS chez OVHcloud. Le site est entièrement en français et doit rester parfaitement utilisable sur téléphone. Avant de pousser une modification, lance `npm run check` et `npm run build`, et vérifie le rendu avec `npm run serve`. Voici ce que je veux faire maintenant : [décrire la demande].
