const STORAGE_KEY = "recent_searches";
const MAX_HISTORY = 8;

export function useSearchHistory() {
  function getHistory(): string[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  function addToHistory(keyword: string): void {
    const kw = keyword.trim();
    if (!kw) return;
    try {
      const current = getHistory();
      const deduped = current.filter((k) => k !== kw);
      deduped.unshift(kw);
      const limited = deduped.slice(0, MAX_HISTORY);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(limited));
    } catch {
      // localStorage không available (private mode, etc.) — bỏ qua
    }
  }

  function removeFromHistory(keyword: string): void {
    try {
      const current = getHistory();
      const updated = current.filter((k) => k !== keyword);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // bỏ qua
    }
  }

  function clearHistory(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // bỏ qua
    }
  }

  return { getHistory, addToHistory, removeFromHistory, clearHistory };
}
