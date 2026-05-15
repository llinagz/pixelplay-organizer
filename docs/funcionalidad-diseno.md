# Backlog Pixel - Funcionalidad y Diseno (V1)

read_when:
- Cuando se vaya a tocar onboarding, dashboard o sincronizacion
- Antes de cambiar contratos del AppContext
- Antes de ampliar flujos E2E

## Objetivo de producto
Backlog Pixel es un organizador de ocio local-first con experiencia offline inmediata.
La sincronizacion entre dispositivos debe ser opcional, guiada y sin friccion.

## Principios UX
- Offline first: la app debe funcionar sin red.
- Sync explicable: siempre mostrar estado de sincronizacion.
- Flujo simple: vincular dispositivo en pocos pasos.
- Recuperable: export/import como red de seguridad.

## Funcionalidad actual
- Onboarding por nombre de usuario.
- Gestion de categorias: crear, reordenar y eliminar en Dashboard.
- Gestion de items por categoria: crear, actualizar estado y borrar.
- Panel de sincronizacion en Dashboard:
  - Estado: offline, syncing, up_to_date, error.
  - Ultima sincronizacion y error amigable.
  - Vinculacion por codigo portable.
  - Exportar/Importar payload JSON validado.
- Resolucion basica de conflicto en notas:
  - Si cambia notas sobre un valor existente, se guarda copia local de respaldo.

## Contratos internos relevantes
- `AppContext` expone:
  - Estado: `syncStatus`, `lastSyncAt`, `syncError`, `isLinked`, `linkedDevices`, `lastConflict`.
  - Acciones: `startDeviceLink`, `completeDeviceLink`, `retrySync`, `exportData`, `importData`.
- `src/domain/sync.ts` contiene:
  - Tipos: `SyncStatus`, `ImportResult`, `ConflictResolutionEvent`.
  - Validacion: `parseExportPayload`.
  - Codecs: `encodeLinkCode`, `decodeLinkCode`.

## Testing y calidad
- Unit tests (Vitest): dominio sync + i18n + dominio de negocio.
- E2E (Playwright):
  - Onboarding + categoria + item.
  - Eliminar categoria desde Dashboard.
  - Flujo de panel sync (codigo, export, import).

## Limites conocidos
- `linkedDevices` en V1 es indicador orientativo y no inventario real de sesiones.
- El pairing por codigo es portable y simple, no sustituye gestion avanzada de dispositivos.
- No hay cifrado E2E custom en esta fase.
