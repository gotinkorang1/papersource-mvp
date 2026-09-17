import type { DeliveryFeeMode, MoneyPesewas } from "@/types/commerce";

export type StockLevel = "in_stock" | "low" | "out";

export type PriceTierPreview = {
  minimumQuantity: number;
  maximumQuantity: number | null;
  unitPricePesewas: MoneyPesewas | null;
  requestQuote: boolean;
};

export type ProductCardModel = {
  id: string;
  variantId: string;
  slug: string;
  sku: string;
  name: string;
  specLine: string;
  unitLabel: string;
  unitPricePesewas: MoneyPesewas;
  imageAlt: string;
  imageSrc?: string;
  stock: StockLevel;
  tiers: PriceTierPreview[];
  deliveryBadge: DeliveryBadgeModel;
  updatedAt?: Date;
};

export type ProductDetailModel = ProductCardModel & {
  imageSources?: { src: string; alt: string }[];
  sku: string;
  barcode: string | null;
  description: string;
  brandName: string;
  brandSlug: string;
  categoryName: string;
  categorySlug: string;
  divisionName: string;
  divisionSlug: string;
  attributes: { namespace: string; key: string; valueText: string }[];
  bundleContents?: string[];
  productType: "standard" | "bundle";
};

export type CatalogueCategoryView = {
  id: string;
  parentId: string | null;
  name: string;
  slug: string;
  caption: string;
  position: number;
  imagePublicId?: string | null;
};

export type CatalogueBrandView = {
  id: string;
  name: string;
  slug: string;
};

export type QuoteLinePreview = {
  id: string;
  name: string;
  sku: string;
  specLine: string;
  quantity: number;
  unitPricePesewas: MoneyPesewas | null;
  unitLabel: string;
};

export type CartLinePreview = {
  id: string;
  name: string;
  specLine: string;
  quantity: number;
  unitPricePesewas: MoneyPesewas;
  unitLabel: string;
};

export type DeliveryBadgeModel = {
  label: string;
  feeMode: DeliveryFeeMode;
};

export type QuoteStatus =
  | "draft"
  | "submitted"
  | "under_review"
  | "priced"
  | "sent"
  | "accepted"
  | "payment_pending"
  | "paid"
  | "order_created"
  | "declined"
  | "expired"
  | "cancelled"
  | "revised";

export type OrderStatus =
  | "pending_payment"
  | "awaiting_terms"
  | "paid"
  | "processing"
  | "out_for_delivery"
  | "delivered"
  | "cancelled";
