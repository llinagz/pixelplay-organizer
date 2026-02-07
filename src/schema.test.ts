/**
 * Tests unitarios para los esquemas Jazz de Backlog Pixel.
 *
 * Verifica que los CoValues (Tag, OcioItem, listas y cuenta)
 * se pueden instanciar correctamente con los valores esperados.
 */
import { describe, it, expect, beforeEach } from "vitest";
import {
  setupJazzTestSync,
  createJazzTestAccount,
} from "jazz-tools/testing";
import {
  Tag,
  OcioItem,
  ListaDeTags,
  ListaDeOcioItems,
  BacklogPixelAccount,
  DEFAULT_TAGS,
  ESTADO_LABELS,
  ESTADO_COLORS,
  TAG_ICONS,
  OCIO_TIPOS,
  OCIO_ESTADOS,
} from "./schema";

describe("Esquemas Jazz — Backlog Pixel", () => {
  beforeEach(async () => {
    await setupJazzTestSync();
    await createJazzTestAccount({
      AccountSchema: BacklogPixelAccount,
      isCurrentActiveAccount: true,
      creationProps: { name: "Test User" },
    });
  });

  // ─── Tag ─────────────────────────────────────────────────────

  describe("Tag", () => {
    it("se puede crear con valores válidos", () => {
      const tag = Tag.create({
        nombre: "Videojuegos",
        icono: "gamepad",
        color: "#22c55e",
      });

      expect(tag.nombre).toBe("Videojuegos");
      expect(tag.icono).toBe("gamepad");
      expect(tag.color).toBe("#22c55e");
    });

    it("permite todos los iconos definidos", () => {
      for (const icono of TAG_ICONS) {
        const tag = Tag.create({
          nombre: `Tag ${icono}`,
          icono,
          color: "#000000",
        });
        expect(tag.icono).toBe(icono);
      }
    });
  });

  // ─── OcioItem ────────────────────────────────────────────────

  describe("OcioItem", () => {
    it("se puede crear con las propiedades obligatorias", () => {
      const tag = Tag.create({
        nombre: "Libros",
        icono: "book",
        color: "#3b82f6",
      });

      const item = OcioItem.create({
        titulo: "El Señor de los Anillos",
        tipo: "libro",
        estado: "pendiente",
        tag,
      });

      expect(item.titulo).toBe("El Señor de los Anillos");
      expect(item.tipo).toBe("libro");
      expect(item.estado).toBe("pendiente");
    });

    it("se puede crear con propiedades opcionales", () => {
      const tag = Tag.create({
        nombre: "Cine",
        icono: "film",
        color: "#a855f7",
      });

      const item = OcioItem.create({
        titulo: "Blade Runner",
        tipo: "cine",
        estado: "completado",
        tag,
        valoracion: 5,
        notas: "Una obra maestra de la ciencia ficción",
        imagenUrl: "https://example.com/blade-runner.jpg",
      });

      expect(item.valoracion).toBe(5);
      expect(item.notas).toBe("Una obra maestra de la ciencia ficción");
      expect(item.imagenUrl).toBe("https://example.com/blade-runner.jpg");
    });

    it("soporta todos los tipos de ocio", () => {
      const tag = Tag.create({
        nombre: "Test",
        icono: "custom",
        color: "#000",
      });

      for (const tipo of OCIO_TIPOS) {
        const item = OcioItem.create({
          titulo: `Item ${tipo}`,
          tipo,
          estado: "pendiente",
          tag,
        });
        expect(item.tipo).toBe(tipo);
      }
    });

    it("soporta todos los estados", () => {
      const tag = Tag.create({
        nombre: "Test",
        icono: "custom",
        color: "#000",
      });

      for (const estado of OCIO_ESTADOS) {
        const item = OcioItem.create({
          titulo: `Item ${estado}`,
          tipo: "videojuego",
          estado,
          tag,
        });
        expect(item.estado).toBe(estado);
      }
    });
  });

  // ─── Listas colaborativas ────────────────────────────────────

  describe("ListaDeTags", () => {
    it("se puede crear vacía", () => {
      const lista = ListaDeTags.create([]);
      expect(lista.length).toBe(0);
    });

    it("se puede crear con tags iniciales", () => {
      const lista = ListaDeTags.create([
        { nombre: "Videojuegos", icono: "gamepad", color: "#22c55e" },
        { nombre: "Libros", icono: "book", color: "#3b82f6" },
      ]);
      expect(lista.length).toBe(2);
    });
  });

  describe("ListaDeOcioItems", () => {
    it("se puede crear vacía", () => {
      const lista = ListaDeOcioItems.create([]);
      expect(lista.length).toBe(0);
    });
  });

  // ─── Constantes auxiliares ───────────────────────────────────

  describe("Constantes", () => {
    it("DEFAULT_TAGS tiene 3 etiquetas por defecto", () => {
      expect(DEFAULT_TAGS).toHaveLength(3);
      expect(DEFAULT_TAGS[0].nombre).toBe("Videojuegos");
      expect(DEFAULT_TAGS[1].nombre).toBe("Libros");
      expect(DEFAULT_TAGS[2].nombre).toBe("Cine");
    });

    it("ESTADO_LABELS cubre todos los estados", () => {
      for (const estado of OCIO_ESTADOS) {
        expect(ESTADO_LABELS[estado]).toBeDefined();
      }
    });

    it("ESTADO_COLORS cubre todos los estados", () => {
      for (const estado of OCIO_ESTADOS) {
        expect(ESTADO_COLORS[estado]).toBeDefined();
      }
    });
  });
});
