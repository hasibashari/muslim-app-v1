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
  },
  getHadithsByCollectionPaginated: (collectionId: string, page: number, limit: number): Hadith[] => {
    const trimmed = collectionId.trim();
    if (!trimmed) return [];
    const sanitizedPage = Math.max(1, page);
    const sanitizedLimit = Math.max(1, limit);
    return hadithRepository.getHadithsByCollectionPaginated(trimmed, sanitizedPage, sanitizedLimit);
  }
};
