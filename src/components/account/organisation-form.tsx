"use client";

import { useActionState } from "react";
import { paperButton } from "@/components/commerce/paper-button";
import { saveOrganisationAction } from "@/features/account/actions";
import type { AccountActionState } from "@/features/account/actions-state";

const types = [["business", "Business"], ["school", "School"], ["government", "Government"], ["ngo", "NGO"], ["hospital", "Hospital"], ["church", "Church"], ["university", "University"], ["retailer", "Retailer"], ["other", "Other"]];
const fieldClass = "min-h-11 w-full rounded-md border border-border bg-white px-3 py-2 text-graphite focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink";

export function OrganisationForm({ values }: { values: { name: string; type: string; email: string; phone: string } }) {
  const [state, action, pending] = useActionState(saveOrganisationAction, {} as AccountActionState);
  function errors(field: string) { return state.errors?.[field]; }
  function errorProps(field: string) { return { "aria-invalid": Boolean(errors(field)?.length), "aria-describedby": errors(field)?.length ? `org-${field}-error` : undefined }; }
  return (
    <form action={action} className="mt-8 grid max-w-xl gap-4 rounded-md border border-border bg-white p-5">
      <div className="space-y-1.5">
        <label htmlFor="org-name" className="block text-sm font-medium">Organisation name *</label>
        <input id="org-name" name="name" required maxLength={200} autoComplete="organization" defaultValue={values.name} className={fieldClass} {...errorProps("name")} />
        <p id="org-name-error" className="text-sm text-error">{errors("name")?.join(" ")}</p>
      </div>
      <div className="space-y-1.5">
        <label htmlFor="org-type" className="block text-sm font-medium">Type</label>
        <select id="org-type" name="type" defaultValue={values.type} className={fieldClass} {...errorProps("type")}>
          {types.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
        <p id="org-type-error" className="text-sm text-error">{errors("type")?.join(" ")}</p>
      </div>
      {(["email", "phone"] as const).map((field) => (
        <div key={field} className="space-y-1.5">
          <label htmlFor={`org-${field}`} className="block text-sm font-medium">{field === "email" ? "Email" : "Phone"}</label>
          <input id={`org-${field}`} name={field} type={field === "email" ? "email" : "tel"} autoComplete={field === "email" ? "email" : "tel"} defaultValue={values[field]} className={fieldClass} {...errorProps(field)} />
          <p id={`org-${field}-error`} className="text-sm text-error">{errors(field)?.join(" ")}</p>
        </div>
      ))}
      {state.message ? <p role={state.success ? "status" : "alert"} className={state.success ? "text-sm text-ink" : "text-sm text-error"}>{state.message}</p> : null}
      <button type="submit" disabled={pending} className={paperButton()}>{pending ? "Saving…" : "Save organisation"}</button>
    </form>
  );
}
