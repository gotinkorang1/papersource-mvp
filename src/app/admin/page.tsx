import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default function AdminHomePage() {
  return (
    <main className="min-h-full bg-cream px-6 py-16 text-graphite">
      <p className="text-sm tracking-[0.16em] text-slate uppercase">
        PaperSource operations
      </p>
      <h1 className="mt-3 text-3xl text-ink">Admin</h1>
      <p className="mt-4 max-w-xl text-slate">
        The first-party dashboard lands with RBAC in a later phase. Do not operate
        quotes or orders from the Supabase dashboard. See docs/ADMIN.md.
      </p>
    </main>
  );
}
