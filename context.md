# Mes Pages — Contexte

## Ce que fait l'extension

**Mes Pages** remplace la page **Nouvel onglet** de Chrome par un tableau de bord en mosaïque qui regroupe deux sources d'information souvent éparpillées :

1. **Favoris** — l'arbre des bookmarks aplati, organisé en groupes colorés (un dossier Chrome = un groupe).
2. **Onglets ouverts** — tous les onglets de toutes les fenêtres Chrome, en direct.

Une **barre Google** en haut de la page permet une recherche directe ; une **barre de filtre** filtre simultanément les onglets et les favoris par titre ou URL.

L'utilisateur peut réorganiser ses favoris en glisser-déposer :

- glisser un onglet ouvert sur un groupe (ou en racine) pour le bookmarker,
- glisser un favori ou un onglet sur le placeholder « Nouveau groupe » pour créer un nouveau groupe,
- déplacer un favori d'un groupe à un autre,
- réordonner les groupes via les flèches haut/bas (DnD désactivé pendant un filtre actif),
- basculer chaque groupe ou le bloc onglets entre **pleine largeur** et **demi-largeur**,
- choisir une couleur par groupe (palette de 7 teintes, persistée).

Les largeurs et les couleurs sont persistées dans `localStorage`. L'ordre des sections (Favoris puis Onglets) est fixe — pensé pour un usage post-AVC où la prévisibilité prime.

## Pourquoi

À chaque ouverture d'un nouvel onglet, on a sous les yeux :

- les favoris pertinents, organisables sans quitter le dashboard,
- ce qu'on a déjà ouvert (au lieu de ré-ouvrir un doublon),
- une recherche Google immédiate.

C'est volontairement **minimaliste** : pas de comptes, pas de sync cloud, pas de widgets externes. Tout est local, tout est rapide.

## Comment ça marche techniquement

### Stack

- **React 19 + TypeScript strict** — UI déclarative, types stricts (`strict`, `noUnusedLocals`, `noUnusedParameters`, `verbatimModuleSyntax`).
- **Vite 8** — build, HMR en dev.
- **Tailwind CSS 3** — styling utility-first, mode sombre auto via `prefers-color-scheme`.
- **@dnd-kit** (`core` + `sortable` + `utilities`) — drag-and-drop accessible (clavier compris).
- **Manifest V3** — la page `index.html` produite par Vite est utilisée comme `chrome_url_overrides.newtab`.

### Permissions Chrome demandées

| Permission  | Usage                                            |
| ----------- | ------------------------------------------------ |
| `tabs`      | lister, activer, fermer les onglets              |
| `bookmarks` | lire et modifier l'arbre des favoris             |
| `favicon`   | servir les favicons des favoris via `_favicon/`  |

Aucun accès réseau, aucun `host_permissions`, aucune injection de script dans les pages visitées. Les préférences (largeurs, couleurs, thème) vivent dans `localStorage`, pas dans `chrome.storage`.

### Architecture du code

```
src/
├── components/
│   ├── GoogleSearch.tsx        barre de recherche Google
│   └── ui/                     composants muets, jamais d'API extension
│       ├── Tile.tsx, TilePreview, TileBody, tileCornerInner
│       ├── TileActionsMenu.tsx menu d'actions par tuile (portail, flash succès)
│       ├── SectionHeader.tsx, SubsectionTitle.tsx
│       ├── IconButton.tsx, ConfirmIconButton.tsx
│       ├── Tooltip.tsx, PortalTooltip.tsx
│       ├── EmptyDropZone.tsx, GroupDot.tsx
│       ├── SearchBar.tsx, ThemeToggle.tsx, Logo.tsx
├── features/                   une feature = un dossier (Panel + hooks qui parlent à chrome.*)
│   ├── tabs/                   useTabs, TabsPanel, DraggableTab
│   └── favorites/              useBookmarks, useAssignment,
│                               FavoritesPanel, GroupCard, GroupColorPicker,
│                               GroupPlaceholder, BookmarkTile (+ BookmarkPreview)
├── lib/
│   ├── chrome.ts               helper isExtension pour fallback en mode dev
│   ├── url.ts                  getHostname + getFavicon (helpers partagés)
│   ├── widths.ts               useBlockWidth + useBlockWidthMap (full/half)
│   ├── groupColors.ts          palette + useGroupColorMap
│   ├── theme.ts                useTheme (light/dark, persisté)
│   └── dnd.ts                  useActiveDragType, isBookmarkDropTarget
├── App.tsx                     orchestre le layout, le filtre et le DnD
├── main.tsx                    point d'entrée React
└── index.css                   Tailwind + globals (scrollbar, focus, dégradé titre)
```

