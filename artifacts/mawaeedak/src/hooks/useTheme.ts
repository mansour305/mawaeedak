import { useState, useEffect, useCallback } from 'react';

type ThemeType = 'light' | 'dark';

const PERSONAL_KEY = 'app-theme';
const MODE_KEY = 'app-mode';
const BASE_SLUG = 'default';

let cachedGlobal: string | null = null;
let inflight: Promise<string> | null = null;

/** ظٹظ‚ط±ط£ ط§ظ„ط«ظٹظ… ط§ظ„ط§ظپطھط±ط§ط¶ظٹ ط§ظ„ط¹ط§ظ… ظ…ظ† ط§ظ„ط®ط§ط¯ظ… (ظٹط¹ظ…ظ„ ظپظٹ ظƒظ„ ط£ظˆط¶ط§ط¹ ط§ظ„ط¨ظٹط§ظ†ط§طھ ظ„ط£ظ† Express ظ…طھط§ط­ ط¯ط§ط¦ظ…ط§ظ‹). */
async function fetchGlobalDefault(): Promise<string> {
  if (cachedGlobal) return cachedGlobal;
  if (inflight) return inflight;
  inflight = (async () => {
    try {
      const res = await fetch('/api/settings/default-theme', { credentials: 'include' });
      if (res.ok) {
        const data = (await res.json()) as { slug?: string };
        cachedGlobal = data.slug || BASE_SLUG;
      } else {
        cachedGlobal = BASE_SLUG;
      }
    } catch {
      cachedGlobal = BASE_SLUG;
    }
    return cachedGlobal;
  })();
  return inflight;
}

/** ظٹظڈط­ط¯ظگظ‘ط« ط§ظ„ط°ط§ظƒط±ط© ط§ظ„ظ…ط¤ظ‚طھط© ط¨ط¹ط¯ ط£ظ† ظٹط؛ظٹظ‘ط± ط§ظ„ظ…ط§ظ„ظƒ ط§ظ„ط§ظپطھط±ط§ط¶ظٹ ط§ظ„ط¹ط§ظ…. */
export function setCachedGlobalDefault(slug: string): void {
  cachedGlobal = slug;
}

function applySlug(slug: string): void {
  const root = document.documentElement;
  if (slug && slug !== BASE_SLUG && slug !== 'default') {
    root.setAttribute('data-theme', slug);
  } else {
    root.removeAttribute('data-theme');
  }
}

function readPersonal(): string | null {
  const v = localStorage.getItem(PERSONAL_KEY);
  if (!v || v === 'default') return null;
  return v;
}

export function useTheme() {
  const [theme, setTheme] = useState<ThemeType>(
    () => (localStorage.getItem(MODE_KEY) as ThemeType) || 'light'
  );

  const [globalDefault, setGlobalDefault] = useState<string>(cachedGlobal ?? BASE_SLUG);
  const [personalSlug, setPersonalSlug] = useState<string | null>(() => readPersonal());

  const effectiveSlug = personalSlug ?? globalDefault;
  const hasPersonalTheme = personalSlug !== null;

  // ظˆط¶ط¹ ظپط§طھط­/ط¯ط§ظƒظ†
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') root.classList.add('dark');
    else root.classList.remove('dark');
    localStorage.setItem(MODE_KEY, theme);
  }, [theme]);

  // ط¬ظ„ط¨ ط§ظ„ط§ظپطھط±ط§ط¶ظٹ ط§ظ„ط¹ط§ظ… ظ…ط±ط© ظˆط§ط­ط¯ط©
  useEffect(() => {
    let active = true;
    void fetchGlobalDefault().then(slug => {
      if (active) setGlobalDefault(slug);
    });
    return () => {
      active = false;
    };
  }, []);

  // طھط·ط¨ظٹظ‚ ط§ظ„ط«ظٹظ… ط§ظ„ظپط¹ظ‘ط§ظ„ (ط§ظ„ط´ط®طµظٹ ط£ظˆظ„ط§ظ‹ ط«ظ… ط§ظ„ط¹ط§ظ…)
  useEffect(() => {
    applySlug(effectiveSlug);
  }, [effectiveSlug]);

  const toggleMode = useCallback(() => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  // طھط؛ظٹظٹط± ط«ظٹظ… ط§ظ„ظ…ط³طھط®ط¯ظ… ط§ظ„ط´ط®طµظٹ (ظٹظڈط­ظپط¸ ظ…ط­ظ„ظٹط§ظ‹ ظˆظٹطھط¬ط§ظˆط² ط§ظ„ط§ظپطھط±ط§ط¶ظٹ ط§ظ„ط¹ط§ظ…)
  const changeTheme = useCallback((slug: string) => {
    localStorage.setItem(PERSONAL_KEY, slug);
    setPersonalSlug(readPersonal());
  }, []);

  // ط¥ط¹ط§ط¯ط© ط§ظ„ظ…ط³طھط®ط¯ظ… ط¥ظ„ظ‰ ط§ظ„ط«ظٹظ… ط§ظ„ط§ظپطھط±ط§ط¶ظٹ ط§ظ„ط¹ط§ظ… (ط¥ط²ط§ظ„ط© ط§ظ„طھظپط¶ظٹظ„ ط§ظ„ط´ط®طµظٹ)
  const resetToGlobal = useCallback(() => {
    localStorage.removeItem(PERSONAL_KEY);
    setPersonalSlug(null);
  }, []);

  return {
    theme,
    themeSlug: effectiveSlug,
    globalDefault,
    hasPersonalTheme,
    toggleMode,
    changeTheme,
    resetToGlobal,
  };
}

