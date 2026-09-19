import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CataloguePagination } from "./catalogue-pagination";

describe("CataloguePagination", () => {
  it("keeps pagination on the current catalogue route", () => {
    render(
      <CataloguePagination
        basePath="/brands/scholastic"
        page={1}
        totalPages={2}
        totalItems={30}
        query={{ q: "workbook" }}
      />,
    );

    expect(screen.getByRole("link", { name: "Next" })).toHaveAttribute(
      "href",
      "/brands/scholastic?q=workbook&page=2",
    );
  });

  it("omits empty filters and the default sort from shared URLs", () => {
    render(
      <CataloguePagination
        page={1}
        totalPages={2}
        query={{ q: "", category: "", brand: "", availability: "", sort: "featured", view: "list" }}
      />,
    );

    expect(screen.getByRole("link", { name: "Next" })).toHaveAttribute(
      "href",
      "/shop?view=list&page=2",
    );
  });
});
