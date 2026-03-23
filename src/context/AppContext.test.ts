/**
 * Tests unitarios para la lógica de negocio del AppContext.
 *
 * Valida las operaciones CRUD sobre los esquemas Jazz que el contexto
 * expone a los componentes de UI: crear/eliminar tags, crear/actualizar/
 * eliminar ítems de ocio y completar el onboarding.
 *
 * Usa jazz-tools/testing para simular el entorno local-first sin red.
 */
import { describe, it, expect, beforeEach } from "vitest";
import { setupJazzTestSync, createJazzTestAccount } from "jazz-tools/testing";
import {
  Tag,
  OcioItem,
  BacklogPixelAccount,
  TagIcon,
  OcioTipo,
} from "@/schema";

// ─── Helpers que replican la lógica interna de AppContext ─────────

/** Obtiene el ID de un CoValue */
const coId = (coValue: { $jazz: { readonly id: string } }): string =>
  coValue.$jazz.id;

/**
 * Convierte un CoList a un array tipado.
 * En el entorno de test sincrónico, los elementos siempre están cargados,
 * por eso el cast a T[] es seguro.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const toLoadedArray = <T>(list: any): T[] => Array.from(list) as T[];

/** Mapa de icono → tipo de ocio (igual que en AppContext) */
const tipoMap: Record<TagIcon, OcioTipo> = {
  gamepad: "videojuego",
  book: "libro",
  film: "cine",
  music: "musica",
  tv: "serie",
  custom: "videojuego",
};

// ─── Fixtures ────────────────────────────────────────────────────

