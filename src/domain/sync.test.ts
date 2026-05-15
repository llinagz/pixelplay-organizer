import { describe, expect, it } from "vitest";
import { createConflictEvent, decodeLinkCode, encodeLinkCode } from "@/domain/sync";

describe("sync domain", () => {
  it("codifica y decodifica un codigo de vinculacion valido", () => {
    const code = encodeLinkCode({
      version: 1,
      exportedAt: new Date().toISOString(),
      onboardingCompletado: true,
      tags: [{ nombre: "Libros", icono: "book", color: "#3b82f6" }],
      items: [
        {
          titulo: "Dune",
          tipo: "libro",
          estado: "pendiente",
          tagNombre: "Libros",
        },
      ],
    });

    const decoded = decodeLinkCode(code);
    expect(decoded.ok).toBe(true);
    expect(decoded.payload?.tags.length).toBe(1);
    expect(decoded.payload?.items[0]?.titulo).toBe("Dune");
  });

  it("rechaza codigos invalidos", () => {
    const decoded = decodeLinkCode("codigo-invalido");
    expect(decoded.ok).toBe(false);
    expect(decoded.errorCode).toBe("invalid_json");
  });

  it("crea eventos de conflicto para notas", () => {
    const event = createConflictEvent({
      itemId: "item-1",
      localValue: "local",
      remoteValue: "remote",
    });

    expect(event.itemId).toBe("item-1");
    expect(event.field).toBe("notas");
    expect(event.localValue).toBe("local");
    expect(event.remoteValue).toBe("remote");
  });
});
