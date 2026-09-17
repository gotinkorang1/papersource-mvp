export const ADMIN_PRODUCT_PAGE_SIZE = 50;

export function normaliseAdminProductPage(value: string | undefined) {
  const page = Number.parseInt(value ?? "1", 10);
  return Number.isFinite(page) && page > 0 ? page : 1;
}
