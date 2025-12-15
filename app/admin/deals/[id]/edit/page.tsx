"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";

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
  image?: string;
  description?: string;
  content?: string;
  learn?: string[];
  requirements?: string[];
  faqs?: { q: string; a: string }[];
  curriculum?: { section: string; lectures: { title: string; duration?: string }[] }[];
  instructor?: string;
  duration?: string;
  language?: string;
  createdAt?: string;
  updatedAt?: string;
  seoTitle?: string;
  seoDescription?: string;
  seoOgImage?: string;
  seoCanonical?: string;
  seoNoindex?: boolean;
  seoNofollow?: boolean;
};

const envDefaultToken = process.env.NEXT_PUBLIC_ADMIN_PASSWORD;
const DEFAULT_ADMIN_TOKEN = typeof envDefaultToken === "string" ? envDefaultToken.trim() : "1983";

export default function EditDealPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deal, setDeal] = useState<Deal | null>(null);

  // Initialize token from localStorage or default
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const loadToken = () => {
      // Try to get token from localStorage
      let savedToken = localStorage.getItem("coursespeak:adminToken");
      
      // If no token in localStorage, use default and save it
      if (!savedToken && DEFAULT_ADMIN_TOKEN) {
        savedToken = DEFAULT_ADMIN_TOKEN;
        localStorage.setItem("coursespeak:adminToken", savedToken);
      }
      
      if (savedToken) {
        setToken(savedToken);
      }
    };
    
    loadToken();
    
    // Listen for storage events to sync token across tabs
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'coursespeak:adminToken') {
        setToken(e.newValue);
      }
    };
    
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  // Function to set token
  const onSetToken = async () => {
    const newToken = prompt("Enter admin token", token || DEFAULT_ADMIN_TOKEN || "");
    if (newToken) {
      try {
        // Test the token first
        const testRes = await fetch(`/api/admin/verify-token`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: newToken })
        });
        
        if (testRes.ok) {
          localStorage.setItem("coursespeak:adminToken", newToken);
          setToken(newToken);
          alert('Token updated successfully!');
        } else {
          const error = await testRes.json().catch(() => ({}));
          throw new Error(error.message || 'Invalid token');
        }
      } catch (error) {
        console.error('Error setting token:', error);
        alert(`Failed to set token: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  };

  // Fetch deal data when component mounts or token changes
  useEffect(() => {
    const fetchDeal = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      
      setLoading(true);
      setError(null);
      
      try {
        const res = await fetch(`/api/admin/deals/${params.id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
            'Authorization': `Bearer ${token}`
          },
          credentials: 'include',
          cache: 'no-store'
        });
        
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          if (res.status === 401) {
            localStorage.removeItem("coursespeak:adminToken");
            setToken(null);
            throw new Error(errorData.message || "Session expired. Please log in again.");
          }
          throw new Error(errorData.error || `Failed to fetch deal (${res.status})`);
        }
        
        const response = await res.json();
        if (!response.success) {
          throw new Error(response.error || 'Failed to load deal data');
        }
        
        const dealData = response.data; // Extract data from response
        if (!dealData) {
          throw new Error('No deal data received');
        }
        
        // Normalize arrays and set default values
        const normalizedDeal = {
          ...dealData,
          learn: Array.isArray(dealData.learn) ? dealData.learn : [],
          requirements: Array.isArray(dealData.requirements) ? dealData.requirements : [],
          faqs: Array.isArray(dealData.faqs) ? dealData.faqs : [],
          curriculum: Array.isArray(dealData.curriculum) ? dealData.curriculum : [],
          price: Number(dealData.price) || 0,
          originalPrice: Number(dealData.originalPrice) || undefined,
          rating: Number(dealData.rating) || undefined,
          students: Number(dealData.students) || undefined,
        };
        
        setDeal(normalizedDeal);
      } catch (e: any) {
        console.error('Error fetching deal:', e);
        setError(e?.message || "Failed to load deal");
      } finally {
        setLoading(false);
      }
    };

    fetchDeal();
  }, [token, params.id]);

  // Create headers object for API requests
  const headers = useMemo(() => ({
    'Content-Type': 'application/json',
    ...(token ? { 
      'x-admin-token': token,
      'Authorization': `Bearer ${token}`
    } : {})
  }), [token]);

  function slugify(s: string) {
    return s
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  }

  // Hooks must be declared before any early returns
  const contentRef = useRef<HTMLTextAreaElement | null>(null);

  function timeAgo(iso: string) {
    const ms = Date.now() - new Date(iso).getTime();
    if (isNaN(ms) || ms < 0) return "just now";
    const sec = Math.floor(ms / 1000);
    const min = Math.floor(sec / 60);
    const hr = Math.floor(min / 60);
    const day = Math.floor(hr / 24);
    if (day > 0) return `${day}d ago`;
    if (hr > 0) return `${hr}h ago`;
    if (min > 0) return `${min}m ago`;
    return `${sec}s ago`;
  }

  function update<K extends keyof Deal>(key: K, value: Deal[K]) {
    if (!deal) return;
    setDeal({ ...deal, [key]: value });
  }

  const save = async () => {
    if (!deal) {
      setError("No deal data found");
      return;
    }

    // Get token from state or localStorage
    const adminToken = token || localStorage.getItem('coursespeak:adminToken') || DEFAULT_ADMIN_TOKEN;
    
    if (!adminToken) {
      setError("No authentication token found. Please set your admin token.");
      onSetToken();
      return;
    }

    setSaving(true);
    setError(null);

    try {
      // Create a clean payload without internal fields
      const payload: Partial<Deal> = { ...deal };
      delete (payload as any).id;
      delete payload.createdAt;
      delete payload.updatedAt;

      const res = await fetch(`/api/admin/deals/${deal.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': adminToken,
          'Authorization': `Bearer ${adminToken}`,
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        },
        body: JSON.stringify(payload),
        credentials: 'include',
        cache: 'no-store',
        next: { revalidate: 0 }
      });
      
      const result = await res.json().catch(() => ({}));
      
      if (!res.ok) {
        if (res.status === 401) {
          // Clear invalid token
          localStorage.removeItem("coursespeak:adminToken");
          setToken(null);
          throw new Error(result.message || "Session expired. Please log in again.");
        }
        throw new Error(result.error || `Save failed (${res.status}): ${JSON.stringify(result)}`);
      }

      // Update local state with the server response
      if (result.data) {
        setDeal(prev => ({
          ...prev,
          ...result.data
        }));
      }
      
      // Show success message
      alert('Deal updated successfully!');
      
      // Redirect to admin deals list to show updated deal in correct position
      router.push('/admin/deals');
      
    } catch (e: any) {
      console.error('Error saving deal:', e);
      setError(e?.message || 'Failed to save deal');
      
      // If unauthorized, prompt for token
      if (e?.message?.includes('expired') || e?.message?.includes('Unauthorized')) {
        onSetToken();
      }
    } finally {
      setSaving(false);
    }
  };

  if (!token) {
    return (
      <div style={{ maxWidth: '600px', margin: '40px auto', padding: '20px' }}>
        <h2>Admin Access Required</h2>
        <div style={{ 
          background: '#1a1f2e', 
          padding: '20px', 
          borderRadius: '8px',
          margin: '20px 0'
        }}>
          <p style={{ marginBottom: '20px' }}>Please enter your admin token to continue:</p>
          <div style={{ display: 'flex', gap: '10px' }}>
            <input
              type="password"
              value={DEFAULT_ADMIN_TOKEN}
              readOnly
              style={{
                flex: 1,
                padding: '10px',
                borderRadius: '4px',
                border: '1px solid #2d3748',
                background: '#1a202c',
                color: '#e2e8f0'
              }}
            />
            <button 
              onClick={onSetToken}
              style={{
                padding: '10px 20px',
                background: '#4299e1',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Use Default Token
            </button>
          </div>
          {/* Default token removed for security */}
        </div>
      </div>
    );
  }

  if (loading) return <div>Loading...</div>;
  if (error) return <div style={{ color: "#f87171" }}>{error}</div>;
  if (!deal) return <div>Not found</div>;

  const postUrl = typeof window !== "undefined" && deal ? `${location.origin}/deal/${deal.slug || deal.id}` : "";

  return (
    <div>
      <h2>Edit Deal</h2>
      <div style={{ display: "grid", gap: 12, maxWidth: 900 }}>
        <label style={{ display: "grid", gap: 6 }}>
          <span>Title</span>
          <input value={deal.title} onChange={(e) => update("title", e.target.value)} className="pill" style={{ padding: 8 }} />
        </label>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <label style={{ display: "grid", gap: 6 }}>
            <span>Provider</span>
            <input value={deal.provider} onChange={(e) => update("provider", e.target.value)} className="pill" style={{ padding: 8 }} />
          </label>
          <label style={{ display: "grid", gap: 6 }}>
            <span>Category</span>
            <input value={deal.category || ""} onChange={(e) => update("category", e.target.value)} className="pill" style={{ padding: 8 }} />
          </label>
        </div>
        <label style={{ display: "grid", gap: 6 }}>
          <span>Subcategory</span>
          <input value={deal.subcategory || ""} onChange={(e) => update("subcategory", e.target.value)} className="pill" style={{ padding: 8 }} />
        </label>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12 }}>
          <label style={{ display: "grid", gap: 6 }}>
            <span>Price</span>
            <input type="number" value={deal.price} onChange={(e) => update("price", Number(e.target.value))} className="pill" style={{ padding: 8 }} />
          </label>
          <label style={{ display: "grid", gap: 6 }}>
            <span>Original Price</span>
            <input type="number" value={deal.originalPrice || 0} onChange={(e) => update("originalPrice", Number(e.target.value))} className="pill" style={{ padding: 8 }} />
          </label>
          <label style={{ display: "grid", gap: 6 }}>
            <span>Rating</span>
            <input type="number" step="0.1" value={deal.rating || 0} onChange={(e) => update("rating", Number(e.target.value))} className="pill" style={{ padding: 8 }} />
          </label>
          <label style={{ display: "grid", gap: 6 }}>
            <span>Students</span>
            <input type="number" value={deal.students || 0} onChange={(e) => update("students", Number(e.target.value))} className="pill" style={{ padding: 8 }} />
          </label>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <label style={{ display: "grid", gap: 6 }}>
            <span>Udemy URL</span>
            <input value={deal.url} onChange={(e) => update("url", e.target.value)} className="pill" style={{ padding: 8 }} />
          </label>
          <label style={{ display: "grid", gap: 6 }}>
            <span>Coupon</span>
            <input
              value={deal.coupon || ""}
              onChange={(e) => update("coupon", e.target.value)}
              onBlur={(e) => {
                const v = (e.target.value || "").trim();
                update("coupon", v);
              }}
              placeholder="e.g. SAVE50"
              className="pill"
              style={{ padding: 8 }}
            />
          </label>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
          <label style={{ display: "grid", gap: 6 }}>
            <span>Instructor</span>
            <input value={deal.instructor || ""} onChange={(e) => update("instructor", e.target.value)} className="pill" style={{ padding: 8 }} />
          </label>
          <label style={{ display: "grid", gap: 6 }}>
            <span>Duration</span>
            <input value={deal.duration || ""} onChange={(e) => update("duration", e.target.value)} placeholder="e.g. 12h 30m" className="pill" style={{ padding: 8 }} />
          </label>
          <label style={{ display: "grid", gap: 6 }}>
            <span>Language</span>
            <input value={deal.language || ""} onChange={(e) => update("language", e.target.value)} placeholder="e.g. English" className="pill" style={{ padding: 8 }} />
          </label>
        </div>
        <label style={{ display: "grid", gap: 6 }}>
          <span>Post URL (read-only)</span>
          <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 8 }}>
            <input value={postUrl} readOnly className="pill" style={{ padding: 8 }} />
            <button className="pill" onClick={() => { if (postUrl) { navigator.clipboard.writeText(postUrl); } }}>Copy</button>
          </div>
        </label>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <label style={{ display: "grid", gap: 6 }}>
            <span>Image URL</span>
            <input value={deal.image || ""} onChange={(e) => update("image", e.target.value)} className="pill" style={{ padding: 8 }} />
          </label>
          <label style={{ display: "grid", gap: 6 }}>
            <span>Expires At</span>
            <input type="datetime-local" value={deal.expiresAt ? toLocalInput(deal.expiresAt) : ""} onChange={(e) => update("expiresAt", fromLocalInput(e.target.value))} className="pill" style={{ padding: 8 }} />
          </label>
        </div>
        <label style={{ display: "grid", gap: 6 }}>
          <span>Slug</span>
          <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 8 }}>
            <input
              value={deal.slug || ""}
              onChange={(e) => update("slug", e.target.value)}
              placeholder="e.g. javascript-fundamentals"
              className="pill"
              style={{ padding: 8 }}
            />
            <button
              className="pill"
              onClick={(ev) => {
                ev.preventDefault();
                const s = slugify(deal.title || "");
                update("slug", s);
              }}
            >
              Generate
            </button>
          </div>
          <small className="muted">Post URL will use slug if present: /deal/&lt;slug&gt;</small>
        </label>
        <label style={{ display: "grid", gap: 6 }}>
          <span>Description</span>
          <textarea value={deal.description || ""} onChange={(e) => update("description", e.target.value)} className="pill" style={{ padding: 8, minHeight: 80 }} />
        </label>
        <label style={{ display: "grid", gap: 6 }}>
          <span>Content (Markdown)</span>
          <MarkdownToolbar onApply={(fn) => {
            const el = contentRef.current;
            if (!el) return;
            const start = el.selectionStart || 0;
            const end = el.selectionEnd || 0;
            const before = (deal.content || "").slice(0, start);
            const selected = (deal.content || "").slice(start, end);
            const after = (deal.content || "").slice(end);
            const { text, cursorOffset } = fn(selected);
            const next = before + text + after;
            update("content", next);
            requestAnimationFrame(() => {
              const pos = before.length + (cursorOffset ?? text.length);
              el.focus();
              el.setSelectionRange(pos, pos);
            });
          }} />
          <textarea
            ref={contentRef}
            value={deal.content || ""}
            onChange={(e) => update("content", e.target.value)}
            style={{ padding: 10, minHeight: 260, border: "1px solid #1f2330", borderRadius: 4, background: "#0f1320", color: "#e6e9f2", fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace" }}
          />
        </label>
        <FieldArray label="What you'll learn" values={deal.learn || []} onChange={(arr) => update("learn", arr)} />
        <FieldArray label="Requirements" values={deal.requirements || []} onChange={(arr) => update("requirements", arr)} />
        <section style={{ borderTop: "1px solid #1f2330", paddingTop: 12 }}>
          <h3>SEO</h3>
          <div style={{ display: "grid", gap: 12 }}>
            <label style={{ display: "grid", gap: 6 }}>
              <span>SEO Title</span>
              <input value={deal.seoTitle || ""} onChange={(e) => update("seoTitle", e.target.value)} className="pill" style={{ padding: 8 }} />
            </label>
            <label style={{ display: "grid", gap: 6 }}>
              <span>SEO Description</span>
              <textarea value={deal.seoDescription || ""} onChange={(e) => update("seoDescription", e.target.value)} className="pill" style={{ padding: 8, minHeight: 80 }} />
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <label style={{ display: "grid", gap: 6 }}>
                <span>OpenGraph Image URL</span>
                <input value={deal.seoOgImage || ""} onChange={(e) => update("seoOgImage", e.target.value)} className="pill" style={{ padding: 8 }} />
              </label>
              <label style={{ display: "grid", gap: 6 }}>
                <span>Canonical URL (override)</span>
                <input value={deal.seoCanonical || ""} onChange={(e) => update("seoCanonical", e.target.value)} placeholder="Leave blank to use slug" className="pill" style={{ padding: 8 }} />
              </label>
            </div>
            <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
              <label style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                <input type="checkbox" checked={!!deal.seoNoindex} onChange={(e) => update("seoNoindex", e.target.checked)} />
                <span>Noindex</span>
              </label>
              <label style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                <input type="checkbox" checked={!!deal.seoNofollow} onChange={(e) => update("seoNofollow", e.target.checked)} />
                <span>Nofollow</span>
              </label>
            </div>
          </div>
        </section>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <button className="pill" onClick={() => router.push("/admin/deals")}>Cancel</button>
          <button className="pill" onClick={save} disabled={saving}>{saving ? "Saving..." : "Save"}</button>
          {deal.updatedAt && (
            <span className="muted">Last updated {timeAgo(deal.updatedAt)}</span>
          )}
        </div>
      </div>
    </div>
  );
}

function toLocalInput(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
function fromLocalInput(val: string) { return val ? new Date(val).toISOString() : ""; }

function MarkdownToolbar({ onApply }: { onApply: (fn: (selection: string) => { text: string; cursorOffset?: number }) => void }) {
  const btn = (label: string, action: (sel: string) => { text: string; cursorOffset?: number }) => (
    <button type="button" className="pill" onClick={(e) => { e.preventDefault(); onApply(action); }}>{label}</button>
  );
  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      {btn("H1", (sel) => ({ text: `# ${sel || "Heading"}\n`, cursorOffset: 2 }))}
      {btn("H2", (sel) => ({ text: `## ${sel || "Heading"}\n`, cursorOffset: 3 }))}
      {btn("Bold", (sel) => ({ text: `**${sel || "bold"}**`, cursorOffset: 2 }))}
      {btn("Italic", (sel) => ({ text: `*${sel || "italic"}*`, cursorOffset: 1 }))}
      {btn("Code", (sel) => ({ text: `\`${sel || "code"}\``, cursorOffset: 1 }))}
      {btn("Quote", (sel) => ({ text: `> ${sel || "quote"}\n`, cursorOffset: 2 }))}
      {btn("UL", (sel) => ({ text: sel ? sel.split(/\r?\n/).map((l) => `- ${l || "item"}`).join("\n") : `- item\n- item\n`, cursorOffset: 2 }))}
      {btn("OL", (sel) => ({ text: sel ? sel.split(/\r?\n/).map((l, i) => `${i + 1}. ${l || "item"}`).join("\n") : `1. item\n2. item\n`, cursorOffset: 3 }))}
      {btn("Link", (sel) => ({ text: `[${sel || "text"}](https://)`, cursorOffset: (sel || "text").length + 3 }))}
    </div>
  );
}

function FieldArray({ label, values, onChange }: { label: string; values: string[]; onChange: (arr: string[]) => void }) {
  function add() { onChange([...(values || []), ""]); }
  function set(i: number, v: string) { const next = [...values]; next[i] = v; onChange(next); }
  function del(i: number) { const next = values.filter((_, idx) => idx !== i); onChange(next); }
  return (
    <div>
      <h3>{label}</h3>
      <div style={{ display: "grid", gap: 8 }}>
        {(values || []).map((v, i) => (
          <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 8 }}>
            <input value={v} onChange={(e) => set(i, e.target.value)} className="pill" style={{ padding: 8 }} />
            <button className="pill" onClick={() => del(i)}>Remove</button>
          </div>
        ))}
        <button className="pill" onClick={add}>Add</button>
      </div>
    </div>
  );
}

