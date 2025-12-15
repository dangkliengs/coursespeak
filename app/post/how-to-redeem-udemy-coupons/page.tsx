import type { Metadata } from "next";
import Script from "next/script";
import Link from "next/link";
const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://coursespeak.com").replace(/\/$/, "");
const PUBLISHED_DATE = "2024-06-10";
const UPDATED_DATE = "2025-09-15";

export const metadata: Metadata = {
  title: "How to Redeem Udemy Coupons (Step-by-Step) | Coursespeak",
  description: "Follow Coursespeak's step-by-step guide to redeem Udemy coupons, troubleshoot checkout issues, and lock in 100% off courses.",
  alternates: { canonical: "/post/how-to-redeem-udemy-coupons" },
  openGraph: {
    title: "How to Redeem Udemy Coupons (Step-by-Step) | Coursespeak",
    description: "Screenshots and troubleshooting tips for redeeming Udemy coupons successfully.",
    url: "/post/how-to-redeem-udemy-coupons",
    type: "article",
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "How to Redeem Udemy Coupons",
  description: "Step-by-step instructions with screenshots for redeeming Udemy coupons and fixing the most common errors.",
  author: {
    "@type": "Organization",
    name: "Coursespeak",
    url: SITE_URL,
  },
  publisher: {
    "@type": "Organization",
    name: "Coursespeak",
    logo: {
      "@type": "ImageObject",
      url: `${SITE_URL}/icon.png`,
    },
  },
  datePublished: PUBLISHED_DATE,
  dateModified: UPDATED_DATE,
  url: `${SITE_URL}/post/how-to-redeem-udemy-coupons`,
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Why does the coupon show a price at checkout?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The coupon has likely expired or reached its redemption limit. Return to Coursespeak, refresh the Udemy coupons page, and grab a newer coupon.",
      },
    },
    {
      "@type": "Question",
      name: "Can I apply a coupon in the Udemy mobile app?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Tap \"Redeem coupon\" on the course page, paste the code, and press apply. If the app fails, open the same course in a mobile browser instead.",
      },
    },
    {
      "@type": "Question",
      name: "Do I need to buy immediately after applying a coupon?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "You should complete checkout right away. Putting a course in your cart locks the price for 30 minutes, but popular coupons often expire or run out sooner.",
      },
    },
  ],
};

