"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import DealCard from "@/components/DealCard";
import type { Deal } from "@/types/deal";

const PRIMARY_KEYWORD = "Udemy courses";

interface SearchClientProps {
  initialQuery?: string;
}

export default function SearchClient({ initialQuery = "" }: SearchClientProps) {
  const [q, setQ] = useState(initialQuery);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPlaceholder, setCurrentPlaceholder] = useState(0);

  const searchTerms = [
    "100 days of code",
    "JavaScript",
    "Python", 
    "React",
    "Web development",
    "TypeScript",
    "Node.js",
    "Machine learning",
    "Data science",
    "Next.js"
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPlaceholder((prev) => (prev + 1) % searchTerms.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    // Fetch deals with server-side search
    const params = new URLSearchParams();
    params.set("pageSize", "20");
    params.set("page", String(page));
    if (q.trim()) {
      params.set("q", q.trim());
    }
    
    fetch(`/api/deals?${params.toString()}`)
      .then((response) => {
        if (!response.ok) throw new Error("Failed to load deals");
        return response.json();
      })
      .then((data) => {
        if (!cancelled) {
          setDeals(Array.isArray(data.items) ? data.items : []);
          setTotalPages(data.totalPages || 1);
        }
      })
      .catch((err: Error) => {
        if (!cancelled) {
          setDeals([]);
          setError(err.message || "Unable to fetch deals");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [page, q]); // Re-fetch when page or query changes

  // Handle search input changes
  const handleSearchChange = (newQuery: string) => {
    setQ(newQuery);
    setPage(1); // Reset to first page when searching

    // Update URL without page reload
    if (newQuery.trim()) {
      window.history.replaceState(null, '', `/search?q=${encodeURIComponent(newQuery.trim())}`);
    } else {
      window.history.replaceState(null, '', '/search');
    }
  };

  const filtered = deals; // No client-side filtering needed - server handles it

  const totalDeals = deals.length;
  const visibleDeals = filtered.length;
  const keywordPreview = q.trim().length > 0 ? `“${q.trim()}”` : PRIMARY_KEYWORD;

  return (
    <div style={{ display: "grid", gap: 24 }}>
      <section
        className="card brand-border"
        style={{
          borderRadius: 16,
          padding: 0,
        }}
      >
        <div className="card-body" style={{ gap: 14 }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 13, color: "var(--brand)", fontWeight: 600, textTransform: "uppercase" }}>Live inventory</div>
              <h2 style={{ margin: "4px 0 0", fontSize: 24 }}>Search {PRIMARY_KEYWORD} coupons</h2>
            </div>
            <div style={{ fontSize: 12, color: "#a9b0c0" }}>
              Showing {visibleDeals.toLocaleString()} of {totalDeals.toLocaleString()} deals
            </div>
          </div>
          <div style={{ display: "grid", gap: 12 }}>
            <label htmlFor="search-input" className="muted" style={{ fontSize: 12 }}>
              Filter by course title, provider, category, or coupon keyword
            </label>
            <input
              id="search-input"
              value={q}
              onChange={(event) => handleSearchChange(event.target.value)}
              placeholder={`${searchTerms[currentPlaceholder]}...`}
              style={{
                width: "100%",
                padding: "12px 16px",
                borderRadius: 999,
                border: "1px solid var(--brand-soft)",
                background: "rgba(15, 19, 32, 0.8)",
                color: "#e6e9f2",
                fontSize: 15,
                transition: "all 0.3s ease",
              }}
              aria-label="Search Udemy courses"
            />
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {[
              "Web development",
              "AI & machine learning",
              "Productivity",
              "Design",
            ].map((chip) => (
              <button
                key={chip}
                type="button"
                className="pill"
                style={{ borderColor: "var(--brand-soft)", cursor: "pointer" }}
                onClick={() => handleSearchChange(chip)}
              >
                {chip}
              </button>
            ))}
          </div>
          <div className="muted" style={{ fontSize: 13 }}>
            Searching for <span style={{ color: "#eaf4ff" }}>{keywordPreview}</span>
          </div>
        </div>
      </section>

      {loading ? (
        <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))" }}>
          {Array.from({ length: 8 }).map((_, idx) => (
            <div
              key={idx}
              className="card brand-border brand-gradient"
              style={{ height: 220, borderRadius: 12, opacity: 0.7 }}
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card brand-border" style={{ borderRadius: 16 }}>
          <div className="card-body" style={{ gap: 12 }}>
            <h3 style={{ margin: 0 }}>No deals matched your search</h3>
            <p className="muted" style={{ margin: 0 }}>
              Try a broader keyword or jump into one of these curated collections.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              <Link href="/udemy-coupons" className="pill" style={{ textDecoration: "none", borderColor: "var(--brand-soft)" }}>
                Browse Udemy coupons
              </Link>
              <Link href="/?provider=udemy&freeOnly=1" className="pill" style={{ textDecoration: "none", borderColor: "var(--brand-soft)" }}>
                See free Udemy courses
              </Link>
              <Link href="/categories" className="pill" style={{ textDecoration: "none", borderColor: "var(--brand-soft)" }}>
                Explore categories
              </Link>
            </div>
            {error ? (
              <div style={{ fontSize: 12, color: "#fca5a5" }}>Last error: {error}</div>
            ) : null}
          </div>
        </div>
      ) : (
        <>
          <div className="grid">
            {filtered.map((deal) => (
              <DealCard key={deal.id} deal={deal} />
            ))}
          </div>
          
          {totalPages > 1 && (
            <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 16, alignItems: "center" }}>
              <button 
                className="pill" 
                onClick={() => setPage(page - 1)} 
                disabled={page === 1 || loading}
              >
                Previous
              </button>
              <span style={{ padding: "0 16px", color: "#d7eaff" }}>
                Page {page} of {totalPages}
              </span>
              <button 
                className="pill" 
                onClick={() => setPage(page + 1)} 
                disabled={page >= totalPages || loading}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
