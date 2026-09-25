import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const directory = path.dirname(fileURLToPath(import.meta.url));

const tablePages = [
  ["deliveries", "page.tsx"],
  ["payments", "page.tsx"],
  ["users", "page.tsx"],
  ["logs", "page.tsx"],
] as const;

describe("admin mobile table contract", () => {
  it("uses labelled responsive rows for every operational list", async () => {
    const sourceFiles = await Promise.all(
      tablePages.map(([folder, file]) => readFile(path.join(directory, folder, file), "utf8")),
    );

    for (const source of sourceFiles) {
      expect(source).toContain("admin-responsive-table");
      expect(source).toContain("data-label=");
    }

    expect(sourceFiles[3]).toContain('error.code === "42P01"');
  });

  it("does not depend on column position for mobile table labels", async () => {
    const globalCss = await readFile(path.resolve(directory, "../../globals.css"), "utf8");

    expect(globalCss).not.toContain("table:not(.admin-responsive-table):has(th:nth-child(6))");
  });

  it("keeps product variants and price tiers readable on mobile", async () => {
    const productEditor = await readFile(path.join(directory, "products", "[id]", "page.tsx"), "utf8");

    expect(productEditor).toContain('className="admin-responsive-table w-full min-w-[34rem] text-sm"');
    expect(productEditor).toContain('data-label="SKU"');
    expect(productEditor).toContain('data-label="List price"');
    expect(productEditor).toContain('data-label="Qty"');
  });

  it("keeps order and quote operations readable on mobile", async () => {
    const [orderDetail, quoteActions] = await Promise.all([
      readFile(path.join(directory, "orders", "[id]", "page.tsx"), "utf8"),
      readFile(path.resolve(directory, "../../../components/admin/quote-admin-actions.tsx"), "utf8"),
    ]);

    for (const source of [orderDetail, quoteActions]) {
      expect(source).toContain("admin-responsive-table");
      expect(source).toContain('data-label="Item"');
      expect(source).toContain('data-label="Qty"');
    }
  });
});
