import { describe, expect, it } from "vitest";
import { hasSupportedImageSignature } from "./validation";

describe("hasSupportedImageSignature", () => {
  it("accepts a JPEG whose header matches its MIME type", async () => {
    const file = new File([new Uint8Array([0xff, 0xd8, 0xff, 0xe0])], "cover.jpg", { type: "image/jpeg" });
    await expect(hasSupportedImageSignature(file)).resolves.toBe(true);
  });

  it("rejects a mislabeled image", async () => {
    const file = new File([new TextEncoder().encode("not an image")], "cover.jpg", { type: "image/jpeg" });
    await expect(hasSupportedImageSignature(file)).resolves.toBe(false);
  });
});
