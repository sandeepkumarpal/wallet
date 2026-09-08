type CacheListener = (key: string, value: unknown | null) => void;

const store = new Map<string, unknown>();
const listeners = new Set<CacheListener>();

export const getCache = <T,>(key: string): T | null => {
  if (!store.has(key)) return null;
  return store.get(key) as T;
};

export const setCache = <T,>(key: string, value: T | null) => {
  if (value === null) {
    store.delete(key);
  } else {
    store.set(key, value);
  }
  listeners.forEach((fn) => fn(key, value));
};

/** Delete key and notify subscribers (e.g. Home should silent-refetch). */
export const invalidateCache = (key: string) => {
  store.delete(key);
  listeners.forEach((fn) => fn(key, null));
};

export const subscribeCache = (fn: CacheListener) => {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
};
