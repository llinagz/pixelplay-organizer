# Backlog Pixel

Backlog Pixel es un organizador de ocio local-first con estética pixel-art.
Permite gestionar categorías e ítems (videojuegos, libros, cine, etc.) con experiencia offline y sincronización guiada.

## Características

- Local-first con Jazz (persistencia en navegador y sincronización entre dispositivos).
- Flujo offline-first: la app funciona sin red.
- Panel de sincronización con estado, emparejamiento por código y export/import JSON.
- Onboarding simple: nombre de usuario + configuración de categorías.
- UI pixel-art con Tailwind CSS.
- Cobertura de calidad con tests unitarios (Vitest) y E2E (Playwright).

## Stack

- React + TypeScript
- Vite
- Jazz (`jazz-tools`)
- Tailwind CSS
- Vitest + Testing Library
- Playwright

## Arquitectura (actual)

La app está separada por capas y estado segmentado:

- `src/domain`: reglas puras de negocio (rating, sync, colecciones, etc.).
- `src/context/services.ts`: casos de uso y adaptadores sobre Jazz (CRUD, import/export, link, conflictos).
- `src/state`: providers y hooks especializados:
  - `AuthContext`: sesión y onboarding.
  - `BacklogContext`: categorías e ítems.
  - `SyncContext`: estado y acciones de sincronización.

Hooks principales expuestos desde `src/state/index.tsx`:

- `useAuthState`, `useAuthActionsState`
- `useBacklogState`, `useBacklogActions`, `useTags`, `useItemsByTag`
- `useSyncState`, `useSyncActionsState`, `useSyncStatus`

## Requisitos

- Node.js 20+
- npm 10+

## Instalación

```bash
git clone https://github.com/llinagz/pixelplay-organizer.git
cd pixelplay-organizer
npm install
```

## Desarrollo

```bash
npm run dev
```

Por defecto Vite levanta en `http://localhost:8080`.

## Scripts

- `npm run dev`: entorno local.
- `npm run build`: build de producción.
- `npm run preview`: servir build local.
- `npm run lint`: análisis estático con ESLint.
- `npm run test`: tests unitarios con Vitest.
- `npm run test:e2e`: tests E2E con Playwright.

## Calidad

Antes de abrir PR o mergear:

```bash
npm run lint
npm run test
npm run test:e2e
npm run build
```

## Estructura rápida

- `src/pages`: entradas de pantalla.
- `src/components`: componentes UI y de dominio visual.
- `src/state`: estado global segmentado por responsabilidad.
- `src/domain`: lógica de negocio pura.
- `tests/e2e`: flujos críticos Playwright.
- `docs/funcionalidad-diseno.md`: guía funcional v1 y contratos internos.

## Notas

- La sincronización usa Jazz Cloud vía WebSocket.
- El proyecto mantiene estética pixel-art estricta (sin estilos suaves modernos).