**Règles de séparation :**

- `components/ui/` ne touche jamais à `chrome.*` ni à dnd-kit.
- Toute logique d'API extension vit dans un hook `useX` à côté de son `XPanel.tsx`.
- Les helpers d'URL/favicon vivent dans `lib/url.ts` (jamais dupliqués).
- Les préférences UI (largeurs, couleurs, thème) vivent dans `lib/` via des hooks `localStorage`.

### Mode dev vs runtime extension

`src/lib/chrome.ts` expose `isExtension`. Chaque hook teste cette valeur :

- **Dans Chrome (extension chargée)** → vraie API `chrome.tabs` / `chrome.bookmarks`, favicons servis par `chrome.runtime.getURL('/_favicon/')`.
- **En `npm run dev`** → onglets factices, pas de favoris, favicons servis par `s2/favicons` de Google.

Conséquence : on peut itérer sur l'UI dans un onglet normal sans recharger l'extension à chaque save.

### Drag-and-drop

Toute l'orchestration DnD est dans `App.tsx` :

- Un seul `<DndContext>` couvre toute la page (capteurs : `PointerSensor` à 8 px, `KeyboardSensor`).
- `collisionDetection` fait du `closestCenter`.
- Les types `DragSource` (tab/bookmark) et `DropTarget` (favorites-root/group/bookmark/placeholder) sont des unions discriminées qui décrivent ce que portent `active.data.current` et `over.data.current`.
- `useAssignment` regroupe les actions sans drag (épingler un onglet, ranger un favori, créer un groupe vide) ; `resolveDropPosition` calcule `{ parentId, index }` pour `chrome.bookmarks.move`.
- Le drop sur le placeholder « Nouveau groupe » crée le groupe, y déplace l'élément, puis met le focus sur son input pour le renommer (`autoEditId`).
- Une **alternative single-click** existe pour chaque action de drag : le menu d'actions par tuile (Tile + TileActionsMenu) propose « Ranger dans » / « Épingler dans » + flash de succès — indispensable pour le public cible.

### Réactivité aux changements

- **Onglets** : `useTabs` s'abonne à `chrome.tabs.onCreated/onRemoved/onUpdated` et re-query la liste.
- **Favoris** : `useBookmarks` s'abonne à `chrome.bookmarks.onCreated/onRemoved/onChanged/onMoved` et reconstruit le modèle (favoris directs + groupes via `walkFolderTree`, qui supporte les sous-dossiers en fil d'Ariane).
- **Préférences UI** : sauvegardées dans `localStorage` (`mosaic.tabsWidth`, `mosaic.groupWidths`, `mosaic.groupColors`, `mosaic.theme`).

## Accessibilité

Public cible : utilisateurs avec contraintes motrices/cognitives (post-AVC notamment).

- Toutes les actions principales sont **single-click** (sauf les suppressions, qui demandent une seconde confirmation cliquable via `ConfirmIconButton`).
- Toute action accessible en DnD a une **alternative au clic** via `TileActionsMenu` (« Ranger dans », « Épingler dans », « Nouveau groupe »).
- Échelle typographique resserrée (1.0625 rem de base, pas de `text-2xs`).
- Labels ARIA explicites sur chaque bouton et zone droppable ; tooltips portalisés (`PortalTooltip`) pour ne pas être coupés par les conteneurs `overflow-hidden`.
- `focus-visible` global avec ring violet, désactivé là où Tailwind pose déjà un ring.
- DnD clavier supporté par `KeyboardSensor` + `sortableKeyboardCoordinates`.
- `prefers-reduced-motion` désactive transitions et animations.

## Ce que l'extension ne fait pas (volontairement)

- Pas de sessions sauvegardées, pas de groupes d'onglets Chrome.
- Pas de raccourcis clavier custom au-delà du DnD clavier de dnd-kit.
- Pas de service worker en arrière-plan — toute la logique vit dans la page Nouvel onglet.

Chaque ajout futur doit justifier sa permission.

## Build & chargement

```bash
npm run build              # tsc -b && vite build → dist/
npm run build:watch        # vite build --watch (sans type-check)
```

Puis `chrome://extensions` → mode développeur → **Charger l'extension non empaquetée** → sélectionner `dist/`. Cliquer ↻ après chaque rebuild.
