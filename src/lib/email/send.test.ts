import { createElement } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/email/render-html", () => ({
  renderHtml: async () => "<html>RFQ-2026-000238</html>",
  renderText: async () => "RFQ-2026-000238",
}));

import { isLiveEmail } from "@/lib/email/config";
import { sendTransactional } from "@/lib/email/send";
import { customerEmailFromSnapshot } from "@/lib/email/snapshot";
import { listMockInbox, resetMockInbox } from "@/lib/email/transport";

afterEach(() => {
  resetMockInbox();
  delete process.env.EMAIL_MODE;
});

describe("email transport", () => {
  it("stays on the mock inbox unless EMAIL_MODE is live", () => {
    expect(isLiveEmail()).toBe(false);
    process.env.EMAIL_MODE = "live";
    expect(isLiveEmail()).toBe(true);
  });

  it("records a mock message and skips the same event/entity", async () => {
    const mail = {
      event: "quote-received",
      entityId: "quote-1",
      to: "ama@harbour.test",
      subject: "We received RFQ-2026-000238",
      react: createElement("p", null, "RFQ-2026-000238"),
    };

    await sendTransactional(mail);
    await sendTransactional(mail);

    const inbox = listMockInbox();
    expect(inbox).toHaveLength(1);
    expect(inbox[0]?.idempotencyKey).toBe("quote-received/quote-1");
    expect(inbox[0]?.to).toBe("ama@harbour.test");
    expect(inbox[0]?.html).toContain("RFQ-2026-000238");
    expect(inbox[0]?.text).toContain("RFQ-2026-000238");
  });

  it("allows a second event on the same entity", async () => {
    const react = createElement("p", null, "body");
    await sendTransactional({
      event: "quote-received",
      entityId: "quote-1",
      to: "ama@harbour.test",
      subject: "Received",
      react,
    });
    await sendTransactional({
      event: "quote-ready",
      entityId: "quote-1",
      to: "ama@harbour.test",
      subject: "Ready",
      react,
    });
    expect(listMockInbox()).toHaveLength(2);
  });

  it("skips a missing recipient without throwing", async () => {
    await sendTransactional({
      event: "quote-received",
      entityId: "quote-2",
      to: "  ",
      subject: "Nope",
      react: createElement("p", null, "body"),
    });
    expect(listMockInbox()).toHaveLength(0);
  });
});

describe("customerEmailFromSnapshot", () => {
  it("reads the guest checkout email off the address snapshot", () => {
    expect(
      customerEmailFromSnapshot({
        fullName: "Kwame",
        phone: "0240000000",
        region: "Greater Accra",
        cityTown: "Accra",
        areaSuburb: "",
        streetLandmark: "",
        ghanapostGps: "",
        deliveryInstructions: "",
        deliveryArea: "accra",
        email: "kwame@office.test",
      }),
    ).toBe("kwame@office.test");
    expect(customerEmailFromSnapshot(null)).toBeUndefined();
  });
});
