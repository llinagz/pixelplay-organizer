import { describe, expect, it } from "vitest";
import { reorderIds } from "./collections";

describe("reorderIds", () => {
  it("reordena y conserva elementos no incluidos", () => {
    const input = [
      { id: "a", v: 1 },
      { id: "b", v: 2 },
      { id: "c", v: 3 },
    ];
    const result = reorderIds(input, ["c", "a"]);
    expect(result.map((x) => x.id)).toEqual(["c", "a", "b"]);
  });
});

