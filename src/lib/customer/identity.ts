import "server-only";
import { z } from "zod";

export type CustomerActor = {
  profileId: string;
  email: string;
  fullName: string;
  phone: string | null;
};

type ClaimsReader = {
  getClaims(): Promise<{ data: { claims: unknown } | null; error: unknown }>;
};

const customerClaims = z.object({
  sub: z.string().uuid(),
  email: z.string().email(),
  role: z.literal("authenticated"),
  is_anonymous: z.literal(false).optional(),
  user_metadata: z.unknown().optional(),
});

/** Only call with the server-created Supabase Auth client, never caller claims. */
export async function readVerifiedCustomerIdentity(auth: ClaimsReader): Promise<CustomerActor | null> {
  const { data, error } = await auth.getClaims();
  if (error || !data) return null;
  const parsed = customerClaims.safeParse(data.claims);
  if (!parsed.success) return null;
  const { sub, email, user_metadata: metadata } = parsed.data;
  const display = z.object({ full_name: z.unknown().optional(), phone: z.unknown().optional() }).safeParse(metadata);
  const name = display.success && typeof display.data.full_name === "string" ? display.data.full_name.trim().slice(0, 120) : "";
  const phone = display.success && typeof display.data.phone === "string" ? display.data.phone.trim().slice(0, 30) : "";
  return { profileId: sub, email: email.toLowerCase(), fullName: name || email.toLowerCase(), phone: phone || null };
}
