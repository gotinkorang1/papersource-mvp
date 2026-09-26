import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
const actions = vi.hoisted(() => ({ login: vi.fn(), register: vi.fn(), forgot: vi.fn(), reset: vi.fn(), signOut: vi.fn(), actor: vi.fn() }));
vi.mock("@/features/account/auth-actions", () => ({
  loginCustomerAction: actions.login, registerCustomerAction: actions.register,
  requestPasswordResetAction: actions.forgot, updateCustomerPasswordAction: actions.reset, signOutCustomerAction: actions.signOut,
}));
vi.mock("@/lib/customer/require", () => ({ readCustomerActor: actions.actor }));
import { CustomerAuthForm } from "./auth-form";
import { SignOutButton } from "./sign-out-button";
import LoginPage from "@/app/(account)/login/page";
import RegisterPage from "@/app/(account)/register/page";
import ResetPasswordPage from "@/app/(account)/reset-password/page";

beforeEach(() => {
  vi.resetAllMocks();
  actions.actor.mockResolvedValue(null);
});
describe("customer authentication forms", () => {
  it.each([
    ["login", "Sign in", "current-password"],
    ["register", "Create account", "new-password"],
    ["reset", "Update password", "new-password"],
  ] as const)("labels the %s password with correct autocomplete", (mode, button, autocomplete) => {
    render(<CustomerAuthForm mode={mode} next="/checkout" />);
    expect(screen.getByLabelText("Password")).toHaveAttribute("autocomplete", autocomplete);
    expect(screen.getByRole("button", { name: button })).toBeEnabled();
  });
  it("matches the password hint to the twelve-character policy", () => {
    render(<CustomerAuthForm mode="register" />);
    expect(screen.getByLabelText("Password")).toHaveAttribute("minlength", "12");
    expect(screen.getByText("Use 12–128 characters.")).toBeInTheDocument();
  });
  it("labels registration name and phone without mixing them with email", () => {
    render(<CustomerAuthForm mode="register" />);
    expect(screen.getByLabelText("Full name")).toHaveAttribute("autocomplete", "name");
    expect(screen.getByLabelText("Phone (optional)")).toHaveAttribute("type", "tel");
    expect(screen.getByLabelText("Email")).toHaveAttribute("autocomplete", "email");
  });
  it("associates server validation errors with the relevant fields and announces failure", async () => {
    actions.login.mockResolvedValue({ status: "error", message: "Check the highlighted fields.", fieldErrors: { email: ["Check your email address."] } });
    render(<CustomerAuthForm mode="login" />);
    const user = userEvent.setup();
    await user.type(screen.getByLabelText("Email"), "ama@example.test");
    await user.type(screen.getByLabelText("Password"), "bad-password");
    await user.click(screen.getByRole("button", { name: "Sign in" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Check the highlighted fields.");
    expect(screen.getByLabelText("Email")).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByLabelText("Email")).toHaveAccessibleDescription("Check your email address.");
  });
  it("disables duplicate submissions while pending and shows neutral email confirmation", async () => {
    let finish!: (state: { status: "success"; message: string }) => void;
    actions.forgot.mockImplementation(() => new Promise((resolve) => { finish = resolve; }));
    render(<CustomerAuthForm mode="forgot" />);
    const user = userEvent.setup();
    await user.type(screen.getByLabelText("Email"), "ama@example.test");
    await user.click(screen.getByRole("button", { name: "Send reset link" }));
    const pendingButton = screen.getByRole("button", { name: "Sending…" });
    expect(pendingButton).toBeDisabled();
    expect(pendingButton.querySelector("span[aria-hidden='true']")).toBeInTheDocument();
    await act(async () => { finish({ status: "success", message: "If an account exists, check your email." }); });
    expect(screen.getByRole("status")).toHaveTextContent("If an account exists");
    expect(screen.getByRole("button", { name: "Send reset link" })).toBeEnabled();
  });
  it("passes reset confirmation as a distinct field and offers account navigation after success", async () => {
    actions.reset.mockResolvedValue({ status: "success", message: "Your password has been updated." });
    render(<CustomerAuthForm mode="reset" />);
    const user = userEvent.setup();
    await user.type(screen.getByLabelText("Password"), "new-password!");
    await user.type(screen.getByLabelText("Confirm password"), "new-password!");
    await user.click(screen.getByRole("button", { name: "Update password" }));
    expect(await screen.findByRole("status")).toHaveTextContent("updated");
    expect(actions.reset.mock.calls[0][1].get("confirmPassword")).toBe("new-password!");
    expect(screen.getByRole("link", { name: "Continue to account" })).toHaveAttribute("href", "/account");
  });
  it("signout announces pending state", async () => {
    let finish!: () => void;
    actions.signOut.mockImplementation(() => new Promise<void>((resolve) => { finish = resolve; }));
    render(<SignOutButton />);
    await userEvent.click(screen.getByRole("button", { name: "Sign out" }));
    const pendingButton = screen.getByRole("button", { name: "Signing out…" });
    expect(pendingButton).toBeDisabled();
    expect(pendingButton.querySelector("span[aria-hidden='true']")).toBeInTheDocument();
    await act(async () => { finish(); });
    await waitFor(() => expect(screen.getByRole("button", { name: "Sign out" })).toBeEnabled());
  });
  it("login renders only allow-listed callback feedback, never raw query errors", async () => {
    render(await LoginPage({ searchParams: Promise.resolve({ error: "private-token-detail", authError: "confirmation", next: "//evil.test" }) }));
    expect(screen.queryByText("private-token-detail")).not.toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent(/invalid or expired/i);
    expect(screen.getByRole("link", { name: "Forgot password?" })).toHaveAttribute("href", "/forgot-password");
    expect(screen.getByRole("link", { name: "Create an account" })).toHaveAttribute("href", "/register?next=%2Faccount");
  });
  it("registration does not reflect arbitrary provider errors from the query string", async () => {
    render(await RegisterPage({ searchParams: Promise.resolve({ error: "private-token-detail", next: "/checkout" }) }));
    expect(screen.queryByText("private-token-detail")).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Sign in" })).toHaveAttribute("href", "/login?next=%2Fcheckout");
  });
  it("offers a new reset email instead of an unauthenticated update form", async () => {
    render(await ResetPasswordPage());
    expect(screen.queryByRole("button", { name: "Update password" })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Request a new reset link" })).toHaveAttribute("href", "/forgot-password");
  });
});
