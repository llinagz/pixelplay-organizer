import { ReactNode } from "react";
import { AppDataProvider } from "./AppDataContext";
import { AuthProvider } from "./AuthContext";
import { BacklogProvider } from "./BacklogContext";
import { SyncProvider } from "./SyncContext";

export const AppStateProvider = ({ children }: { children: ReactNode }) => {
  return (
    <AppDataProvider>
      <AuthProvider>
        <BacklogProvider>
          <SyncProvider>{children}</SyncProvider>
        </BacklogProvider>
      </AuthProvider>
    </AppDataProvider>
  );
};

export { useAuthState, useAuthActionsState } from "./AuthContext";
export { useBacklogState, useBacklogActions, useItemsByTag, useTags } from "./BacklogContext";
export { useSyncState, useSyncActionsState, useSyncStatus } from "./SyncContext";
