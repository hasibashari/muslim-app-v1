import { hadithRepository } from '../repository/hadith.repository';
import { HadithCollection, Hadith } from '../types';

export const hadithService = {
  getCollections: (): HadithCollection[] => {
    return hadithRepository.getCollections();
  },
  getHadithsByCollection: (collectionId: string): Hadith[] => {
    const trimmed = collectionId.trim();
    if (!trimmed) return [];
    return hadithRepository.getHadithsByCollection(trimmed);
  }
};
