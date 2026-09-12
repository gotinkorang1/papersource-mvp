import { NextResponse } from "next/server";
import { z } from "zod";
import { recordAdminAudit } from "@/features/admin/audit";
import {
  addBundleItem,
  addPriceTier,
  addProductAlias,
  addProductAttribute,
  addProductImage,
  addProductImages,
  addVariant,
  bulkUpdateProducts,
  CatalogueAdminError,
  createProduct,
  deactivatePriceTier,
  parseOptionalPesewas,
  parseRequiredPesewas,
  removeBundleItem,
  removeProductAlias,
  removeProductAttribute,
  removeProductImage,
  moveProductImage,
  replaceProductImage,
  updateProductImage,
  saveProduct,
  saveVariant,
} from "@/features/catalogue/admin";
import { canAccessAdmin } from "@/lib/staff/rbac";
import { readStaffActor } from "@/lib/staff/require";

const uuid = z.string().uuid();
const productType = z.enum(["standard", "bundle"]);
const productStatus = z.enum(["draft", "active", "archived"]);

function redirectWithError(url: URL, error: unknown) {
  // Only expose deliberately user-facing catalogue errors. Database/provider
  // errors may contain schema or infrastructure details and must stay server-side.
  const message = error instanceof CatalogueAdminError
    ? error.message
    : "Could not update the catalogue. Please check the fields and try again.";
  url.searchParams.set("error", message);
  return NextResponse.redirect(url, 303);
}

function isJsonRequest(request: Request) {
  return request.headers.get("accept")?.includes("application/json") || request.headers.get("x-requested-with") === "XMLHttpRequest";
}

