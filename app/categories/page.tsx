import type { Metadata } from "next";
import { readDeals } from "@/lib/store";
import { promises as fs } from "fs";
import path from "path";
import { slugifyCategory } from "@/lib/slug";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const now = new Date();
  const monthYear = now.toLocaleString("en-US", { month: "long", year: "numeric" });
  const title = `All Categories & Subcategories ${monthYear} | Coursespeak`;
  const description = "Browse all primary categories and subcategories of Udemy deals and free coupons on Coursespeak.";
  return {
    title,
    description,
    alternates: { canonical: "/categories" },
    openGraph: {
      title,
      description: "Explore all categories and subcategories of Udemy deals and free Udemy coupons.",
      url: "/categories",
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

function normName(raw?: string | null) {
  if (!raw) return undefined;
  let v = String(raw).trim();
  v = v.replace(/&amp;/gi, "&");
  v = v.replace(/\s+/g, " ");
  return v || undefined;
}

export default async function CategoriesPage() {
  const deals = await readDeals();
  const cats = new Map<string, { name: string; count: number; subs: Map<string, number> }>();
  for (const d of deals) {
    const cName = normName((d as any).category) ?? "Uncategorized";
    const cKey = cName.toLowerCase();
    if (!cats.has(cKey)) cats.set(cKey, { name: cName, count: 0, subs: new Map() });
    const bucket = cats.get(cKey)!;
    bucket.count += 1;
    const sName = normName((d as any).subcategory);
    if (sName) {
      bucket.subs.set(sName, (bucket.subs.get(sName) || 0) + 1);
    }
  }
  const listRaw = Array.from(cats.values()).sort((a, b) => b.count - a.count);
  // Resolve icon paths on the server to avoid client-side event handlers

  const list = await Promise.all(listRaw.map(async (c) => {
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
    const file = path.join(process.cwd(), "public", "categories", `${cSlug}.svg`);
    let icon = "/categories/default.svg";
    try {
      await fs.access(file);
      icon = `/categories/${cSlug}.svg`;
    } catch {}
    return { ...c, icon };
  }));

  if (list.length === 0) {
    return (
      <div style={{ display: "grid", gap: 24 }}>
        <section
          style={{
            padding: "32px 28px",
            borderRadius: 18,
            display: "grid",
            gap: 12,
            border: "1px solid rgba(91, 140, 255, 0.24)",
            background: "linear-gradient(140deg, rgba(11, 13, 18, 0.98) 0%, rgba(18, 24, 40, 0.98) 55%, rgba(42, 64, 110, 0.38) 100%)",
            boxShadow: "0 18px 36px rgba(8, 12, 26, 0.45)",
          }}
        >
          <span style={{ color: "var(--brand)", fontSize: 12, fontWeight: 600, textTransform: "uppercase" }}>Categories</span>
          <h2 style={{ margin: 0 }}>All Categories & Subcategories</h2>
          <p className="muted" style={{ margin: 0 }}>
            No categories were resolved from the current dataset. We loaded {deals.length} deals—try refreshing the deals
            source or verify each deal includes a category or subcategory value.
          </p>
        </section>
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gap: 32 }}>
      <section
        style={{
          padding: "32px 28px",
          borderRadius: 18,
          display: "grid",
          gap: 12,
          border: "1px solid rgba(91, 140, 255, 0.24)",
          background: "linear-gradient(140deg, rgba(11, 13, 18, 0.98) 0%, rgba(18, 24, 40, 0.98) 55%, rgba(42, 64, 110, 0.38) 100%)",
          boxShadow: "0 18px 36px rgba(8, 12, 26, 0.45)",
        }}
      >
        <span style={{ color: "var(--brand)", fontSize: 12, fontWeight: 600, textTransform: "uppercase" }}>Categories</span>
        <h1 style={{ margin: 0 }}>All Categories & Subcategories</h1>
        <p className="muted" style={{ margin: 0, maxWidth: 720 }}>
          Explore every primary category and subcategory available on Coursespeak. Select a topic to dive straight into updated Udemy coupons and 100% off courses curated for that niche.
        </p>
      </section>

      <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 16 }}>
        {list.map((c) => {
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
          return (
            <div key={cSlug} className="card brand-border" style={{ color: "#eaf4ff", borderRadius: 14 }}>
              <div className="card-body" style={{ display: "grid", gap: 8 }}>
                <a href={`/?category=${encodeURIComponent(cSlug)}`} style={{ textDecoration: "none", color: "inherit" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={c.icon} alt="" width={20} height={20} style={{ filter: "brightness(1.2)" }} />
                    <div style={{ fontWeight: 700, fontSize: 16 }}>{c.name}</div>
                    <span className="muted" style={{ fontSize: 12, marginLeft: "auto" }}>{c.count} deals</span>
                  </div>
                </a>
                {c.subs.size > 0 && (
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {Array.from(c.subs.entries()).sort((a, b) => b[1] - a[1]).map(([sub, n]) => {
                      const q = new URLSearchParams();
                      q.set("category", cSlug);
                      q.set("q", sub);
                      return (
                        <a
                          key={sub}
                          href={`/?${q.toString()}`}
                          className="pill"
                          style={{ textDecoration: "none", borderColor: "var(--brand-soft)" }}
                          title={`${sub} (${n})`}
                        >
                          {sub}
                        </a>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
