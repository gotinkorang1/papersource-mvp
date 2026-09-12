import { describe, expect, it } from "vitest";
import { centeredCropRect } from "@/lib/image/crop";

describe("centeredCropRect", () => {
  it("fits a portrait ratio by trimming the sides", () => {
    expect(centeredCropRect(1600, 900, "4:5")).toEqual({ x: 440, y: 0, width: 720, height: 900 });
  });

  it("fits a landscape ratio by trimming the top and bottom", () => {
    expect(centeredCropRect(900, 1600, "4:3")).toEqual({ x: 0, y: 463, width: 900, height: 675 });
  });
});
