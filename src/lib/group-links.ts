export type GroupLink = {
  label: string;
  href: string;
  description: string;
};

/** Official PaperSource group websites used for company context and discovery. */
export const GROUP_LINKS: readonly GroupLink[] = [
  {
    label: "NiiPlants Group Ghana",
    href: "https://www.niiplantsgroup.com/",
    description: "The PaperSource parent company and wider group.",
  },
  {
    label: "NiiPlants Logistics",
    href: "https://www.niiplantslogistics.com/",
    description: "Group logistics and delivery services.",
  },
  {
    label: "NiiPlants Ghana",
    href: "https://niiplantsghana.com/",
    description: "NiiPlants Ghana company information and services.",
  },
  {
    label: "Trivoxo",
    href: "https://trivoxogh.com/",
    description: "The group technology and digital services company.",
  },
] as const;
