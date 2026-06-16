import { NextRequest, NextResponse } from 'next/server';
import { quranService } from '@/src/features/quran/service/quran.service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || searchParams.get('query') || '';
    
    const surahs = quranService.searchSurahs(query);
    return NextResponse.json({ surahs });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch surahs' }, { status: 500 });
  }
}
export const dynamic = 'force-dynamic';
