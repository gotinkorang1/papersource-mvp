import type { ReactElement } from "react";
import { Resend } from "resend";
import { emailFrom, isLiveEmail } from "@/lib/email/config";
import { renderHtml, renderText } from "@/lib/email/render-html";
import { hasSentKey, markSent } from "@/lib/email/transport";

export type TransactionalEmail = {
  event: string;
  entityId: string;
  to: string | null | undefined;
  subject: string;
  react: ReactElement;
};

function idempotencyKey(event: string, entityId: string) {
  return `${event}/${entityId}`.slice(0, 256);
}

/** Never throws. Checkout, RFQ, and fulfil must succeed even if mail fails. */
export async function sendTransactional(mail: TransactionalEmail) {
  const to = mail.to?.trim();
  if (!to) {
    return;
  }

  const key = idempotencyKey(mail.event, mail.entityId);
  if (hasSentKey(key)) {
    return;
  }

  try {
    const html = await renderHtml(mail.react);
    const text = await renderText(mail.react);

    if (isLiveEmail()) {
      const apiKey = process.env.RESEND_API_KEY?.trim();
      if (!apiKey) {
        console.error("[email] RESEND_API_KEY is required when EMAIL_MODE=live");
        return;
      }

      const resend = new Resend(apiKey);
      const { error } = await resend.emails.send(
        {
          from: emailFrom(),
          to: [to],
          subject: mail.subject,
          html,
          text,
        },
        { idempotencyKey: key },
      );

      if (error) {
        console.error("[email]", error.message);
        return;
      }
    }

    markSent({
      idempotencyKey: key,
      event: mail.event,
      entityId: mail.entityId,
      to,
      subject: mail.subject,
      html,
      text,
    });

    if (!isLiveEmail()) {
      console.info(`[email:mock] ${key} → ${to} (${mail.subject})`);
    }
  } catch (error) {
    console.error("[email]", error);
  }
}
