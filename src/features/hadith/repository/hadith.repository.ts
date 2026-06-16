import { db } from '@/src/database/db';
import { HadithCollection, Hadith } from '../types';

export const hadithRepository = {
  getCollections: (): HadithCollection[] => {
    return db.prepare('SELECT * FROM hadith_collections').all() as HadithCollection[];
  },
  getHadithsByCollection: (collectionId: string): Hadith[] => {
    return db.prepare('SELECT * FROM hadiths WHERE collection_id = ?').all(collectionId) as Hadith[];
  }
};
