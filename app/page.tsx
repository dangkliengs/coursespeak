import DealCard from "@/components/DealCard";
import { headers } from "next/headers";
import { uniqueProviders } from "@/lib/mockData";
import type { Metadata } from "next";
import DealsList from "@/components/DealsList";
import { readDeals } from "@/lib/store";
import { slugifyCategory } from "@/lib/slug";
import { buildDealLink } from "@/lib/links";
import { promises as fs } from "fs";
import path from "path";

// Ensure the homepage is always rendered dynamically and never cached with an empty state
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata({ searchParams }: { searchParams: Promise<{ q?: string; category?: string; page?: string; provider?: string; sort?: string; freeOnly?: string }> }): Promise<Metadata> {
  const params = await searchParams;
  const categoryDisplay = (() => {
    if (!params.category) return undefined;

    // Try to find a matching display name by normalized category in our categories list
    const normalizedSearchCat = (() => {
      let v = params.category.toLowerCase();
      // First decode URL encoding
      v = decodeURIComponent(v);
      // Then normalize like the database
      v = v.replace(/&amp;/gi, "&");
      v = v.replace(/&/g, " and ");
      v = v.replace(/[^\w\s-]/g, "");
      v = v.replace(/\s+/g, " ");
      return v.trim();
    })();

    // Handle cases like "it-and-software" with "Network & Security" query
    if (params.q) {
      const decodedQ = decodeURIComponent(params.q);
      // For subcategories, use the full query as the display name
      return decodedQ;
    }

    // For single categories, keep them concise
    const categoryName = params.category.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    return categoryName.length > 20 ? params.category.replace(/-/g, ' ') : categoryName;
  })();

  const now = new Date();
  const monthYear = now.toLocaleString("en-US", { month: "long", year: "numeric" });

  // Build modifiers based on filters to avoid duplicate titles/descriptions
  const provider = (params.provider || "").toLowerCase().trim();
  const providerDisplay = provider ? provider.charAt(0).toUpperCase() + provider.slice(1) : undefined;
  const isFreeOnly = (params.freeOnly || "") === "1";
  const sort = (params.sort || "").trim();
  const pageNum = Math.max(1, Number(params.page || 1));
  const pageSuffix = pageNum > 1 ? ` - Page ${pageNum}` : "";

  const filtersSuffix = (() => {
    const parts: string[] = [];
    if (providerDisplay) parts.push(`${providerDisplay}`);
    if (isFreeOnly) parts.push("Free");
    if (sort && sort !== "newest") parts.push(`Sort: ${sort}`);
    return parts.length ? ` (${parts.join(", ")})` : "";
  })();

  const titleCore = categoryDisplay
    ? `100% Off ${categoryDisplay} Udemy Coupons ${monthYear}`
    : `100% Off and Free Udemy Coupons ${monthYear}`;
  const title = `${titleCore}${filtersSuffix} | Coursespeak${pageSuffix}`;

  const baseDescription = "Discover 100% off Udemy coupons and free courses updated daily. Find the best deals on programming, design, marketing, and more.";
  const descriptionCore = categoryDisplay
    ? `Find 100% off ${categoryDisplay} Udemy coupons and free courses. Updated daily with the latest discounts.`
    : baseDescription;
  const description = `${descriptionCore}${filtersSuffix}${pageSuffix}`;

  return {
    title,
    description,
    alternates: { canonical: (() => {
      const urlParams = new URLSearchParams();
      if (params.category) urlParams.set("category", params.category);
      if (params.q) urlParams.set("q", params.q);
      if (params.provider) urlParams.set("provider", params.provider);
      if (params.freeOnly === "1") urlParams.set("freeOnly", "1");
      if (params.sort && params.sort !== "newest") urlParams.set("sort", params.sort);
      if (pageNum > 1) urlParams.set("page", String(pageNum));
      const qs = urlParams.toString();
      return qs ? `/?${qs}` : "/";
    })() },
    robots: {
      index: pageNum <= 1,
      follow: true,
    },
    openGraph: {
      title,
      description,
      url: (() => {
        const urlParams = new URLSearchParams();
        if (params.category) urlParams.set("category", params.category);
        if (params.q) urlParams.set("q", params.q);
        if (params.provider) urlParams.set("provider", params.provider);
        if (params.freeOnly === "1") urlParams.set("freeOnly", "1");
        if (params.sort && params.sort !== "newest") urlParams.set("sort", params.sort);
        if (pageNum > 1) urlParams.set("page", String(pageNum));
        const qs = urlParams.toString();
        return qs ? `/?${qs}` : "/";
      })(),
      siteName: "Coursespeak",
      type: "website",
   },
   twitter: {
     card: "summary_large_image",
     title,
     description,
   },
  };
}

