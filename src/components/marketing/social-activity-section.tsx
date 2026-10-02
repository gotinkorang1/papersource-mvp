import { socialLinks } from "@/lib/social";
import { SITE_URL } from "@/lib/seo";

const facebookUrl = socialLinks.find((link) => link.label === "Facebook")?.href ?? "https://www.facebook.com/papersourcegh";
const instagramUrl = socialLinks.find((link) => link.label === "Instagram")?.href ?? "https://www.instagram.com/papersourcegh/";
// Meta's Page Plugin can return a successful HTTP response containing its own
// error screen when a page is unpublished, restricted, or the plugin cannot
// resolve the page identity. Require an explicit Page ID as a second safety
// gate so production never renders that broken iframe by accident.
const facebookPageId = process.env.NEXT_PUBLIC_FACEBOOK_PAGE_ID?.trim();
const facebookEmbedEnabled = process.env.NEXT_PUBLIC_FACEBOOK_EMBED_ENABLED === "true" && Boolean(facebookPageId);
const facebookEmbedHref = facebookPageId ? `https://www.facebook.com/${facebookPageId}` : facebookUrl;

/**
 * The Page Plugin keeps the homepage current without storing or duplicating
 * social content in our database. It is intentionally lazy so it cannot block
 * the catalogue or the first meaningful paint.
 */
export function SocialActivitySection() {
  const facebookEmbed = `https://www.facebook.com/plugins/page.php?href=${encodeURIComponent(facebookEmbedHref)}&tabs=timeline&width=500&height=620&small_header=false&adapt_container_width=true&hide_cover=false&show_facepile=false`;

  return (
    <section className="border-y border-border bg-background py-14 sm:py-16 md:py-20" aria-labelledby="social-activity-heading">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-paper-green">Stay connected</p>
            <h2 id="social-activity-heading" className="mt-2 text-3xl tracking-tight text-ink sm:text-4xl">What’s happening at PaperSource</h2>
          </div>
          <p className="max-w-md text-sm leading-6 text-slate">See our latest updates, workplace tips and product news without leaving the site.</p>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.72fr)] lg:items-start">
          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
            <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3 sm:px-5">
              <div>
                <p className="font-semibold text-ink">Latest on Facebook</p>
                <p className="text-xs text-slate">PaperSource Ghana</p>
              </div>
              <a href={facebookUrl} target="_blank" rel="noreferrer" className="text-xs font-semibold text-paper-green underline underline-offset-4 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink">Open Page</a>
            </div>
            <div className="bg-muted/20 p-2 sm:p-4">
              {facebookEmbedEnabled ? <iframe
                title="Latest PaperSource Ghana Facebook activity"
                src={facebookEmbed}
                loading="lazy"
                scrolling="no"
                frameBorder="0"
                referrerPolicy="strict-origin-when-cross-origin"
                allow="clipboard-write; encrypted-media; picture-in-picture; web-share"
                className="mx-auto block h-[620px] w-full max-w-[500px] border-0 bg-card"
              /> : <div className="grid min-h-[220px] place-items-center rounded-xl border border-border bg-card p-6 text-center"><div><p className="font-semibold text-ink">Follow our latest updates on Facebook</p><p className="mt-2 text-sm leading-6 text-slate">Open the PaperSource Ghana Page for current arrivals, workplace tips and announcements.</p><a href={facebookUrl} target="_blank" rel="noreferrer" className="mt-5 inline-flex min-h-11 items-center justify-center rounded-lg bg-ink px-4 py-2.5 text-sm font-semibold text-white hover:bg-ink/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink">Open Facebook Page</a></div></div>}
              {facebookEmbedEnabled ? <p className="px-2 pb-2 text-center text-xs leading-5 text-slate sm:px-0">If the feed does not load, <a href={facebookUrl} target="_blank" rel="noreferrer" className="font-semibold text-ink underline underline-offset-4 hover:text-paper-green">open our Facebook Page</a> to see the latest updates.</p> : null}
            </div>
            <div className="border-t border-border bg-card p-4 sm:p-5">
              <div className="mb-3">
                <p className="font-semibold text-ink">Join the conversation</p>
                <p className="mt-1 text-xs leading-5 text-slate">Use your Facebook account to comment on PaperSource updates without leaving this page.</p>
              </div>
              {facebookEmbedEnabled ? <iframe
                title="Comments on PaperSource Ghana updates"
                src={`https://www.facebook.com/plugins/comments.php?href=${encodeURIComponent(SITE_URL)}&width=500&numposts=5&order=reverse_time&colorscheme=light`}
                loading="lazy"
                scrolling="no"
                frameBorder="0"
                referrerPolicy="strict-origin-when-cross-origin"
                allow="clipboard-write; encrypted-media; picture-in-picture; web-share"
                className="block min-h-[220px] w-full border-0 bg-card"
              /> : <a href={`${facebookUrl}?sk=reviews`} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center justify-center rounded-lg border border-border px-4 py-2.5 text-sm font-semibold text-ink hover:bg-cream focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink">Comment on Facebook</a>}
              <p className="mt-3 text-xs leading-5 text-slate">Meta may require sign-in before you can like or comment.</p>
            </div>
          </div>

          <aside className="rounded-2xl border border-border bg-cream/70 p-6 shadow-sm sm:p-7">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-paper-green">Follow the workday</p>
            <h3 className="mt-3 text-2xl tracking-tight text-ink">More from our social channels</h3>
            <p className="mt-3 text-sm leading-6 text-slate">Follow @papersourcegh for new arrivals, helpful stationery ideas and updates from Ghana.</p>
            <a href={instagramUrl} target="_blank" rel="noreferrer" className="mt-6 inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-ink px-4 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-ink/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink">Follow on Instagram</a>
            <a href={facebookUrl} target="_blank" rel="noreferrer" className="mt-3 inline-flex min-h-11 w-full items-center justify-center rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-semibold text-ink transition hover:-translate-y-0.5 hover:border-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink">Visit Facebook Page</a>
            <p className="mt-5 text-xs leading-5 text-slate">The Facebook timeline and comments are provided by Meta. You may need to sign in to Facebook before liking or commenting.</p>
          </aside>
        </div>
      </div>
    </section>
  );
}
