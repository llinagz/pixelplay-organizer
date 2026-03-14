/**
 * Esquemas de datos de Backlog Pixel con Jazz.
 *
 * Define las estructuras colaborativas (CoValues) que permiten
 * sincronización automática y latencia cero gracias a Jazz.
 */
import { co, z, Group } from "jazz-tools";

// ─── Tipos auxiliares ────────────────────────────────────────────

/** Iconos disponibles para las etiquetas */
export const TAG_ICONS = [
  "gamepad",
  "book",
  "film",
  "music",
  "tv",
  "custom",
] as const;
export type TagIcon = (typeof TAG_ICONS)[number];

/** Tipos de ocio soportados */
export const OCIO_TIPOS = [
  "videojuego",
  "libro",
  "cine",
  "musica",
  "serie",
] as const;
export type OcioTipo = (typeof OCIO_TIPOS)[number];

/** Estados posibles de un ítem de ocio */
export const OCIO_ESTADOS = [
  "pendiente",
  "en_progreso",
  "completado",
  "abandonado",
] as const;
export type OcioEstado = (typeof OCIO_ESTADOS)[number];

// ─── Reglas de negocio ───────────────────────────────────────────

/** Rango válido de valoración (1–10) */
export const VALORACION_MIN = 1;
export const VALORACION_MAX = 10;

/**
 * Comprueba si una valoración numérica es válida.
 * Devuelve true si está en el rango [1, 10] y es entero.
 */
export const esValoracionValida = (v: number): boolean =>
  Number.isInteger(v) && v >= VALORACION_MIN && v <= VALORACION_MAX;

// ─── Etiquetas por defecto para nuevos usuarios ──────────────────

export const DEFAULT_TAGS: Array<{
  nombre: string;
  icono: TagIcon;
  color: string;
}> = [
  { nombre: "Videojuegos", icono: "gamepad", color: "#22c55e" },
  { nombre: "Libros", icono: "book", color: "#3b82f6" },
  { nombre: "Cine", icono: "film", color: "#a855f7" },
];

// ─── Etiquetas de estado para la UI ──────────────────────────────

export const ESTADO_LABELS: Record<OcioEstado, string> = {
  pendiente: "En cola",
  en_progreso: "En progreso",
  completado: "Completado",
  abandonado: "Abandonado",
};

export const ESTADO_COLORS: Record<OcioEstado, string> = {
  pendiente: "#6b7280",
  en_progreso: "#22c55e",
  completado: "#f59e0b",
  abandonado: "#ef4444",
};

// ─── Esquemas Jazz (CoValues) ────────────────────────────────────

/**
 * Tag — Etiqueta para categorizar ítems de ocio.
 * Cada etiqueta tiene un nombre, un icono pixel-art y un color hexadecimal.
 */
export const Tag = co.map({
  nombre: z.string(),
  icono: z.literal(TAG_ICONS),
  color: z.string(),
});
export type Tag = co.loaded<typeof Tag>;

/**
 * OcioItem — Un ítem del backlog de ocio del usuario.
 * Representa un videojuego, libro, película, etc. que el usuario
 * quiere consumir o está consumiendo.
 */
export const OcioItem = co.map({
  titulo: z.string(),
  tipo: z.literal(OCIO_TIPOS),
  estado: z.literal(OCIO_ESTADOS),
  tag: Tag,
  valoracion: z.optional(z.number()),
  notas: z.optional(z.string()),
  imagenUrl: z.optional(z.string()),
});
export type OcioItem = co.loaded<typeof OcioItem>;

/** Lista colaborativa de etiquetas */
export const ListaDeTags = co.list(Tag);
export type ListaDeTags = co.loaded<typeof ListaDeTags>;

/** Lista colaborativa de ítems de ocio */
export const ListaDeOcioItems = co.list(OcioItem);
export type ListaDeOcioItems = co.loaded<typeof ListaDeOcioItems>;

// ─── Perfil y cuenta del usuario ─────────────────────────────────

/**
 * Perfil público del usuario.
 * Extiende el perfil base de Jazz con el nombre del usuario.
 */
export const BacklogPixelProfile = co.profile({
  name: z.string(),
});
export type BacklogPixelProfile = co.loaded<typeof BacklogPixelProfile>;

/**
 * Root privado del usuario.
 * Contiene las listas de tags e ítems de ocio del usuario.
 */
export const BacklogPixelRoot = co.map({
  tags: ListaDeTags,
  items: ListaDeOcioItems,
  onboardingCompletado: z.boolean(),
});
export type BacklogPixelRoot = co.loaded<typeof BacklogPixelRoot>;

/**
 * Cuenta de usuario de Backlog Pixel.
 * Extiende la cuenta base de Jazz con el perfil personalizado y
 * el root con los datos privados del usuario.
 */
export const BacklogPixelAccount = co
  .account({
    root: BacklogPixelRoot,
    profile: BacklogPixelProfile,
  })
  .withMigration((account, creationProps?: { name: string }) => {
    // Inicializar root si no existe (primera vez)
    if (!account.$jazz.has("root")) {
      account.$jazz.set("root", {
        tags: ListaDeTags.create([]),
        items: ListaDeOcioItems.create([]),
        onboardingCompletado: false,
      });
    }

    // Inicializar perfil público si no existe
    if (!account.$jazz.has("profile")) {
      const profileGroup = Group.create();
      profileGroup.makePublic();

      account.$jazz.set(
        "profile",
        BacklogPixelProfile.create(
          { name: creationProps?.name ?? "Nuevo usuario" },
          profileGroup,
        ),
      );
    }
  });
export type BacklogPixelAccount = co.loaded<typeof BacklogPixelAccount>;