function filterList(all: any[], opts: { q?: string; category?: string; provider?: string; freeOnly?: string }) {
  const term = opts.q?.trim().toLowerCase();
  const cat = opts.category?.trim();
  const prov = opts.provider?.trim().toLowerCase();

  // Normalize category parameter the same way as database categories
  const normalizedCat = cat ? (() => {
    let v = cat.toLowerCase();
    // First decode URL encoding
    v = decodeURIComponent(v);
    // Then normalize like the database
    v = v.replace(/&amp;/gi, "&");
    v = v.replace(/&/g, " and ");
    v = v.replace(/[^\w\s-]/g, "");
    v = v.replace(/\s+/g, " ");
    return v.trim();
  })() : undefined;

  return all.filter((d) => {
    const okTerm = !term
      ? true
      : String(d.title || "").toLowerCase().includes(term) ||
        String(d.provider || "").toLowerCase().includes(term) ||
        String(d.category || "").toLowerCase().includes(term) ||
        String(d.subcategory || "").toLowerCase().includes(term);

    // Normalize database category for comparison
    const normalizedDbCat = (() => {
      const raw = String(d.category || "");
      if (!raw.trim()) return "uncategorized"; // Handle deals without categories
      let v = raw.replace(/&amp;/gi, "&");
      v = v.replace(/&/g, " and ");
      v = v.replace(/[^\w\s-]/g, "");
      v = v.replace(/\s+/g, " ");
      return v.trim().toLowerCase();
    })();

    let okCat = !normalizedCat ? true : normalizedDbCat === normalizedCat;

    // Special handling for subcategory searches
    if (normalizedCat && term) {
      // If the database category matches the URL category and the search term matches subcategory
      const normalizedDbSubcat = (() => {
        const raw = String(d.subcategory || "");
        if (!raw.trim()) return ""; // Handle empty subcategories
        let v = raw.replace(/&amp;/gi, "&");
        v = v.replace(/\s+/g, " ");
        return v.trim().toLowerCase();
      })();

      // More flexible matching - check if either category matches or subcategory matches
      const termNormalized = term.toLowerCase();
      const categoryMatch = normalizedDbCat === normalizedCat;
      const subcategoryMatch = normalizedDbSubcat.includes(termNormalized) ||
                              termNormalized.includes(normalizedDbSubcat) ||
                              normalizedDbSubcat === termNormalized;

      // If we have a category match OR a subcategory match within that category
      if (categoryMatch && subcategoryMatch) {
        okCat = true;
      } else if (subcategoryMatch) {
        // If only subcategory matches, also allow it (more flexible)
        okCat = true;
      }
    }

    const okProv = !prov ? true : String(d.provider || "").toLowerCase() === prov;
    const okFree = opts.freeOnly ? (d.price ?? 0) === 0 : true;
    return okTerm && okCat && okProv && okFree;
  });
}

function sortList(items: any[], sort?: string): any[] {
  switch (sort) {
    case "updated":
      return [...items].sort((a, b) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime());
    case "rating":
      return [...items].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
    case "students":
      return [...items].sort((a, b) => (b.students ?? 0) - (a.students ?? 0));
    case "price":
      return [...items].sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
    case "newest":
    default:
      return [...items].sort((a, b) => {
        const updatedA = new Date(a.updatedAt ?? a.createdAt ?? a.expiresAt ?? 0).getTime();
        const updatedB = new Date(b.updatedAt ?? b.createdAt ?? b.expiresAt ?? 0).getTime();
        return updatedB - updatedA;
      });
  }
}

async function getDeals(params: { q?: string; category?: string; page?: string; provider?: string; sort?: string; freeOnly?: string }) {
  // Use readDeals() which already sorts correctly
  const all = await readDeals();
  const filtered = filterList(all, {
    q: params.q,
    category: params.category,
    provider: params.provider,
    freeOnly: params.freeOnly,
  });

  // Only apply additional sorting if explicitly requested (not for default)
  const sorted = params.sort && params.sort !== "newest" ? sortList(filtered, params.sort) : filtered;
  const pageNum = Math.max(1, Number(params.page ?? 1));
  const pageSize = 12;
  const start = (pageNum - 1) * pageSize;
  const items = sorted.slice(start, start + pageSize);
  const total = sorted.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  return { items, total, page: pageNum, totalPages };
}

