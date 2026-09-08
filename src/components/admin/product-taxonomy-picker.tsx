"use client";

import { useMemo, useState } from "react";
import { adminFieldClass } from "@/components/admin/field";

type TaxonomyOption = { id: string; name: string; parentId?: string | null };

function categoryLabel(category: TaxonomyOption, all: TaxonomyOption[]) {
  const names: string[] = [];
  const seen = new Set<string>();
  let current: TaxonomyOption | undefined = category;
  while (current && !seen.has(current.id)) {
    seen.add(current.id);
    names.unshift(current.name);
    current = current.parentId ? all.find((item) => item.id === current?.parentId) : undefined;
  }
  return names.join(" › ");
}

export function ProductTaxonomyPicker({
  kind,
  options,
  name,
  required = true,
  value,
}: {
  kind: "category" | "brand";
  options: TaxonomyOption[];
  name: string;
  required?: boolean;
  value?: string;
}) {
  const [items, setItems] = useState(options);
  const [selected, setSelected] = useState(value ?? options[0]?.id ?? "");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [newName, setNewName] = useState("");
  const [parentId, setParentId] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const selectedItem = items.find((item) => item.id === selected);
  const labels = useMemo(() => new Map(items.map((item) => [item.id, kind === "category" ? categoryLabel(item, items) : item.name])), [items, kind]);

  async function createItem() {
    if (!newName.trim()) return;
    setSaving(true);
    setStatus(null);
    const body = new FormData();
    body.set("intent", kind === "category" ? "create-category" : "create-brand");
    body.set("name", newName.trim());
    body.set("slug", "");
    body.set("active", "true");
    if (kind === "category") {
      body.set("parentId", parentId);
      body.set("description", "");
      body.set("position", "0");
    }
    try {
      const response = await fetch(kind === "category" ? "/admin/categories/mutate" : "/admin/brands/mutate", {
        method: "POST",
        body,
        headers: { Accept: "application/json" },
      });
      const result = (await response.json()) as { item?: TaxonomyOption; error?: string };
      if (!response.ok || !result.item) throw new Error(result.error ?? "Could not create this option.");
      setItems((current) => [...current, result.item!]);
      setSelected(result.item.id);
      setNewName("");
      setParentId("");
      setOpen(false);
      setStatus(`${kind === "category" ? "Category" : "Brand"} added.`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not create this option.");
    } finally {
      setSaving(false);
    }
  }

  async function updateItem() {
    if (!selectedItem || !newName.trim()) return;
    setSaving(true);
    setStatus(null);
    const body = new FormData();
    body.set("intent", kind === "category" ? "save-category" : "save-brand");
    body.set(kind === "category" ? "categoryId" : "brandId", selectedItem.id);
    body.set("name", newName.trim());
    body.set("slug", "");
    body.set("active", "true");
    if (kind === "category") {
      body.set("parentId", parentId);
      body.set("description", "");
      body.set("position", "0");
    }
    try {
      const response = await fetch(kind === "category" ? "/admin/categories/mutate" : "/admin/brands/mutate", { method: "POST", body, headers: { Accept: "application/json" } });
      const result = (await response.json()) as { item?: TaxonomyOption; error?: string };
      if (!response.ok || !result.item) throw new Error(result.error ?? "Could not update this option.");
      setItems((current) => current.map((item) => item.id === result.item!.id ? result.item! : item));
      setNewName("");
      setEditing(false);
      setOpen(false);
      setStatus(`${kind === "category" ? "Category" : "Brand"} updated.`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not update this option.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid gap-2">
      <div className="flex gap-2">
        <select name={name} required={required} value={selected} onChange={(event) => setSelected(event.target.value)} className={`${adminFieldClass} min-w-0 flex-1`}>
          {items.length ? items.map((item) => <option key={item.id} value={item.id}>{labels.get(item.id)}</option>) : <option value="">Add an option first</option>}
        </select>
        <div className="flex shrink-0 gap-2"><button type="button" className="min-h-11 rounded-lg border border-border px-3 text-sm font-semibold text-ink transition hover:border-paper-green hover:text-paper-green" onClick={() => setOpen((current) => !current)} aria-expanded={open}>{open ? "Close" : "Add new"}</button>{selectedItem ? <button type="button" className="min-h-11 rounded-lg border border-border px-3 text-sm font-semibold text-ink transition hover:border-paper-green hover:text-paper-green" onClick={() => { setNewName(selectedItem.name); setParentId(selectedItem.parentId ?? ""); setEditing(true); setOpen(true); }}>Edit</button> : null}</div>
      </div>
      {open ? <div className="rounded-lg border border-paper-green/30 bg-paper-green/5 p-3">
        <p className="text-xs font-semibold tracking-[0.12em] text-paper-green uppercase">{editing ? `Edit ${kind}` : `Add ${kind}`}</p>
        <div className="mt-2 grid gap-2">
          <input value={newName} onChange={(event) => setNewName(event.target.value)} className={adminFieldClass} placeholder={kind === "category" ? "e.g. Social Issues & Women’s Suffrage" : "e.g. Pilot"} aria-label={`New ${kind} name`} />
          {kind === "category" ? <select value={parentId} onChange={(event) => setParentId(event.target.value)} className={adminFieldClass} aria-label="Parent category"><option value="">Top-level category</option>{items.map((item) => <option key={item.id} value={item.id}>{labels.get(item.id)}</option>)}</select> : null}
          <button type="button" disabled={saving || !newName.trim()} onClick={() => void (editing ? updateItem() : createItem())} className="min-h-10 rounded-lg bg-ink px-3 text-sm font-semibold text-white transition hover:bg-paper-green disabled:cursor-not-allowed disabled:opacity-50">{saving ? "Saving…" : editing ? `Save ${kind}` : `Add ${kind}`}</button>
        </div>
      </div> : null}
      {status ? <p className="text-xs text-slate" role="status">{status}</p> : null}
    </div>
  );
}
