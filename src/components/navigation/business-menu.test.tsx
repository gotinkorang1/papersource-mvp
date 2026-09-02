import { render, screen } from "@testing-library/react";
import { fireEvent } from "@testing-library/react";
import { expect, it } from "vitest";
import { BusinessMenu } from "./business-menu";

it("groups business destinations behind one menu", async () => {
  render(<BusinessMenu />);
  expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Business" }));
  expect(screen.getByRole("menu")).toHaveTextContent("Business accounts");
  expect(screen.getByRole("menu")).toHaveTextContent("Schools");
});
