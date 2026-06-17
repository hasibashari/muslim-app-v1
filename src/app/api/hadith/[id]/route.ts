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
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10) || 1;
    const limit = parseInt(searchParams.get('limit') || '50', 10) || 50;

    const collections = hadithService.getCollections();
    const collection = collections.find(c => c.id === collectionId);
    
    if (!collection) {
      return NextResponse.json({ error: 'Collection not found' }, { status: 404 });
    }
    
    const hadiths = hadithService.getHadithsByCollectionPaginated(collectionId, page, limit);
    const total = collection.total_hadith;
    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({ 
      collection, 
      hadiths,
      pagination: {
        page,
        limit,
        total,
        totalPages
      }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch hadiths' }, { status: 500 });
  }
}
export const dynamic = 'force-dynamic';
