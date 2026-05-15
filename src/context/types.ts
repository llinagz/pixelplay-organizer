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

