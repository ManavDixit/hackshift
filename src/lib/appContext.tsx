import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import type { Lang, Profile, Role } from './types';

interface AppState {
  profile: Profile;
  setProfile: (p: Partial<Profile>) => void;
  lang: Lang;
  setLang: (l: Lang) => void;
  completedTasks: string[];
  toggleTask: (id: string) => void;
  page: string;
  navigate: (p: string) => void;
}

const AppContext = createContext<AppState | null>(null);

/* ── localStorage keys ───────────────────────── */
const LS_PAGE    = 'medilink_page';
const LS_PROFILE = 'medilink_profile';

/* Pages that are entry-flow only — never restore to these on reload */
const ENTRY_PAGES = new Set(['home', 'signin', 'onboarding']);

function readPage(): string {
  try {
    const saved = localStorage.getItem(LS_PAGE);
    if (saved && !ENTRY_PAGES.has(saved)) return saved;
  } catch { /* localStorage blocked */ }
  return 'overview';
}

function readProfile(): Partial<Profile> {
  try {
    const raw = localStorage.getItem(LS_PROFILE);
    if (raw) return JSON.parse(raw) as Partial<Profile>;
  } catch { /* ignore */ }
  return {};
}

function savePage(p: string) {
  try { localStorage.setItem(LS_PAGE, p); } catch { /* ignore */ }
}

function saveProfile(p: Profile) {
  try { localStorage.setItem(LS_PROFILE, JSON.stringify(p)); } catch { /* ignore */ }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const savedProfile = readProfile();

  const [profile, setProfileState] = useState<Profile>({
    id: 'demo-user',
    name: 'Aarav',
    role: 'patient' as Role,
    lang: 'en',
    email: '',
    phone: '',
    city: 'Central District',
    ...savedProfile,
  });
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);
  const [page, setPage] = useState(readPage);

  const setProfile = useCallback((p: Partial<Profile>) => {
    setProfileState((prev) => {
      const next = { ...prev, ...p };
      saveProfile(next);
      return next;
    });
  }, []);

  const setLang = useCallback((l: Lang) => {
    setProfileState((prev) => {
      const next = { ...prev, lang: l };
      saveProfile(next);
      return next;
    });
  }, []);

  const toggleTask = useCallback((id: string) => {
    setCompletedTasks((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  }, []);

  const navigate = useCallback((p: string) => {
    setPage(p);
    savePage(p);
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, []);

  const value = useMemo(
    () => ({ profile, setProfile, lang: profile.lang, setLang, completedTasks, toggleTask, page, navigate }),
    [profile, setProfile, setLang, completedTasks, toggleTask, page, navigate]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppState {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
