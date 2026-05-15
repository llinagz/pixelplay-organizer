/**
 * Contexto principal de Backlog Pixel.
 *
 * Mantiene la API pública useApp, pero delega lógica de negocio
 * a servicios internos para mejorar mantenibilidad y testabilidad.
 */
import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";
import { useAccount, useDemoAuth, useIsAuthenticated } from "jazz-tools/react";
import {
  BacklogPixelAccount,
  DEFAULT_TAGS,
  ESTADO_COLORS,
  ESTADO_LABELS,
  OcioEstado,
  TagIcon,
} from "@/schema";
import { useAuthActions, useItemActions, useOnboardingActions, useSyncActions, useTagActions, coId, toArray } from "./services";
import type { AuthState, OcioItemUI, SyncActions, SyncSnapshot, TagUI } from "./types";
import type { ConflictResolutionEvent, ImportResult, SyncStatus } from "@/domain/sync";

interface AppContextType {
  authState: AuthState;
  nombreUsuario?: string;
  onboardingCompletado: boolean;
  tags: TagUI[];
  items: OcioItemUI[];
  signUp: (nombre: string) => Promise<void>;
  logIn: (nombre: string) => Promise<void>;
  existingUsers: string[];
  completeOnboarding: () => void;
  addTag: (tag: { nombre: string; icono: TagIcon; color: string }) => void;
  removeTag: (id: string) => void;
  reorderTags: (newOrderIds: string[]) => void;
  addItem: (item: { titulo: string; tagId: string; estado: OcioEstado }) => void;
  updateItem: (
    id: string,
    updates: Partial<{ estado: OcioEstado; valoracion: number; notas: string }>,
  ) => void;
  removeItem: (id: string) => void;
  logOut: () => void;
  syncStatus: SyncStatus;
  lastSyncAt?: string;
  syncError?: string;
  linkedDevices: number | null;
  isLinked: boolean;
  lastConflict?: ConflictResolutionEvent;
  startDeviceLink: SyncActions["startDeviceLink"];
  completeDeviceLink: SyncActions["completeDeviceLink"];
  retrySync: SyncActions["retrySync"];
  exportData: SyncActions["exportData"];
  importData: SyncActions["importData"];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const demoAuth = useDemoAuth();
  const isAuthenticated = useIsAuthenticated();
  const account = useAccount(BacklogPixelAccount, {
    resolve: {
      profile: true,
      root: {
        tags: { $each: true },
        items: { $each: { tag: true } },
      },
    },
  });

  const isLoaded = isAuthenticated && account?.$isLoaded;
  const root = isLoaded ? account.root : undefined;
  const profile = isLoaded ? account.profile : undefined;

  const tags: TagUI[] = useMemo(() => {
    if (!root?.tags) return [];
    return toArray(root.tags)
      .filter((t) => t != null && t.$isLoaded)
      .map((t) => ({
        id: coId(t),
        nombre: t.nombre,
        icono: t.icono,
        color: t.color,
      }));
  }, [root?.tags]);

  const items: OcioItemUI[] = useMemo(() => {
    if (!root?.items) return [];
    return toArray(root.items)
      .filter((i) => i != null && i.$isLoaded)
      .map((i) => ({
        id: coId(i),
        titulo: i.titulo,
        tipo: i.tipo,
        estado: i.estado,
        tagId: i.tag ? coId(i.tag) : "",
        valoracion: i.valoracion ?? undefined,
        notas: i.notas ?? undefined,
        imagenUrl: i.imagenUrl ?? undefined,
      }));
  }, [root?.items]);

  const { completeOnboarding } = useOnboardingActions(root);
  const { addTag, removeTag, reorderTags } = useTagActions(root);
  const { addItem, updateItem, removeItem } = useItemActions(root);
  const { startDeviceLink, completeDeviceLink, exportData, importData } = useSyncActions(root);
  const { logOut } = useAuthActions();
  const [syncSnapshot, setSyncSnapshot] = useState<SyncSnapshot>({
    syncStatus: navigator.onLine ? "up_to_date" : "offline",
    lastSyncAt: undefined,
    syncError: undefined,
    linkedDevices: null,
    isLinked: false,
    lastConflict: undefined,
  });

