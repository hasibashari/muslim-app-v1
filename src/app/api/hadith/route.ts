import { NextResponse } from 'next/server';
import { hadithService } from '@/src/features/hadith/service/hadith.service';

export async function GET() {
  try {
    const collections = hadithService.getCollections();
    return NextResponse.json({ collections });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch hadith collections' }, { status: 500 });
  }
}
export const dynamic = 'force-dynamic';
