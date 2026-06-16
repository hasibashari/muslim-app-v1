import { NextRequest, NextResponse } from 'next/server';
import { hadithService } from '@/src/features/hadith/service/hadith.service';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const collectionId = resolvedParams.id;
    
    if (!collectionId) {
      return NextResponse.json({ error: 'Invalid Collection ID' }, { status: 400 });
    }
    
    const collections = hadithService.getCollections();
    const collection = collections.find(c => c.id === collectionId);
    
    if (!collection) {
      return NextResponse.json({ error: 'Collection not found' }, { status: 404 });
    }
    
    const hadiths = hadithService.getHadithsByCollection(collectionId);
    return NextResponse.json({ collection, hadiths });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch hadiths' }, { status: 500 });
  }
}
export const dynamic = 'force-dynamic';
