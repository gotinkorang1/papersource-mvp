"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createCustomerAuthService, type CustomerAuthResult } from "./auth-service";
import { mergeGuestCommerce } from "./merge";
import type { CustomerAuthFormState } from "./auth-actions-state";
import { synchronizeCustomerProfile } from "@/lib/customer/profiles";
import { publicEnv } from "@/lib/env";
import { readGuestSessionId } from "@/lib/session/guest";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isTransientAuthError } from "@/lib/auth/transient-error";
import { clearLocalSupabaseAuthCookies } from "@/lib/supabase/clear-auth-cookies";

type AuthOperation = "login" | "register" | "requestPasswordReset" | "updatePassword";

function safeCommerceMergeMessage(error: unknown): string | null {
  const message = error instanceof Error ? error.message : "";
  return [
    "Reduce your cart quantity before signing in.",
    "Reduce your quote quantity before signing in.",
  ].includes(message) ? message : null;
}

async function execute(operation: AuthOperation, input: unknown): Promise<CustomerAuthFormState> {
  let result: CustomerAuthResult;
  try {
    // Keep recovery and sign-in available when the optional public site URL
    // was not duplicated into the deployment environment. The canonical
    // production origin is also used by SEO and transactional email.
    const siteUrl = publicEnv.NEXT_PUBLIC_SITE_URL || "https://www.papersourcegh.com";
    const client = await createSupabaseServerClient();
    const service = createCustomerAuthService({
      auth: client.auth,
      siteUrl,
      synchronizeProfile: synchronizeCustomerProfile,
    });
    result = await service[operation](input);
    if (result.status === "signed_in") {
      try {
        await mergeGuestCommerce({ profileId: result.customer.profileId, sessionId: await readGuestSessionId() });
      } catch (error) {
        // Do not announce success or leave a new session after failed integration.
        try {
          const { error: signOutError } = await client.auth.signOut({ scope: "local" });
          if (signOutError) await clearLocalSupabaseAuthCookies();
        } catch {
          await clearLocalSupabaseAuthCookies();
        }
        return {
          status: "error",
          message: safeCommerceMergeMessage(error)
            ?? (isTransientAuthError(error)
              ? "Account services are temporarily unavailable. Please try again."
              : "Could not finish signing in. Please try again."),
        };
      }
    }
  } catch {
    return { status: "error", message: "Account services are temporarily unavailable. Please try again." };
  }

  // redirect throws a framework control-flow exception; keep it outside catches.
  if (result.status === "signed_in") {
    revalidatePath("/", "layout");
    redirect(result.next);
  }
  if (result.status === "error") return result;
  if (result.status === "password_updated") {
    return { status: "success", message: "Your password has been updated. You can continue to your account." };
  }
  return {
    status: "success",
    message: operation === "register"
      ? "Check your email for the next step. If you already have an account, you can sign in or reset your password."
      : "If an account exists for that email, you will receive a password reset link. Check your inbox and spam folder.",
  };
}

export async function loginCustomerAction(_previous: CustomerAuthFormState, formData: FormData): Promise<CustomerAuthFormState> {
  return execute("login", { email: formData.get("email"), password: formData.get("password"), next: formData.get("next") });
}

export async function registerCustomerAction(_previous: CustomerAuthFormState, formData: FormData): Promise<CustomerAuthFormState> {
  return execute("register", {
    email: formData.get("email"), password: formData.get("password"),
    fullName: formData.get("fullName"), phone: formData.get("phone") ?? "", next: formData.get("next"),
  });
}

export async function requestPasswordResetAction(_previous: CustomerAuthFormState, formData: FormData): Promise<CustomerAuthFormState> {
  return execute("requestPasswordReset", { email: formData.get("email") });
}

export async function updateCustomerPasswordAction(_previous: CustomerAuthFormState, formData: FormData): Promise<CustomerAuthFormState> {
  return execute("updatePassword", { password: formData.get("password"), confirmPassword: formData.get("confirmPassword") });
}

export async function signOutCustomerAction(): Promise<void> {
  let signedOut = false;
  try {
    const client = await createSupabaseServerClient();
    const { error } = await client.auth.signOut({ scope: "global" });
    signedOut = !error;
    if (error) await clearLocalSupabaseAuthCookies();
  } catch {
    await clearLocalSupabaseAuthCookies();
  }
  if (!signedOut) redirect("/account?authError=sign-out");
  // Supabase clears its own cookies; ps_sid remains a guest-only capability.
  revalidatePath("/", "layout");
  redirect("/login");
}
