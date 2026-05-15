import type { OcioEstado, OcioTipo, TagIcon } from "@/schema";

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

