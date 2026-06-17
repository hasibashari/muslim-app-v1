import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/src/database/db';

export interface SearchResult {
  type: 'surah' | 'hadith' | 'dua' | 'dhikr';
  id: string;
  title: string;
  subtitle: string;
  href: string;
  arabic?: string;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q')?.trim();

  if (!query || query.length < 2) {
    return NextResponse.json({ results: [] });
  }

  const results: SearchResult[] = [];
  const searchTerm = `%${query}%`;
  const limit = 5;

  try {
    // Search Surahs (by name or translated name)
    const surahRows = db
      .prepare(
        `SELECT id, name_simple, name_arabic, translated_name, revelation_place, verses_count
         FROM surahs
         WHERE name_simple LIKE ? OR translated_name LIKE ? OR name_arabic LIKE ?
         LIMIT ?`
      )
      .all(searchTerm, searchTerm, searchTerm, limit) as {
      id: number;
      name_simple: string;
      name_arabic: string;
      translated_name: string;
      revelation_place: string;
      verses_count: number;
    }[];

    for (const s of surahRows) {
      results.push({
        type: 'surah',
        id: String(s.id),
        title: s.name_simple,
        subtitle: `${s.translated_name} · ${s.verses_count} Verses · ${s.revelation_place}`,
        href: `/quran/${s.id}`,
        arabic: s.name_arabic,
      });
    }

    // Search Duas (by title or translation)
    const duaRows = db
      .prepare(
        `SELECT id, title, text_translation, category
         FROM duas
         WHERE title LIKE ? OR text_translation LIKE ? OR latin LIKE ?
         LIMIT ?`
      )
      .all(searchTerm, searchTerm, searchTerm, limit) as {
      id: number;
      title: string;
      text_translation: string;
      category: string;
    }[];

    for (const d of duaRows) {
      results.push({
        type: 'dua',
        id: String(d.id),
        title: d.title,
        subtitle: d.category || 'Dua',
        href: `/dua/detail/${d.id}`,
      });
    }

    // Search Dhikr (by title or translation)
    const dhikrRows = db
      .prepare(
        `SELECT id, title, category, text_translation
         FROM dhikrs
         WHERE title LIKE ? OR text_translation LIKE ? OR latin LIKE ?
         LIMIT ?`
      )
      .all(searchTerm, searchTerm, searchTerm, limit) as {
      id: number;
      title: string;
      category: string;
      text_translation: string;
    }[];

    for (const d of dhikrRows) {
      results.push({
        type: 'dhikr',
        id: String(d.id),
        title: d.title,
        subtitle: `${d.category} Dhikr`,
        href: `/dhikr/${d.category.toLowerCase()}`,
      });
    }

    // Search Hadiths (by text)
    const hadithRows = db
      .prepare(
        `SELECT h.id, h.hadith_number, h.text_en, h.collection_id, c.name as collection_name
         FROM hadiths h
         JOIN hadith_collections c ON h.collection_id = c.id
         WHERE h.text_en LIKE ? OR h.text_arab LIKE ?
         LIMIT ?`
      )
      .all(searchTerm, searchTerm, limit) as {
      id: number;
      hadith_number: string;
      text_en: string;
      collection_id: string;
      collection_name: string;
    }[];

    for (const h of hadithRows) {
      const snippet = h.text_en.length > 80 ? h.text_en.slice(0, 80) + '...' : h.text_en;
      results.push({
        type: 'hadith',
        id: String(h.id),
        title: `Hadith #${h.hadith_number}`,
        subtitle: `${h.collection_name} · ${snippet}`,
        href: `/hadith/${h.collection_id}`,
      });
    }

    return NextResponse.json({ results, query });
  } catch (err) {
    console.error('[Search API] Error:', err);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}
