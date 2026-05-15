import { describe, expect, it } from "vitest";
import { colorPorPuntuacion, parseValoracion } from "./rating";

describe("rating", () => {
  it("devuelve color segun rango", () => {
    expect(colorPorPuntuacion(1)).toBe("#ef4444");
    expect(colorPorPuntuacion(6)).toBe("#f59e0b");
    expect(colorPorPuntuacion(9)).toBe("#22c55e");
  });

  it("parsea valoraciones validas e invalidas", () => {
    expect(parseValoracion(7)).toBe(7);
    expect(parseValoracion(7.2)).toBeUndefined();
    expect(parseValoracion(0)).toBeUndefined();
    expect(parseValoracion("7")).toBeUndefined();
  });
});

