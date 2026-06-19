import { db } from '@/src/database/db';
import { HadithCollection, Hadith } from '../types';
import { parseSearchQuery } from '@/src/shared/utils/search';

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
  },
  getHadithsByCollectionSearchPaginated: (collectionId: string, query: string, page: number, limit: number): Hadith[] => {
    const offset = (page - 1) * limit;
    const { cleanQuery, isNumeric } = parseSearchQuery(query);

    if (isNumeric) {
      return db.prepare(
        `SELECT * FROM hadiths 
         WHERE collection_id = ? 
           AND (hadith_number = ? OR hadith_number LIKE ?)
         ORDER BY (hadith_number = ?) DESC, CAST(hadith_number AS INTEGER) ASC, id ASC
         LIMIT ? OFFSET ?`
      ).all(collectionId, cleanQuery, cleanQuery + '%', cleanQuery, limit, offset) as Hadith[];
    } else {
      const likeQuery = `%${query}%`;
      return db.prepare(
        `SELECT * FROM hadiths 
         WHERE collection_id = ? 
           AND (LOWER(text_en) LIKE ? OR LOWER(text_arab) LIKE ?)
         LIMIT ? OFFSET ?`
      ).all(collectionId, likeQuery, likeQuery, limit, offset) as Hadith[];
    }
  },
  getHadithsByCollectionSearchCount: (collectionId: string, query: string): number => {
    const { cleanQuery, isNumeric } = parseSearchQuery(query);

    if (isNumeric) {
      const result = db.prepare(
        `SELECT COUNT(*) as count FROM hadiths 
         WHERE collection_id = ? 
           AND (hadith_number = ? OR hadith_number LIKE ?)`
      ).get(collectionId, cleanQuery, cleanQuery + '%') as { count: number };
      return result?.count || 0;
    } else {
      const likeQuery = `%${query}%`;
      const result = db.prepare(
        `SELECT COUNT(*) as count FROM hadiths 
         WHERE collection_id = ? 
           AND (LOWER(text_en) LIKE ? OR LOWER(text_arab) LIKE ?)`
      ).get(collectionId, likeQuery, likeQuery) as { count: number };
      return result?.count || 0;
    }
  }
};