  useEffect(() => {
    const onOnline = () => {
      setSyncSnapshot((prev) => ({
        ...prev,
        syncStatus: "up_to_date",
        lastSyncAt: new Date().toISOString(),
        syncError: undefined,
      }));
    };
    const onOffline = () => {
      setSyncSnapshot((prev) => ({
        ...prev,
        syncStatus: "offline",
      }));
    };

    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);

  const retrySync = async () => {
    setSyncSnapshot((prev) => ({ ...prev, syncStatus: "syncing", syncError: undefined }));
    await new Promise((resolve) => setTimeout(resolve, 350));
    if (!navigator.onLine) {
      setSyncSnapshot((prev) => ({
        ...prev,
        syncStatus: "error",
        syncError: "Sin conexion a internet",
      }));
      return;
    }
    setSyncSnapshot((prev) => ({
      ...prev,
      syncStatus: "up_to_date",
      lastSyncAt: new Date().toISOString(),
      syncError: undefined,
    }));
  };

  const wrappedCompleteDeviceLink = (code: string): ImportResult => {
    const result = completeDeviceLink(code);
    setSyncSnapshot((prev) => ({
      ...prev,
      isLinked: result.ok || prev.isLinked,
      linkedDevices: result.ok ? 2 : prev.linkedDevices,
      syncStatus: result.ok ? "up_to_date" : "error",
      syncError: result.ok ? undefined : result.message,
      lastSyncAt: result.ok ? new Date().toISOString() : prev.lastSyncAt,
    }));
    return result;
  };

  const wrappedStartDeviceLink = (): string => {
    const code = startDeviceLink();
    setSyncSnapshot((prev) => ({
      ...prev,
      isLinked: true,
      linkedDevices: Math.max(prev.linkedDevices ?? 1, 1),
    }));
    return code;
  };

  const wrappedImportData = (payload: string): ImportResult => {
    const result = importData(payload);
    setSyncSnapshot((prev) => ({
      ...prev,
      syncStatus: result.ok ? "up_to_date" : "error",
      syncError: result.ok ? undefined : result.message,
      lastSyncAt: result.ok ? new Date().toISOString() : prev.lastSyncAt,
    }));
    return result;
  };

  const wrappedUpdateItem = (
    id: string,
    updates: Partial<{ estado: OcioEstado; valoracion: number; notas: string }>,
  ) => {
    updateItem(id, updates, (event) => {
      setSyncSnapshot((prev) => ({ ...prev, lastConflict: event }));
    });
  };

  const value = useMemo<AppContextType>(
    () => ({
      authState: demoAuth.state,
      nombreUsuario: profile?.$isLoaded ? profile.name : undefined,
      onboardingCompletado: root?.onboardingCompletado ?? false,
      tags,
      items,
      signUp: demoAuth.signUp,
      logIn: demoAuth.logIn,
      existingUsers: demoAuth.existingUsers,
      completeOnboarding,
      addTag,
      removeTag,
      reorderTags,
      addItem,
      updateItem: wrappedUpdateItem,
      removeItem,
      logOut,
      syncStatus: syncSnapshot.syncStatus,
      lastSyncAt: syncSnapshot.lastSyncAt,
      syncError: syncSnapshot.syncError,
      linkedDevices: syncSnapshot.linkedDevices,
      isLinked: syncSnapshot.isLinked,
      lastConflict: syncSnapshot.lastConflict,
      startDeviceLink: wrappedStartDeviceLink,
      completeDeviceLink: wrappedCompleteDeviceLink,
      retrySync,
      exportData,
      importData: wrappedImportData,
    }),
    [
      demoAuth,
      profile,
      root,
      tags,
      items,
      completeOnboarding,
      addTag,
      removeTag,
      reorderTags,
      addItem,
      wrappedUpdateItem,
      removeItem,
      logOut,
      syncSnapshot,
      wrappedStartDeviceLink,
      wrappedCompleteDeviceLink,
      retrySync,
      exportData,
      wrappedImportData,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp debe usarse dentro de un AppProvider");
  }
  return context;
};

export { ESTADO_COLORS, ESTADO_LABELS, DEFAULT_TAGS };
export type { OcioEstado, TagIcon };
export type { AuthState, OcioItemUI, TagUI } from "./types";

