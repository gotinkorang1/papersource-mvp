import type { Metadata } from "next";
import { listAdminStaff } from "@/features/admin/queries";
import { SubmitProgressButton } from "@/components/admin/submit-progress-button";
import { canAccessAdmin } from "@/lib/staff/rbac";
import { requireStaffArea } from "@/lib/staff/require";
import type { StaffRole } from "@/lib/staff/types";

export const metadata: Metadata = { title: "Staff users" };
export const dynamic = "force-dynamic";

const roles: StaffRole[] = ["super_admin", "admin", "sales", "warehouse", "content_manager"];

export default async function AdminUsersPage({ searchParams }: { searchParams: Promise<{ error?: string; success?: string }> }) {
  const actor = await requireStaffArea("users", "read");
  const rows = await listAdminStaff(actor.role);
  const canWrite = canAccessAdmin(actor.role, "roles", "write");
  const { error, success } = await searchParams;

  return (
    <main className="max-w-5xl">
      <p className="text-sm tracking-[0.16em] text-slate uppercase">System</p>
      <h1 className="mt-2 font-heading text-3xl text-ink">Staff users</h1>
      <p className="mt-3 max-w-2xl text-slate">Staff access is granted by Supabase Auth email plus an entry in <code>admin_roles</code>. Passwords remain managed in Supabase Auth.</p>
      {error ? <p role="alert" className="mt-4 rounded-lg border border-error/40 bg-card px-4 py-3 text-sm text-error">{error}</p> : null}
      {success ? <p role="status" className="mt-4 border border-paper-green/40 bg-paper-green/10 px-4 py-3 text-sm text-paper-green">Role updated.</p> : null}
      {rows.length === 0 ? <p className="mt-8 text-slate">No staff profiles have been assigned yet.</p> : (
        <div className="mt-8 overflow-x-auto rounded-xl border border-border bg-card">
          <table className="w-full text-sm">
            <caption className="sr-only">Staff users and roles</caption>
            <thead><tr className="border-b border-border text-left text-slate"><th className="px-4 py-3 font-medium">Name</th><th className="px-4 py-3 font-medium">Email</th><th className="px-4 py-3 font-medium">Role</th><th className="px-4 py-3 font-medium">Access</th></tr></thead>
            <tbody>{rows.map((row) => <tr key={row.id} className="border-b border-border transition-colors hover:bg-muted/40 last:border-0"><td className="px-4 py-3 font-medium text-ink">{row.fullName}</td><td className="px-4 py-3">{row.email}</td><td className="px-4 py-3 capitalize">{row.role.replaceAll("_", " ")}</td><td className="px-4 py-3">{canWrite ? <form action="/admin/users/mutate" method="post" className="flex items-center gap-2"><input type="hidden" name="profileId" value={row.id} /><select name="role" defaultValue={row.role} className="h-9 rounded-md border border-border bg-background px-2 text-sm text-ink" aria-label={`Role for ${row.email}`}>{roles.map((role) => <option key={role} value={role}>{role.replaceAll("_", " ")}</option>)}</select><SubmitProgressButton idleLabel="Save" pendingLabel="Saving…" className="rounded-md border border-ink px-3 py-1.5 text-xs font-semibold text-ink transition hover:bg-ink hover:text-white" /></form> : <span className="text-slate">Read only</span>}</td></tr>)}</tbody>
          </table>
        </div>
      )}
    </main>
  );
}
