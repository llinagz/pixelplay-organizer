const APP_STORAGE_PREFIX = "backlog-pixel";

export const clearAppStorage = (): void => {
  const keysToRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i += 1) {
    const key = localStorage.key(i);
    if (!key) continue;
    if (key.startsWith(APP_STORAGE_PREFIX)) keysToRemove.push(key);
  }

  for (const key of keysToRemove) {
    localStorage.removeItem(key);
  }
};

