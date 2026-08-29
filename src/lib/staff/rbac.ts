import type { StaffRole } from "@/lib/staff/types";

export type AdminArea =
  | "dashboard"
  | "orders"
  | "quotes"
  | "customers"
  | "organisations"
  | "products"
  | "categories"
  | "brands"
  | "inventory"
  | "pricing"
  | "promotions"
  | "banners"
  | "featured"
  | "deliveries"
  | "delivery_zones"
  | "payments"
  | "enquiries"
  | "pages"
  | "faqs"
  | "navigation"
  | "users"
  | "roles"
  | "logs"
  | "settings";

export type AdminAction = "read" | "write";

const FULL: AdminAction[] = ["read", "write"];
const READ: AdminAction[] = ["read"];
const NONE: AdminAction[] = [];

const MATRIX: Record<StaffRole, Record<AdminArea, AdminAction[]>> = {
  super_admin: {
    dashboard: FULL,
    orders: FULL,
    quotes: FULL,
    customers: FULL,
    organisations: FULL,
    products: FULL,
    categories: FULL,
    brands: FULL,
    inventory: FULL,
    pricing: FULL,
    promotions: FULL,
    banners: FULL,
    featured: FULL,
    deliveries: FULL,
    delivery_zones: FULL,
    payments: FULL,
    enquiries: FULL,
    pages: FULL,
    faqs: FULL,
    navigation: FULL,
    users: FULL,
    roles: FULL,
    logs: FULL,
    settings: FULL,
  },
  admin: {
    dashboard: FULL,
    orders: FULL,
    quotes: FULL,
    customers: FULL,
    organisations: FULL,
    products: FULL,
    categories: FULL,
    brands: FULL,
    inventory: FULL,
    pricing: FULL,
    promotions: FULL,
    banners: FULL,
    featured: FULL,
    deliveries: FULL,
    delivery_zones: FULL,
    payments: FULL,
    enquiries: FULL,
    pages: FULL,
    faqs: FULL,
    navigation: FULL,
    users: READ,
    roles: NONE,
    logs: FULL,
    settings: FULL,
  },
  sales: {
    dashboard: READ,
    orders: READ,
    quotes: FULL,
    customers: FULL,
    organisations: FULL,
    products: READ,
    categories: READ,
    brands: READ,
    inventory: READ,
    pricing: READ,
    promotions: READ,
    banners: NONE,
    featured: NONE,
    deliveries: READ,
    delivery_zones: NONE,
    payments: FULL,
    enquiries: FULL,
    pages: NONE,
    faqs: NONE,
    navigation: NONE,
    users: NONE,
    roles: NONE,
    logs: READ,
    settings: NONE,
  },
  warehouse: {
    dashboard: READ,
    orders: FULL,
    quotes: READ,
    customers: READ,
    organisations: READ,
    products: READ,
    categories: READ,
    brands: READ,
    inventory: FULL,
    pricing: NONE,
    promotions: NONE,
    banners: NONE,
    featured: NONE,
    deliveries: FULL,
    delivery_zones: NONE,
    payments: READ,
    enquiries: NONE,
    pages: NONE,
    faqs: NONE,
    navigation: NONE,
    users: NONE,
    roles: NONE,
    logs: READ,
    settings: NONE,
  },
  content_manager: {
    dashboard: READ,
    orders: NONE,
    quotes: NONE,
    customers: NONE,
    organisations: NONE,
    products: FULL,
    categories: FULL,
    brands: FULL,
    inventory: NONE,
    pricing: NONE,
    promotions: NONE,
    banners: FULL,
    featured: FULL,
    deliveries: NONE,
    delivery_zones: NONE,
    payments: NONE,
    enquiries: READ,
    pages: FULL,
    faqs: FULL,
    navigation: FULL,
    users: NONE,
    roles: NONE,
    logs: NONE,
    settings: NONE,
  },
};

export function canAccessAdmin(
  role: StaffRole,
  area: AdminArea,
  action: AdminAction,
) {
  return MATRIX[role][area].includes(action);
}

export function canConfirmQuoteTerms(role: StaffRole) {
  return (
    canAccessAdmin(role, "quotes", "write") ||
    canAccessAdmin(role, "payments", "write")
  );
}
