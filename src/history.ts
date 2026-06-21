export type SavedSession = {
  data: any;
  currentStep: number;
  isComplete?: boolean;
  viewAll?: boolean;
};

export type SourceType = 'text' | 'link' | 'youtube' | 'file' | 'pdf';

export type HistoryEntry = {
  id: string;
  title: string;
  category?: string;
  pinned?: boolean;
  pinnedAt?: number;
  createdAt: number;
  updatedAt: number;
  sourceType: SourceType;
  session: SavedSession;
};

export type HistoryStore = {
  activeId: string | null;
  entries: HistoryEntry[];
};

import { normalizeCategory } from './categories';

const HISTORY_KEY = 'tdah-optimizer-history';
const LEGACY_SESSION_KEY = 'tdah-optimizer-session';
const MAX_ENTRIES = 30;

// crypto.randomUUID() only exists in secure contexts (HTTPS or localhost).
// When the app is opened over plain HTTP via a LAN IP (e.g. on mobile), it is
// undefined, so we fall back to a manual generator to avoid crashing.
function generateId(): string {
  try {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }
  } catch {
    // ignore and use fallback
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}-${Math.random()
    .toString(36)
    .slice(2, 10)}`;
}

function isValidSession(session: unknown): session is SavedSession {
  const s = session as SavedSession;
  return Boolean(s?.data?.steps?.length);
}

function isValidEntry(entry: unknown): entry is HistoryEntry {
  const e = entry as HistoryEntry;
  return Boolean(
    e?.id &&
      e?.title &&
      typeof e.createdAt === 'number' &&
      typeof e.updatedAt === 'number' &&
      e.sourceType &&
      isValidSession(e.session)
  );
}

function migrateLegacySession(): HistoryStore | null {
  try {
    const raw = localStorage.getItem(LEGACY_SESSION_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as SavedSession;
    if (!isValidSession(parsed)) {
      localStorage.removeItem(LEGACY_SESSION_KEY);
      return null;
    }

    const now = Date.now();
    const entry: HistoryEntry = {
      id: generateId(),
      title: parsed.data.title || 'Mapa sin título',
      createdAt: now,
      updatedAt: now,
      sourceType: 'text',
      session: parsed,
    };

    localStorage.removeItem(LEGACY_SESSION_KEY);
    return { activeId: entry.id, entries: [entry] };
  } catch {
    localStorage.removeItem(LEGACY_SESSION_KEY);
    return null;
  }
}

function trimEntries(entries: HistoryEntry[]): HistoryEntry[] {
  return entries.slice(0, MAX_ENTRIES);
}

function persist(store: HistoryStore): boolean {
  const trimmed: HistoryStore = {
    activeId: store.activeId,
    entries: trimEntries(store.entries),
  };

  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(trimmed));
    return true;
  } catch {
    if (trimmed.entries.length <= 1) return false;

    const reduced: HistoryStore = {
      activeId: trimmed.activeId,
      entries: trimmed.entries.slice(0, Math.max(1, Math.floor(trimmed.entries.length / 2))),
    };

    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(reduced));
      return true;
    } catch {
      return false;
    }
  }
}

export function loadHistory(): HistoryStore {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as HistoryStore;
      const entries = (parsed.entries || []).filter(isValidEntry);
      const activeId =
        parsed.activeId && entries.some((e) => e.id === parsed.activeId)
          ? parsed.activeId
          : entries[0]?.id ?? null;
      return { activeId, entries };
    }
  } catch {
    // fall through to migration
  }

  const migrated = migrateLegacySession();
  if (migrated) {
    persist(migrated);
    return migrated;
  }

  return { activeId: null, entries: [] };
}

export function saveHistory(store: HistoryStore): boolean {
  return persist(store);
}

export function getActiveEntry(store: HistoryStore): HistoryEntry | null {
  if (!store.activeId) return null;
  return store.entries.find((e) => e.id === store.activeId) ?? null;
}

export function createEntry(
  store: HistoryStore,
  session: SavedSession,
  sourceType: SourceType
): HistoryStore {
  const now = Date.now();
  const entry: HistoryEntry = {
    id: generateId(),
    title: session.data?.title || 'Mapa sin título',
    category: normalizeCategory(session.data?.category),
    createdAt: now,
    updatedAt: now,
    sourceType,
    session,
  };

  return {
    activeId: entry.id,
    entries: [entry, ...store.entries],
  };
}

export function updateActiveSession(
  store: HistoryStore,
  session: SavedSession
): HistoryStore {
  if (!store.activeId) return store;

  const now = Date.now();
  const entries = store.entries.map((entry) =>
    entry.id === store.activeId
      ? {
          ...entry,
          title: session.data?.title || entry.title,
          category: normalizeCategory(session.data?.category ?? entry.category),
          updatedAt: now,
          session,
        }
      : entry
  );

  return { ...store, entries };
}

export function setActiveId(store: HistoryStore, id: string | null): HistoryStore {
  if (id && !store.entries.some((e) => e.id === id)) {
    return store;
  }
  return { ...store, activeId: id };
}

export function deleteEntry(store: HistoryStore, id: string): HistoryStore {
  const entries = store.entries.filter((e) => e.id !== id);
  const activeId = store.activeId === id ? null : store.activeId;

  return { activeId, entries };
}

export function togglePinEntry(store: HistoryStore, id: string): HistoryStore {
  const now = Date.now();
  const entries = store.entries.map((entry) => {
    if (entry.id !== id) return entry;

    if (entry.pinned) {
      const { pinned: _pinned, pinnedAt: _pinnedAt, ...rest } = entry;
      return rest;
    }

    return { ...entry, pinned: true, pinnedAt: now };
  });

  return { ...store, entries };
}

export function formatRelativeDate(timestamp: number): string {
  const now = new Date();
  const date = new Date(timestamp);
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.round(
    (startOfToday.getTime() - startOfDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diffDays === 0) return 'Hoy';
  if (diffDays === 1) return 'Ayer';
  if (diffDays < 7) return `Hace ${diffDays} días`;

  return date.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
  });
}
