import { useCallback } from "react";
import { OcioItem, Tag, type OcioEstado, type TagIcon } from "@/schema";
import { esValoracionValida } from "@/schema";
import { ocioTipoFromTagIcon } from "@/domain/ocio";
import { clearAppStorage } from "@/domain/session";

const coId = (coValue: { $jazz: { readonly id: string } }): string => coValue.$jazz.id;
const toArray = <T,>(list: ArrayLike<T>): T[] => Array.from(list);

export const useOnboardingActions = (root: any) => {
  const completeOnboarding = useCallback(() => {
    if (!root) return;
    root.$jazz.applyDiff({ onboardingCompletado: true });
  }, [root]);

  return { completeOnboarding };
};

export const useTagActions = (root: any) => {
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

      const tagArr = toArray(root.tags);
      const tagIndex = tagArr.findIndex((t) => t != null && coId(t) === id);
      if (tagIndex !== -1) root.tags.$jazz.splice(tagIndex, 1);

      const itemArr = toArray(root.items);
      for (let i = itemArr.length - 1; i >= 0; i -= 1) {
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
      for (let i = 0; i < newOrderIds.length; i += 1) {
        const id = newOrderIds[i];
        const currentArr = toArray(root.tags);
        const currentIndex = currentArr.findIndex((t) => t != null && coId(t) === id);
        if (currentIndex !== -1 && currentIndex !== i) {
          const tag = currentArr[currentIndex];
          if (!tag) continue;
          root.tags.$jazz.splice(currentIndex, 1);
          root.tags.$jazz.splice(i, 0, tag);
        }
      }
    },
    [root],
  );

  return { addTag, removeTag, reorderTags };
};

export const useItemActions = (root: any) => {
  const addItem = useCallback(
    (itemData: { titulo: string; tagId: string; estado: OcioEstado }) => {
      if (!root?.tags || !root?.items) return;
      const tagArr = toArray(root.tags);
      const tag = tagArr.find((t) => t != null && coId(t) === itemData.tagId);
      if (!tag) return;

      const nuevoItem = OcioItem.create({
        titulo: itemData.titulo,
        tipo: ocioTipoFromTagIcon(tag.icono),
        estado: itemData.estado,
        tag,
      });
      root.items.$jazz.push(nuevoItem);
    },
    [root],
  );

  const updateItem = useCallback(
    (
      id: string,
      updates: Partial<{ estado: OcioEstado; valoracion: number; notas: string }>,
    ) => {
      if (!root?.items) return;
      const itemArr = toArray(root.items);
      const item = itemArr.find((i) => i != null && coId(i) === id);
      if (!item) return;

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
      if (idx !== -1) root.items.$jazz.splice(idx, 1);
    },
    [root],
  );

  return { addItem, updateItem, removeItem };
};

export const useAuthActions = () => {
  const logOut = useCallback(() => {
    clearAppStorage();
    window.location.reload();
  }, []);

  return { logOut };
};

export { coId, toArray };

