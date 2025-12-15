"use client";
import { useCallback, useEffect, useState } from "react";
import { useAdminAuth } from "@/components/AdminAuthGate";

type Deal = {
  id: string;
  slug?: string;
  title: string;
  provider: string;
  price: number;
  originalPrice?: number;
  rating?: number;
  students?: number;
  coupon?: string | null;
  url: string;
  category?: string;
  subcategory?: string;
  expiresAt?: string;
  updatedAt?: string;
  createdAt?: string;
};

export default function AdminDealsPage() {
  const { refresh } = useAdminAuth();
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<Deal[]>([]);
  const [total, setTotal] = useState(0);
  const [pageSize, setPageSize] = useState(20);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (q) params.set("q", q);
      params.set("page", String(page));
      params.set("pageSize", String(pageSize));
      const res = await fetch(`/api/admin/deals?${params.toString()}`, {
        credentials: "include",
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      if (res.status === 401) {
        await refresh();
        throw new Error("Sesi admin berakhir. Silakan login kembali.");
      }
      if (!res.ok) throw new Error(`Error ${res.status}`);
      const data = await res.json();
      setItems(data.items || []);
      setTotal(data.total || 0);
    } catch (e: any) {
      setError(e?.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, q, refresh]);

  useEffect(() => {
    load();
  }, [load]);

  async function onDelete(id: string) {
    if (!confirm("Delete this deal?")) return;
    try {
      const res = await fetch(`/api/admin/deals/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error(`Delete failed (${res.status})`);
      await load();
    } catch (e: any) {
      alert(e?.message || "Delete failed");
    }
  }

  function slugify(s: string) {
    return s
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  }

  async function onCreateQuick() {
    const title = prompt("Title?") || "Untitled";
    const url = prompt("Udemy URL?") || "#";
    const provider = prompt("Provider? (Udemy/Coursera)") || "Udemy";
    const priceStr = prompt("Price? (0 for Free)") || "0";
    const price = Number(priceStr) || 0;
    const slug = slugify(title);
    try {
      const res = await fetch(`/api/admin/deals`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "x-admin-token": "dev-admin"
        },
        credentials: "include",
        body: JSON.stringify({ title, url, provider, price, slug }),
      });
      if (!res.ok) throw new Error(`Create failed (${res.status})`);
      await load();
    } catch (e: any) {
      alert(e?.message || "Create failed");
    }
  }

  return (
    <div>
      <h2>Deals</h2>
      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginBottom: 12 }}>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search title/provider/category"
          style={{ padding: 8, borderRadius: 8, border: "1px solid #1f2330", background: "#0f1320", color: "#e6e9f2" }}
        />
        <button className="pill" onClick={() => { setPage(1); load(); }}>Search</button>
        <button className="pill" onClick={() => { setQ(""); setPage(1); load(); }}>Clear</button>
        <span style={{ marginLeft: "auto" }} />
        <button className="pill" onClick={onCreateQuick}>New Deal</button>
        <button className="pill" onClick={load}>🔄 Refresh</button>
      </div>
      {error && <div style={{ color: "#f87171", marginBottom: 8 }}>{error}</div>}
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ textAlign: "left" }}>
                <th style={{ padding: 8, borderBottom: "1px solid #1f2330" }}>Title</th>
                <th style={{ padding: 8, borderBottom: "1px solid #1f2330" }}>Provider</th>
                <th style={{ padding: 8, borderBottom: "1px solid #1f2330" }}>Price</th>
                <th style={{ padding: 8, borderBottom: "1px solid #1f2330" }}>Coupon</th>
                <th style={{ padding: 8, borderBottom: "1px solid #1f2330" }}>Category</th>
                <th style={{ padding: 8, borderBottom: "1px solid #1f2330" }}>Updated</th>
                <th style={{ padding: 8, borderBottom: "1px solid #1f2330" }}>Expires</th>
                <th style={{ padding: 8, borderBottom: "1px solid #1f2330" }}></th>
              </tr>
            </thead>
            <tbody>
              {items.map((d) => {
                const hasPrice = typeof d.price === "number" && Number.isFinite(d.price);
                const priceLabel = hasPrice ? (d.price === 0 ? "Free" : `$${d.price.toFixed(2)}`) : "-";

                return (
                  <tr key={d.id}>
                    <td style={{ padding: 8, borderBottom: "1px solid #1f2330" }}>{d.title}</td>
                    <td style={{ padding: 8, borderBottom: "1px solid #1f2330" }}>{d.provider}</td>
                    <td style={{ padding: 8, borderBottom: "1px solid #1f2330" }}>{priceLabel}</td>
                    <td style={{ padding: 8, borderBottom: "1px solid #1f2330" }}>{d.coupon || "-"}</td>
                  <td style={{ padding: 8, borderBottom: "1px solid #1f2330" }}>{d.category || "-"}</td>
                  <td style={{ padding: 8, borderBottom: "1px solid #1f2330" }}>{d.updatedAt ? new Date(d.updatedAt).toLocaleString() : "-"}</td>
                  <td style={{ padding: 8, borderBottom: "1px solid #1f2330" }}>{d.expiresAt ? new Date(d.expiresAt).toLocaleString() : "-"}</td>
                  <td style={{ padding: 8, borderBottom: "1px solid #1f2330", display: "flex", gap: 8 }}>
                    <a className="pill" href={`/deal/${d.slug || d.id}`} target="_blank" rel="noreferrer">View</a>
                    <a className="pill" href={`/admin/deals/${d.id}/edit`}>Edit</a>
                    <button className="pill" onClick={() => onDelete(d.id)}>Delete</button>
                  </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 16, alignItems: "center" }}>
        <button className="pill" onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}>
          Previous
        </button>
        <span style={{ padding: "0 16px" }}>
          Page {page} of {Math.max(1, Math.ceil(total / pageSize))}
        </span>
        <button className="pill" onClick={() => setPage(Math.min(Math.ceil(total / pageSize), page + 1))} disabled={page >= Math.ceil(total / pageSize)}>
          Next
        </button>
      </div>
    </div>
  );
}
