import { describe, expect, it, vi } from "vitest";
import { POST } from "@/app/(account)/account/lists/items/mutate/route";

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("next/navigation", () => ({ redirect: (path: string) => { throw new Error(`REDIRECT:${path}`); } }));
vi.mock("@/lib/customer/require", () => ({ requireCustomer: async () => ({ profileId: "owner", fullName: "Ama", email: "ama@example.test", phone: "0241234567" }) }));
vi.mock("@/features/saved-lists/repository", () => ({
  addSavedListItem: vi.fn(async () => undefined),
  getSavedList: vi.fn(async () => ({ items: [{ variantId: "variant-1", quantity: 2, productActive: true, variantActive: true }, { variantId: "variant-old", quantity: 4, productActive: false, variantActive: false }] })),
  removeSavedListItem: vi.fn(async () => undefined),
  SavedListError: class SavedListError extends Error {},
}));
vi.mock("@/lib/customer/commerce", () => ({ readCommerceIdentity: vi.fn(async () => ({ profileId: "owner", sessionId: null })) }));
vi.mock("@/features/cart/repository", () => ({ addVariantToCart: vi.fn(async () => undefined) }));
vi.mock("@/features/quotations/repository", () => ({ addVariantToQuote: vi.fn(async () => undefined) }));

describe("saved-list item mutation route", () => {
  it("removes an item and redirects back to its list", async () => {
    const formData = new FormData();
    formData.set("intent", "remove");
    formData.set("listId", "list-1");
    formData.set("itemId", "item-1");

    await expect(POST(new Request("http://localhost/account/lists/items/mutate", { method: "POST", body: formData }))).rejects.toThrow("REDIRECT:/account/lists/list-1?message=Item%20removed.");
  });

  it("adds a product to a list and redirects back to its list", async () => {
    const formData = new FormData();
    formData.set("intent", "add");
    formData.set("listId", "list-1");
    formData.set("variantId", "variant-1");
    formData.set("quantity", "3");

    await expect(POST(new Request("http://localhost/account/lists/items/mutate", { method: "POST", body: formData }))).rejects.toThrow("REDIRECT:/account/lists/list-1?message=Item%20saved.");
  });

  it("adds only available items to the retail cart", async () => {
    const formData = new FormData();
    formData.set("intent", "bulk-cart");
    formData.set("listId", "list-1");

    await expect(POST(new Request("http://localhost/account/lists/items/mutate", { method: "POST", body: formData }))).rejects.toThrow("REDIRECT:/cart");
    const { addVariantToCart } = await import("@/features/cart/repository");
    expect(addVariantToCart).toHaveBeenCalledWith({ profileId: "owner", sessionId: null }, "variant-1", 2);
    expect(addVariantToCart).toHaveBeenCalledTimes(1);
  });
});
