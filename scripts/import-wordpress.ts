#!/usr/bin/env ts-node
import fs from 'fs/promises';
import path from 'path';
import TurndownService from 'turndown';

// Minimal Deal shape (keep in sync with types/deal.ts)
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
  faqs?: { q: string; a: string }[];
  subtitle?: string;
  learn?: string[];
  requirements?: string[];
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

// CLI args
const args = process.argv.slice(2);
const baseArg = args.find(a => a.startsWith('--base='));
const base = (baseArg ? baseArg.split('=')[1] : process.env.WP_BASE) || '';
const perPageArg = args.find(a => a.startsWith('--perPage='));
const perPage = perPageArg ? Math.min(100, Math.max(1, Number(perPageArg.split('=')[1]) || 20)) : 20;
const maxPagesArg = args.find(a => a.startsWith('--pages='));
const maxPages = maxPagesArg ? Math.max(1, Number(maxPagesArg.split('=')[1]) || 1) : undefined;

if (!base) {
  console.error('Usage: ts-node scripts/import-wordpress.ts --base=https://coursespeak.com [--perPage=20] [--pages=5]');
  process.exit(1);
}

function toPrice(input: any): number | undefined {
  if (input == null) return undefined;
  if (typeof input === 'number') return isFinite(input) ? input : undefined;
  const s = String(input).trim();
  if (!s) return undefined;
  // Remove currency symbols and commas, keep digits and dot
  const cleaned = s.replace(/[^0-9.]/g, '');
  const n = parseFloat(cleaned);
  return isFinite(n) ? n : undefined;
}

const turndown = new TurndownService({ headingStyle: 'atx', codeBlockStyle: 'fenced' });

async function fetchJson(url: string) {
  const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.json();
}

function toISO(d?: string | null): string | undefined {
  if (!d) return undefined;
  const t = new Date(d);
  if (isNaN(t.getTime())) return undefined;
  return t.toISOString();
}

function normString(s?: string | null): string | undefined {
  if (s == null) return undefined;
  const v = String(s).trim();
  return v ? v : undefined;
}

// Deterministic pseudo-random helpers for stable fake metrics
function seededRandom(key: string): number {
  let h = 2166136261 >>> 0; // FNV-1a 32-bit
  for (let i = 0; i < key.length; i++) {
    h ^= key.charCodeAt(i);
    h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24);
  }
  return (h >>> 0) / 0xffffffff; // [0,1)
}

function genRating(key: string): number {
  const r = seededRandom(key + ':rating');
  const val = 4.5 + (0.3 * r); // 4.5..4.8
  return Math.round(val * 10) / 10;
}

function genStudents(key: string): number {
  const r = seededRandom(key + ':students');
  const min = 1000;
  const max = 80000;
  const val = Math.floor(min + (max - min) * Math.pow(r, 0.6));
  return Math.round(val / 10) * 10; // nice rounding
}

function extractUrl(url?: string | null): string | undefined {
  const raw = normString(url);
  if (!raw) return undefined;
  try {
    const u = new URL(raw);
    // Some affiliate links (e.g., LinkSynergy) wrap target in murl param
    const murl = u.searchParams.get('murl');
    if (murl) {
      const inner = new URL(decodeURIComponent(murl));
      return inner.toString();
    }
    return u.toString();
  } catch {
    return raw;
  }
}

function deriveCouponFromUrl(url?: string): string | undefined {
  if (!url) return undefined;
  try {
    const u = new URL(url);
    const code = u.searchParams.get('couponCode') || u.searchParams.get('coupon') || u.searchParams.get('coupon_code');
    if (code && code.trim()) return code.trim();
  } catch {}
  return undefined;
}

function deriveProviderFromUrl(url?: string): string | undefined {
  if (!url) return undefined;
  try {
    const u = new URL(url);
    const h = u.hostname.toLowerCase();
    if (h.includes('udemy.com')) return 'Udemy';
    if (h.includes('coursera.org')) return 'Coursera';
    if (h.includes('edx.org')) return 'edX';
    if (h.includes('skillshare.com')) return 'Skillshare';
    if (h.includes('udacity.com')) return 'Udacity';
    return undefined;
  } catch { return undefined; }
}

