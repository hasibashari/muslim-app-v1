import { quranRepository } from '../repository/quran.repository';
import { Surah, Verse } from '../types';

export const quranService = {
  getAllSurahs: (): Surah[] => {
    return quranRepository.getAllSurahs();
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
    if (!trimmed) return quranRepository.getAllSurahs();
    return quranRepository.searchSurahs(trimmed);
  }
};
