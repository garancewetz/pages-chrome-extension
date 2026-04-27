# Mosaic Dashboard — Contexte

## Ce que fait l'extension

**Mosaic Dashboard** remplace la page **Nouvel onglet** de Chrome par un tableau de bord en mosaïque qui regroupe trois sources d'information souvent éparpillées :

1. **Onglets ouverts** — tous les onglets de toutes les fenêtres Chrome, en direct.
2. **Favoris** — l'arbre des bookmarks aplati, organisé en groupes (sections).
3. **Note rapide** — une zone de texte libre persistée dans `chrome.storage.local`.

Une **barre de filtre** unique en haut de la page filtre simultanément les onglets et les favoris par titre ou URL.

L'utilisateur peut **réorganiser la mosaïque** entièrement en glisser-déposer :

- réordonner les blocs (favoris, onglets, note, sections de favoris) en les attrapant par leur poignée,
- basculer chaque bloc entre **pleine largeur** et **demi-largeur** (la mise en page est une grille 2 colonnes ≥ md),
- glisser un onglet ouvert vers les favoris pour le bookmarker,
- glisser un favori ou un onglet sur le placeholder « Glisser ici pour créer un groupe » pour créer une nouvelle section,
- déplacer un favori d'une section à une autre.

L'ordre des blocs et leur largeur sont persistés dans `localStorage`.

## Pourquoi

À chaque ouverture d'un nouvel onglet, on a sous les yeux :

- ce qu'on a déjà ouvert (au lieu de ré-ouvrir un doublon),
- les favoris pertinents, organisables sans quitter le dashboard,
- les notes en cours.

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
| `storage`   | persister la note rapide                         |
| `favicon`   | servir les favicons des favoris via `_favicon/`  |

Aucun accès réseau, aucun `host_permissions`, aucune injection de script dans les pages visitées.

### Architecture du code

```
src/
├── components/
│   ├── ui/              composants muets (Card, SearchBar)
│   └── SortableBlock.tsx  wrapper sortable + toggle full/half pour un bloc top-level
├── features/            une feature = un dossier (Panel + hook qui parle à chrome.*)
│   ├── tabs/            useTabs, TabsPanel, DraggableTab
│   ├── favorites/       useBookmarks, FlatBookmarks, BookmarkSection,
│   │                    BookmarkTile, SectionPlaceholder
│   └── notes/           useNotes, NotesPanel
├── lib/
│   ├── chrome.ts        helper isExtension pour fallback en mode dev
│   ├── url.ts           getHostname + getFavicon (helpers partagés)
│   └── blocks.ts        identifiants de blocs + useBlockOrder + useBlockWidths
├── App.tsx              orchestre la grille, le filtre et le DnD
└── main.tsx             point d'entrée React
```

**Règles de séparation :**

- `components/ui/` ne touche jamais à `chrome.*` ni à dnd-kit.
- Toute logique d'API extension vit dans un hook `useX` à côté de son `XPanel.tsx`.
- Tous les helpers d'URL/favicon vivent dans `lib/url.ts` (jamais dupliqués).
- L'état de la mosaïque (ordre + largeur des blocs) vit dans `lib/blocks.ts` via `useBlockOrder` et `useBlockWidths`.

### Mode dev vs runtime extension

`src/lib/chrome.ts` expose `isExtension`. Chaque hook teste cette valeur :

- **Dans Chrome (extension chargée)** → vraie API `chrome.tabs` / `chrome.bookmarks` / `chrome.storage`, favicons servis par `chrome.runtime.getURL('/_favicon/')`.
- **En `npm run dev`** → données factices ou fallback `localStorage`, favicons servis par `s2/favicons` de Google.

Conséquence : on peut itérer sur l'UI dans un onglet normal sans recharger l'extension à chaque save.

### Drag-and-drop

Toute l'orchestration DnD est dans `App.tsx` :

- Un seul `<DndContext>` couvre toute la page (capteurs : `PointerSensor` à 8 px, `KeyboardSensor`).
- `collisionDetection` fait du `closestCenter`, restreint aux blocs top-level quand on déplace un bloc.
- Les types `DragSource` (tab/bookmark) et `DropTarget` (root/section/bookmark/placeholder/block) sont des unions discriminées qui décrivent ce que portent `active.data.current` et `over.data.current`.
- `resolveDropPosition` calcule `{ parentId, index }` pour `chrome.bookmarks.move`.
- Le drop sur un placeholder crée la section, y déplace l'élément, puis met le focus sur son input pour la renommer (`autoEditId`).

### Réactivité aux changements

- **Onglets** : `useTabs` s'abonne à `chrome.tabs.onCreated/onRemoved/onUpdated` et re-query la liste.
- **Favoris** : `useBookmarks` s'abonne à `chrome.bookmarks.onCreated/onRemoved/onChanged/onMoved` et reconstruit le modèle (flat + sections).
- **Note** : sauvegarde à chaque keystroke dans `chrome.storage.local`.
- **Ordre/largeur des blocs** : sauvegardés dans `localStorage` (`mosaic.blockOrder`, `mosaic.blockWidths`), réconciliés au montage avec les sections présentes.

## Accessibilité

Public cible : utilisateurs avec contraintes motrices/cognitives (post-AVC notamment).

- Toutes les actions principales sont **single-click** (sauf la suppression d'un favori, qui demande une seconde confirmation cliquable).
- Labels ARIA explicites sur chaque bouton et zone droppable.
- `focus-visible:ring-4` partout pour la navigation clavier.
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
