import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import { readVerifiedCustomerIdentity, type CustomerActor } from "@/lib/customer/identity";
import { safeCustomerReturnPath } from "@/lib/customer/return-path";

type AuthClient = Pick<SupabaseClient["auth"],
  "signUp" | "signInWithPassword" | "verifyOtp" | "resetPasswordForEmail" | "updateUser" | "signOut" | "getClaims">;

export type CustomerAuthResult =
  | { status: "error"; message: string; fieldErrors?: Record<string, string[]> }
  | { status: "email_sent" | "password_updated" | "signed_out" }
  | { status: "signed_in"; customer: CustomerActor; next: string };

const email = z.string().trim().max(254).email().toLowerCase();
const newPassword = z.string().min(8, "Use at least 8 characters.").max(128, "Use no more than 128 characters.");
const loginSchema = z.object({ email, password: z.string().min(1).max(128), next: z.unknown().optional() });
const registerSchema = loginSchema.extend({
  password: newPassword,
  fullName: z.string().trim().min(1, "Enter your name.").max(120),
  phone: z.string().trim().max(30).optional().default(""),
});
const confirmSchema = z.object({
  tokenHash: z.string().min(1).max(2048), type: z.enum(["email", "recovery"]), next: z.unknown().optional(),
});
const resetRequestSchema = z.object({ email });
const passwordSchema = z.object({ password: newPassword, confirmPassword: z.string().max(128) })
  .refine((input) => input.password === input.confirmPassword, { path: ["confirmPassword"], message: "Passwords must match." });

function validationError(error: z.ZodError): CustomerAuthResult {
  const fieldErrors: Record<string, string[]> = {};
  for (const issue of error.issues) {
    const field = String(issue.path[0] ?? "form");
    (fieldErrors[field] ??= []).push(issue.message);
  }
  return { status: "error", message: "Check the highlighted fields.", fieldErrors };
}

function callbackOrigin(siteUrl: string): string {
  const url = new URL(siteUrl);
  const local = ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname);
  if ((url.protocol !== "https:" && !(url.protocol === "http:" && local)) ||
      url.username || url.password || url.pathname !== "/" || url.search || url.hash) {
    throw new Error("Customer Auth requires a trusted site origin.");
  }
  return url.origin;
}

/** Server-internal operation layer. Supply a fresh cookie-backed Auth client per request.
 * Route/action callers must complete safe commerce integration before redirecting.
 * No custom credentials, application session cookies or email-based claiming exist here.
 */
export function createCustomerAuthService({ auth, siteUrl, synchronizeProfile }: {
  auth: AuthClient;
  siteUrl: string;
  synchronizeProfile: (identity: CustomerActor) => Promise<CustomerActor>;
}) {
  const origin = callbackOrigin(siteUrl);
  const failure = (message: string): CustomerAuthResult => ({ status: "error", message });
  const signInFailure = "Could not sign in. Check your details and try again.";
  const confirmationFailure = "This link is invalid or expired. Request a new email.";

  async function finishSignIn(next: string, message: string): Promise<CustomerAuthResult> {
    try {
      const identity = await readVerifiedCustomerIdentity(auth);
      if (!identity) throw new Error("Unverified customer identity.");
      const customer = await synchronizeProfile(identity);
      return { status: "signed_in", customer, next };
    } catch {
      // Best effort only: provider outages must not be reported as successful sign-in.
      try { await auth.signOut({ scope: "local" }); } catch { /* Keep failure neutral. */ }
      return failure(message);
    }
  }

  return {
    async register(input: unknown): Promise<CustomerAuthResult> {
      const parsed = registerSchema.safeParse(input);
      if (!parsed.success) return validationError(parsed.error);
      const { email, password, fullName, phone, next } = parsed.data;
      const destination = safeCustomerReturnPath(next);
      const callback = new URL("/auth/confirm", origin);
      callback.searchParams.set("type", "email");
      callback.searchParams.set("next", destination);
      try {
        const { data, error } = await auth.signUp({
          email, password,
          options: { data: { full_name: fullName, phone }, emailRedirectTo: callback.toString() },
        });
        if (error?.code === "user_already_exists") return { status: "email_sent" };
        if (error) return failure("Could not create your account. Please try again.");
        // An unconfirmed signup's user record is not an authenticated identity.
        if (!data.session) return { status: "email_sent" };
        return finishSignIn(destination, signInFailure);
      } catch { return failure("Could not create your account. Please try again."); }
    },

    async login(input: unknown): Promise<CustomerAuthResult> {
      const parsed = loginSchema.safeParse(input);
      if (!parsed.success) return validationError(parsed.error);
      const { email, password, next } = parsed.data;
      try {
        const { data, error } = await auth.signInWithPassword({ email, password });
        if (error || !data.session) return failure(signInFailure);
        return finishSignIn(safeCustomerReturnPath(next), signInFailure);
      } catch { return failure(signInFailure); }
    },

    async confirm(input: unknown): Promise<CustomerAuthResult> {
      const parsed = confirmSchema.safeParse(input);
      if (!parsed.success) return failure(confirmationFailure);
      const { tokenHash, type, next } = parsed.data;
      try {
        const { data, error } = await auth.verifyOtp({ token_hash: tokenHash, type });
        if (error || !data.session) return failure(confirmationFailure);
        return finishSignIn(type === "recovery" ? "/reset-password" : safeCustomerReturnPath(next), confirmationFailure);
      } catch { return failure(confirmationFailure); }
    },

    async requestPasswordReset(input: unknown): Promise<CustomerAuthResult> {
      const parsed = resetRequestSchema.safeParse(input);
      if (!parsed.success) return validationError(parsed.error);
      const message = "Could not send the email. Please try again.";
      try {
        const { error } = await auth.resetPasswordForEmail(parsed.data.email, {
          redirectTo: new URL("/auth/confirm?type=recovery", origin).toString(),
        });
        return error ? failure(message) : { status: "email_sent" };
      } catch { return failure(message); }
    },

    async updatePassword(input: unknown): Promise<CustomerAuthResult> {
      const parsed = passwordSchema.safeParse(input);
      if (!parsed.success) return validationError(parsed.error);
      const message = "Could not update your password. Request a new reset email and try again.";
      try {
        if (!await readVerifiedCustomerIdentity(auth)) return failure(message);
        const { data, error } = await auth.updateUser({ password: parsed.data.password });
        return error || !data.user ? failure(message) : { status: "password_updated" };
      } catch { return failure(message); }
    },

    async signOut(): Promise<CustomerAuthResult> {
      const message = "Could not sign out. Please try again.";
      try {
        const { error } = await auth.signOut({ scope: "global" });
        return error ? failure(message) : { status: "signed_out" };
      } catch { return failure(message); }
    },
  };
}
