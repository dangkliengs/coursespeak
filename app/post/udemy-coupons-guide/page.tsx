import type { Metadata } from "next";
import Script from "next/script";
import Link from "next/link";

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://coursespeak.com").replace(/\/$/, "");
const PUBLISHED_DATE = "2024-06-01";
const UPDATED_DATE = "2025-09-15";

export const metadata: Metadata = {
  title: "Ultimate Udemy Coupons Guide | Coursespeak",
  description: "Learn how to find, redeem, and stack the best Udemy coupons. Follow Coursespeak's expert tips to maximize free and 100% off Udemy course deals.",
  alternates: { canonical: "/post/udemy-coupons-guide" },
  openGraph: {
    title: "Ultimate Udemy Coupons Guide | Coursespeak",
    description: "Everything you need to know about using Udemy coupons effectively.",
    url: "/post/udemy-coupons-guide",
    type: "article",
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "Ultimate Udemy Coupons Guide",
  description: "Learn how to find, redeem, and stack the best Udemy coupons to enroll in top courses for free.",
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
  url: `${SITE_URL}/post/udemy-coupons-guide`,
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Where do Udemy coupons come from?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Udemy instructors and promotional partners release coupons via Impact, social media, newsletters, and direct partnership feeds. Coursespeak aggregates verified coupons and tracks expirations for you.",
      },
    },
    {
      "@type": "Question",
      name: "How long do Udemy coupons stay active?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Most 100% off coupons expire within 24 hours. Some popular courses limit coupons to the first 1,000 redemptions. Redeem quickly and add the course to your Udemy library immediately.",
      },
    },
    {
      "@type": "Question",
      name: "Can I stack multiple Udemy coupons?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Udemy applies one coupon per course. However, you can add multiple courses with different coupons to your cart and check out in one transaction to save time.",
      },
    },
  ],
};

export default function UdemyCouponsGuidePage() {
  return (
    <article style={{ display: "grid", gap: 32 }}>
      <Script id="udemy-guide-article-jsonld" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
      <Script id="udemy-guide-faq-jsonld" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

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
          <Link href="/post/udemy-coupons-guide" className="footer-link" aria-current="page">
            Udemy coupons guide
          </Link>
        </nav>
        <h1 style={{ margin: 0, fontSize: 34 }}>Ultimate Udemy coupons guide</h1>
        <p className="muted" style={{ margin: 0, maxWidth: 760 }}>
          Learn the exact playbook Coursespeak uses to surface free and 100% off Udemy courses. From discovering instructor drops to timing your redemptions, this guide helps you squeeze the most value out of Udemy promotions.
        </p>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", fontSize: 13, color: "#a9b0c0" }}>
          <span>Updated <time dateTime={UPDATED_DATE}>September 15, 2025</time></span>
          <span>Reading time: 7 minutes</span>
        </div>
      </header>

      <section className="card brand-border" style={{ borderRadius: 16 }}>
        <div className="card-body" style={{ gap: 14 }}>
          <h2 style={{ margin: 0 }}>How we source Udemy coupons</h2>
          <p className="muted" style={{ margin: 0 }}>
            Coursespeak combines automated deal discovery with manual curation. We ingest partner feeds, monitor instructor announcements, and verify every coupon manually before featuring it. Our system:
          </p>
          <ol style={{ margin: 0, paddingLeft: 22, color: "#cbd5f5", display: "grid", gap: 8 }}>
            <li>Fetches fresh coupons via partnered APIs and instructor newsletters.</li>
            <li>Validates redemption URLs and checks remaining quota.</li>
            <li>Tags each coupon with category, skill level, and estimated expiration.</li>
          </ol>
          <p className="muted" style={{ margin: 0 }}>
            If a coupon fails our health checks, it never reaches the public feed. That keeps the Coursespeak catalog clean and trustworthy.
          </p>
        </div>
      </section>

      <section className="card brand-border" style={{ borderRadius: 16 }}>
        <div className="card-body" style={{ gap: 14 }}>
          <h2 style={{ margin: 0 }}>Finding the best coupons</h2>
          <p className="muted" style={{ margin: 0 }}>
            Start with the dedicated <Link href="/udemy-coupons" className="footer-link">Udemy coupons</Link> page to see verified free courses. Filter by category on our <Link href="/categories" className="footer-link">categories</Link> index or use the <Link href="/search" className="footer-link">live search</Link> to target topics such as AI, web development, or productivity.
          </p>
          <ul style={{ margin: 0, paddingLeft: 22, color: "#cbd5f5", display: "grid", gap: 8 }}>
            <li>Sort by rating to prioritize high-quality courses with 4.5★+ reviews.</li>
            <li>Check the student count to gauge community interest and credibility.</li>
            <li>When in doubt, read the instructor bio for expertise and teaching style.</li>
          </ul>
        </div>
      </section>

      <section className="card brand-border" style={{ borderRadius: 16 }}>
        <div className="card-body" style={{ gap: 14 }}>
          <h2 style={{ margin: 0 }}>Redeeming coupons the right way</h2>
          <p className="muted" style={{ margin: 0 }}>
            Open the coupon in a new tab, ensure the price reads $0, and complete checkout immediately. Pushing coupons into your Udemy cart locks the free price for a limited window—usually 30 minutes. If you add multiple free courses at once, use the cart to finish in one session.
          </p>
          <p className="muted" style={{ margin: 0 }}>
            Want step-by-step instructions? Read our companion article <Link href="/post/how-to-redeem-udemy-coupons" className="footer-link">How to redeem Udemy coupons</Link> for screenshots and troubleshooting tips.
          </p>
        </div>
      </section>

      <section className="card brand-border" style={{ borderRadius: 16 }}>
        <div className="card-body" style={{ gap: 14 }}>
          <h2 style={{ margin: 0 }}>Stay ahead of expirations</h2>
          <p className="muted" style={{ margin: 0 }}>
            Most coupons vanish without warning. Enable browser notifications or subscribe to the Coursespeak newsletter below to receive weekly roundups of freshly verified promotions. We also highlight deals that are trending or close to fully redeemed.
          </p>
        </div>
      </section>

      <section className="card brand-border" style={{ borderRadius: 16 }}>
        <div className="card-body" style={{ gap: 12 }}>
          <h2 style={{ margin: 0 }}>Key takeaways & next steps</h2>
          <ul style={{ margin: 0, paddingLeft: 22, color: "#cbd5f5", display: "grid", gap: 8 }}>
            <li>Monitor the <Link href="/udemy-coupons" className="footer-link">Udemy coupons</Link> hub for newly verified free courses.</li>
            <li>Redeem promising coupons immediately and add them to your library before they expire.</li>
            <li>Use the <Link href="/categories" className="footer-link">categories</Link> directory or <Link href="/search" className="footer-link">search</Link> to track topics you care about.</li>
          </ul>
          <div className="muted">
            Want curated alerts? Join the Coursespeak newsletter and receive freshly verified Udemy coupons every week.
            <Link href="/newsletter" className="footer-link"> Subscribe now →</Link>
          </div>
        </div>
      </section>

    </article>
  );
}
