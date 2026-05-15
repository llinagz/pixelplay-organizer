import { describe, expect, it } from "vitest";
import { ocioTipoFromTagIcon } from "./ocio";
import { TAG_ICONS } from "@/schema";

describe("ocioTipoFromTagIcon", () => {
  it("mapea cada icono a un tipo de ocio valido", () => {
    for (const icon of TAG_ICONS) {
      expect(ocioTipoFromTagIcon(icon)).toBeTruthy();
    }
  });
});

