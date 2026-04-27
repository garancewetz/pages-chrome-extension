# Installer Mosaic Dashboard sur ton ordinateur

Ce document explique comment installer l'extension Chrome **Mosaic Dashboard**
sur ton ordinateur. L'installation prend 2 minutes.

## Ce dont tu as besoin

- Le fichier `mosaic-extension.zip` (que je t'ai envoyé).
- Google Chrome (ou Microsoft Edge, ça marche aussi).

## Étape 1 — Ranger l'extension dans un dossier stable

1. Crée un dossier dans **Documents** (ou un autre endroit que tu ne videras
   pas), par exemple : `Documents/mosaic-extension/`.
2. Dézippe `mosaic-extension.zip` dans ce dossier.

> **Important** : ne mets pas le dossier dans **Téléchargements** ou sur le
> **Bureau** si tu fais souvent du ménage à ces endroits. Si tu supprimes le
> dossier, l'extension arrêtera de fonctionner.

À la fin, tu dois avoir un dossier qui contient un fichier `manifest.json`,
un fichier `index.html`, et un sous-dossier `assets/`.

## Étape 2 — Charger l'extension dans Chrome

1. Ouvre Chrome.
2. Dans la barre d'adresse, tape :
   ```
   chrome://extensions
   ```
   et appuie sur Entrée.
3. En haut à droite de la page, active le bouton **« Mode développeur »**.
4. Trois nouveaux boutons apparaissent en haut à gauche. Clique sur
   **« Charger l'extension non empaquetée »**.
5. Sélectionne le dossier `mosaic-extension/` que tu as créé à l'étape 1
   (le dossier qui contient `manifest.json`).
6. L'extension **Mosaic Dashboard** apparaît dans la liste. C'est installé.

## Étape 3 — Vérifier

Ouvre un nouvel onglet (Cmd+T sur Mac, Ctrl+T sur Windows). Tu devrais voir
le tableau de bord Mosaic à la place de la page Google habituelle.

## Questions fréquentes

### À chaque démarrage, Chrome affiche un bandeau « Désactiver les extensions du mode développeur »

C'est normal pour les extensions installées manuellement (pas via le Chrome
Web Store). **Clique sur « Annuler » ou ferme le bandeau** — surtout, ne
clique pas sur « Désactiver », sinon Mosaic sera désactivée et il faudra la
réactiver dans `chrome://extensions`.

### Comment mettre à jour l'extension ?

Quand je t'envoie une nouvelle version :

1. Remplace le contenu du dossier `mosaic-extension/` par les nouveaux
   fichiers du zip.
2. Va sur `chrome://extensions`.
3. Sur la carte « Mosaic Dashboard », clique sur l'icône **↻** (recharger).

### Comment désinstaller ?

Va sur `chrome://extensions`, trouve **Mosaic Dashboard**, clique sur
**« Supprimer »**. Tu peux aussi supprimer le dossier `mosaic-extension/`.

### Mes favoris ont disparu

Pas de panique : Mosaic affiche les marque-pages Chrome. Si tu utilises la
synchronisation Chrome avec ton compte Google, ils reviendront tout seuls.
Sinon ils sont toujours dans le menu Favoris classique de Chrome (`Cmd+Shift+B`
pour afficher la barre).
