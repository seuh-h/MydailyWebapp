// Using localStorage to keep it simple — no backend needed for personal use.
// Considered IndexedDB but overkill for text-only diary entries.
// TODO: if entries grow past ~1000, might need to rethink this approach
const STORAGE_KEY = 'my_diary_entries';

export function loadEntries() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    // JSON.parse can fail if storage is corrupted somehow
    return [];
  }
}

export function saveEntry(entry) {
  const entries = loadEntries();
  const existingIdx = entries.findIndex((e) => e.date === entry.date);

  // Same date = update existing, not duplicate
  if (existingIdx >= 0) {
    entries[existingIdx] = entry;
  } else {
    entries.unshift(entry); // newest first
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  return entries;
}

export function deleteEntry(date) {
  const entries = loadEntries().filter((e) => e.date !== date);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  return entries;
}

export function getEntryByDate(date) {
  return loadEntries().find((e) => e.date === date) || null;
}

export function getEntriesByMonth(year, month) {
  return loadEntries().filter((e) => {
    const d = new Date(e.date);
    return d.getFullYear() === year && d.getMonth() + 1 === month;
  });
}
