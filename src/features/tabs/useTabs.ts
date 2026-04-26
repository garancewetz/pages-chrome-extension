import { useEffect, useState } from 'react';
import { isExtension } from '../../lib/chrome';

export type Tab = {
  id: number;
  title: string;
  url: string;
  favIconUrl?: string;
  windowId: number;
};

export function useTabs() {
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isExtension) {
      setTabs([
        {
          id: 1,
          title: 'Mode dev — chrome.tabs indisponible',
          url: 'https://example.com',
          windowId: 0,
        },
      ]);
      setLoading(false);
      return;
    }

    const refresh = async () => {
      const all = await chrome.tabs.query({});
      setTabs(
        all
          .filter((t): t is chrome.tabs.Tab & { id: number } => t.id != null)
          .map((t) => ({
            id: t.id,
            title: t.title ?? t.url ?? '(sans titre)',
            url: t.url ?? '',
            favIconUrl: t.favIconUrl,
            windowId: t.windowId,
          })),
      );
      setLoading(false);
    };

    void refresh();

    const handler = () => void refresh();
    chrome.tabs.onCreated.addListener(handler);
    chrome.tabs.onRemoved.addListener(handler);
    chrome.tabs.onUpdated.addListener(handler);
    return () => {
      chrome.tabs.onCreated.removeListener(handler);
      chrome.tabs.onRemoved.removeListener(handler);
      chrome.tabs.onUpdated.removeListener(handler);
    };
  }, []);

  const activate = (tab: Tab) => {
    if (!isExtension) return;
    void chrome.tabs.update(tab.id, { active: true });
    void chrome.windows.update(tab.windowId, { focused: true });
  };

  const close = (tab: Tab) => {
    if (!isExtension) return;
    void chrome.tabs.remove(tab.id);
  };

  return { tabs, loading, activate, close };
}
