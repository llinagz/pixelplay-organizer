import { useCallback } from "react";
import { OcioItem, Tag, type BacklogPixelRoot, type OcioEstado } from "@/schema";
import { esValoracionValida } from "@/schema";
import { ocioTipoFromTagIcon } from "@/domain/ocio";
import { clearAppStorage } from "@/domain/session";
import {
  conflictBackupKey,
  createConflictEvent,
  decodeLinkCode,
  encodeLinkCode,
  parseExportPayload,
  type ConflictResolutionEvent,
  type ExportPayload,
  type ImportResult,
} from "@/domain/sync";

export type CoValueWithId = { $jazz: { readonly id: string } };
export const coId = (coValue: CoValueWithId): string => coValue.$jazz.id;
export const toArray = <T,>(list: ArrayLike<T>): T[] => Array.from(list);

export const useOnboardingActions = (root: BacklogPixelRoot | undefined) => {
  const completeOnboarding = useCallback(() => {
    if (!root) return;
    root.$jazz.applyDiff({ onboardingCompletado: true });
  }, [root]);

  return { completeOnboarding };
};

export const useTagActions = (root: BacklogPixelRoot | undefined) => {
  const addTag = useCallback(
    (tagData: { nombre: string; icono: Tag["icono"]; color: string }) => {
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

export const useItemActions = (root: BacklogPixelRoot | undefined) => {
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
      onConflict?: (event: ConflictResolutionEvent) => void,
    ) => {
      if (!root?.items) return;
      const itemArr = toArray(root.items);
      const item = itemArr.find((i) => i != null && coId(i) === id);
      if (!item) return;

      const diff: typeof updates = { ...updates };
      if (diff.valoracion !== undefined && !esValoracionValida(diff.valoracion)) {
        delete diff.valoracion;
      }
      if (
        diff.notas !== undefined &&
        item.notas !== undefined &&
        diff.notas.trim() !== item.notas.trim()
      ) {
        const event = createConflictEvent({
          itemId: id,
          localValue: item.notas,
          remoteValue: diff.notas,
        });
        localStorage.setItem(conflictBackupKey(id), item.notas);
        onConflict?.(event);
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

const getPayloadFromRoot = (root: BacklogPixelRoot | undefined): ExportPayload => {
  const tags = root?.tags ? toArray(root.tags).filter(Boolean) : [];
  const items = root?.items ? toArray(root.items).filter(Boolean) : [];

  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    onboardingCompletado: Boolean(root?.onboardingCompletado),
    tags: tags.map((tag) => ({
      nombre: tag.nombre,
      icono: tag.icono,
      color: tag.color,
    })),
    items: items.map((item) => ({
      titulo: item.titulo,
      tipo: item.tipo,
      estado: item.estado,
      tagNombre: item.tag?.nombre ?? "",
      valoracion: item.valoracion ?? undefined,
      notas: item.notas ?? undefined,
      imagenUrl: item.imagenUrl ?? undefined,
    })),
  };
};

export const useSyncActions = (root: BacklogPixelRoot | undefined) => {
  const exportData = useCallback((): string => {
    const payload = getPayloadFromRoot(root);
    return JSON.stringify(payload);
  }, [root]);

  const importData = useCallback(
    (payloadRaw: string): ImportResult => {
      if (!root?.tags || !root?.items) {
        return { ok: false, errorCode: "unknown", message: "Cuenta no disponible" };
      }

      try {
        const parsed = JSON.parse(payloadRaw);
        const validation = parseExportPayload(parsed);
        if (!validation.success) {
          return {
            ok: false,
            errorCode: "invalid_schema",
            message: "El formato del backup no es valido",
          };
        }

        const payload = validation.data;
        while (root.items.length > 0) root.items.$jazz.splice(0, 1);
        while (root.tags.length > 0) root.tags.$jazz.splice(0, 1);

        const tagsByName = new Map<string, Tag>();
        for (const tag of payload.tags) {
          const created = Tag.create(tag);
          root.tags.$jazz.push(created);
          tagsByName.set(tag.nombre, created);
        }

        for (const item of payload.items) {
          const tag = tagsByName.get(item.tagNombre);
          if (!tag) continue;
          root.items.$jazz.push(
            OcioItem.create({
              titulo: item.titulo,
              tipo: item.tipo,
              estado: item.estado,
              tag,
              valoracion: item.valoracion,
              notas: item.notas,
              imagenUrl: item.imagenUrl,
            }),
          );
        }

        root.$jazz.applyDiff({ onboardingCompletado: payload.onboardingCompletado });
        return {
          ok: true,
          importedTags: payload.tags.length,
          importedItems: payload.items.length,
        };
      } catch {
        return {
          ok: false,
          errorCode: "invalid_json",
          message: "No se pudo importar el contenido",
        };
      }
    },
    [root],
  );

  const startDeviceLink = useCallback((): string => {
    const payload = getPayloadFromRoot(root);
    return encodeLinkCode(payload);
  }, [root]);

  const completeDeviceLink = useCallback(
    (code: string): ImportResult => {
      const decoded = decodeLinkCode(code);
      if (!decoded.ok || !decoded.payload) return decoded;
      return importData(JSON.stringify(decoded.payload));
    },
    [importData],
  );

  return { exportData, importData, startDeviceLink, completeDeviceLink };
};

export const useAuthActions = () => {
  const logOut = useCallback(() => {
    clearAppStorage();
    window.location.reload();
  }, []);

  return { logOut };
};
