import { NextRequest, NextResponse } from 'next/server';
import { quranService } from '@/src/features/quran/service/quran.service';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const surahId = parseInt(resolvedParams.id, 10);
    
    if (isNaN(surahId) || surahId <= 0) {
      return NextResponse.json({ error: 'Invalid Surah ID' }, { status: 400 });
    }
    
    const surah = quranService.getSurahById(surahId);
    if (!surah) {
      return NextResponse.json({ error: 'Surah not found' }, { status: 404 });
    }
    
    const verses = quranService.getVersesBySurahId(surahId);
    return NextResponse.json({ surah, verses });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch surah details' }, { status: 500 });
  }
}
export const dynamic = 'force-dynamic';
