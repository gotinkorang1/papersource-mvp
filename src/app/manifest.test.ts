import { describe, expect, it } from "vitest";
import manifest from "./manifest";

describe("PWA manifest", () => {
  it("provides useful shortcuts for core PaperSource journeys", () => {
    const shortcuts = manifest().shortcuts ?? [];
    expect(shortcuts.map((shortcut) => shortcut.url)).toEqual(expect.arrayContaining(["/shop", "/search", "/quote", "/cart"]));
    expect(manifest().display).toBe("standalone");
    expect(manifest().display_override).toEqual(expect.arrayContaining(["standalone"]));
    expect(manifest().screenshots?.length).toBeGreaterThan(0);
  });
});
