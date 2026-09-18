// Bouton « Copier le code » / « Copier le lien » : copie dans le presse-papiers avec un retour visuel.
document.querySelectorAll("[data-copier]").forEach((bouton) => {
  const libelle = bouton.textContent;
  bouton.addEventListener("click", async () => {
    const valeur = bouton.dataset.copier;
    try {
      await navigator.clipboard.writeText(valeur);
      bouton.textContent = valeur.startsWith("http") ? "Lien copié ✓" : "Code copié ✓";
    } catch {
      // Repli pour les navigateurs sans API presse-papiers : on sélectionne le code.
      const cible = document.getElementById("code-parrainage");
      if (cible) {
        const plage = document.createRange();
        plage.selectNodeContents(cible);
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(plage);
      }
      bouton.textContent = "Sélectionnez et copiez";
    }
    bouton.classList.add("bouton--copie");
    setTimeout(() => {
      bouton.textContent = libelle;
      bouton.classList.remove("bouton--copie");
    }, 2500);
  });
});

// Filtres par catégorie sur l'accueil.
const filtres = document.querySelectorAll(".filtre");
if (filtres.length) {
  const cartes = document.querySelectorAll("#applications .carte");
  const vide = document.querySelector(".filtres__vide");
  filtres.forEach((filtre) => {
    filtre.addEventListener("click", () => {
      const categorie = filtre.dataset.filtre;
      filtres.forEach((f) => f.classList.toggle("filtre--actif", f === filtre));
      let visibles = 0;
      cartes.forEach((carte) => {
        const affichee = !categorie || carte.dataset.categorie === categorie;
        carte.hidden = !affichee;
        if (affichee) visibles++;
      });
      if (vide) vide.hidden = visibles > 0;
    });
  });
}
