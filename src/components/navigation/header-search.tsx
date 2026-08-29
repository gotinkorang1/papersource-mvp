"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { cn } from "@/lib/utils";

export function HeaderSearch({
  className,
  defaultQuery = "",
  inputId = "universal-search",
}: {
  className?: string;
  defaultQuery?: string;
  inputId?: string;
}) {
  const router = useRouter();
  const [query, setQuery] = useState(defaultQuery);

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    const next = query.trim();
    router.push(next ? `/search?q=${encodeURIComponent(next)}` : "/search");
  }

  return (
    <form
      onSubmit={onSubmit}
      className={cn("hidden min-w-0 flex-1 md:block", className)}
    >
      <label htmlFor={inputId} className="sr-only">
        Search products
      </label>
      <input
        id={inputId}
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search paper, toner, pens, brands or SKU..."
        className="h-10 w-full rounded-md border border-border bg-cream px-3 text-sm text-ink placeholder:text-slate focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
      />
    </form>
  );
}
