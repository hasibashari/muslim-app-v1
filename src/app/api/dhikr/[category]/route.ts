import { NextRequest, NextResponse } from 'next/server';
import { dhikrService } from '@/src/features/dhikr/service/dhikr.service';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ category: string }> }
) {
  try {
    const resolvedParams = await params;
    const category = decodeURIComponent(resolvedParams.category);
    
    if (!category) {
      return NextResponse.json({ error: 'Category parameter is required' }, { status: 400 });
    }
    
    const categories = dhikrService.getCategories();
    const matchedCategory = categories.find(c => c.toLowerCase() === category.toLowerCase());
    
    if (!matchedCategory) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }
    
    const dhikrs = dhikrService.getDhikrsByCategory(matchedCategory);
    return NextResponse.json({ category: matchedCategory, dhikrs }, {
      headers: {
        'Cache-Control': 'public, max-age=86400, stale-while-revalidate=600'
      }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch dhikrs' }, { status: 500 });
  }
}
export const dynamic = 'force-dynamic';
