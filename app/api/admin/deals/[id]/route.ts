import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getDealById, updateDeal, deleteDeal } from '@/lib/store';
import { adminAuthMiddleware } from '@/lib/admin-auth';

type ApiResponse = {
  success: boolean;
  data?: any;
  error?: string;
  details?: string;
}

const handleApiError = (error: unknown, context: string): NextResponse => {
  console.error(`Error in ${context}:`, error);
  const message = error instanceof Error ? error.message : 'An unknown error occurred';
  return NextResponse.json(
    { success: false, error: 'Operation failed', details: message },
    { status: 500 }
  );
};

// GET handler
async function handleGet(
  request: NextRequest, 
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params;
    const deal = await getDealById(id);
    
    if (!deal) {
      return NextResponse.json(
        { success: false, error: 'Deal not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data: deal });
  } catch (error) {
    return handleApiError(error, 'GET /api/admin/deals/[id]');
  }
}

// PATCH handler
async function handlePatch(
  request: NextRequest, 
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params;
    const body = await request.json();
    
    if (!body || typeof body !== 'object' || Object.keys(body).length === 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid or empty request body' },
        { status: 400 }
      );
    }
    
    const updatedDeal = await updateDeal(id, body);
    
    if (!updatedDeal) {
      return NextResponse.json(
        { success: false, error: 'Deal not found' },
        { status: 404 }
      );
    }

    // Revalidate relevant paths
    revalidatePath(`/deal/${updatedDeal.slug || updatedDeal.id}`);
    revalidatePath('/');
    revalidatePath('/admin/deals');
    revalidatePath('/api/deals'); // Revalidate public API
    
    return NextResponse.json({
      success: true,
      data: updatedDeal
    });
  } catch (error) {
    return handleApiError(error, 'PATCH /api/admin/deals/[id]');
  }
}

// DELETE handler
async function handleDelete(
  request: NextRequest, 
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params;
    const deal = await getDealById(id);
    if (!deal) {
      return NextResponse.json(
        { success: false, error: 'Deal not found' },
        { status: 404 }
      );
    }
    
    await deleteDeal(id);
    revalidatePath('/');
    revalidatePath('/api/deals'); // Revalidate public API

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return handleApiError(error, 'DELETE /api/admin/deals/[id]');
  }
}

// Export handlers with authentication middleware
export const GET = adminAuthMiddleware(handleGet);
export const PATCH = adminAuthMiddleware(handlePatch);
export const DELETE = adminAuthMiddleware(handleDelete);