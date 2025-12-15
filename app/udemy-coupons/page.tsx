import type { Metadata } from "next";
import Script from "next/script";
import { readDeals } from "@/lib/store";
import { buildDealLink } from "@/lib/links";
import DealCard from "@/components/DealCard";

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://coursespeak.com").replace(/\/$/, "");

export async function generateMetadata(): Promise<Metadata> {
  const now = new Date();
  const monthYear = now.toLocaleString("en-US", { month: "long", year: "numeric" });

  const title = `Latest 100% Off Udemy Coupons ${monthYear} | Coursespeak`;
  const description = "Discover handpicked 100% off Udemy coupons and free course deals updated daily by Coursespeak.";

  return {
    title,
    description,
    alternates: { canonical: "/udemy-coupons" },
    openGraph: {
      title,
      description: "Get the newest free Udemy course coupons, discount codes, and curated tips for staying ahead.",
      url: "/udemy-coupons",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`${process.env.NEXT_PUBLIC_SITE_URL || 'https://coursespeak.com'}/api/og/site`],
    },
  };
}

function buildItemListJson(deals: ReturnType<typeof mapDeal>[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: deals.slice(0, 12).map((deal, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: `${SITE_URL}/deal/${deal.slug || deal.id}`,
      name: deal.title,
    })),
  };
}

function buildFaqJson() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "How often are Udemy coupons updated?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "We refresh Udemy coupons multiple times per day. Deals that expire are removed automatically so you only see valid promotions.",
        },
      },
      {
        "@type": "Question",
        name: "How do I redeem a 100% off Udemy coupon?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Click \"Get Deal\" to open Udemy in a new tab. The coupon code is automatically applied. If the course shows a price, the coupon has likely expired—try another coupon from the list.",
        },
      },
      {
        "@type": "Question",
        name: "Can I get notified about new free Udemy courses?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. Join the Coursespeak newsletter below to receive weekly roundups of new free and 100% off Udemy courses.",
        },
      },
    ],
  };
}

function mapDeal(deal: any) {
  return {
    id: deal.id,
    slug: deal.slug,
    title: String(deal.title || ""),
    provider: String(deal.provider || ""),
    price: deal.price,
    originalPrice: deal.originalPrice,
    rating: deal.rating,
    students: deal.students,
    image: deal.image,
    category: deal.category,
    subcategory: deal.subcategory,
    expiresAt: deal.expiresAt,
    coupon: deal.coupon,
    finalUrl: buildDealLink(deal),
  };
}

export default async function UdemyCouponsPage() {
  const monthYear = new Date().toLocaleString("en-US", { month: "long", year: "numeric" });
  const allDeals = await readDeals();
  const coupons = allDeals
    .filter((deal) => String(deal.provider || "").toLowerCase() === "udemy")
    .slice(0, 24)
    .map(mapDeal);

  const itemListJson = buildItemListJson(coupons);
  const faqJson = buildFaqJson();

  return (
    <div style={{ display: "grid", gap: 32 }}>
      <Script id="udemy-coupons-jsonld" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJson) }} />
      <Script id="udemy-coupons-faq" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJson) }} />

      <section
        style={{
          borderRadius: 20,
          padding: "36px 30px",
          display: "grid",
          gap: 14,
          border: "1px solid rgba(91, 140, 255, 0.24)",
          background: "linear-gradient(140deg, rgba(11, 13, 18, 0.98) 0%, rgba(18, 24, 40, 0.98) 55%, rgba(42, 64, 110, 0.38) 100%)",
          boxShadow: "0 18px 36px rgba(8, 12, 26, 0.45)",
        }}
      >
        <span style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 12, fontWeight: 600, color: "var(--brand)", textTransform: "uppercase" }}>
          100% off Udemy coupons
        </span>
        <h1 style={{ margin: 0, fontSize: 34 }}>Latest free Udemy course coupons {monthYear}</h1>
        <p className="muted" style={{ margin: 0, maxWidth: 720 }}>
          Handpicked Udemy coupons updated throughout the day. Every deal below is either fully free or includes an active coupon code. Most coupons expire within 24 hours—grab them before they&apos;re gone.
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
          <div className="pill" style={{ borderColor: "var(--brand-soft)", fontSize: 12 }}>Auto refreshes hourly</div>
          <a href="/post/udemy-coupons-guide" className="pill" style={{ textDecoration: "none", borderColor: "var(--brand-soft)" }}>
            Coupon tips &amp; guide
          </a>
        </div>
      </section>
      <section style={{ display: "grid", gap: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <h2 style={{ margin: 0 }}>Latest Udemy coupons</h2>
          <a href="/?provider=udemy&freeOnly=1" className="footer-link">
            View all free Udemy courses →
          </a>
        </div>
        {coupons.length > 0 ? (
          <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
            {coupons.map((deal) => (
              <DealCard key={deal.slug || deal.id} deal={deal} />
            ))}
          </div>
        ) : (
          <div className="card brand-border" style={{ padding: 24, borderRadius: 14 }}>
            <div className="muted">We&apos;re refreshing coupons right now. Check back in a few minutes for new free Udemy courses.</div>
          </div>
        )}
      </section>

      <section className="card brand-border" style={{ borderRadius: 16 }}>
        <div className="card-body" style={{ gap: 12 }}>
          <h2 style={{ margin: 0 }}>Tips to secure Udemy coupons</h2>
          <ul style={{ margin: 0, paddingLeft: 20, color: "#cbd5f5", display: "grid", gap: 8 }}>
            <li>Redeem coupons immediately—most expire within 24 hours or sooner.</li>
            <li>Add courses to your cart and complete checkout on Udemy to lock in the free price.</li>
            <li>Bookmark this page or join the newsletter below to catch newly verified 100% off coupons.</li>
          </ul>
        </div>
      </section>

      <section className="card brand-border" style={{ borderRadius: 16 }}>
        <div className="card-body" style={{ gap: 12 }}>
          <h2 style={{ margin: 0 }}>Frequently asked questions</h2>
          <details>
            <summary style={{ cursor: "pointer", fontWeight: 600 }}>Do these coupons really make courses free?</summary>
            <p className="muted" style={{ marginTop: 8 }}>
              Yes! As long as you redeem the coupon while it&apos;s active, the course price will drop to $0 at checkout.
            </p>
          </details>
          <details>
            <summary style={{ cursor: "pointer", fontWeight: 600 }}>What if a coupon no longer works?</summary>
            <p className="muted" style={{ marginTop: 8 }}>
              Coupons change quickly. If one shows a price, it has likely expired. Try the next coupon above or subscribe for fresh alerts.
            </p>
          </details>
          <details>
            <summary style={{ cursor: "pointer", fontWeight: 600 }}>Can I sort by topic?</summary>
            <p className="muted" style={{ marginTop: 8 }}>
              Use the filters on the homepage or head to the categories page to view Udemy coupons grouped by topic.
            </p>
          </details>
        </div>
      </section>

    </div>
  );
}
