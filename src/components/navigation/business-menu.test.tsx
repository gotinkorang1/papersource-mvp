import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BusinessMenu } from "./business-menu";

it("groups business destinations behind one menu", async () => {
  const user = userEvent.setup();
  render(<BusinessMenu />);
  expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: "Business" }));
  expect(screen.getByRole("menu")).toHaveTextContent("Business accounts");
  expect(screen.getByRole("menu")).toHaveTextContent("Schools");
});
