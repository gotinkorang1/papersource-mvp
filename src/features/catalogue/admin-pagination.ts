export const ADMIN_PRODUCT_PAGE_SIZE = 50;

export function normaliseAdminProductPage(value: string | undefined) {
  const page = Number.parseInt(value ?? "1", 10);
  return Number.isFinite(page) && page > 0 ? page : 1;
}

export function resolveAdminProductPage(value: string | undefined, total: number) {
  const totalPages = Math.max(1, Math.ceil(total / ADMIN_PRODUCT_PAGE_SIZE));
  return Math.min(normaliseAdminProductPage(value), totalPages);
}
