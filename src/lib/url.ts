import { isExtension } from './chrome';

export function getHostname(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

// Clé de comparaison stable entre une URL d'onglet et une URL de favori :
// retire le fragment et un éventuel slash terminal. Le constructeur URL
// normalise déjà le hostname en minuscules.
export function normalizeUrl(url: string): string {
  try {
    const u = new URL(url);
    u.hash = '';
    let s = u.toString();
    if (s.endsWith('/') && !s.endsWith('//')) s = s.slice(0, -1);
    return s;
  } catch {
    return url;
  }
}

export function getFavicon(pageUrl: string): string | undefined {
  let hostname: string;
  try {
    hostname = new URL(pageUrl).hostname;
  } catch {
    return undefined;
  }
  if (!hostname) return undefined;

  if (isExtension) {
    const url = new URL(chrome.runtime.getURL('/_favicon/'));
    url.searchParams.set('pageUrl', pageUrl);
    url.searchParams.set('size', '64');
    return url.toString();
  }

  const url = new URL('https://www.google.com/s2/favicons');
  url.searchParams.set('domain', hostname);
  url.searchParams.set('sz', '64');
  return url.toString();
}
