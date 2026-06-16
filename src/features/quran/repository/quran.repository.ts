import { db } from '@/src/database/db';
import { Surah, Verse } from '../types';

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
