// Simulation history manager — localStorage-backed, max 50 entries FIFO

export interface HistoryEntry {
  id: string;
  timestamp: number;
  scenario: string;
  tags?: { location?: string; budget?: string; timeline?: string; experience?: string };
  photoThumbnail?: string;
  flowData: { nodes: unknown[]; edges: unknown[]; title?: string };
}

const STORAGE_KEY = 'simulator-history';
const MAX_ENTRIES = 50;

function readStorage(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

function writeStorage(entries: HistoryEntry[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // Quota exceeded — remove oldest entries until it fits
    let trimmed = entries.slice(0, Math.max(1, entries.length - 5));
    for (let i = 0; i < 10; i++) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
        return;
      } catch {
        trimmed = trimmed.slice(0, Math.max(1, trimmed.length - 5));
      }
    }
    // Last resort: clear
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* give up */ }
  }
}

/**
 * Resize a base64 image to max 80px dimension for thumbnail storage.
 * Returns a small base64 JPEG string.
 */
export function createThumbnail(base64: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const maxDim = 80;
      let w = img.width;
      let h = img.height;
      if (w > h) { h = Math.round((h / w) * maxDim); w = maxDim; }
      else { w = Math.round((w / h) * maxDim); h = maxDim; }

      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (!ctx) { resolve(''); return; }
      ctx.drawImage(img, 0, 0, w, h);
      resolve(canvas.toDataURL('image/jpeg', 0.6));
    };
    img.onerror = () => resolve('');
    img.src = base64;
  });
}

export function saveToHistory(entry: Omit<HistoryEntry, 'id' | 'timestamp'>): void {
  const entries = readStorage();
  const newEntry: HistoryEntry = {
    ...entry,
    id: crypto.randomUUID(),
    timestamp: Date.now(),
  };
  // Prepend (newest first), enforce max
  const updated = [newEntry, ...entries].slice(0, MAX_ENTRIES);
  writeStorage(updated);
}

export function getHistory(): HistoryEntry[] {
  return readStorage();
}

export function getHistoryEntry(id: string): HistoryEntry | null {
  return readStorage().find(e => e.id === id) ?? null;
}

export function deleteHistoryEntry(id: string): void {
  const entries = readStorage().filter(e => e.id !== id);
  writeStorage(entries);
}

export function clearHistory(): void {
  try { localStorage.removeItem(STORAGE_KEY); } catch { /* silent */ }
}
