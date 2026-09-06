export const ADMIN_NAV = [
  {
    label: "Dashboard",
    href: "/admin",
    area: "dashboard" as const,
  },
  {
    label: "Commerce",
    items: [
      { label: "Orders", href: "/admin/orders", area: "orders" as const },
      { label: "Quotes", href: "/admin/quotes", area: "quotes" as const },
      { label: "Customers", href: "/admin/customers", area: "customers" as const },
      {
        label: "Organisations",
        href: "/admin/organisations",
        area: "organisations" as const,
      },
    ],
  },
  {
    label: "Catalogue",
    items: [
      { label: "Products", href: "/admin/products", area: "products" as const },
      { label: "Categories", href: "/admin/categories", area: "categories" as const },
      { label: "Brands", href: "/admin/brands", area: "brands" as const },
      { label: "Inventory", href: "/admin/inventory", area: "inventory" as const },
      { label: "Pricing", href: "/admin/pricing", area: "pricing" as const },
    ],
  },
  {
    label: "Marketing",
    items: [
      { label: "Promotions", href: "/admin/promotions", area: "promotions" as const },
      { label: "Banners", href: "/admin/banners", area: "banners" as const },
      { label: "Featured", href: "/admin/featured", area: "featured" as const },
    ],
  },
  {
    label: "Operations",
    items: [
      { label: "Deliveries", href: "/admin/deliveries", area: "deliveries" as const },
      { label: "Payments", href: "/admin/payments", area: "payments" as const },
      { label: "Enquiries", href: "/admin/enquiries", area: "enquiries" as const },
    ],
  },
  {
    label: "Website",
    items: [
      { label: "Pages", href: "/admin/pages", area: "pages" as const },
      { label: "FAQs", href: "/admin/faqs", area: "faqs" as const },
      { label: "Navigation", href: "/admin/navigation", area: "navigation" as const },
    ],
  },
  {
    label: "Engagement",
    items: [{ label: "Reviews", href: "/admin/reviews", area: "reviews" as const }],
  },
  {
    label: "System",
    items: [
      { label: "Users & roles", href: "/admin/users", area: "users" as const },
      { label: "Logs", href: "/admin/logs", area: "logs" as const },
      { label: "Settings", href: "/admin/settings", area: "settings" as const },
      {
        label: "Delivery zones",
        href: "/admin/delivery",
        area: "delivery_zones" as const,
      },
    ],
  },
] as const;

export const ADMIN_PLACEHOLDER_SECTIONS = [
  "promotions",
  "banners",
  "featured",
  "enquiries",
  "pages",
  "faqs",
  "navigation",
  "users",
  "roles",
  "logs",
  "settings",
  "delivery",
] as const;
