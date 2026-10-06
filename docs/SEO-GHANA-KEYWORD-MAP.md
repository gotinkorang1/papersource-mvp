# Ghana SEO keyword map

PaperSource now maintains a 350-phrase Ghana search-intent map in
`src/lib/seo-keywords.ts`. It is grouped into 35 clusters covering retail,
procurement, local delivery, shop pickup, product specifications and buyer
questions.

The map is used as follows:

- The site-wide metadata uses a small, high-intent subset.
- Category pages receive the cluster matching their category plus local
  variants for Ghana and Accra.
- Product pages receive product, brand, category, specification and purchase
  variants. These terms are not rendered as a keyword list on the page.
- The remaining phrases guide future buying guides, FAQs, internal links and
  campaign landing pages. Each new page should target one intent and provide
  useful, original content rather than repeating phrases.

The accompanying test enforces the complete 35 x 10 = 350 phrase inventory.
