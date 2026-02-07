// Data types for Backlog Pixel - Ready for Jazz integration

export type ItemStatus = 'backlog' | 'playing' | 'reading' | 'watching' | 'completed' | 'dropped';

export interface Tag {
  id: string;
  name: string;
  icon: 'gamepad' | 'book' | 'film' | 'music' | 'tv' | 'custom';
  color: string;
  createdAt: Date;
}

export interface BacklogItem {
  id: string;
  title: string;
  tagId: string;
  status: ItemStatus;
  rating?: number; // 1-5 stars
  notes?: string;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfile {
  name: string;
  createdAt: Date;
  onboardingCompleted: boolean;
}

export interface AppState {
  user: UserProfile | null;
  tags: Tag[];
  items: BacklogItem[];
}

// Default tags for new users
export const DEFAULT_TAGS: Omit<Tag, 'id' | 'createdAt'>[] = [
  { name: 'Videojuegos', icon: 'gamepad', color: '#22c55e' },
  { name: 'Libros', icon: 'book', color: '#3b82f6' },
  { name: 'Cine', icon: 'film', color: '#a855f7' },
];

export const STATUS_LABELS: Record<ItemStatus, string> = {
  backlog: 'En cola',
  playing: 'Jugando',
  reading: 'Leyendo',
  watching: 'Viendo',
  completed: 'Completado',
  dropped: 'Abandonado',
};

export const STATUS_COLORS: Record<ItemStatus, string> = {
  backlog: '#6b7280',
  playing: '#22c55e',
  reading: '#3b82f6',
  watching: '#a855f7',
  completed: '#f59e0b',
  dropped: '#ef4444',
};
