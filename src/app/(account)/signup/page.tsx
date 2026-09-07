import { redirect } from "next/navigation";

/** Compatibility alias for the common /signup convention. */
export default function SignupPage() {
  redirect("/register");
}
