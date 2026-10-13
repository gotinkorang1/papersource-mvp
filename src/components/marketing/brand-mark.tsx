import Image from "next/image";
import { cn } from "@/lib/utils";

const ASSETS = {
  mark: { light: "/brand/papersource-mark-light.png", dark: "/brand/papersource-mark-dark.png", width: 512, height: 512 },
  lockup: { light: "/brand/papersource-lockup-light.png", dark: "/brand/papersource-lockup-dark.png", width: 1712, height: 374 },
} as const;

/**
 * The PaperSource logo, with one variant for light surfaces and one for dark.
 * "auto" follows the active theme, "inverse" suits surfaces that flip against
 * it (e.g. `bg-ink`), and "light"/"dark" pin a variant on fixed-colour panels.
 */
export function BrandMark({
  variant = "mark",
  tone = "auto",
  className,
  priority = false,
  alt = "",
}: {
  variant?: keyof typeof ASSETS;
  tone?: "auto" | "inverse" | "light" | "dark";
  className?: string;
  priority?: boolean;
  alt?: string;
}) {
  const asset = ASSETS[variant];
  const image = (src: string, className?: string) => <Image src={src} width={asset.width} height={asset.height} alt={alt} priority={priority} className={cn("h-full w-auto", className)} />;

  return (
    <span className={cn("inline-flex shrink-0", className)}>
      {tone === "light" ? image(asset.light) : null}
      {tone === "dark" ? image(asset.dark) : null}
      {tone === "auto" ? <>{image(asset.light, "dark:hidden")}{image(asset.dark, "hidden dark:block")}</> : null}
      {tone === "inverse" ? <>{image(asset.dark, "dark:hidden")}{image(asset.light, "hidden dark:block")}</> : null}
    </span>
  );
}
