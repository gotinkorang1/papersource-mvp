import { describe, expect, it } from "vitest";
import { POST as addressPost } from "@/app/account/addresses/mutate/route";
import { POST as organisationPost } from "@/app/account/organisation/mutate/route";
import { vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("@/lib/customer/require", () => ({ readCustomerActor: async () => null }));

describe("superseded account mutation endpoints", () => {
  it.each([addressPost, organisationPost])("denies legacy POST without executing mutations", async (post) => {
    const response = await post();
    expect(response.status).toBe(405);
    expect(response.headers.get("cache-control")).toBe("private, no-store");
  });
});
