import { db } from '@/src/database/db';

export interface HadithCollection {
  id: string;
  name: string;
  total_hadith: number;
}

export interface Hadith {
  id: number;
  collection_id: string;
  hadith_number: string;
  text_arab: string;
  text_en: string;
}

export const hadithRepository = {
  getCollections: (): HadithCollection[] => {
    return db.prepare('SELECT * FROM hadith_collections').all() as HadithCollection[];
  },
  getHadithsByCollection: (collectionId: string): Hadith[] => {
    return db.prepare('SELECT * FROM hadiths WHERE collection_id = ?').all(collectionId) as Hadith[];
  }
};
