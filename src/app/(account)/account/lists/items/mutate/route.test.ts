import { describe, expect, it, vi } from "vitest";
import { POST } from "@/app/(account)/account/lists/items/mutate/route";

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("next/navigation", () => ({ redirect: (path: string) => { throw new Error(`REDIRECT:${path}`); } }));
vi.mock("@/lib/customer/require", () => ({ requireCustomer: async () => ({ profileId: "owner", fullName: "Ama", email: "ama@example.test", phone: "0241234567" }) }));
vi.mock("@/features/saved-lists/repository", () => ({
  addSavedListItem: vi.fn(async () => undefined),
  removeSavedListItem: vi.fn(async () => undefined),
  SavedListError: class SavedListError extends Error {},
}));

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
});
