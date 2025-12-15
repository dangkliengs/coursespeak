import { NextRequest, NextResponse } from 'next/server';
import { getDealById, updateDeal, deleteDeal } from '@/lib/store';
import { verifyAdminToken } from '@/lib/admin-auth';
import type { Deal } from '@/types/deal';

// Helper function to get token from request
function getToken(request: NextRequest): string | null {
  return (
    request.headers.get('x-admin-token') ||
    request.cookies.get('admin-token')?.value ||
    (request.headers.get('authorization') || '').replace('Bearer ', '').trim()
  );
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const deal = await getDealById(id);
    if (!deal) {
      return NextResponse.json({ error: 'Deal not found' }, { status: 404 });
    }
    
    // For public access, we don't require authentication
    return NextResponse.json(deal);
  } catch (error) {
    console.error('Error fetching deal:', error);
    return NextResponse.json(
      { error: 'Failed to fetch deal' }, 
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify admin token
    const token = getToken(request);
    if (!token || !verifyAdminToken(token)) {
      return NextResponse.json(
        { 
          error: 'Unauthorized: Invalid or missing admin token',
          code: 'UNAUTHORIZED'
        },
        { status: 401 }
      );
    }

    const body = await request.json();
    
    // Validate required fields
    if (!body.title || !body.provider) {
      return NextResponse.json(
        { error: 'Title and provider are required' },
        { status: 400 }
      );
    }

    const { id } = await params;
    const updatedDeal = await updateDeal(id, body);
    
    if (!updatedDeal) {
      return NextResponse.json(
        { error: 'Deal not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: updatedDeal,
      message: 'Deal updated successfully'
    });
  } catch (error) {
    console.error('Error updating deal:', error);
    return NextResponse.json(
      { 
        error: 'Failed to update deal',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify admin token
    const token = request.headers.get('x-admin-token');
    const expectedToken = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || '1983';
    
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized: No token provided. Please set your admin token in the headers.' },
        { status: 401 }
      );
    }
    
    if (token !== expectedToken) {
      console.error(`Token validation failed. Received: ${token}, Expected: ${expectedToken}`);
      return NextResponse.json(
        { error: 'Unauthorized: Invalid admin password' },
        { status: 401 }
      );
    }

    const { id } = await params;
    
    // First check if the deal exists
    const deal = await getDealById(id);
    if (!deal) {
      return NextResponse.json(
        { error: 'Deal not found' },
        { status: 404 }
      );
    }

    // Delete the deal (this function returns void)
    await deleteDeal(id);
    
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting deal:', error);
    return NextResponse.json(
      { 
        error: 'Failed to delete deal',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}