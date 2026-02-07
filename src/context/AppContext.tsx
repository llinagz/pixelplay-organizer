import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { AppState, Tag, BacklogItem, UserProfile, DEFAULT_TAGS } from '@/types/backlog';

interface AppContextType {
  state: AppState;
  setUserName: (name: string) => void;
  completeOnboarding: () => void;
  addTag: (tag: Omit<Tag, 'id' | 'createdAt'>) => void;
  removeTag: (id: string) => void;
  addItem: (item: Omit<BacklogItem, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateItem: (id: string, updates: Partial<BacklogItem>) => void;
  removeItem: (id: string) => void;
  resetApp: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY = 'backlog-pixel-state';

const generateId = () => crypto.randomUUID();

const getInitialState = (): AppState => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      return {
        ...parsed,
        tags: parsed.tags.map((t: Tag) => ({ ...t, createdAt: new Date(t.createdAt) })),
        items: parsed.items.map((i: BacklogItem) => ({
          ...i,
          createdAt: new Date(i.createdAt),
          updatedAt: new Date(i.updatedAt),
        })),
        user: parsed.user
          ? { ...parsed.user, createdAt: new Date(parsed.user.createdAt) }
          : null,
      };
    } catch {
      // Invalid stored data
    }
  }
  return {
    user: null,
    tags: [],
    items: [],
  };
};

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<AppState>(getInitialState);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const setUserName = (name: string) => {
    setState((prev) => ({
      ...prev,
      user: {
        name,
        createdAt: new Date(),
        onboardingCompleted: false,
      },
      // Initialize default tags when user is created
      tags: DEFAULT_TAGS.map((t) => ({
        ...t,
        id: generateId(),
        createdAt: new Date(),
      })),
    }));
  };

  const completeOnboarding = () => {
    setState((prev) => ({
      ...prev,
      user: prev.user ? { ...prev.user, onboardingCompleted: true } : null,
    }));
  };

  const addTag = (tag: Omit<Tag, 'id' | 'createdAt'>) => {
    setState((prev) => ({
      ...prev,
      tags: [...prev.tags, { ...tag, id: generateId(), createdAt: new Date() }],
    }));
  };

  const removeTag = (id: string) => {
    setState((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t.id !== id),
      items: prev.items.filter((i) => i.tagId !== id),
    }));
  };

  const addItem = (item: Omit<BacklogItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date();
    setState((prev) => ({
      ...prev,
      items: [...prev.items, { ...item, id: generateId(), createdAt: now, updatedAt: now }],
    }));
  };

  const updateItem = (id: string, updates: Partial<BacklogItem>) => {
    setState((prev) => ({
      ...prev,
      items: prev.items.map((item) =>
        item.id === id ? { ...item, ...updates, updatedAt: new Date() } : item
      ),
    }));
  };

  const removeItem = (id: string) => {
    setState((prev) => ({
      ...prev,
      items: prev.items.filter((i) => i.id !== id),
    }));
  };

  const resetApp = () => {
    localStorage.removeItem(STORAGE_KEY);
    setState({ user: null, tags: [], items: [] });
  };

  return (
    <AppContext.Provider
      value={{
        state,
        setUserName,
        completeOnboarding,
        addTag,
        removeTag,
        addItem,
        updateItem,
        removeItem,
        resetApp,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
