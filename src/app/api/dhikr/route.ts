import { NextResponse } from 'next/server';
import { dhikrService } from '@/src/features/dhikr/service/dhikr.service';

export async function GET() {
  try {
    const categories = dhikrService.getCategories();
    return NextResponse.json({ categories }, {
      headers: {
        'Cache-Control': 'public, max-age=86400, stale-while-revalidate=600'
      }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch dhikr categories' }, { status: 500 });
  }
}
export const dynamic = 'force-dynamic';
