/**
 * Contexto de la aplicación Backlog Pixel.
 *
 * Actúa como puente entre los componentes de la UI y Jazz.
 * Expone el hook useApp() que permite leer y escribir datos
 * que se persisten automáticamente en IndexedDB via Jazz.
 */
import { createContext, useContext, ReactNode, useMemo, useCallback } from "react";
import { useAccount, useDemoAuth, useIsAuthenticated } from "jazz-tools/react";
import {
  Tag,
  OcioItem,
  BacklogPixelAccount,
  OcioEstado,
  OcioTipo,
  TagIcon,
  ESTADO_LABELS,
  ESTADO_COLORS,
  DEFAULT_TAGS,
  esValoracionValida,
} from "@/schema";

// ─── Tipos para la interfaz del contexto ─────────────────────────

/** Representación de un tag para los componentes de UI */
export interface TagUI {
  id: string;
  nombre: string;
  icono: TagIcon;
  color: string;
}

/** Representación de un ítem de ocio para los componentes de UI */
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

/** Estado de autenticación del usuario */
export type AuthState = "anonymous" | "signedIn";

/** Interfaz pública del contexto de la app */
interface AppContextType {
  /** Estado de autenticación */
  authState: AuthState;
  /** Nombre del usuario autenticado (o undefined) */
  nombreUsuario?: string;
  /** Si el onboarding está completado */
  onboardingCompletado: boolean;
  /** Lista de tags del usuario */
  tags: TagUI[];
  /** Lista de ítems del usuario */
  items: OcioItemUI[];

  // ─── Acciones de autenticación ───────────────────────────
  signUp: (nombre: string) => Promise<void>;
  logIn: (nombre: string) => Promise<void>;
  existingUsers: string[];

