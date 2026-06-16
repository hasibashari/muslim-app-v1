import { NextResponse } from 'next/server';
import { dhikrRepository } from '@/src/features/dhikr/repository';

export async function GET() {
  const dhikrs = dhikrRepository.getAllDhikrs();
  return NextResponse.json(dhikrs);
}
