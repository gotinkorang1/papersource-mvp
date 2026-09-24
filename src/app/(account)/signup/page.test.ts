import { expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  permanentRedirect: (path: string) => {
    throw new Error(`PERMANENT_REDIRECT:${path}`);
  },
}));

import SignupPage from "./page";

it("permanently redirects the legacy signup URL to registration", () => {
  expect(() => SignupPage()).toThrow("PERMANENT_REDIRECT:/register");
});
