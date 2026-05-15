import { VALORACION_MAX, VALORACION_MIN } from "@/schema";

export const colorPorPuntuacion = (v: number): string => {
  if (v <= 4) return "#ef4444";
  if (v <= 7) return "#f59e0b";
  return "#22c55e";
};

export const parseValoracion = (value: unknown): number | undefined => {
  if (typeof value !== "number") return undefined;
  if (!Number.isInteger(value)) return undefined;
  if (value < VALORACION_MIN || value > VALORACION_MAX) return undefined;
  return value;
};

