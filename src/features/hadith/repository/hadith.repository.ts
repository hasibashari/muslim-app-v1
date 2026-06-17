import { db } from '@/src/database/db';
import { HadithCollection, Hadith } from '../types';

export const hadithRepository = {
  getCollections: (): HadithCollection[] => {
    return db.prepare('SELECT * FROM hadith_collections').all() as HadithCollection[];
  },
  getHadithsByCollection: (collectionId: string): Hadith[] => {
    return db.prepare('SELECT * FROM hadiths WHERE collection_id = ?').all(collectionId) as Hadith[];
  },
  getHadithsByCollectionPaginated: (collectionId: string, page: number, limit: number): Hadith[] => {
    const offset = (page - 1) * limit;
    return db.prepare('SELECT * FROM hadiths WHERE collection_id = ? LIMIT ? OFFSET ?').all(collectionId, limit, offset) as Hadith[];
  }
};