  // ─── Acciones de datos ───────────────────────────────────
  completeOnboarding: () => void;
  addTag: (tag: { nombre: string; icono: TagIcon; color: string }) => void;
  removeTag: (id: string) => void;
  reorderTags: (newOrderIds: string[]) => void;
  addItem: (item: { titulo: string; tagId: string; estado: OcioEstado }) => void;
  updateItem: (id: string, updates: Partial<{ estado: OcioEstado; valoracion: number; notas: string }>) => void;
  removeItem: (id: string) => void;
  logOut: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// ─── Helpers internos ────────────────────────────────────────────

/** Obtiene el ID de un CoValue de forma type-safe */
const coId = (coValue: { $jazz: { readonly id: string } }): string => coValue.$jazz.id;

/** Convierte un CoList a un array iterable */
const toArray = <T,>(list: ArrayLike<T>): T[] => Array.from(list);

// ─── Provider ────────────────────────────────────────────────────

export const AppProvider = ({ children }: { children: ReactNode }) => {
  // Autenticación con DemoAuth
  const demoAuth = useDemoAuth();
  const isAuthenticated = useIsAuthenticated();

  // Cuenta del usuario (solo disponible si está autenticado)
  const account = useAccount(BacklogPixelAccount, {
    resolve: {
      profile: true,
      root: {
        tags: { $each: true },
        items: { $each: { tag: true } },
      },
    },
  });

  // Verificar si la cuenta está completamente cargada
  const isLoaded = isAuthenticated && account?.$isLoaded;
  const root = isLoaded ? account.root : undefined;
  const profile = isLoaded ? account.profile : undefined;

  // ─── Convertir CoValues a tipos UI planos ──────────────────

  const tags: TagUI[] = useMemo(() => {
    if (!root?.tags) return [];
    const resultado: TagUI[] = [];
    const arr = toArray(root.tags);
    for (const t of arr) {
      if (t != null && t.$isLoaded) {
        resultado.push({
          id: coId(t),
          nombre: t.nombre,
          icono: t.icono,
          color: t.color,
        });
      }
    }
    return resultado;
  }, [root?.tags]);

  const items: OcioItemUI[] = useMemo(() => {
    if (!root?.items) return [];
    const resultado: OcioItemUI[] = [];
    const arr = toArray(root.items);
    for (const i of arr) {
      if (i != null && i.$isLoaded) {
        resultado.push({
          id: coId(i),
          titulo: i.titulo,
          tipo: i.tipo,
          estado: i.estado,
          tagId: i.tag ? coId(i.tag) : "",
          valoracion: i.valoracion ?? undefined,
          notas: i.notas ?? undefined,
          imagenUrl: i.imagenUrl ?? undefined,
        });
      }
    }
    return resultado;
  }, [root?.items]);

  // ─── Acciones ──────────────────────────────────────────────

  const completeOnboarding = useCallback(() => {
    if (!root) return;
    root.$jazz.applyDiff({ onboardingCompletado: true });
  }, [root]);

  const addTag = useCallback(
    (tagData: { nombre: string; icono: TagIcon; color: string }) => {
      if (!root?.tags) return;
      const nuevoTag = Tag.create(tagData);
      root.tags.$jazz.push(nuevoTag);
    },
    [root],
  );

  const removeTag = useCallback(
    (id: string) => {
      if (!root?.tags || !root?.items) return;

      // Eliminar el tag
      const tagArr = toArray(root.tags);
      const tagIndex = tagArr.findIndex((t) => t != null && coId(t) === id);
      if (tagIndex !== -1) {
        root.tags.$jazz.splice(tagIndex, 1);
      }

      // Eliminar ítems asociados a este tag (en orden inverso)
      const itemArr = toArray(root.items);
      for (let i = itemArr.length - 1; i >= 0; i--) {
        const item = itemArr[i];
        if (item?.tag && coId(item.tag) === id) {
          root.items.$jazz.splice(i, 1);
        }
      }
    },
    [root],
  );

  const reorderTags = useCallback(
    (newOrderIds: string[]) => {
      if (!root?.tags) return;

      for (let i = 0; i < newOrderIds.length; i++) {
        const id = newOrderIds[i];
        const currentArr = toArray(root.tags);
        const currentIndex = currentArr.findIndex((t) => t != null && coId(t) === id);

        if (currentIndex !== -1 && currentIndex !== i) {
          const tag = currentArr[currentIndex];
          if (tag) {
            root.tags.$jazz.splice(currentIndex, 1);
            root.tags.$jazz.splice(i, 0, tag);
          }
        }
      }
    },
    [root],
  );

  const addItem = useCallback(
    (itemData: { titulo: string; tagId: string; estado: OcioEstado }) => {
      if (!root?.tags || !root?.items) return;

      // Buscar el tag referenciado
      const tagArr = toArray(root.tags);
      const tag = tagArr.find((t) => t != null && coId(t) === itemData.tagId);
      if (!tag) return;

      // Determinar el tipo según el icono del tag
      const tipoMap: Record<TagIcon, OcioTipo> = {
        gamepad: "videojuego",
        book: "libro",
        film: "cine",
        music: "musica",
        tv: "serie",
        monitor: "anime",
        popcorn: "cine",
        comic: "manga",
        utensils: "comida",
        ticket: "plan",
        cake: "evento",
        gift: "compra",
        cart: "compra",
        dumbbell: "deporte",
        custom: "otro",
      };
      const tipo: OcioTipo = tipoMap[tag.icono] ?? "otro";

      const nuevoItem = OcioItem.create({
        titulo: itemData.titulo,
        tipo,
        estado: itemData.estado,
        tag,
      });
      root.items.$jazz.push(nuevoItem);
    },
    [root],
  );

  const updateItem = useCallback(
    (id: string, updates: Partial<{ estado: OcioEstado; valoracion: number; notas: string }>) => {
      if (!root?.items) return;
      const itemArr = toArray(root.items);
      const item = itemArr.find((i) => i != null && coId(i) === id);
      if (!item) return;

      // Filtrar valoración inválida para no persistir basura
      const diff: typeof updates = { ...updates };
      if (diff.valoracion !== undefined && !esValoracionValida(diff.valoracion)) {
        delete diff.valoracion;
      }

      item.$jazz.applyDiff(diff);
    },
    [root],
  );

  const removeItem = useCallback(
    (id: string) => {
      if (!root?.items) return;
      const itemArr = toArray(root.items);
      const idx = itemArr.findIndex((i) => i != null && coId(i) === id);
      if (idx !== -1) {
        root.items.$jazz.splice(idx, 1);
      }
    },
    [root],
  );

  const logOut = useCallback(() => {
    localStorage.clear();
    window.location.reload();
  }, []);

  // ─── Valor del contexto ────────────────────────────────────

  const value: AppContextType = useMemo(
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
      demoAuth, isLoaded, profile, root,
      tags, items,
      completeOnboarding, addTag, removeTag, reorderTags,
      addItem, updateItem, removeItem, logOut,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// ─── Hook público ────────────────────────────────────────────────

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp debe usarse dentro de un AppProvider");
  }
  return context;
};

// Re-exportar constantes útiles para los componentes
export { ESTADO_LABELS, ESTADO_COLORS, DEFAULT_TAGS };
export type { OcioEstado, TagIcon };
