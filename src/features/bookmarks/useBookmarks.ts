import { useEffect, useState } from 'react';
import { isExtension } from '../../lib/chrome';

export type Bookmark = {
  id: string;
  title: string;
  url: string;
};

function flatten(nodes: chrome.bookmarks.BookmarkTreeNode[]): Bookmark[] {
  const out: Bookmark[] = [];
  const walk = (list: chrome.bookmarks.BookmarkTreeNode[]) => {
    for (const n of list) {
      if (n.url) out.push({ id: n.id, title: n.title || n.url, url: n.url });
      if (n.children) walk(n.children);
    }
  };
  walk(nodes);
  return out;
}

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isExtension) {
      setBookmarks([]);
      setLoading(false);
      return;
    }
    chrome.bookmarks.getTree().then((tree) => {
      setBookmarks(flatten(tree));
      setLoading(false);
    });
  }, []);

  return { bookmarks, loading };
}
