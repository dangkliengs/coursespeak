"use client";
import React, { useMemo, useState } from "react";
import DealCard from "@/components/DealCard";

export default function DealsList({
  initialItems,
  initialPage,
  totalPages,
  baseParams,
}: {
  initialItems: any[];
  initialPage: number;
  totalPages: number;
  baseParams: Record<string, string | undefined>;
}) {
  const [items, setItems] = useState<any[]>(initialItems || []);
  const [page, setPage] = useState<number>(initialPage || 1);
  const [loading, setLoading] = useState(false);

  const canShowMore = page < totalPages;

  async function loadMore() {
    if (!canShowMore || loading) return;
    setLoading(true);
    try {
      const params = new URLSearchParams();
      Object.entries(baseParams).forEach(([k, v]) => {
        if (v) params.set(k, v);
      });
      params.set("page", String(page + 1));
      params.set("pageSize", baseParams.pageSize || "12");
      const res = await fetch(`/api/deals?${params.toString()}`, { cache: "no-store" });
      const data = await res.json();
      setItems((prev) => prev.concat(data.items || []));
      setPage(data.page || page + 1);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="grid">
        {items.map((d: any) => (
          <DealCard key={d.id} deal={d} />
        ))}
      </div>
      {canShowMore && (
        <div style={{ display: "flex", justifyContent: "center", marginTop: 16 }}>
          <button className="pill" onClick={loadMore} disabled={loading}>
            {loading ? "Loading..." : "Show more"}
          </button>
        </div>
      )}
    </>
  );
}
