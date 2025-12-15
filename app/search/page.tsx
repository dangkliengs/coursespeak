import type { Metadata } from "next";
import Script from "next/script";
import SearchClient from "./SearchClient";

const PRIMARY_KEYWORD = "Udemy courses";
const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://coursespeak.com").replace(/\/$/, "");

export async function generateMetadata({ searchParams }: { searchParams: Promise<{ q?: string }> }): Promise<Metadata> {
  const params = await searchParams;
  const now = new Date();
  const monthYear = now.toLocaleString("en-US", { month: "long", year: "numeric" });
  const q = (params.q || "").trim();
  const hasQuery = q.length > 0;
  const title = hasQuery
    ? `Search Udemy coupons for "${q}" ${monthYear} | Coursespeak`
    : `${PRIMARY_KEYWORD} Deals & Coupons ${monthYear} | Coursespeak`;
  const descriptionCore = hasQuery
    ? `Find the latest 100% off Udemy coupons and free courses for "${q}". Updated daily with verified deals.`
    : "Discover the latest Udemy courses coupons and discounts curated by Coursespeak.";
  const description = descriptionCore;
  const canonical = (() => {
    const params = new URLSearchParams();
    if (hasQuery) params.set("q", q);
    const qs = params.toString();
    return qs ? `/search?${qs}` : "/search";
  })();
  return {
    title,
    description,
    keywords: [
      "Udemy courses",
      "Udemy coupons",
      "Udemy discounts",
      "online course deals",
      "elearning promotions",
    ],
    openGraph: {
      title,
      description: hasQuery ? `Udemy coupons for "${q}". Daily verified 100% off deals and free courses.` : "A curated list of Udemy courses deals, coupons, and limited-time discounts to boost your skills.",
      type: "website",
      url: canonical,
    },
    alternates: { canonical },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

const searchJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Coursespeak",
  url: SITE_URL,
  potentialAction: {
    "@type": "SearchAction",
    target: `${SITE_URL}/search?q={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
};

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const monthYear = new Date().toLocaleString("en-US", { month: "long", year: "numeric" });
  const initialQuery = params.q || "";

  return (
    <div style={{ display: "grid", gap: 28 }}>
      <Script id="search-jsonld" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(searchJsonLd) }} />
      <section
        style={{
          borderRadius: 18,
          padding: "32px 28px",
          display: "grid",
          gap: 12,
          border: "1px solid rgba(91, 140, 255, 0.24)",
          background: "linear-gradient(140deg, rgba(11, 13, 18, 0.98) 0%, rgba(18, 24, 40, 0.98) 55%, rgba(42, 64, 110, 0.38) 100%)",
          boxShadow: "0 18px 36px rgba(8, 12, 26, 0.45)",
        }}
      >
        <span style={{ color: "var(--brand)", fontSize: 12, fontWeight: 600, textTransform: "uppercase" }}>Search Udemy coupons</span>
        <h1 style={{ margin: 0, fontSize: 32 }}>Find the latest {PRIMARY_KEYWORD} deals {monthYear}</h1>
        <p className="muted" style={{ margin: 0, maxWidth: 680 }}>
          Filter thousands of daily-updated coupons to uncover 100% off Udemy courses, trending topics, and curated learning paths from Coursespeak.
        </p>
      </section>

      <SearchClient initialQuery={initialQuery} />

    </div>
  );
}
