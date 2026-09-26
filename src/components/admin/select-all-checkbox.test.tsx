import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SelectAllCheckbox } from "./select-all-checkbox";

describe("SelectAllCheckbox", () => {
  it("keeps duplicate controls in one form synchronized", async () => {
    const user = userEvent.setup();
    render(
      <form>
        <SelectAllCheckbox count={2} />
        <SelectAllCheckbox count={2} />
        <input type="checkbox" name="productId" value="one" aria-label="One" />
        <input type="checkbox" name="productId" value="two" aria-label="Two" />
      </form>,
    );

    await user.click(screen.getAllByRole("checkbox")[0]);

    expect(screen.getAllByRole("checkbox")[0]).toBeChecked();
    expect(screen.getAllByRole("checkbox")[1]).toBeChecked();
    expect(screen.getAllByText("2")).toHaveLength(2);
    expect(screen.getAllByRole("checkbox")[2]).toBeChecked();
    expect(screen.getAllByRole("checkbox")[3]).toBeChecked();
  });

  it("uses singular wording for one selected row", async () => {
    const user = userEvent.setup();
    render(
      <form>
        <SelectAllCheckbox count={2} />
        <input type="checkbox" name="productId" value="one" aria-label="One" />
        <input type="checkbox" name="productId" value="two" aria-label="Two" />
      </form>,
    );

    await user.click(screen.getByRole("checkbox", { name: "One" }));

    expect(screen.getByLabelText("1 product selected")).toBeInTheDocument();
  });

  it("handles irregular plural labels", async () => {
    const user = userEvent.setup();
    render(
      <form>
        <SelectAllCheckbox count={1} label="categories" />
        <input type="checkbox" name="productId" value="one" aria-label="One" />
      </form>,
    );

    await user.click(screen.getByRole("checkbox", { name: "One" }));

    expect(screen.getByLabelText("1 category selected")).toBeInTheDocument();
  });

  it("disables select all when there are no rows", () => {
    render(<SelectAllCheckbox count={0} />);

    expect(screen.getByRole("checkbox", { name: "Select all products" })).toBeDisabled();
    expect(screen.getByLabelText("0 products selected")).toBeInTheDocument();
  });
});