function mergeDeals(existing: Deal[], incoming: Deal[]): Deal[] {
  const byKey = new Map<string, Deal>();
  const keyOf = (d: Deal) => (d.slug && d.slug.trim()) || d.id;
  for (const d of existing) byKey.set(keyOf(d), d);
  for (const d of incoming) byKey.set(keyOf(d), { ...(byKey.get(keyOf(d)) || {} as Deal), ...d });
  return Array.from(byKey.values());
}

async function readExisting(): Promise<Deal[]> {
  try {
    const file = path.join(process.cwd(), 'data', 'deals.json');
    const buf = await fs.readFile(file, 'utf-8');
    const data = JSON.parse(buf);
    return Array.isArray(data) ? data as Deal[] : [];
  } catch {
    return [];
  }
}

async function writeDeals(all: Deal[]) {
  const dir = path.join(process.cwd(), 'data');
  const file = path.join(dir, 'deals.json');
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(file, JSON.stringify(all, null, 2), 'utf-8');
}

async function importPage(page: number): Promise<Deal[]> {
  const url = `${base.replace(/\/$/, '')}/wp-json/coursespeak/v1/posts?per_page=${perPage}&page=${page}`;
  const data = await fetchJson(url) as {
    items: any[];
    page: number;
    per_page: number;
    total: number;
    totalPages: number;
  };

  const incoming: Deal[] = [];
  for (const it of data.items) {
    const title = normString(it.title) || 'Untitled';
    const slug = normString(it.slug);
    const description = normString(it.description);
    const image = normString(it.image);
    const contentHtml = String(it.content_html || '');
    const contentMd = turndown.turndown(contentHtml);

    const createdAt = toISO(it.createdAt);
    const updatedAt = toISO(it.updatedAt);

    const directUrl = extractUrl(it.url);
    const derivedCoupon = it.coupon ? String(it.coupon).trim() : (deriveCouponFromUrl(directUrl) || null);
    const provider = normString(it.provider) || deriveProviderFromUrl(directUrl) || 'Udemy';

    let priceNow = toPrice((it as any).price ?? (it as any).rehub_offer_product_price ?? (it as any).rehub_main_product_price);
    let priceOld = toPrice((it as any).originalPrice ?? (it as any).rehub_offer_product_price_old);
    // Defaults if missing per user's preference
    if (priceNow == null || priceNow === 0) priceNow = 9.99;
    if (priceOld == null || priceOld <= priceNow) priceOld = 119.99;

    const key = slug || String(it.id);
    const deal: Deal = {
      id: String(it.id),
      slug: slug,
      title,
      provider,
      price: priceNow ?? 0,
      url: directUrl || '#',
      category: normString(it.category),
      subcategory: normString(it.subcategory),
      expiresAt: toISO(it.expiresAt),
      image,
      description,
      content: contentMd,
      coupon: (derivedCoupon as any) ?? null,
      createdAt,
      updatedAt,
      originalPrice: priceOld,
      seoTitle: normString(it.seoTitle),
      seoDescription: normString(it.seoDescription),
      seoOgImage: normString(it.seoOgImage) || image,
    };

    // Populate rating/students if missing, deterministically
    if ((it as any).rating == null) {
      (deal as any).rating = genRating(key);
    }
    if ((it as any).students == null) {
      (deal as any).students = genStudents(key);
    }

    incoming.push(deal);
  }

  console.log(`Fetched page ${data.page}/${data.totalPages}, items=${data.items.length}`);
  return incoming;
}

async function run() {
  const allExisting = await readExisting();
  const firstPageUrl = `${base.replace(/\/$/, '')}/wp-json/coursespeak/v1/posts?per_page=${perPage}&page=1`;
  const first = await fetchJson(firstPageUrl) as any;
  const totalPages: number = first.totalPages || 1;

  let incoming: Deal[] = [];
  // process first page
  incoming = incoming.concat(await importPage(1));

  const lastPage = maxPages ? Math.min(maxPages, totalPages) : totalPages;
  for (let p = 2; p <= lastPage; p++) {
    incoming = incoming.concat(await importPage(p));
  }

  const merged = mergeDeals(allExisting, incoming);
  await writeDeals(merged);
  console.log(`Imported ${incoming.length} items. Merged total = ${merged.length}.`);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
