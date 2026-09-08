import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminError, AdminField, adminAreaClass, adminFieldClass } from "@/components/admin/field";
import { SubmitProgressButton } from "@/components/admin/submit-progress-button";
import { ProductImageManager } from "@/components/admin/product-image-manager";
import { paperButton } from "@/components/commerce/paper-button";
import { getAdminProduct, listTaxonomyOptions } from "@/features/catalogue/admin";
import { formatGhs, pesewasToMajor } from "@/lib/money";
import { canAccessAdmin } from "@/lib/staff/rbac";
import { requireStaffArea } from "@/lib/staff/require";

export const metadata: Metadata = {
  title: "Product",
};

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
};

export default async function AdminProductDetailPage({
  params,
  searchParams,
}: PageProps) {
  const actor = await requireStaffArea("products", "read");
  const { id } = await params;
  const { error } = await searchParams;
  const product = await getAdminProduct(id);
  if (!product) {
    notFound();
  }

  const { brands, categories } = await listTaxonomyOptions();
  const canWrite = canAccessAdmin(actor.role, "products", "write");
  const canPrice = canAccessAdmin(actor.role, "pricing", "write");

  return (
    <main>
      <p className="text-sm tracking-[0.16em] text-slate uppercase">
        <Link href="/admin/products" className="underline">
          Products
        </Link>
      </p>
      <h1 className="mt-2 font-heading text-3xl text-ink">{product.name}</h1>
      <p className="mt-2 text-sm text-slate">
        {product.status} · {product.productType} · /product/{product.slug}
      </p>
      <AdminError error={error} />

      <section className="mt-8 max-w-2xl rounded-xl border border-border bg-card p-4 shadow-sm sm:p-5">
        <h2 className="font-heading text-xl text-ink">Copy</h2>
        {canWrite ? (
          <form action="/admin/products/mutate" method="post" className="mt-4 grid gap-4">
            <input type="hidden" name="intent" value="save-product" />
            <input type="hidden" name="productId" value={product.id} />
            <AdminField label="Name *">
              <input name="name" required defaultValue={product.name} className={adminFieldClass} />
            </AdminField>
            <AdminField label="Slug *">
              <input name="slug" required defaultValue={product.slug} className={adminFieldClass} />
            </AdminField>
            <AdminField label="Brand *">
              <select name="brandId" required defaultValue={product.brandId} className={adminFieldClass}>
                {brands.map((brand) => (
                  <option key={brand.id} value={brand.id}>
                    {brand.name}
                  </option>
                ))}
              </select>
            </AdminField>
            <AdminField label="Category *">
              <select
                name="categoryId"
                required
                defaultValue={product.categoryId}
                className={adminFieldClass}
              >
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </AdminField>
            <AdminField label="Type">
              <select name="productType" defaultValue={product.productType} className={adminFieldClass}>
                <option value="standard">Standard</option>
                <option value="bundle">Office pack</option>
              </select>
            </AdminField>
            <AdminField label="Status">
              <select name="status" defaultValue={product.status} className={adminFieldClass}>
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="archived">Archived</option>
              </select>
            </AdminField>
            <AdminField label="Description">
              <textarea
                name="description"
                defaultValue={product.description ?? ""}
                className={adminAreaClass}
              />
            </AdminField>
            <SubmitProgressButton idleLabel="Save product" pendingLabel="Saving product…" className={paperButton()} />
          </form>
        ) : (
          <p className="mt-3 text-sm text-slate">This role can read the catalogue but not edit copy.</p>
        )}
      </section>

      <section className="mt-8">
        <h2 className="font-heading text-xl text-ink">Variants</h2>
        <div className="mt-4 overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
          <table className="w-full min-w-[34rem] text-sm">
            <caption className="sr-only">Product variants</caption>
            <thead>
              <tr className="border-b border-border text-left text-slate">
                <th className="px-4 py-3 font-medium">SKU</th>
                <th className="px-4 py-3 font-medium">Unit</th>
                <th className="px-4 py-3 font-medium">List price</th>
                <th className="px-4 py-3 font-medium">Active</th>
              </tr>
            </thead>
            <tbody>
              {product.variants.map((variant) => (
                <tr key={variant.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 font-mono text-xs">{variant.sku}</td>
                  <td className="px-4 py-3">{variant.unitLabel}</td>
                  <td className="px-4 py-3 tabular-nums">
                    {canAccessAdmin(actor.role, "pricing", "read")
                      ? formatGhs(variant.baseUnitPrice)
                      : "—"}
                  </td>
                  <td className="px-4 py-3">{variant.active ? "Yes" : "No"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {canWrite
          ? product.variants.map((variant) => (
              <form
                key={variant.id}
                action="/admin/products/mutate"
                method="post"
                className="mt-4 grid gap-3 rounded-xl border border-border bg-card p-4 shadow-sm sm:grid-cols-2 sm:p-5"
              >
                <input type="hidden" name="intent" value="save-variant" />
                <input type="hidden" name="productId" value={product.id} />
                <input type="hidden" name="variantId" value={variant.id} />
                <AdminField label="SKU">
                  <input name="sku" required defaultValue={variant.sku} className={adminFieldClass} />
                </AdminField>
                <AdminField label="Unit label">
                  <input
                    name="unitLabel"
                    required
                    defaultValue={variant.unitLabel}
                    className={adminFieldClass}
                  />
                </AdminField>
                <AdminField label="Barcode">
                  <input
                    name="barcode"
                    defaultValue={variant.barcode ?? ""}
                    className={adminFieldClass}
                  />
                </AdminField>
                <AdminField label="Variant name">
                  <input name="name" defaultValue={variant.name ?? ""} className={adminFieldClass} />
                </AdminField>
                {canPrice ? (
                  <AdminField label="Base unit price (GHS)">
                    <input
                      name="baseUnitPrice"
                      defaultValue={pesewasToMajor(variant.baseUnitPrice)}
                      className={adminFieldClass}
                    />
                  </AdminField>
                ) : null}
                <AdminField label="Active">
                  <select
                    name="active"
                    defaultValue={variant.active ? "true" : "false"}
                    className={adminFieldClass}
                  >
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                </AdminField>
                <div className="sm:col-span-2">
                  <SubmitProgressButton
                    idleLabel={`Save ${variant.sku}`}
                    pendingLabel={`Saving ${variant.sku}…`}
                    className={paperButton()}
                  />
                </div>
              </form>
            ))
          : null}

        {canWrite ? (
          <form
            action="/admin/products/mutate"
            method="post"
            className="mt-4 grid gap-3 rounded-xl border border-border bg-card p-4 shadow-sm sm:grid-cols-3 sm:p-5"
          >
            <input type="hidden" name="intent" value="add-variant" />
            <input type="hidden" name="productId" value={product.id} />
            <AdminField label="New SKU">
              <input name="sku" required className={adminFieldClass} />
            </AdminField>
            <AdminField label="Unit label">
              <input name="unitLabel" defaultValue="each" className={adminFieldClass} />
            </AdminField>
            <AdminField label="Base unit price (GHS)">
              <input name="baseUnitPrice" required className={adminFieldClass} placeholder="78.99" />
            </AdminField>
            <div className="sm:col-span-3">
              <SubmitProgressButton
                idleLabel="Add variant"
                pendingLabel="Adding variant…"
                className={paperButton({ variant: "secondary" })}
              />
            </div>
          </form>
        ) : null}
      </section>

      {canAccessAdmin(actor.role, "pricing", "read") ? (
        <section className="mt-8">
          <h2 className="font-heading text-xl text-ink">Price tiers</h2>
          <p className="mt-2 text-sm text-slate">
            Server-authoritative bands. Request-quote is for open-ended volume.
          </p>
          <div className="mt-4 overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
            <table className="w-full min-w-[34rem] text-sm">
              <caption className="sr-only">Price tiers</caption>
              <thead>
                <tr className="border-b border-border text-left text-slate">
                  <th className="px-4 py-3 font-medium">SKU</th>
                  <th className="px-4 py-3 font-medium">Qty</th>
                  <th className="px-4 py-3 font-medium">Price</th>
                  <th className="px-4 py-3 font-medium">Active</th>
                  {canPrice ? <th className="px-4 py-3 font-medium"> </th> : null}
                </tr>
              </thead>
              <tbody>
                {product.tiers.map((tier) => {
                  const sku =
                    product.variants.find((variant) => variant.id === tier.variantId)?.sku ?? "—";
                  return (
                    <tr key={tier.id} className="border-b border-border last:border-0">
                      <td className="px-4 py-3 font-mono text-xs">{sku}</td>
                      <td className="px-4 py-3">
                        {tier.minimumQuantity}
                        {tier.maximumQuantity ? `–${tier.maximumQuantity}` : "+"}
                      </td>
                      <td className="px-4 py-3 tabular-nums">
                        {tier.requestQuote
                          ? "Request quote"
                          : tier.unitPrice !== null
                            ? formatGhs(tier.unitPrice)
                            : "—"}
                      </td>
                      <td className="px-4 py-3">{tier.active ? "Yes" : "No"}</td>
                      {canPrice && tier.active ? (
                        <td className="px-4 py-3">
                          <form action="/admin/products/mutate" method="post">
                            <input type="hidden" name="intent" value="deactivate-tier" />
                            <input type="hidden" name="productId" value={product.id} />
                            <input type="hidden" name="tierId" value={tier.id} />
                            <SubmitProgressButton
                              idleLabel="Deactivate"
                              pendingLabel="Deactivating…"
                              className="h-auto min-h-0 bg-transparent px-0 text-sm text-ink underline hover:bg-transparent"
                            />
                          </form>
                        </td>
                      ) : canPrice ? (
                        <td className="px-4 py-3 text-slate">—</td>
                      ) : null}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {canPrice ? (
            <form
              action="/admin/products/mutate"
              method="post"
              className="mt-4 grid gap-3 rounded-xl border border-border bg-card p-4 shadow-sm sm:grid-cols-2 sm:p-5"
            >
              <input type="hidden" name="intent" value="add-tier" />
              <input type="hidden" name="productId" value={product.id} />
              <AdminField label="Variant">
                <select name="variantId" required className={adminFieldClass}>
                  {product.variants.map((variant) => (
                    <option key={variant.id} value={variant.id}>
                      {variant.sku}
                    </option>
                  ))}
                </select>
              </AdminField>
              <AdminField label="Minimum qty">
                <input name="minimumQuantity" required defaultValue="1" className={adminFieldClass} />
              </AdminField>
              <AdminField label="Maximum qty (blank = open)">
                <input name="maximumQuantity" className={adminFieldClass} />
              </AdminField>
              <AdminField label="Unit price (GHS)">
                <input name="unitPrice" className={adminFieldClass} placeholder="leave blank if quote" />
              </AdminField>
              <label className="flex items-center gap-2 text-sm text-ink sm:col-span-2">
                <input type="checkbox" name="requestQuote" value="true" />
                Request quote (no unit price)
              </label>
              <div className="sm:col-span-2">
                <SubmitProgressButton idleLabel="Add price band" pendingLabel="Adding price band…" className={paperButton({ variant: "secondary" })} />
              </div>
            </form>
          ) : (
            <p className="mt-3 text-sm text-slate">Only admin roles can change list prices.</p>
          )}
        </section>
      ) : null}

      <section className="mt-8 grid gap-8 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm sm:p-5">
          <h2 className="font-heading text-xl text-ink">Images</h2>
          <p className="mt-2 text-sm text-slate">Add up to 4 optimized Cloudinary images. The first image is the primary product image.</p>
          <p className="mt-2 text-xs font-semibold tracking-[0.12em] text-paper-green uppercase">{product.images.length}/4 images used</p>
          <ul className="mt-4 space-y-2 text-sm">
            {product.images.map((image) => (
              <li key={image.id} className="flex items-center justify-between gap-3">
                <span>
                  {image.cloudinaryPublicId} — {image.alt}
                </span>
                {canWrite ? (
                  <form action="/admin/products/mutate" method="post">
                    <input type="hidden" name="intent" value="remove-image" />
                    <input type="hidden" name="productId" value={product.id} />
                    <input type="hidden" name="imageId" value={image.id} />
                    <SubmitProgressButton idleLabel="Remove" pendingLabel="Removing…" className="h-auto min-h-0 bg-transparent px-0 text-sm text-ink underline hover:bg-transparent" />
                  </form>
                ) : null}
              </li>
            ))}
          </ul>
          {canWrite && product.images.length < 4 ? (
            <ProductImageManager productId={product.id} imageCount={product.images.length} />
          ) : canWrite ? <p className="mt-4 rounded-lg border border-paper-green/30 bg-paper-green/10 px-3 py-2 text-sm text-paper-green">Image limit reached. Remove an image before adding another.</p> : null}
        </div>

        <div className="rounded-xl border border-border bg-card p-4 shadow-sm sm:p-5">
          <h2 className="font-heading text-xl text-ink">Search aliases</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {product.aliases.map((alias) => (
              <li key={alias.id} className="flex items-center justify-between gap-3">
                <span>{alias.alias}</span>
                {canWrite ? (
                  <form action="/admin/products/mutate" method="post">
                    <input type="hidden" name="intent" value="remove-alias" />
                    <input type="hidden" name="productId" value={product.id} />
                    <input type="hidden" name="aliasId" value={alias.id} />
                    <SubmitProgressButton idleLabel="Remove" pendingLabel="Removing…" className="h-auto min-h-0 bg-transparent px-0 text-sm text-ink underline hover:bg-transparent" />
                  </form>
                ) : null}
              </li>
            ))}
          </ul>
          {canWrite ? (
            <form action="/admin/products/mutate" method="post" className="mt-4 grid gap-3">
              <input type="hidden" name="intent" value="add-alias" />
              <input type="hidden" name="productId" value={product.id} />
              <AdminField label="Alias">
                <input name="alias" required className={adminFieldClass} />
              </AdminField>
              <SubmitProgressButton idleLabel="Add alias" pendingLabel="Adding alias…" className={paperButton({ variant: "secondary" })} />
            </form>
          ) : null}
        </div>
      </section>

      <section className="mt-8 grid gap-8 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm sm:p-5">
          <h2 className="font-heading text-xl text-ink">Attributes</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {product.attributes.map((attribute) => (
              <li key={attribute.id} className="flex items-center justify-between gap-3">
                <span>
                  {attribute.namespace}.{attribute.key}: {attribute.valueText}
                </span>
                {canWrite ? (
                  <form action="/admin/products/mutate" method="post">
                    <input type="hidden" name="intent" value="remove-attribute" />
                    <input type="hidden" name="productId" value={product.id} />
                    <input type="hidden" name="attributeId" value={attribute.id} />
                    <SubmitProgressButton idleLabel="Remove" pendingLabel="Removing…" className="h-auto min-h-0 bg-transparent px-0 text-sm text-ink underline hover:bg-transparent" />
                  </form>
                ) : null}
              </li>
            ))}
          </ul>
          {canWrite ? (
            <form action="/admin/products/mutate" method="post" className="mt-4 grid gap-3">
              <input type="hidden" name="intent" value="add-attribute" />
              <input type="hidden" name="productId" value={product.id} />
              <AdminField label="Namespace">
                <input name="namespace" required className={adminFieldClass} placeholder="paper" />
              </AdminField>
              <AdminField label="Key">
                <input name="key" required className={adminFieldClass} placeholder="gsm" />
              </AdminField>
              <AdminField label="Value">
                <input name="valueText" required className={adminFieldClass} />
              </AdminField>
              <SubmitProgressButton idleLabel="Add attribute" pendingLabel="Adding attribute…" className={paperButton({ variant: "secondary" })} />
            </form>
          ) : null}
        </div>

        {product.productType === "bundle" ? (
          <div className="rounded-xl border border-border bg-card p-4 shadow-sm sm:p-5">
            <h2 className="font-heading text-xl text-ink">Office pack items</h2>
            <ul className="mt-4 space-y-2 text-sm">
              {product.bundleItems.map((item) => (
                <li key={item.id} className="flex items-center justify-between gap-3">
                  <span>
                    {item.quantity} × {item.sku}
                  </span>
                  {canWrite ? (
                    <form action="/admin/products/mutate" method="post">
                      <input type="hidden" name="intent" value="remove-bundle-item" />
                      <input type="hidden" name="productId" value={product.id} />
                      <input type="hidden" name="bundleItemId" value={item.id} />
                      <SubmitProgressButton idleLabel="Remove" pendingLabel="Removing…" className="h-auto min-h-0 bg-transparent px-0 text-sm text-ink underline hover:bg-transparent" />
                    </form>
                  ) : null}
                </li>
              ))}
            </ul>
            {canWrite ? (
              <form action="/admin/products/mutate" method="post" className="mt-4 grid gap-3">
                <input type="hidden" name="intent" value="add-bundle-item" />
                <input type="hidden" name="productId" value={product.id} />
                <AdminField label="Component SKU">
                  <input name="sku" required className={adminFieldClass} />
                </AdminField>
                <AdminField label="Quantity">
                  <input name="quantity" required defaultValue="1" className={adminFieldClass} />
                </AdminField>
                <SubmitProgressButton idleLabel="Add pack item" pendingLabel="Adding pack item…" className={paperButton({ variant: "secondary" })} />
              </form>
            ) : null}
          </div>
        ) : null}
      </section>
    </main>
  );
}
