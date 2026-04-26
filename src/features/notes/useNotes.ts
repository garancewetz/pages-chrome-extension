import { useCallback, useEffect, useState } from 'react';
import { isExtension } from '../../lib/chrome';

const KEY = 'mosaic.note';

export function useNotes() {
  const [note, setNote] = useState('');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!isExtension) {
      setNote(localStorage.getItem(KEY) ?? '');
      setLoaded(true);
      return;
    }
    chrome.storage.local.get(KEY).then((res) => {
      setNote(typeof res[KEY] === 'string' ? res[KEY] : '');
      setLoaded(true);
    });
  }, []);

  const save = useCallback((value: string) => {
    setNote(value);
    if (isExtension) {
      void chrome.storage.local.set({ [KEY]: value });
    } else {
      localStorage.setItem(KEY, value);
    }
  }, []);

  return { note, save, loaded };
}