export default async function Page({ searchParams }: { searchParams: Promise<{ q?: string; category?: string; page?: string; provider?: string; sort?: string; freeOnly?: string }> }) {
  const params = await searchParams;
  const monthYear = new Date().toLocaleString("en-US", { month: "long", year: "numeric" });
  const providers = uniqueProviders();
  let pageData = await getDeals(params);
  // Guard: if for any reason we computed an empty list, fall back to unfiltered first page
  if (!pageData.items || pageData.items.length === 0) {
    const all = await readDeals();
    const fallback = all.slice(0, 12);
    pageData = { items: fallback, total: all.length, page: 1, totalPages: Math.max(1, Math.ceil(all.length / 12)) } as any;
  }
  const { items, total, page, totalPages } = pageData;
  // Reduce payload passed to the client component to avoid large serialization (App Router limit ~1MB)
  const lightItems = (items || []).map((d: any) => ({
    id: d.id,
    slug: d.slug,
    title: d.title,
    provider: d.provider,
    url: d.url,
    finalUrl: buildDealLink(d),
    price: d.price,
    originalPrice: d.originalPrice,
    rating: d.rating,
    students: d.students,
    image: d.image,
    category: d.category,
    subcategory: d.subcategory,
    expiresAt: d.expiresAt,
    coupon: d.coupon,
    updatedAt: d.updatedAt,
    createdAt: d.createdAt,
  }));
  // Build dynamic primary categories from all deals, merging equivalent names
  // e.g., "IT & Software" vs "IT &amp; Software"
  const all = await readDeals();
  const catCount = new Map<string, { name: string; count: number }>();
  const normName = (raw?: string) => {
    if (!raw) return undefined;
    let v = String(raw).trim();
    // Normalize like the database - convert & to " and "
    v = v.replace(/&amp;/gi, "&");
    v = v.replace(/&/g, " and ");
    v = v.replace(/[^\w\s-]/g, "");
    v = v.replace(/\s+/g, " ");
    return v.toLowerCase();
  };
  for (const d of all) {
    const raw = (d as any).category as string | undefined;
    const name = normName(raw) || "Uncategorized";
    const key = name.toLowerCase();
    const prev = catCount.get(key) || { name, count: 0 };
    // keep the prettier display name (non-entity) if present
    if (prev.name.includes("&amp;") && !name.includes("&amp;")) prev.name = name;
    prev.count += 1;
    catCount.set(key, prev);
  }
  const categoriesRaw = Array.from(catCount.values())
    .sort((a, b) => b.count - a.count)
    .map(({ name, count }) => ({
      name,
      count,
      slug: (() => {
        if (name === "Uncategorized") return "uncategorized";
        let v = name.toLowerCase();
        // Use the same normalization as the filtering
        v = v.replace(/&amp;/gi, "&");
        v = v.replace(/&/g, " and ");
        v = v.replace(/[^\w\s-]/g, "");
        v = v.trim();
        v = v.replace(/\s+/g, "-");
        v = v.replace(/-+/g, "-");
        return v;
      })(),
    }));
  // Resolve icon path server-side to avoid client event handlers
  const categories = await Promise.all(
    categoriesRaw.map(async (c) => {
      const file = path.join(process.cwd(), "public", "categories", `${c.slug}.svg`);
      let icon = "/categories/default.svg";
      try {
        await fs.access(file);
        icon = `/categories/${c.slug}.svg`;
      } catch {}
      return { ...c, icon };
    })
  );
  // Build ItemList JSON-LD for the first page of deals
  const itemListJson = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: (items || []).slice(0, 12).map((d: any, idx: number) => ({
      '@type': 'ListItem',
      position: idx + 1,
      url: `${process.env.NEXT_PUBLIC_SITE_URL || ''}/deal/${d.slug || d.id}`,
      name: String(d.title || ''),
    })),
  };
  // If viewing a filtered category, annotate with a Category ItemList as well
  const categoryDisplay = (() => {
    if (!params.category) return undefined;

    // Try to find a matching display name by normalized category in our categories list
    const normalizedSearchCat = (() => {
      let v = params.category.toLowerCase();
      // First decode URL encoding
      v = decodeURIComponent(v);
      // Then normalize like the database
      v = v.replace(/&amp;/gi, "&");
      v = v.replace(/&/g, " and ");
      v = v.replace(/[^\w\s-]/g, "");
      v = v.replace(/\s+/g, " ");
      return v.trim();
    })();

    const match = categories.find((c) => {
      const normalizedDbCat = (() => {
        let v = c.name.toLowerCase();
        // Use the same normalization as the filtering
        v = v.replace(/&amp;/gi, "&");
        v = v.replace(/&/g, " and ");
        v = v.replace(/[^\w\s-]/g, "");
        v = v.replace(/\s+/g, " ");
        return v.trim();
      })();
      return normalizedDbCat === normalizedSearchCat;
    });

    // If we found a match, use the display name
    if (match) return match.name;

    // Fallback to formatted category parameter
    if (params.category === 'uncategorized') {
      return params.q ? decodeURIComponent(params.q) : 'Other';
    }

    // Handle cases like "it-and-software" with "Network & Security" query
    if (params.q) {
      const decodedQ = decodeURIComponent(params.q);
      // For subcategories, use the full query as the display name
      return decodedQ;
    }

    // For single categories, keep them concise
    const categoryName = params.category.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    return categoryName.length > 20 ? params.category.replace(/-/g, ' ') : categoryName;
  })();
  const categoryItemListJson = categoryDisplay
    ? {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        itemListOrder: 'https://schema.org/ItemListOrderDescending',
        itemListName: `${categoryDisplay} Udemy Coupons and Free Courses`,
        itemListElement: (items || []).slice(0, 12).map((d: any, idx: number) => ({
          '@type': 'ListItem',
          position: idx + 1,
          url: `${process.env.NEXT_PUBLIC_SITE_URL || ''}/deal/${d.slug || d.id}`,
          name: String(d.title || ''),
        })),
      }
    : undefined;

  return (
    <div>
      <section
        style={{
          padding: "32px 28px",
          border: "1px solid rgba(91, 140, 255, 0.24)",
          borderRadius: 16,
          background: "linear-gradient(140deg, rgba(11, 13, 18, 0.98) 0%, rgba(18, 24, 40, 0.98) 55%, rgba(42, 64, 110, 0.38) 100%)",
          boxShadow: "0 18px 36px rgba(8, 12, 26, 0.45)",
        }}
      >
        <h1 style={{ marginBottom: 6 }}>
          {categoryDisplay
            ? `100% Off ${categoryDisplay} Udemy Coupons ${monthYear}`
            : `100% Off and Free Udemy Coupons ${monthYear}`}
        </h1>
        <div style={{ color: "#a9b0c0", marginBottom: 8 }}>{total} results</div>
        <p className="muted" style={{ marginTop: 0, marginBottom: 0 }}>
          {categoryDisplay
            ? `Daily updated ${categoryDisplay} Udemy deals featuring 100% off coupons and free courses. Filter by provider, price, and more.`
            : "Daily updated collection of Udemy deals featuring 100% off coupons and free Udemy courses. Filter by provider, category, price, and more."
          }
        </p>
        <p className="muted" style={{ marginTop: 8, marginBottom: 0, fontSize: 13 }}>
          {categoryDisplay
            ? `Find free Udemy courses, 100% off ${categoryDisplay} coupons, Udemy discount codes, and the latest Udemy deals updated daily.`
            : "Find free Udemy courses, 100% off Udemy coupons, Udemy discount codes, and the latest Udemy deals updated daily."
          } Browse all topics on our <a href="/categories" style={{ color: "#eaf4ff" }}>Categories</a> page.
        </p>
      </section>

      {/* ItemList JSON-LD for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJson) }}
      />
      {categoryItemListJson ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(categoryItemListJson) }}
        />
      ) : null}

      {/* SEO keyword chips (Coursera removed) */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12, marginBottom: 12 }}>
        {(() => {
          const chips: Array<{ label: string; href: string; active: boolean }> = [];
          // All Deals
          {
            const sp = new URLSearchParams();
            if (params.q) sp.set("q", params.q);
            if (params.category) sp.set("category", params.category);
            if (params.sort) sp.set("sort", params.sort);
            chips.push({ label: "All Deals", href: `/?${sp.toString()}`, active: !params.provider && !params.freeOnly });
          }
          // Udemy Deals
          {
            const sp = new URLSearchParams();
            if (params.q) sp.set("q", params.q);
            if (params.category) sp.set("category", params.category);
            if (params.sort) sp.set("sort", params.sort);
            sp.set("provider", "udemy");
            chips.push({ label: "Udemy Deals", href: `/?${sp.toString()}`, active: (params.provider || "").toLowerCase() === "udemy" && !params.freeOnly });
          }
          // 100% Off Udemy Coupons
          {
            const sp = new URLSearchParams();
            if (params.q) sp.set("q", params.q);
            if (params.category) sp.set("category", params.category);
            if (params.sort) sp.set("sort", params.sort);
            sp.set("provider", "udemy");
            sp.set("freeOnly", "1");
            const active = (params.provider || "").toLowerCase() === "udemy" && (params.freeOnly === "1" || params.freeOnly === "true");
            chips.push({ label: "100% Off Udemy Coupons", href: `/?${sp.toString()}`, active });
          }
          // Free Udemy Courses
          {
            const sp = new URLSearchParams();
            if (params.q) sp.set("q", params.q);
            if (params.category) sp.set("category", params.category);
            if (params.sort) sp.set("sort", params.sort);
            sp.set("provider", "udemy");
            sp.set("freeOnly", "1");
            const active = (params.provider || "").toLowerCase() === "udemy" && (params.freeOnly === "1" || params.freeOnly === "true");
            chips.push({ label: "Free Udemy Courses", href: `/?${sp.toString()}`, active });
          }
          return chips.map((c) => (
            <a
              key={c.label}
              href={c.href}
              style={{
                padding: "6px 10px",
                borderRadius: 999,
                border: "1px solid #1f2330",
                background: c.active ? "#151a28" : "#0f1320",
                color: "#eaf4ff",
                textDecoration: "none",
                fontSize: 12,
                whiteSpace: "nowrap",
              }}
            >
              {c.label}
            </a>
          ));
        })()}
      </div>

      {/* Sort controls */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
        {[
          { key: "newest", label: "Newest" },
          { key: "updated", label: "Updated" },
          { key: "rating", label: "Rating" },
          { key: "students", label: "Students" },
          { key: "price", label: "Price" },
        ].map((s) => {
          const sp = new URLSearchParams();
          if (params.q) sp.set("q", params.q);
          if (params.category) sp.set("category", params.category);
          if (params.provider) sp.set("provider", params.provider);
          if (params.freeOnly) sp.set("freeOnly", params.freeOnly);
          sp.set("sort", s.key);
          return (
            <a
              key={s.key}
              href={`/?${sp.toString()}`}
              style={{
                padding: "6px 10px",
                borderRadius: 8,
                border: "1px solid #1f2330",
                background: (params.sort ?? "newest") === s.key ? "#151a28" : "#0f1320",
                color: "#d7eaff",
                textDecoration: "none",
                fontSize: 12,
              }}
            >
              {s.label}
            </a>
          );
        })}
      </div>

      <DealsList
        initialItems={lightItems}
        initialPage={page}
        totalPages={totalPages}
        baseParams={{
          q: params.q,
          category: params.category,
          provider: params.provider,
          sort: params.sort,
          freeOnly: params.freeOnly,
          pageSize: "12",
        }}
      />

      {/* Categories Cards (dynamic primary categories) */}
      <section style={{ marginTop: 24 }}>
        <h2 style={{ marginBottom: 8 }}>Top Categories</h2>
        <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))" }}>
          {categories.map((c) => {
            const cSlug = (() => {
              if (c.name === "Uncategorized") return "uncategorized";
              let v = c.name.toLowerCase();
              // Use the same normalization as the filtering
              v = v.replace(/&amp;/gi, "&");
              v = v.replace(/&/g, " and ");
              v = v.replace(/[^\w\s-]/g, "");
              v = v.trim();
              v = v.replace(/\s+/g, "-");
              v = v.replace(/-+/g, "-");
              return v;
            })();
            const sp = new URLSearchParams();
            sp.set("category", cSlug);
            return (
              <a
                key={c.slug}
                href={`/?${sp.toString()}`}
                className="card"
                style={{ textDecoration: "none", color: "#eaf4ff" }}
                title={`${c.name} coupons & free courses`}
              >
                <div className="card-body" style={{ display: "grid", gap: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={c.icon} alt="" width={18} height={18} style={{ filter: "brightness(1.2)" }} />
                    <div style={{ fontWeight: 700 }}>{c.name}</div>
                  </div>
                  <div className="muted" style={{ fontSize: 12 }}>{c.count} deals</div>
                </div>
              </a>
            );
          })}
        </div>
      </section>
      {/* Show more handled inside DealsList (moved below categories per your request) */}
      {/* SEO helper text */}
      <section style={{ marginTop: 24 }}>
        <h2 style={{ fontSize: 18, marginBottom: 8 }}>About these Udemy coupons</h2>
        <p className="muted" style={{ marginTop: 0 }}>
          Explore the best 100% Off and Free Udemy Coupons handpicked for learners. We regularly refresh discounts so you can enroll in top Udemy courses without breaking the bank.
        </p>
      </section>
    </div>
  );
}
