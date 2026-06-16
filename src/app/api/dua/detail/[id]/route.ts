import { NextRequest, NextResponse } from 'next/server';
import { duaService } from '@/src/features/dua/service/dua.service';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const duaId = parseInt(resolvedParams.id, 10);
    
    if (isNaN(duaId) || duaId <= 0) {
      return NextResponse.json({ error: 'Invalid Supplication ID' }, { status: 400 });
    }
    
    const dua = duaService.getDuaById(duaId);
    if (!dua) {
      return NextResponse.json({ error: 'Supplication not found' }, { status: 404 });
    }
    
    return NextResponse.json({ dua });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch supplication' }, { status: 500 });
  }
}
export const dynamic = 'force-dynamic';