/**
 * Root del usuario en el entorno de test.
 * Usamos `any` porque los tipos de Jazz usan MaybeLoaded para las refs,
 * pero en el entorno sincrónico de test siempre están cargados.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let root: any;

beforeEach(async () => {
  await setupJazzTestSync();
  const account = await createJazzTestAccount({
    AccountSchema: BacklogPixelAccount,
    isCurrentActiveAccount: true,
    creationProps: { name: "Jugador Test" },
  });

  // La migración de la cuenta crea root con listas vacías.
  root = account.root;
});

// ─── Tests ───────────────────────────────────────────────────────

describe("Operaciones CRUD — AppContext", () => {
  // ─── Onboarding ──────────────────────────────────────────────

  describe("Onboarding", () => {
    it("comienza con onboardingCompletado = false", () => {
      expect(root.onboardingCompletado).toBe(false);
    });

    it("se puede completar el onboarding", () => {
      root.$jazz.applyDiff({ onboardingCompletado: true });
      expect(root.onboardingCompletado).toBe(true);
    });
  });

  // ─── Tags ────────────────────────────────────────────────────

  describe("addTag", () => {
    it("añade un tag a la lista vacía", () => {
      const nuevoTag = Tag.create({
        nombre: "Videojuegos",
        icono: "gamepad",
        color: "#22c55e",
      });
      root.tags.$jazz.push(nuevoTag);

      expect(root.tags.length).toBe(1);
      const arr = toLoadedArray<Tag>(root.tags);
      expect(arr[0]!.nombre).toBe("Videojuegos");
    });

    it("añade múltiples tags manteniendo el orden", () => {
      const tagsData = [
        { nombre: "Videojuegos", icono: "gamepad" as const, color: "#22c55e" },
        { nombre: "Libros", icono: "book" as const, color: "#3b82f6" },
        { nombre: "Cine", icono: "film" as const, color: "#a855f7" },
      ];

      for (const t of tagsData) {
        root.tags.$jazz.push(Tag.create(t));
      }

      expect(root.tags.length).toBe(3);
      const arr = toLoadedArray<Tag>(root.tags);
      expect(arr[0]!.nombre).toBe("Videojuegos");
      expect(arr[1]!.nombre).toBe("Libros");
      expect(arr[2]!.nombre).toBe("Cine");
    });
  });

  describe("reorderTags", () => {
    it("reordena los tags correctamente", () => {
      // Setup: añadir 3 tags
      const t1 = Tag.create({ nombre: "Uno", icono: "gamepad", color: "#000" });
      const t2 = Tag.create({ nombre: "Dos", icono: "book", color: "#000" });
      const t3 = Tag.create({ nombre: "Tres", icono: "film", color: "#000" });
      root.tags.$jazz.push(t1);
      root.tags.$jazz.push(t2);
      root.tags.$jazz.push(t3);

      expect(root.tags.length).toBe(3);
      expect(toLoadedArray<Tag>(root.tags)[0]!.nombre).toBe("Uno");
      expect(toLoadedArray<Tag>(root.tags)[1]!.nombre).toBe("Dos");
      expect(toLoadedArray<Tag>(root.tags)[2]!.nombre).toBe("Tres");

      // Simular reorder (t3, t1, t2)
      const newOrderIds = [coId(t3), coId(t1), coId(t2)];

      for (let i = 0; i < newOrderIds.length; i++) {
        const id = newOrderIds[i];
        const currentArr = toLoadedArray<Tag>(root.tags);
        const currentIndex = currentArr.findIndex((t) => t != null && coId(t) === id);

        if (currentIndex !== -1 && currentIndex !== i) {
          const tag = currentArr[currentIndex];
          if (tag) {
            root.tags.$jazz.splice(currentIndex, 1);
            root.tags.$jazz.splice(i, 0, tag);
          }
        }
      }

      const reordered = toLoadedArray<Tag>(root.tags);
      expect(reordered[0]!.nombre).toBe("Tres");
      expect(reordered[1]!.nombre).toBe("Uno");
      expect(reordered[2]!.nombre).toBe("Dos");
    });
  });

  describe("removeTag", () => {
    it("elimina un tag por su ID", () => {
      const tag = Tag.create({
        nombre: "Borrar",
        icono: "custom",
        color: "#000",
      });
      root.tags.$jazz.push(tag);
      expect(root.tags.length).toBe(1);

      const tagId = coId(tag);
      const arr = toLoadedArray<Tag>(root.tags);
      const idx = arr.findIndex((t) => t != null && coId(t) === tagId);
      if (idx !== -1) root.tags.$jazz.splice(idx, 1);

      expect(root.tags.length).toBe(0);
    });

    it("elimina también los ítems asociados al tag eliminado", () => {
      // Crear dos tags
      const tagA = Tag.create({
        nombre: "Tag A",
        icono: "gamepad",
        color: "#111",
      });
      const tagB = Tag.create({
        nombre: "Tag B",
        icono: "book",
        color: "#222",
      });
      root.tags.$jazz.push(tagA);
      root.tags.$jazz.push(tagB);

      // Crear ítems vinculados a cada tag
      root.items.$jazz.push(
        OcioItem.create({
          titulo: "Item de A",
          tipo: "videojuego",
          estado: "pendiente",
          tag: tagA,
        }),
      );
      root.items.$jazz.push(
        OcioItem.create({
          titulo: "Item de B",
          tipo: "libro",
          estado: "pendiente",
          tag: tagB,
        }),
      );

      expect(root.items.length).toBe(2);

      // Simular removeTag para tagA (igual que en AppContext)
      const tagAId = coId(tagA);

      // Eliminar ítems asociados (en orden inverso)
      const itemArr = toLoadedArray<OcioItem>(root.items);
      for (let i = itemArr.length - 1; i >= 0; i--) {
        const item = itemArr[i]!;
        if (item.tag && coId(item.tag) === tagAId) {
          root.items.$jazz.splice(i, 1);
        }
      }

      // Eliminar el tag
      const tagArr = toLoadedArray<Tag>(root.tags);
      const tagIdx = tagArr.findIndex((t) => t != null && coId(t) === tagAId);
      if (tagIdx !== -1) root.tags.$jazz.splice(tagIdx, 1);

      // Solo queda tagB y su ítem
      expect(root.tags.length).toBe(1);
      expect(toLoadedArray<Tag>(root.tags)[0]!.nombre).toBe("Tag B");
      expect(root.items.length).toBe(1);
      expect(toLoadedArray<OcioItem>(root.items)[0]!.titulo).toBe("Item de B");
    });
  });

  // ─── Ítems de ocio ──────────────────────────────────────────

  describe("addItem", () => {
    it("crea un ítem vinculado a un tag existente", () => {
      const tag = Tag.create({
        nombre: "Libros",
        icono: "book",
        color: "#3b82f6",
      });
      root.tags.$jazz.push(tag);

      const item = OcioItem.create({
        titulo: "Dune",
        tipo: tipoMap[tag.icono],
        estado: "pendiente",
        tag,
      });
      root.items.$jazz.push(item);

      expect(root.items.length).toBe(1);
      const arr = toLoadedArray<OcioItem>(root.items);
      expect(arr[0]!.titulo).toBe("Dune");
      expect(arr[0]!.tipo).toBe("libro");
      expect(arr[0]!.estado).toBe("pendiente");
    });

    it("infiere el tipo correcto según el icono del tag", () => {
      const iconos: TagIcon[] = ["gamepad", "book", "film", "music", "tv", "custom"];
      const tiposEsperados: OcioTipo[] = [
        "videojuego",
        "libro",
        "cine",
        "musica",
        "serie",
        "videojuego",
      ];

      for (let i = 0; i < iconos.length; i++) {
        const tag = Tag.create({
          nombre: `Tag ${iconos[i]}`,
          icono: iconos[i]!,
          color: "#000",
        });
        const tipoInferido = tipoMap[tag.icono];
        expect(tipoInferido).toBe(tiposEsperados[i]);
      }
    });
  });

  describe("updateItem", () => {
    it("actualiza el estado de un ítem", () => {
      const tag = Tag.create({
        nombre: "Juegos",
        icono: "gamepad",
        color: "#22c55e",
      });
      root.tags.$jazz.push(tag);

      const item = OcioItem.create({
        titulo: "Zelda",
        tipo: "videojuego",
        estado: "pendiente",
        tag,
      });
      root.items.$jazz.push(item);

      // Simular updateItem
      item.$jazz.applyDiff({ estado: "en_progreso" });
      expect(item.estado).toBe("en_progreso");

      item.$jazz.applyDiff({ estado: "completado" });
      expect(item.estado).toBe("completado");
    });

    it("actualiza la valoración y notas de un ítem", () => {
      const tag = Tag.create({
        nombre: "Cine",
        icono: "film",
        color: "#a855f7",
      });
      const item = OcioItem.create({
        titulo: "Akira",
        tipo: "cine",
        estado: "completado",
        tag,
      });
      root.items.$jazz.push(item);

      item.$jazz.applyDiff({ valoracion: 5, notas: "Obra maestra del anime" });
      expect(item.valoracion).toBe(5);
      expect(item.notas).toBe("Obra maestra del anime");
    });
  });

  describe("updateItem — valoración", () => {
    it("guarda la valoración junto al estado completado", () => {
      const tag = Tag.create({
        nombre: "Juegos",
        icono: "gamepad",
        color: "#22c55e",
      });
      const item = OcioItem.create({
        titulo: "Hollow Knight",
        tipo: "videojuego",
        estado: "en_progreso",
        tag,
      });
      root.items.$jazz.push(item);

      // Marcar como completado con valoración simultánea
      item.$jazz.applyDiff({ estado: "completado", valoracion: 9 });

      expect(item.estado).toBe("completado");
      expect(item.valoracion).toBe(9);
    });

    it("permite actualizar la valoración después de completar", () => {
      const tag = Tag.create({
        nombre: "Cine",
        icono: "film",
        color: "#a855f7",
      });
      const item = OcioItem.create({
        titulo: "2001: A Space Odyssey",
        tipo: "cine",
        estado: "completado",
        tag,
        valoracion: 7,
      });
      root.items.$jazz.push(item);

      expect(item.valoracion).toBe(7);

      // Actualizar solo la valoración sin tocar el estado
      item.$jazz.applyDiff({ valoracion: 10 });
      expect(item.valoracion).toBe(10);
      expect(item.estado).toBe("completado");
    });

    it("la valoración es independiente del estado", () => {
      const tag = Tag.create({
        nombre: "Libros",
        icono: "book",
        color: "#3b82f6",
      });
      const item = OcioItem.create({
        titulo: "Fundación",
        tipo: "libro",
        estado: "en_progreso",
        tag,
      });
      root.items.$jazz.push(item);

      // Se puede asignar una valoración sin cambiar el estado
      item.$jazz.applyDiff({ valoracion: 8 });
      expect(item.valoracion).toBe(8);
      expect(item.estado).toBe("en_progreso");

      // Y se puede quitar la valoración con undefined
      item.$jazz.applyDiff({ valoracion: undefined });
      expect(item.valoracion).toBeUndefined();
    });
  });

  describe("removeItem", () => {
    it("elimina un ítem por su ID sin afectar a otros", () => {
      const tag = Tag.create({
        nombre: "Series",
        icono: "tv",
        color: "#eab308",
      });
      root.tags.$jazz.push(tag);

      const item1 = OcioItem.create({
        titulo: "Breaking Bad",
        tipo: "serie",
        estado: "completado",
        tag,
      });
      const item2 = OcioItem.create({
        titulo: "The Wire",
        tipo: "serie",
        estado: "pendiente",
        tag,
      });
      root.items.$jazz.push(item1);
      root.items.$jazz.push(item2);

      expect(root.items.length).toBe(2);

      // Simular removeItem para item1
      const item1Id = coId(item1);
      const arr = toLoadedArray<OcioItem>(root.items);
      const idx = arr.findIndex((i) => i != null && coId(i) === item1Id);
      if (idx !== -1) root.items.$jazz.splice(idx, 1);

      expect(root.items.length).toBe(1);
      expect(toLoadedArray<OcioItem>(root.items)[0]!.titulo).toBe("The Wire");
    });
  });

  // ─── Flujo completo ─────────────────────────────────────────

  describe("Flujo completo de usuario", () => {
    it("simula el ciclo completo: onboarding → tags → items → actualizar → borrar", () => {
      // 1. Completar onboarding
      root.$jazz.applyDiff({ onboardingCompletado: true });
      expect(root.onboardingCompletado).toBe(true);

      // 2. Añadir tags por defecto
      const tagsData = [
        { nombre: "Videojuegos", icono: "gamepad" as const, color: "#22c55e" },
        { nombre: "Libros", icono: "book" as const, color: "#3b82f6" },
        { nombre: "Cine", icono: "film" as const, color: "#a855f7" },
      ];
      const tagsCreados: Tag[] = [];
      for (const t of tagsData) {
        const tag = Tag.create(t);
        root.tags.$jazz.push(tag);
        tagsCreados.push(tag);
      }
      expect(root.tags.length).toBe(3);

      // 3. Añadir un ítem
      const item = OcioItem.create({
        titulo: "Dark Souls",
        tipo: tipoMap[tagsCreados[0]!.icono],
        estado: "pendiente",
        tag: tagsCreados[0]!,
      });
      root.items.$jazz.push(item);
      expect(root.items.length).toBe(1);
      expect(item.tipo).toBe("videojuego");

      // 4. Actualizar el estado del ítem
      item.$jazz.applyDiff({ estado: "en_progreso" });
      expect(item.estado).toBe("en_progreso");

      // 5. Completar el ítem con valoración
      item.$jazz.applyDiff({
        estado: "completado",
        valoracion: 5,
        notas: "Prepare to die",
      });
      expect(item.estado).toBe("completado");
      expect(item.valoracion).toBe(5);

      // 6. Eliminar el ítem
      const itemId = coId(item);
      const itemArr = toLoadedArray<OcioItem>(root.items);
      const idx = itemArr.findIndex((i) => i != null && coId(i) === itemId);
      if (idx !== -1) root.items.$jazz.splice(idx, 1);
      expect(root.items.length).toBe(0);

      // 7. Tags siguen intactos
      expect(root.tags.length).toBe(3);
    });
  });
});
