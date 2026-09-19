import type { ProductCardModel } from "@/types/catalogue";

const NEW_PRODUCT_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;

export function isProductNew(createdAt: Date | string | null | undefined, now = new Date()) {
  if (!createdAt) return false;
  const created = createdAt instanceof Date ? createdAt : new Date(createdAt);
  const createdTime = created.getTime();
  const nowTime = now.getTime();
  if (!Number.isFinite(createdTime) || !Number.isFinite(nowTime) || createdTime > nowTime) return false;
  return nowTime - createdTime < NEW_PRODUCT_WINDOW_MS;
}

export function decorateProductPresentation(
  product: ProductCardModel,
  options: { now?: Date; viewCount?: number; trendingThreshold?: number } = {},
): ProductCardModel {
  const viewCount = options.viewCount ?? product.viewCount;
  const trendingThreshold = options.trendingThreshold ?? 1;
  return {
    ...product,
    isNew: isProductNew(product.createdAt, options.now),
    ...(viewCount === undefined ? {} : { viewCount, isTrending: viewCount >= trendingThreshold }),
  };
}