export default function HowToRedeemUdemyCouponsPage() {
  return (
    <article style={{ display: "grid", gap: 32 }}>
      <Script id="redeem-udemy-article-jsonld" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
      <Script id="redeem-udemy-faq-jsonld" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

      <header
        style={{
          borderRadius: 20,
          padding: "36px 30px",
          display: "grid",
          gap: 12,
          border: "1px solid rgba(91, 140, 255, 0.24)",
          background: "linear-gradient(140deg, rgba(11, 13, 18, 0.98) 0%, rgba(18, 24, 40, 0.98) 55%, rgba(42, 64, 110, 0.38) 100%)",
          boxShadow: "0 18px 36px rgba(8, 12, 26, 0.45)",
        }}
      >
        <nav aria-label="Breadcrumb" style={{ fontSize: 12, display: "flex", gap: 6, color: "var(--brand)" }}>
          <Link href="/" className="footer-link">Home</Link>
          <span>/</span>
          <Link href="/post/how-to-redeem-udemy-coupons" className="footer-link" aria-current="page">
            How to redeem Udemy coupons
          </Link>
        </nav>
        <h1 style={{ margin: 0, fontSize: 34 }}>How to redeem Udemy coupons</h1>
        <p className="muted" style={{ margin: 0, maxWidth: 760 }}>
          Master Udemy checkout with this step-by-step tutorial. We cover desktop and mobile redemption, explain how to confirm a coupon worked, and troubleshoot the most common hiccups.
        </p>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", fontSize: 13, color: "#a9b0c0" }}>
          <span>Updated <time dateTime={UPDATED_DATE}>September 15, 2025</time></span>
          <span>Reading time: 6 minutes</span>
        </div>
      </header>

      <section className="card brand-border" style={{ borderRadius: 16 }}>
        <div className="card-body" style={{ gap: 12 }}>
          <h2 style={{ margin: 0 }}>Quick-reference steps</h2>
          <details open>
            <summary style={{ cursor: "pointer", fontWeight: 600 }}>Desktop: redeem a Udemy coupon in 60 seconds</summary>
            <ol style={{ margin: "12px 0 0", paddingLeft: 22, color: "#cbd5f5", display: "grid", gap: 6 }}>
              <li>Open a course from the <Link href="/udemy-coupons" className="footer-link">Udemy coupons</Link> hub.</li>
              <li>Confirm the coupon code is pre-applied and the price shows $0.00.</li>
              <li>Click <strong>Enroll now</strong> and finalize checkout to lock the free price.</li>
            </ol>
          </details>
          <details>
            <summary style={{ cursor: "pointer", fontWeight: 600 }}>Mobile: redeem via Udemy app or browser</summary>
            <ol style={{ margin: "12px 0 0", paddingLeft: 22, color: "#cbd5f5", display: "grid", gap: 6 }}>
              <li>Tap the coupon link from Coursespeak and open it in the Udemy app.</li>
              <li>Select <strong>Redeem coupon</strong>, paste the code if prompted, and ensure the total is $0.00.</li>
              <li>Checkout immediately; if it fails, repeat in a mobile browser like Chrome or Safari.</li>
            </ol>
          </details>
        </div>
      </section>

      <section className="card brand-border" style={{ borderRadius: 16 }}>
        <div className="card-body" style={{ gap: 14 }}>
          <h2 style={{ margin: 0 }}>Desktop redemption walkthrough</h2>
          <ol style={{ margin: 0, paddingLeft: 22, color: "#cbd5f5", display: "grid", gap: 8 }}>
            <li>Open the coupon from our <Link href="/udemy-coupons" className="footer-link">Udemy coupons</Link> page in a new tab.</li>
            <li>Ensure the price displays $0.00. If not, refresh and re-apply the coupon code.</li>
            <li>Click <strong>Enroll now</strong> and complete checkout. Udemy will confirm the course is free before finalizing.</li>
          </ol>
          <p className="muted" style={{ margin: 0 }}>
            After purchase, the course lives in your Udemy library forever—even if the coupon expires minutes later.
          </p>
        </div>
      </section>

      <section className="card brand-border" style={{ borderRadius: 16 }}>
        <div className="card-body" style={{ gap: 14 }}>
          <h2 style={{ margin: 0 }}>Mobile app redemption</h2>
          <p className="muted" style={{ margin: 0 }}>
            Using the Udemy app? Tap <strong>Redeem coupon</strong> on the course page, paste the code supplied by Coursespeak, and choose <strong>Apply</strong>. If the price doesn&apos;t drop to $0, open the same course in your browser and try again.
          </p>
          <ul style={{ margin: 0, paddingLeft: 22, color: "#cbd5f5", display: "grid", gap: 8 }}>
            <li>Switch to desktop view if the mobile site fails to apply the coupon.</li>
            <li>Verify you&apos;re logged into the correct Udemy account before checkout.</li>
            <li>Turn off VPNs or blockers that might interfere with coupon validation.</li>
          </ul>
        </div>
      </section>

      <section className="card brand-border" style={{ borderRadius: 16 }}>
        <div className="card-body" style={{ gap: 14 }}>
          <h2 style={{ margin: 0 }}>Desktop vs mobile checklist</h2>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 520 }}>
              <thead>
                <tr style={{ textAlign: "left" }}>
                  <th style={{ padding: "8px 12px", borderBottom: "1px solid rgba(91, 140, 255, 0.24)" }}>Step</th>
                  <th style={{ padding: "8px 12px", borderBottom: "1px solid rgba(91, 140, 255, 0.24)" }}>Desktop flow</th>
                  <th style={{ padding: "8px 12px", borderBottom: "1px solid rgba(91, 140, 255, 0.24)" }}>Mobile flow</th>
                </tr>
              </thead>
              <tbody style={{ color: "#cbd5f5" }}>
                <tr>
                  <td style={{ padding: "8px 12px", borderBottom: "1px solid rgba(91, 140, 255, 0.14)" }}>Launch the course</td>
                  <td style={{ padding: "8px 12px", borderBottom: "1px solid rgba(91, 140, 255, 0.14)" }}>Open coupon link in a new browser tab.</td>
                  <td style={{ padding: "8px 12px", borderBottom: "1px solid rgba(91, 140, 255, 0.14)" }}>Open via Udemy app or in-app browser.</td>
                </tr>
                <tr>
                  <td style={{ padding: "8px 12px", borderBottom: "1px solid rgba(91, 140, 255, 0.14)" }}>Apply code</td>
                  <td style={{ padding: "8px 12px", borderBottom: "1px solid rgba(91, 140, 255, 0.14)" }}>Coupon usually auto-applies; re-enter manually if needed.</td>
                  <td style={{ padding: "8px 12px", borderBottom: "1px solid rgba(91, 140, 255, 0.14)" }}>Tap <strong>Redeem coupon</strong> and paste the code if prompted.</td>
                </tr>
                <tr>
                  <td style={{ padding: "8px 12px", borderBottom: "1px solid rgba(91, 140, 255, 0.14)" }}>Verify price</td>
                  <td style={{ padding: "8px 12px", borderBottom: "1px solid rgba(91, 140, 255, 0.14)" }}>Ensure checkout total reads $0.00 before enrolling.</td>
                  <td style={{ padding: "8px 12px", borderBottom: "1px solid rgba(91, 140, 255, 0.14)" }}>Confirm the app shows $0.00; switch to browser if it doesn&apos;t.</td>
                </tr>
                <tr>
                  <td style={{ padding: "8px 12px" }}>Troubleshooting</td>
                  <td style={{ padding: "8px 12px" }}>Clear cache, try incognito, or test a different browser.</td>
                  <td style={{ padding: "8px 12px" }}>Toggle Wi-Fi, disable VPN, or retry on desktop to confirm.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="card brand-border" style={{ borderRadius: 16 }}>
        <div className="card-body" style={{ gap: 14 }}>
          <h2 style={{ margin: 0 }}>Troubleshooting common issues</h2>
          <p className="muted" style={{ margin: 0 }}>
            Still seeing a price? The coupon may have expired or reached its redemption limit. Head back to Coursespeak and try another coupon. For persistent issues, clear your browser cache or switch devices to rule out local conflicts.
          </p>
        </div>
      </section>

      <section className="card brand-border" style={{ borderRadius: 16 }}>
        <div className="card-body" style={{ gap: 14 }}>
          <h2 style={{ margin: 0 }}>Next steps</h2>
          <p className="muted" style={{ margin: 0 }}>
            Stay ahead of fresh drops by bookmarking the Coupons page, exploring <Link href="/categories" className="footer-link">categories</Link>, and joining our newsletter. We send a weekly digest of the highest-rated free Udemy courses.
          </p>
        </div>
      </section>
    </article>
  );
}
