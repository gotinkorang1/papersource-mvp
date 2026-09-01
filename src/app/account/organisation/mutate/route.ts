// No legacy cookie-authenticated mutation endpoint remains.
export async function POST() {
  return new Response("Use the organisation form in your account.", {
    status: 405,
    headers: { "Cache-Control": "private, no-store" },
  });
}
