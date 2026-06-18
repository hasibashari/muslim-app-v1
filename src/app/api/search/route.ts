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
  const searchTerm = `%${query.toLowerCase()}%`;
  const limit = 5;

  try {
    // Search Surahs (by name or translated name)
    const surahRows = db
      .prepare(
        `SELECT id, name_simple, name_arabic, translated_name, revelation_place, verses_count
         FROM surahs
         WHERE LOWER(name_simple) LIKE ? OR LOWER(translated_name) LIKE ? OR LOWER(name_arabic) LIKE ?
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

    // Search Quran Verses (by translation only, grouped by surah to get diverse matches)
    const verseRows = db
      .prepare(
        `SELECT v.id, v.surah_id, v.verse_number, v.text_arabic, v.text_translation, s.name_simple as surah_name
         FROM verses v
         JOIN surahs s ON v.surah_id = s.id
         WHERE LOWER(v.text_translation) LIKE ?
         GROUP BY v.surah_id
         LIMIT ?`
      )
      .all(searchTerm, limit) as {
      id: number;
      surah_id: number;
      verse_number: number;
      text_arabic: string;
      text_translation: string;
      surah_name: string;
    }[];

    for (const v of verseRows) {
      const snippet = v.text_translation.length > 80 ? v.text_translation.slice(0, 80) + '...' : v.text_translation;
      results.push({
        type: 'surah',
        id: `verse_${v.surah_id}_${v.verse_number}`,
        title: `${v.surah_name} · Ayat ${v.verse_number}`,
        subtitle: snippet,
        href: `/quran/${v.surah_id}#verse-${v.verse_number}`,
      });
    }

    // Search Duas (by title or translation)
    const duaRows = db
      .prepare(
        `SELECT id, title, text_translation, category
         FROM duas
         WHERE LOWER(title) LIKE ? OR LOWER(text_translation) LIKE ? OR LOWER(latin) LIKE ?
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
         WHERE LOWER(title) LIKE ? OR LOWER(text_translation) LIKE ? OR LOWER(latin) LIKE ?
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
        `SELECT h.id, h.hadith_number, h.text_en, h.collection_id, c.name as collection_name,
                (SELECT COUNT(*) FROM hadiths h2 WHERE h2.collection_id = h.collection_id AND h2.id < h.id) as rank
         FROM hadiths h
         JOIN hadith_collections c ON h.collection_id = c.id
         WHERE LOWER(h.text_en) LIKE ? OR LOWER(h.text_arab) LIKE ?
         LIMIT ?`
      )
      .all(searchTerm, searchTerm, limit) as {
      id: number;
      hadith_number: string;
      text_en: string;
      collection_id: string;
      collection_name: string;
      rank: number;
    }[];

    for (const h of hadithRows) {
      const snippet = h.text_en.length > 80 ? h.text_en.slice(0, 80) + '...' : h.text_en;
      const rank = h.rank + 1; // 1-indexed position
      const page = Math.ceil(rank / 10); // 10 hadiths per page
      results.push({
        type: 'hadith',
        id: String(h.id),
        title: `Hadith #${h.hadith_number}`,
        subtitle: `${h.collection_name} · ${snippet}`,
        href: `/hadith/${h.collection_id}?page=${page}#hadith-${h.hadith_number}`,
      });
    }

    return NextResponse.json({ results, query });
  } catch (err) {
    console.error('[Search API] Error:', err);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}
