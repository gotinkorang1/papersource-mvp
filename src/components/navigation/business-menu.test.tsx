import { render, screen, waitFor } from "@testing-library/react";
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

it("supports keyboard entry and Escape from a destination", async () => {
  render(<BusinessMenu />);
  const trigger = screen.getByRole("button", { name: "Business" });
  fireEvent.keyDown(trigger, { key: "ArrowDown" });
  const first = screen.getByRole("menuitem", { name: "Business accounts" });
  await waitFor(() => expect(first).toHaveFocus());
  fireEvent.keyDown(first, { key: "Escape" });
  expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  expect(trigger).toHaveFocus();
});
