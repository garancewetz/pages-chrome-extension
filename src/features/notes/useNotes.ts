import { useCallback, useEffect, useRef, useState } from 'react';
import { isExtension } from '../../lib/chrome';

const KEY = 'mosaic.note';
const SAVED_INDICATOR_DELAY_MS = 600;

export function useNotes() {
  const [note, setNote] = useState('');
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const savingTimer = useRef<number | null>(null);

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

  useEffect(() => {
    return () => {
      if (savingTimer.current !== null) window.clearTimeout(savingTimer.current);
    };
  }, []);

  const save = useCallback((value: string) => {
    setNote(value);
    setSaving(true);
    if (isExtension) {
      void chrome.storage.local.set({ [KEY]: value });
    } else {
      localStorage.setItem(KEY, value);
    }
    if (savingTimer.current !== null) window.clearTimeout(savingTimer.current);
    savingTimer.current = window.setTimeout(() => {
      setSaving(false);
      savingTimer.current = null;
    }, SAVED_INDICATOR_DELAY_MS);
  }, []);

  return { note, save, loaded, saving };
}
