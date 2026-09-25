import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const directory = path.dirname(fileURLToPath(import.meta.url));

describe("customer history tables", () => {
  it("uses labelled compact rows for orders and quotations", async () => {
    const [orders, quotes, globalCss] = await Promise.all([
      readFile(path.join(directory, "orders", "page.tsx"), "utf8"),
      readFile(path.join(directory, "quotes", "page.tsx"), "utf8"),
      readFile(path.resolve(directory, "../../globals.css"), "utf8"),
    ]);

    for (const source of [orders, quotes]) {
      expect(source).toContain("account-history-table");
      expect(source).toContain('data-label="Number"');
      expect(source).toContain('data-label="Status"');
      expect(source).toContain('data-label="Total"');
    }

    expect(globalCss).toContain(".account-history-table");
  });
});
