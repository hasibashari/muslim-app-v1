import { db } from '@/src/database/db';

export interface Surah {
  id: number;
  name_simple: string;
  name_arabic: string;
  translated_name: string;
  verses_count: number;
  revelation_place: string;
}

export interface Verse {
  id: number;
  surah_id: number;
  verse_number: number;
  text_arabic: string;
  text_translation: string;
}

export const quranRepository = {
  getAllSurahs: (): Surah[] => {
    return db.prepare('SELECT * FROM surahs ORDER BY id ASC').all() as Surah[];
  },
  getSurahById: (id: number): Surah | undefined => {
    return db.prepare('SELECT * FROM surahs WHERE id = ?').get(id) as Surah | undefined;
  },
  getVersesBySurahId: (surahId: number): Verse[] => {
    return db.prepare('SELECT * FROM verses WHERE surah_id = ? ORDER BY verse_number ASC').all(surahId) as Verse[];
  },
  searchSurahs: (query: string): Surah[] => {
    return db.prepare('SELECT * FROM surahs WHERE name_simple LIKE ? OR translated_name LIKE ?').all(`%${query}%`, `%${query}%`) as Surah[];
  }
};
