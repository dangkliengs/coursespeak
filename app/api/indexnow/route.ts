import { NextResponse } from 'next/server';
import { indexNowSubmit } from '@/lib/indexnow';
import { readDeals } from '@/lib/store';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    const base = (process.env.NEXT_PUBLIC_SITE_URL || 'https://coursespeak.com').replace(/\/$/, '');

    const coreUrls = [
      `${base}/`,
      `${base}/udemy-coupons`,
      `${base}/search`,
      `${base}/categories`,
    ];

    // Add up to 50 most recent deal URLs
    const deals = (await readDeals()) || [];
    deals.sort((a, b) => new Date(b.updatedAt || b.createdAt || 0).getTime() - new Date(a.updatedAt || a.createdAt || 0).getTime());
    const dealUrls = deals.slice(0, 50).map(d => `${base}/deal/${d.slug || d.id}`);

    const urlList = [...coreUrls, ...dealUrls];

    const key = process.env.INDEXNOW_KEY || '3d8f5a7b2c1e4f9aa6b0d3c58e1f24a7';
    const keyLocation = `${base}/3d8f5a7b2c1e4f9aa6b0d3c58e1f24a7.txt`;

    const res = await indexNowSubmit({ host: new URL(base).host, key, keyLocation, urlList });

    return NextResponse.json({ success: res.ok, status: res.status, body: res.body, submitted: urlList.length });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e?.message || 'Unknown error' }, { status: 500 });
  }
}
