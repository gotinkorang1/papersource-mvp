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

export function uniqueNavigationLinks(links: readonly NavigationLink[]) {
  const seen = new Set<string>();

  return links.filter((link) => {
    if (seen.has(link.href)) return false;
    seen.add(link.href);
    return true;
  });
}

export function isNavigationLinkActive(href: string, pathname: string | null | undefined) {
  return pathname === href || pathname?.startsWith(`${href}/`) === true;
}
