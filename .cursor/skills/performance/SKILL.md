---
name: performance
description: Catalogue performance, images, and bundle size. Use when adding media, client components, or search.
---

# Performance

## When to Use

- Images, client bundles, catalogue lists, animation, caching

## Instructions

1. Prefer Server Components and streaming. Do not fetch catalogues in `useEffect`.
2. Product media via Cloudinary + `next/image`. No full-resolution unoptimized heroes.
3. Motion only for drawers, nav, and light image transitions. No WebGL or page-wide parallax.
4. Keep PDP and checkout client JS small. Isolate cart/quote drawers.
5. Search stays Postgres FTS + `pg_trgm` in MVP.
6. Public cache for published catalogue is fine. Never publicly cache carts, quotes, or payments.
7. Do not add new runtime libraries unless they are on the locked stack in @docs/ARCHITECTURE.md.
