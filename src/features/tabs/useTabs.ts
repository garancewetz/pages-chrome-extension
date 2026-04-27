import { useCallback, useEffect, useState } from 'react';
import { isExtension } from '../../lib/chrome';

export type Tab = {
  id: number;
  title: string;
  url: string;
  favIconUrl?: string;
  windowId: number;
};

export type TabsApi = {
  tabs: Tab[];
  loading: boolean;
  activate: (tab: Tab) => void;
  close: (tab: Tab) => void;
};

function fromChromeTab(tab: chrome.tabs.Tab & { id: number }): Tab {
  return {
    id: tab.id,
    title: tab.title ?? tab.url ?? '(sans titre)',
    url: tab.url ?? '',
    favIconUrl: tab.favIconUrl,
    windowId: tab.windowId,
  };
}

export function useTabs(): TabsApi {
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

    const refresh = async (): Promise<void> => {
      const all = await chrome.tabs.query({});
      setTabs(
        all
          .filter((t): t is chrome.tabs.Tab & { id: number } => t.id != null)
          .map(fromChromeTab),
      );
      setLoading(false);
    };

    void refresh();

    const handler = (): void => {
      void refresh();
    };
    chrome.tabs.onCreated.addListener(handler);
    chrome.tabs.onRemoved.addListener(handler);
    chrome.tabs.onUpdated.addListener(handler);
    return () => {
      chrome.tabs.onCreated.removeListener(handler);
      chrome.tabs.onRemoved.removeListener(handler);
      chrome.tabs.onUpdated.removeListener(handler);
    };
  }, []);

  const activate = useCallback((tab: Tab): void => {
    if (!isExtension) return;
    void chrome.tabs.update(tab.id, { active: true });
    void chrome.windows.update(tab.windowId, { focused: true });
  }, []);

  const close = useCallback((tab: Tab): void => {
    if (!isExtension) return;
    void chrome.tabs.remove(tab.id);
  }, []);

  return { tabs, loading, activate, close };
}
