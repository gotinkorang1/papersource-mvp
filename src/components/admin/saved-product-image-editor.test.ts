import { describe, expect, it } from "vitest";
import { buildSavedImageSuccessUrl } from "./saved-product-image-editor";

describe("saved product image editor navigation", () => {
  it("keeps the current admin path while adding the save confirmation anchor", () => {
    expect(buildSavedImageSuccessUrl("/admin/products/123")).toBe("/admin/products/123?success=saved#images");
  });
});
