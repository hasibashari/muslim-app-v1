import { NextResponse } from 'next/server';
import { duaService } from '@/src/features/dua/service/dua.service';

export async function GET() {
  try {
    const categories = duaService.getCategories();
    return NextResponse.json({ categories }, {
      headers: {
        'Cache-Control': 'public, max-age=86400, stale-while-revalidate=600'
      }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch dua categories' }, { status: 500 });
  }
}
export const dynamic = 'force-dynamic';
