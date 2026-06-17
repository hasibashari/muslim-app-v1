import { quranRepository } from '../repository/quran.repository';
import { Surah, Verse } from '../types';

let cachedSurahs: Surah[] | null = null;

export const quranService = {
  getAllSurahs: (): Surah[] => {
    if (!cachedSurahs) {
      cachedSurahs = quranRepository.getAllSurahs();
    }
    return cachedSurahs;
  },
  getSurahById: (id: number): Surah | undefined => {
    if (isNaN(id) || id <= 0) return undefined;
    return quranRepository.getSurahById(id);
  },
  getVersesBySurahId: (surahId: number): Verse[] => {
    if (isNaN(surahId) || surahId <= 0) return [];
    return quranRepository.getVersesBySurahId(surahId);
  },
  searchSurahs: (query: string): Surah[] => {
    const trimmed = query.trim();
    if (!trimmed) return quranService.getAllSurahs();
    return quranRepository.searchSurahs(trimmed);
  }
};
