# Mosaïque — Extension Chrome

Une page d'accueil pour Chrome qui simplifie le numérique et aide à mettre de l'ordre dans ses pages. Tous vos favoris et vos onglets ouverts au même endroit, rangés visuellement, accessibles en un clic.

![Icône](public/icon128.png)

## À qui ça s'adresse

À toutes les personnes qui veulent retrouver facilement leurs sites préférés sans se perdre dans des menus, des barres d'outils ou des dossiers imbriqués. L'extension est pensée pour être **simple à utiliser** et **simple à organiser** — y compris pour les personnes qui trouvent le numérique compliqué ou fatigant.

## Ce que ça fait

- **Tous vos favoris en un coup d'œil** — organisés en groupes colorés, comme des étiquettes visuelles
- **Vos onglets ouverts à gauche** — une liste claire pour naviguer entre les pages déjà ouvertes
- **Ranger en glissant-déposant** — déplacer un favori d'un groupe à un autre se fait à la souris, sans menu
- **Rien ne se perd** — les favoris supprimés peuvent être restaurés depuis l'historique
- **Recherche Google intégrée** — directement en haut de la page, sans détour
- **Lecture confortable** — texte large, fort contraste, mode sombre par défaut, zones de clic généreuses

## Stack technique

- React 19 + TypeScript
- Vite 8
- Tailwind CSS 3
- dnd-kit (drag and drop)
- API Chrome : `tabs`, `bookmarks`, `favicon`
- Manifest V3

## Installation en développement

```bash
npm install
npm run dev
```

Pour charger l'extension dans Chrome :
1. `npm run build`
2. Ouvrir `chrome://extensions`
3. Activer le **mode développeur**
4. Cliquer **Charger l'extension non empaquetée** → sélectionner le dossier `dist/`

## Build de production

```bash
npm run build
```

Le dossier `dist/` contient l'extension prête à être zippée et soumise au Chrome Web Store.

## Publication sur le Chrome Web Store

1. Zipper le contenu du dossier `dist/` (pas le dossier lui-même)
2. Se connecter au [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
3. Créer un nouvel élément et uploader le zip
4. Remplir la fiche : description, captures d'écran (min. 1280×800), catégorie
5. Soumettre pour révision (délai ~1–7 jours)

Les frais d'inscription au compte développeur sont de **5 USD** (une seule fois).

## Permissions utilisées

| Permission | Utilisation |
|---|---|
| `tabs` | Lire les onglets ouverts (titre, URL, favicon) |
| `bookmarks` | Lire et modifier les favoris Chrome |
| `favicon` | Récupérer les favicons des sites |

## Structure du projet

```
src/
├── features/
│   ├── tabs/          # Panneau d'onglets (TabsSidePanel, TabRow)
│   ├── favorites/     # Mosaïque de favoris (FavoritesPanel, GroupCard, BookmarkTile)
│   └── history/       # Historique de suppression
├── components/
│   ├── SearchBox.tsx
│   └── ui/
└── App.tsx
public/
├── manifest.json
├── icon16.png
├── icon48.png
└── icon128.png
```
