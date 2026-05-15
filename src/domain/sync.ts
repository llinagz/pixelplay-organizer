import { z } from "zod";
import { OCIO_ESTADOS, OCIO_TIPOS, TAG_ICONS } from "@/schema";

export type SyncStatus = "offline" | "syncing" | "up_to_date" | "error";

export interface ConflictResolutionEvent {
  itemId: string;
  field: "notas";
  localValue: string;
  remoteValue: string;
  resolvedAt: string;
}

export interface ImportResult {
  ok: boolean;
  importedTags?: number;
  importedItems?: number;
  errorCode?: "invalid_json" | "invalid_schema" | "unknown";
  message?: string;
}

const exportTagSchema = z.object({
  nombre: z.string().min(1),
  icono: z.enum(TAG_ICONS),
  color: z.string().min(1),
});

const exportItemSchema = z.object({
  titulo: z.string().min(1),
  tipo: z.enum(OCIO_TIPOS),
  estado: z.enum(OCIO_ESTADOS),
  tagNombre: z.string().min(1),
  valoracion: z.number().int().min(1).max(10).optional(),
  notas: z.string().optional(),
  imagenUrl: z.string().optional(),
});

const exportPayloadSchema = z.object({
  version: z.literal(1),
  exportedAt: z.string(),
  onboardingCompletado: z.boolean(),
  tags: z.array(exportTagSchema),
  items: z.array(exportItemSchema),
});

export type ExportPayload = z.infer<typeof exportPayloadSchema>;
export const parseExportPayload = (value: unknown) => exportPayloadSchema.safeParse(value);

export const encodeLinkCode = (payload: ExportPayload): string => {
  const json = JSON.stringify(payload);
  return btoa(unescape(encodeURIComponent(json)));
};

export const decodeLinkCode = (code: string): ImportResult & { payload?: ExportPayload } => {
  try {
    const json = decodeURIComponent(escape(atob(code.trim())));
    const parsed = JSON.parse(json);
    const result = parseExportPayload(parsed);
    if (!result.success) {
      return {
        ok: false,
        errorCode: "invalid_schema",
        message: "El codigo no tiene el formato esperado",
      };
    }
    return { ok: true, payload: result.data };
  } catch {
    return {
      ok: false,
      errorCode: "invalid_json",
      message: "No se pudo leer el codigo",
    };
  }
};

export const createConflictEvent = (args: {
  itemId: string;
  localValue: string;
  remoteValue: string;
}): ConflictResolutionEvent => ({
  itemId: args.itemId,
  field: "notas",
  localValue: args.localValue,
  remoteValue: args.remoteValue,
  resolvedAt: new Date().toISOString(),
});

export const conflictBackupKey = (itemId: string): string =>
  `backlog-pixel:note-conflict:${itemId}`;
