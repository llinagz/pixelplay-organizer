/**
 * Contexto principal de Backlog Pixel.
 *
 * Mantiene la API pública useApp, pero delega lógica de negocio
 * a servicios internos para mejorar mantenibilidad y testabilidad.
 */
import { createContext, ReactNode, useContext, useMemo } from "react";
import { useAccount, useDemoAuth, useIsAuthenticated } from "jazz-tools/react";
import {
  BacklogPixelAccount,
  DEFAULT_TAGS,
  ESTADO_COLORS,
  ESTADO_LABELS,
  OcioEstado,
  TagIcon,
} from "@/schema";
import { useAuthActions, useItemActions, useOnboardingActions, useTagActions, coId, toArray } from "./services";
import type { AuthState, OcioItemUI, TagUI } from "./types";

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
  const { logOut } = useAuthActions();

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
      updateItem,
      removeItem,
      logOut,
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
      updateItem,
      removeItem,
      logOut,
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

