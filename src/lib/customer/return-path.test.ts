import { describe, expect, it } from "vitest";
import { safeCustomerReturnPath } from "./return-path";

describe("safeCustomerReturnPath", () => {
  it.each([
    "/account", "/account/orders", "/account/quotes", "/account/addresses",
    "/account/organisation", "/cart", "/quote", "/checkout", "/request-quote",
  ])("preserves the authorized customer destination %s", (path) => {
    expect(safeCustomerReturnPath(path)).toBe(path);
  });

  it.each([
    "https://evil.example", "//evil.example", "/%2f%2fevil.example",
    "/admin", "/account/../admin", "/account\\..\\admin",
    "/account?next=https://evil.example", "/account#external",
    " /checkout", "/accounting", "/account/orders/other-customer", "",
    null, undefined, ["/checkout"], 1,
  ])("rejects unsafe or unrecognized destination %j", (path) => {
    expect(safeCustomerReturnPath(path)).toBe("/account");
  });
});
