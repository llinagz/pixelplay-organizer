import type { OcioTipo, TagIcon } from "@/schema";

const TAG_ICON_TO_OCIO_TIPO: Record<TagIcon, OcioTipo> = {
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

export const ocioTipoFromTagIcon = (icon: TagIcon): OcioTipo =>
  TAG_ICON_TO_OCIO_TIPO[icon] ?? "otro";

