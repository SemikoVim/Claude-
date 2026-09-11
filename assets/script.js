// Bouton « Copier le code » : copie dans le presse-papiers avec un retour visuel.
document.querySelectorAll("[data-copier]").forEach((bouton) => {
  const libelle = bouton.textContent;
  bouton.addEventListener("click", async () => {
    const code = bouton.dataset.copier;
    try {
      await navigator.clipboard.writeText(code);
      bouton.textContent = "Code copié ✓";
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
      bouton.textContent = "Sélectionnez et copiez le code";
    }
    bouton.classList.add("bouton--copie");
    setTimeout(() => {
      bouton.textContent = libelle;
      bouton.classList.remove("bouton--copie");
    }, 2500);
  });
});
