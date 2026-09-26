import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ProductGallery } from "./product-gallery";

vi.mock("server-only", () => ({}));

const images = [
  { src: "/images/set-school-stationery.jpg", alt: "Stationery set" },
  { src: "/images/catalogue-stationery-generated.png", alt: "Desk stationery" },
];

describe("ProductGallery", () => {
  it("supports arrow-key image navigation when the gallery is focused", async () => {
    const user = userEvent.setup();
    render(<ProductGallery alt="Paper" images={images} />);

    const gallery = screen.getByRole("region", { name: "Paper image gallery" });
    expect(gallery).toHaveAttribute("aria-roledescription", "carousel");
    expect(gallery).toHaveClass("focus-visible:outline-2");
    expect(screen.getByRole("button", { name: "View image 1" })).toHaveClass("focus-visible:outline-2");
    gallery.focus();
    await user.keyboard("{ArrowRight}");

    expect(screen.getByText("2 of 2")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Desk stationery" })).toBeInTheDocument();
  });

  it("does not hijack arrow keys while focus is outside the gallery", async () => {
    const user = userEvent.setup();
    render(<><button type="button">Elsewhere</button><ProductGallery alt="Paper" images={images} /></>);

    screen.getByRole("button", { name: "Elsewhere" }).focus();
    await user.keyboard("{ArrowRight}");

    expect(screen.getByText("1 of 2")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Stationery set" })).toBeInTheDocument();
  });
});
