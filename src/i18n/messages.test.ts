import { describe, expect, it } from "vitest";
import { messages } from "@/i18n/messages";

describe("i18n messages", () => {
  it("mantiene las mismas claves en es, gl y en", () => {
    const esKeys = Object.keys(messages.es).sort();
    const glKeys = Object.keys(messages.gl).sort();
    const enKeys = Object.keys(messages.en).sort();

    expect(glKeys).toEqual(esKeys);
    expect(enKeys).toEqual(esKeys);
  });
});
