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
  },
  getHadithsByCollectionSearchPaginated: (collectionId: string, query: string, page: number, limit: number): Hadith[] => {
    const trimmedCollection = collectionId.trim();
    const trimmedQuery = query.trim();
    if (!trimmedCollection) return [];
    if (!trimmedQuery) {
      return hadithRepository.getHadithsByCollectionPaginated(trimmedCollection, page, limit);
    }
    const sanitizedPage = Math.max(1, page);
    const sanitizedLimit = Math.max(1, limit);
    return hadithRepository.getHadithsByCollectionSearchPaginated(trimmedCollection, trimmedQuery, sanitizedPage, sanitizedLimit);
  },
  getHadithsByCollectionSearchCount: (collectionId: string, query: string): number => {
    const trimmedCollection = collectionId.trim();
    const trimmedQuery = query.trim();
    if (!trimmedCollection) return 0;
    if (!trimmedQuery) {
      const collections = hadithRepository.getCollections();
      const collection = collections.find(c => c.id === trimmedCollection);
      return collection?.total_hadith || 0;
    }
    return hadithRepository.getHadithsByCollectionSearchCount(trimmedCollection, trimmedQuery);
  }
};
