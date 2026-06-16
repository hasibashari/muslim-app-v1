import { NextRequest, NextResponse } from 'next/server';
import { duaService } from '@/src/features/dua/service/dua.service';

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
    
    const categories = duaService.getCategories();
    const matchedCategory = categories.find(c => c.toLowerCase() === category.toLowerCase());
    
    if (!matchedCategory) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }
    
    const duas = duaService.getDuasByCategory(matchedCategory);
    return NextResponse.json({ category: matchedCategory, duas });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch duas' }, { status: 500 });
  }
}
export const dynamic = 'force-dynamic';
