import type { HistoryEntry } from './history';

function collectStrings(value: unknown, parts: string[]): void {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (trimmed) parts.push(trimmed);
    return;
  }
  if (Array.isArray(value)) {
    for (const item of value) collectStrings(item, parts);
    return;
  }
  if (value && typeof value === 'object') {
    for (const nested of Object.values(value as Record<string, unknown>)) {
      collectStrings(nested, parts);
    }
  }
}

export function historyEntrySearchText(entry: HistoryEntry): string {
  const parts: string[] = [entry.title];
  if (entry.category) parts.push(entry.category);
  if (entry.tags?.length) parts.push(...entry.tags);
  collectStrings(entry.session?.data, parts);
  return parts.join('\n').toLowerCase();
}

export function filterHistoryEntries(entries: HistoryEntry[], query: string): HistoryEntry[] {
  const tokens = query
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);
  if (!tokens.length) return entries;

  return entries.filter((entry) => {
    const haystack = historyEntrySearchText(entry);
    return tokens.every((token) => haystack.includes(token));
  });
}

export function filterHistoryByCategory(
  entries: HistoryEntry[],
  category: string | null
): HistoryEntry[] {
  if (!category) return entries;
  const key = category.toLowerCase();
  return entries.filter((entry) => entry.category?.toLowerCase() === key);
}
