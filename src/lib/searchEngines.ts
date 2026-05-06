import { useEffect, useState } from 'react';

export type SearchEngineId = 'google' | 'ecosia' | 'qwant' | 'duckduckgo';

export type SearchEngineConfig = {
  id: SearchEngineId;
  name: string;
  /** Description courte du moteur, affichée sous son nom dans le menu. */
  description: string;
  /** URL d'action du formulaire de recherche (méthode GET). */
  searchUrl: string;
  /** Nom du paramètre de requête (typiquement « q »). */
  paramName: string;
  /**
   * Couleur de fond de la pastille à lettre. Choisie pour respecter
   * WCAG AAA (≥ 7:1) avec un texte blanc en `font-bold`.
   */
  brandColor: string;
  letter: string;
};

export const SEARCH_ENGINES: readonly SearchEngineConfig[] = [
  {
    id: 'google',
    name: 'Google',
    description: 'le moteur le plus utilisé',
    searchUrl: 'https://www.google.com/search',
    paramName: 'q',
    brandColor: '#1A56DB',
    letter: 'G',
  },
  {
    id: 'ecosia',
    name: 'Ecosia',
    description: 'plante des arbres avec vos recherches',
    searchUrl: 'https://www.ecosia.org/search',
    paramName: 'q',
    brandColor: '#1F5C30',
    letter: 'E',
  },
  {
    id: 'qwant',
    name: 'Qwant',
    description: 'moteur français, respecte la vie privée',
    searchUrl: 'https://www.qwant.com/',
    paramName: 'q',
    brandColor: '#1F2D77',
    letter: 'Q',
  },
  {
    id: 'duckduckgo',
    name: 'DuckDuckGo',
    description: 'pas de pistage, vie privée',
    searchUrl: 'https://duckduckgo.com/',
    paramName: 'q',
    brandColor: '#8B3A1A',
    letter: 'D',
  },
] as const;

const STORAGE_KEY = 'mosaic.searchEngine';
const DEFAULT_ID: SearchEngineId = 'google';

const isEngineId = (v: unknown): v is SearchEngineId =>
  typeof v === 'string' && SEARCH_ENGINES.some((e) => e.id === v);

const findEngine = (id: SearchEngineId): SearchEngineConfig =>
  SEARCH_ENGINES.find((e) => e.id === id) ?? SEARCH_ENGINES[0];

export type SearchEngineApi = {
  engine: SearchEngineConfig;
  setEngineId: (id: SearchEngineId) => void;
};

export function useSearchEngine(): SearchEngineApi {
  const [engineId, setEngineId] = useState<SearchEngineId>(() => {
    if (typeof localStorage === 'undefined') return DEFAULT_ID;
    const stored = localStorage.getItem(STORAGE_KEY);
    return isEngineId(stored) ? stored : DEFAULT_ID;
  });

  useEffect(() => {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(STORAGE_KEY, engineId);
  }, [engineId]);

  return { engine: findEngine(engineId), setEngineId };
}
