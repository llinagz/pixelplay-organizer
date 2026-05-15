import { ReactNode, useEffect, useMemo, useState } from "react";
import type { ImportResult } from "@/domain/sync";
import type { SyncSlice, SyncSnapshot } from "@/context/types";
import { useSyncActions as useSyncDomainActions } from "@/context/services";
import { createStrictContext } from "./createStrictContext";
import { useAppData } from "./AppDataContext";

const [SyncContext, useSyncSlice] = createStrictContext<SyncSlice>("useSyncSlice");

export const SyncProvider = ({ children }: { children: ReactNode }) => {
  const { root } = useAppData();
  const syncActions = useSyncDomainActions(root);

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

  const completeDeviceLink = (code: string): ImportResult => {
    const result = syncActions.completeDeviceLink(code);
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

  const startDeviceLink = (): string => {
    const code = syncActions.startDeviceLink();
    setSyncSnapshot((prev) => ({
      ...prev,
      isLinked: true,
      linkedDevices: Math.max(prev.linkedDevices ?? 1, 1),
    }));
    return code;
  };

  const importData = (payload: string): ImportResult => {
    const result = syncActions.importData(payload);
    setSyncSnapshot((prev) => ({
      ...prev,
      syncStatus: result.ok ? "up_to_date" : "error",
      syncError: result.ok ? undefined : result.message,
      lastSyncAt: result.ok ? new Date().toISOString() : prev.lastSyncAt,
    }));
    return result;
  };

  const value = useMemo<SyncSlice>(
    () => ({
      syncStatus: syncSnapshot.syncStatus,
      lastSyncAt: syncSnapshot.lastSyncAt,
      syncError: syncSnapshot.syncError,
      linkedDevices: syncSnapshot.linkedDevices,
      isLinked: syncSnapshot.isLinked,
      lastConflict: syncSnapshot.lastConflict,
      startDeviceLink,
      completeDeviceLink,
      retrySync,
      exportData: syncActions.exportData,
      importData,
    }),
    [syncSnapshot, syncActions.exportData, startDeviceLink, completeDeviceLink, retrySync, importData],
  );

  return <SyncContext.Provider value={value}>{children}</SyncContext.Provider>;
};

export const useSyncState = () => {
  const { syncStatus, lastSyncAt, syncError, linkedDevices, isLinked, lastConflict } = useSyncSlice();
  return { syncStatus, lastSyncAt, syncError, linkedDevices, isLinked, lastConflict };
};

export const useSyncActionsState = () => {
  const { startDeviceLink, completeDeviceLink, retrySync, exportData, importData } = useSyncSlice();
  return { startDeviceLink, completeDeviceLink, retrySync, exportData, importData };
};

export const useSyncStatus = () => useSyncSlice().syncStatus;
