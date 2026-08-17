import { SearchIndexEntry } from '../models';

/** Empty query returns all entries unfiltered — callers decide what "no query" should show. */
export function filterSearchIndex(entries: SearchIndexEntry[], query: string): SearchIndexEntry[] {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) {
    return entries;
  }
  if (/^\d+$/.test(trimmed)) {
    const id = Number(trimmed);
    return entries.filter((entry) => entry.id === id);
  }
  return entries.filter(
    (entry) =>
      entry.nameEn.toLowerCase().includes(trimmed) || entry.nameDe.toLowerCase().includes(trimmed)
  );
}
