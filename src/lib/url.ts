import { isExtension } from './chrome';

export function getHostname(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
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
