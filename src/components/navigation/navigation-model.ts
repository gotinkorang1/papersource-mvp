export type NavigationLink = {
  label: string;
  href: string;
};

export const desktopNavigation: readonly NavigationLink[] = [
  { label: "Shop", href: "/shop" },
  { label: "Business", href: "/business" },
  { label: "About", href: "/about" },
];

export const mobileMenuLinks: readonly NavigationLink[] = [
  { label: "Brands", href: "/brands" },
  { label: "Bulk Orders", href: "/bulk-orders" },
  { label: "Quick Order", href: "/quick-order" },
  { label: "Delivery", href: "/delivery" },
  { label: "Contact", href: "/contact" },
  { label: "Account", href: "/account" },
];

function normalizeNavigationHref(href: string) {
  const trimmed = href.trim();
  if (!trimmed.startsWith("/")) return trimmed;
  return trimmed === "/" ? trimmed : trimmed.replace(/\/+$/, "");
}

export function uniqueNavigationLinks(links: readonly NavigationLink[]) {
  const seen = new Set<string>();

  return links.reduce<NavigationLink[]>((result, link) => {
    const label = typeof link?.label === "string" ? link.label.trim() : "";
    const href = typeof link?.href === "string" ? normalizeNavigationHref(link.href) : "";
    if (!label || !href || seen.has(href)) return result;
    seen.add(href);
    result.push({ label, href });
    return result;
  }, []);
}

export function isNavigationLinkActive(href: string, pathname: string | null | undefined) {
  const normalizedHref = normalizeNavigationHref(href);
  const normalizedPathname = pathname ? normalizeNavigationHref(pathname) : "";
  return normalizedPathname === normalizedHref || normalizedPathname.startsWith(`${normalizedHref}/`);
}
