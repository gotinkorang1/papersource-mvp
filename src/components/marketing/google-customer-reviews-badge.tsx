import Script from "next/script";

const MERCHANT_ID = 5859106353;

/**
 * Loads Google's optional Customer Reviews store widget on storefront pages.
 * The generous bottom margin keeps it above PaperSource's fixed mobile nav.
 */
export function GoogleCustomerReviewsBadge() {
  return (
    <>
      <Script
        id="merchantWidgetScript"
        src="https://www.gstatic.com/shopping/merchant/merchantwidget.js"
        strategy="afterInteractive"
      />
      <Script id="merchant-widget-init" strategy="afterInteractive">
        {`(() => {
  const script = document.getElementById("merchantWidgetScript");
  const start = () => {
    if (window.merchantwidget?.start) {
      window.merchantwidget.start({
        merchant_id: ${MERCHANT_ID},
        position: "RIGHT_BOTTOM",
        sideMargin: 24,
        bottomMargin: 84,
        mobileSideMargin: 12,
        mobileBottomMargin: 92
      });
    }
  };
  if (window.merchantwidget) start();
  else script?.addEventListener("load", start, { once: true });
})();`}
      </Script>
    </>
  );
}
