import type { OcioEstado, OcioTipo, TagIcon } from "@/schema";
import type { ConflictResolutionEvent, ImportResult, SyncStatus } from "@/domain/sync";

export interface TagUI {
  id: string;
  nombre: string;
  icono: TagIcon;
  color: string;
}

export interface OcioItemUI {
  id: string;
  titulo: string;
  tipo: OcioTipo;
  estado: OcioEstado;
  tagId: string;
  valoracion?: number;
  notas?: string;
  imagenUrl?: string;
}

export type AuthState = "anonymous" | "signedIn";

export interface SyncSnapshot {
  syncStatus: SyncStatus;
  lastSyncAt?: string;
  syncError?: string;
  linkedDevices: number | null;
  isLinked: boolean;
  lastConflict?: ConflictResolutionEvent;
}

export interface SyncActions {
  startDeviceLink: () => string;
  completeDeviceLink: (code: string) => ImportResult;
  retrySync: () => Promise<void>;
  exportData: () => string;
  importData: (payload: string) => ImportResult;
}

export interface AuthSlice {
  authState: AuthState;
  nombreUsuario?: string;
  onboardingCompletado: boolean;
  signUp: (nombre: string) => Promise<void>;
  logIn: (nombre: string) => Promise<void>;
  existingUsers: string[];
  completeOnboarding: () => void;
  logOut: () => void;
}

export interface BacklogSlice {
  tags: TagUI[];
  items: OcioItemUI[];
  addTag: (tag: { nombre: string; icono: TagIcon; color: string }) => void;
  removeTag: (id: string) => void;
  reorderTags: (newOrderIds: string[]) => void;
  addItem: (item: { titulo: string; tagId: string; estado: OcioEstado }) => void;
  updateItem: (id: string, updates: Partial<{ estado: OcioEstado; valoracion: number; notas: string }>) => void;
  removeItem: (id: string) => void;
}

export interface SyncSlice extends SyncSnapshot, SyncActions {}
