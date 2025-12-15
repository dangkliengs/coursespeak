import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createDeal, readDeals } from "@/lib/store";
import type { Deal } from "@/types/deal";
import { requireAdmin } from "@/lib/auth";
import { revalidatePath } from "next/cache";

function unauthorizedResponse(message = "Unauthorized") {
  return NextResponse.json({ message }, { status: 401 });
}

export async function GET(req: NextRequest) {
  try {
    requireAdmin(req);
  } catch (e: any) {
    return unauthorizedResponse(e?.message);
  }

  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").toLowerCase();
  const page = Math.max(1, Number(searchParams.get("page") || 1));
  const pageSize = Math.min(100, Math.max(1, Number(searchParams.get("pageSize") || 20)));

  try {
    // Make admin API call the same public API that serves the live site
    // This ensures admin sees exactly what homepage shows
    const protocol = req.headers.get('x-forwarded-proto') || 'http';
    const host = req.headers.get('host') || 'localhost:3000';
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || `${protocol}://${host}`;
    const apiUrl = `${baseUrl}/api/deals?page=${page}&pageSize=${pageSize}${q ? `&q=${encodeURIComponent(q)}` : ""}`;

    console.log(`Admin API: Fetching from public API: ${apiUrl}`);

    const response = await fetch(apiUrl, {
      headers: {
        'Authorization': req.headers.get('authorization') || '',
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Public API returned ${response.status}`);
    }

    const data = await response.json();
    console.log(`Admin API: Got ${data.items?.length || 0} deals from public API`);

    return NextResponse.json(data);

  } catch (error) {
    console.error("Error in admin API:", error);
    return NextResponse.json(
      {
        items: [],
        total: 0,
        page: 1,
        pageSize: 20,
        totalPages: 0,
        error: "Failed to load deals. Please try again later."
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    requireAdmin(req);
  } catch (e: any) {
    return unauthorizedResponse(e?.message);
  }

  let body: Partial<Deal>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON" }, { status: 400 });
  }

  const nowId = Date.now().toString();
  const id = (body.id && String(body.id)) || nowId;

  try {
    const deal = {
      id,
      slug: body.slug || body.title?.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') || 'deal',
      title: body.title || 'Untitled Deal',
      provider: body.provider || 'Unknown',
      price: body.price != null ? Number(body.price) : 0,
      url: body.url || '#',
      category: body.category || 'General',
      subcategory: body.subcategory || undefined,
      image: body.image || undefined,
      description: body.description || undefined,
      content: body.content || undefined,
      coupon: body.coupon || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      // Add other fields as needed
    };

    const created = await createDeal(deal);
    revalidatePath('/');  // Clear cache
    revalidatePath('/admin/deals');  // Clear admin cache
    revalidatePath('/api/deals');  // Clear public API cache
    return NextResponse.json({ success: true, data: created });
  } catch (error: any) {
    console.error('Error creating deal:', error);
    return NextResponse.json({ message: error?.message || "Failed to create deal" }, { status: 500 });
  }
}
