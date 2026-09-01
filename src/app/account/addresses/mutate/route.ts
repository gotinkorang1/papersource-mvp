// First-party mutations now use authenticated Server Actions and Origin checks.
export async function POST() {
  return new Response("Use the address form in your account.", {
    status: 405,
    headers: { "Cache-Control": "private, no-store" },
  });
}
