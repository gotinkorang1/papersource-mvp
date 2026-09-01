// Retired custom-password endpoint. Customer forms use Supabase-backed Server Actions.
export async function POST() {
  return new Response("This sign-in endpoint has been retired. Open /login or /register.", { status: 410 });
}