export async function POST(request: Request) {
  const origin = new URL(request.url).origin;
  const formData = await request.formData();
  const intent = String(formData.get("intent") ?? "");
  const productIdRaw = String(formData.get("productId") ?? "");
  const next = new URL(
    productIdRaw ? `/admin/products/${productIdRaw}` : "/admin/products/new",
    origin,
  );

  const actor = await readStaffActor();
  if (!actor) {
    return NextResponse.redirect(new URL("/admin/login", origin), 303);
  }

  const pricingIntent = intent === "add-tier" || intent === "deactivate-tier";
  const allowed = pricingIntent
    ? canAccessAdmin(actor.role, "pricing", "write")
    : canAccessAdmin(actor.role, "products", "write");
  if (!allowed) {
    next.searchParams.set("error", "This role cannot run that catalogue action.");
    return NextResponse.redirect(next, 303);
  }

  try {
    if (intent === "bulk-update-products") {
      const ids = formData.getAll("productId").map(String);
      const status = productStatus.parse(formData.get("status") ?? "draft");
      const count = await bulkUpdateProducts(actor.role, ids, status);
      const productsUrl = new URL("/admin/products", origin);
      productsUrl.searchParams.set("message", `${count} product${count === 1 ? "" : "s"} updated.`);
      return NextResponse.redirect(productsUrl, 303);
    }
    if (intent === "create-product") {
      const created = await createProduct({
        role: actor.role,
        name: String(formData.get("name") ?? ""),
        slug: String(formData.get("slug") ?? ""),
        brandId: uuid.parse(formData.get("brandId")),
        categoryId: uuid.parse(formData.get("categoryId")),
        productType: productType.parse(formData.get("productType") ?? "standard"),
        description: String(formData.get("description") ?? ""),
        status: productStatus.parse(formData.get("status") ?? "draft"),
        sku: String(formData.get("sku") ?? ""),
        unitLabel: String(formData.get("unitLabel") ?? "each"),
        baseUnitPricePesewas: parseRequiredPesewas(formData.get("baseUnitPrice")),
        openingStock: String(formData.get("openingStock") ?? ""),
        lowStockThreshold: String(formData.get("lowStockThreshold") ?? ""),
        images: formData.getAll("imagePublicId").map((cloudinaryPublicId, index) => ({
          cloudinaryPublicId: String(cloudinaryPublicId),
          alt: String(formData.getAll("imageAlt")[index] ?? ""),
          position: Number(formData.getAll("imagePosition")[index] ?? index),
        })),
      });
      await recordAdminAudit({ actorProfileId: actor.profileId, action: "catalogue_product_created", resourceType: "product", resourceId: created.id });
      return NextResponse.redirect(new URL(`/admin/products/${created.id}`, origin), 303);
    }

    const productId = uuid.parse(productIdRaw);

    if (intent === "save-product") {
      await saveProduct({
        role: actor.role,
        productId,
        name: String(formData.get("name") ?? ""),
        slug: String(formData.get("slug") ?? ""),
        brandId: uuid.parse(formData.get("brandId")),
        categoryId: uuid.parse(formData.get("categoryId")),
        productType: productType.parse(formData.get("productType") ?? "standard"),
        description: String(formData.get("description") ?? ""),
        status: productStatus.parse(formData.get("status") ?? "draft"),
      });
    } else if (intent === "add-variant") {
      await addVariant({
        role: actor.role,
        productId,
        sku: String(formData.get("sku") ?? ""),
        unitLabel: String(formData.get("unitLabel") ?? "each"),
        baseUnitPricePesewas: parseRequiredPesewas(formData.get("baseUnitPrice")),
      });
    } else if (intent === "save-variant") {
      const priceRaw = String(formData.get("baseUnitPrice") ?? "").trim();
      await saveVariant({
        role: actor.role,
        variantId: uuid.parse(formData.get("variantId")),
        sku: String(formData.get("sku") ?? ""),
        unitLabel: String(formData.get("unitLabel") ?? "each"),
        barcode: String(formData.get("barcode") ?? ""),
        name: String(formData.get("name") ?? ""),
        active: String(formData.get("active") ?? "true") === "true",
        baseUnitPricePesewas: priceRaw ? parseRequiredPesewas(priceRaw) : undefined,
      });
    } else if (intent === "add-tier") {
      const requestQuote = String(formData.get("requestQuote") ?? "") === "true";
      const maxRaw = String(formData.get("maximumQuantity") ?? "").trim();
      await addPriceTier({
        role: actor.role,
        variantId: uuid.parse(formData.get("variantId")),
        minimumQuantity: Number(formData.get("minimumQuantity")),
        maximumQuantity: maxRaw ? Number(maxRaw) : null,
        unitPricePesewas: requestQuote ? null : parseOptionalPesewas(formData.get("unitPrice")),
        requestQuote,
      });
    } else if (intent === "deactivate-tier") {
      await deactivatePriceTier({
        role: actor.role,
        tierId: uuid.parse(formData.get("tierId")),
      });
    } else if (intent === "add-image") {
      await addProductImage({
        role: actor.role,
        productId,
        cloudinaryPublicId: String(formData.get("cloudinaryPublicId") ?? ""),
        alt: String(formData.get("alt") ?? ""),
        position: Number(formData.get("position") ?? 0),
      });
    } else if (intent === "add-images") {
      const publicIds = formData.getAll("cloudinaryPublicId").map(String);
      const alts = formData.getAll("alt").map(String);
      const positions = formData.getAll("position").map((value) => Number(value));
      if (publicIds.length !== alts.length) throw new CatalogueAdminError("Every uploaded image needs alt text.");
      await addProductImages({
        role: actor.role,
        productId,
        images: publicIds.map((cloudinaryPublicId, index) => ({ cloudinaryPublicId, alt: alts[index] ?? "", position: positions[index] ?? index })),
      });
    } else if (intent === "remove-image") {
      await removeProductImage({
        role: actor.role,
        imageId: uuid.parse(formData.get("imageId")),
      });
    } else if (intent === "update-image") {
      await updateProductImage({
        role: actor.role,
        imageId: uuid.parse(formData.get("imageId")),
        alt: String(formData.get("alt") ?? ""),
      });
    } else if (intent === "move-image") {
      const direction = z.enum(["up", "down"]).parse(formData.get("direction"));
      await moveProductImage({
        role: actor.role,
        imageId: uuid.parse(formData.get("imageId")),
        direction,
      });
    } else if (intent === "replace-image") {
      await replaceProductImage({
        role: actor.role,
        productId,
        imageId: uuid.parse(formData.get("imageId")),
        cloudinaryPublicId: String(formData.get("cloudinaryPublicId") ?? ""),
      });
    } else if (intent === "add-alias") {
      await addProductAlias({
        role: actor.role,
        productId,
        alias: String(formData.get("alias") ?? ""),
      });
    } else if (intent === "remove-alias") {
      await removeProductAlias({
        role: actor.role,
        aliasId: uuid.parse(formData.get("aliasId")),
      });
    } else if (intent === "add-attribute") {
      await addProductAttribute({
        role: actor.role,
        productId,
        namespace: String(formData.get("namespace") ?? ""),
        key: String(formData.get("key") ?? ""),
        valueText: String(formData.get("valueText") ?? ""),
      });
    } else if (intent === "remove-attribute") {
      await removeProductAttribute({
        role: actor.role,
        attributeId: uuid.parse(formData.get("attributeId")),
      });
    } else if (intent === "add-bundle-item") {
      await addBundleItem({
        role: actor.role,
        bundleProductId: productId,
        sku: String(formData.get("sku") ?? ""),
        quantity: Number(formData.get("quantity")),
      });
    } else if (intent === "remove-bundle-item") {
      await removeBundleItem({
        role: actor.role,
        bundleItemId: uuid.parse(formData.get("bundleItemId")),
      });
    } else {
      next.searchParams.set("error", "Unknown catalogue action.");
    }
    if (!next.searchParams.has("error")) {
      const resourceId = intent.includes("variant")
        ? String(formData.get("variantId") ?? productId)
        : intent.includes("tier")
          ? String(formData.get("tierId") ?? formData.get("variantId") ?? productId)
          : intent.includes("image")
            ? String(formData.get("imageId") ?? productId)
            : intent.includes("alias")
              ? String(formData.get("aliasId") ?? productId)
              : intent.includes("attribute")
                ? String(formData.get("attributeId") ?? productId)
                : intent.includes("bundle")
                  ? String(formData.get("bundleItemId") ?? productId)
                  : productId;
      await recordAdminAudit({
        actorProfileId: actor.profileId,
        action: `catalogue_${intent.replaceAll("-", "_")}`,
        resourceType: intent.includes("variant") ? "variant" : "product",
        resourceId,
      });
      next.searchParams.set("success", "saved");
    }
  } catch (error) {
    if (isJsonRequest(request)) {
      const message = error instanceof CatalogueAdminError
        ? error.message
        : "Could not update the catalogue. Please check the fields and try again.";
      return NextResponse.json({ error: message }, { status: error instanceof CatalogueAdminError ? 400 : 500 });
    }
    return redirectWithError(next, error);
  }

  if (isJsonRequest(request)) {
    const error = next.searchParams.get("error");
    if (error) return NextResponse.json({ error }, { status: 400 });
    return NextResponse.json({ ok: true });
  }
  return NextResponse.redirect(next, 303);
}
