// Retired custom-cookie endpoint; it must never report a Supabase sign-out as successful.
export async function POST() {
  return new Response("Open /account and use Sign out.", { status: 410 });
}
