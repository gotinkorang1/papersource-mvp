import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/observability/client-sentry", () => ({ captureClientBoundaryError: vi.fn() }));
import AccountRouteError from "./error";

describe("account route error boundary", () => {
  it("offers retry and a safe storefront fallback", async () => {
    const reset = vi.fn();
    render(<AccountRouteError error={new Error("private database detail")} reset={reset} />);
    expect(screen.getByRole("alert")).toHaveTextContent(/account temporarily unavailable/i);
    expect(screen.getByRole("link", { name: /back to shop/i })).toHaveAttribute("href", "/shop");
    await userEvent.click(screen.getByRole("button", { name: /try again/i }));
    expect(reset).toHaveBeenCalledOnce();
    expect(screen.queryByText(/private database detail/)).not.toBeInTheDocument();
  });
});
