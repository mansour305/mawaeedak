import { useState, useEffect, useCallback } from 'react';

type ThemeType = 'light' | 'dark';

const PERSONAL_KEY = 'app-theme';
const MODE_KEY = 'app-mode';
const BASE_SLUG = 'neutral';

let cachedGlobal: string | null = null;
let inflight: Promise<string> | null = null;

/** يقرأ الثيم الافتراضي العام من الخادم (يعمل في كل أوضاع البيانات لأن Express متاح دائماً). */
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

/** يُحدِّث الذاكرة المؤقتة بعد أن يغيّر المالك الافتراضي العام. */
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

  // وضع فاتح/داكن
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') root.classList.add('dark');
    else root.classList.remove('dark');
    localStorage.setItem(MODE_KEY, theme);
  }, [theme]);

  // جلب الافتراضي العام مرة واحدة
  useEffect(() => {
    let active = true;
    void fetchGlobalDefault().then(slug => {
      if (active) setGlobalDefault(slug);
    });
    return () => {
      active = false;
    };
  }, []);

  // تطبيق الثيم الفعّال (الشخصي أولاً ثم العام)
  useEffect(() => {
    applySlug(effectiveSlug);
  }, [effectiveSlug]);

  const toggleMode = useCallback(() => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  // تغيير ثيم المستخدم الشخصي (يُحفظ محلياً ويتجاوز الافتراضي العام)
  const changeTheme = useCallback((slug: string) => {
    localStorage.setItem(PERSONAL_KEY, slug);
    setPersonalSlug(readPersonal());
  }, []);

  // إعادة المستخدم إلى الثيم الافتراضي العام (إزالة التفضيل الشخصي)
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
