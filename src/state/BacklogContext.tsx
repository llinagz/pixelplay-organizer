import { ReactNode, useMemo } from "react";
import type { OcioEstado } from "@/schema";
import { useItemActions, useTagActions, coId, toArray } from "@/context/services";
import type { BacklogSlice, OcioItemUI, TagUI } from "@/context/types";
import { createStrictContext } from "./createStrictContext";
import { useAppData } from "./AppDataContext";

const [BacklogContext, useBacklogSlice] = createStrictContext<BacklogSlice>("useBacklogSlice");

export const BacklogProvider = ({ children }: { children: ReactNode }) => {
  const { root } = useAppData();

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

  const { addTag, updateTag, removeTag, reorderTags } = useTagActions(root);
  const { addItem, updateItem, removeItem } = useItemActions(root);

  const value = useMemo<BacklogSlice>(
    () => ({
      tags,
      items,
      addTag,
      updateTag,
      removeTag,
      reorderTags,
      addItem,
      updateItem: (id: string, updates: Partial<{ estado: OcioEstado; valoracion: number; notas: string }>) => {
        updateItem(id, updates);
      },
      removeItem,
    }),
    [tags, items, addTag, updateTag, removeTag, reorderTags, addItem, updateItem, removeItem],
  );

  return <BacklogContext.Provider value={value}>{children}</BacklogContext.Provider>;
};

export const useBacklogState = () => {
  const { tags, items } = useBacklogSlice();
  return { tags, items };
};

export const useBacklogActions = () => {
  const { addTag, updateTag, removeTag, reorderTags, addItem, updateItem, removeItem } = useBacklogSlice();
  return { addTag, updateTag, removeTag, reorderTags, addItem, updateItem, removeItem };
};

export const useTags = () => useBacklogSlice().tags;

export const useItemsByTag = (tagId: string | null) => {
  const { items } = useBacklogSlice();
  return useMemo(() => items.filter((item) => item.tagId === tagId), [items, tagId]);
};
