import { db } from '@/src/database/db';
import { Dua } from '../types';

export const duaRepository = {
  getAllDuas: (): Dua[] => {
    return db.prepare('SELECT * FROM duas').all() as Dua[];
  },
  getCategories: (): string[] => {
    const rows = db.prepare('SELECT DISTINCT category FROM duas').all() as { category: string }[];
    return rows.map(r => r.category);
  },
  getDuasByCategory: (category: string): Dua[] => {
    return db.prepare('SELECT * FROM duas WHERE category = ?').all(category) as Dua[];
  },
  getDuaById: (id: number): Dua | undefined => {
    return db.prepare('SELECT * FROM duas WHERE id = ?').get(id) as Dua | undefined;
  },
  getDuasPaginated: (page: number, limit: number, query?: string, category?: string): Dua[] => {
    const offset = (page - 1) * limit;
    
    let sql = 'SELECT * FROM duas';
    const params: any[] = [];
    const conditions: string[] = [];

    if (category && category.trim()) {
      conditions.push('category = ?');
      params.push(category.trim());
    }

    if (query && query.trim()) {
      conditions.push('(LOWER(title) LIKE ? OR LOWER(category) LIKE ? OR LOWER(text_translation) LIKE ?)');
      const sqlQuery = `%${query.trim().toLowerCase()}%`;
      params.push(sqlQuery, sqlQuery, sqlQuery);
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }

    sql += ' LIMIT ? OFFSET ?';
    params.push(limit, offset);

    return db.prepare(sql).all(...params) as Dua[];
  },
  getDuasCount: (query?: string, category?: string): number => {
    let sql = 'SELECT COUNT(*) as count FROM duas';
    const params: any[] = [];
    const conditions: string[] = [];

    if (category && category.trim()) {
      conditions.push('category = ?');
      params.push(category.trim());
    }

    if (query && query.trim()) {
      conditions.push('(LOWER(title) LIKE ? OR LOWER(category) LIKE ? OR LOWER(text_translation) LIKE ?)');
      const sqlQuery = `%${query.trim().toLowerCase()}%`;
      params.push(sqlQuery, sqlQuery, sqlQuery);
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }

    const row = db.prepare(sql).get(...params) as { count: number };
    return row.count;
  },
  getAdjacentDuas: (currentId: number): { prev?: { id: number; title: string }; next?: { id: number; title: string } } => {
    const prev = db.prepare('SELECT id, title FROM duas WHERE id < ? ORDER BY id DESC LIMIT 1').get(currentId) as { id: number; title: string } | undefined;
    const next = db.prepare('SELECT id, title FROM duas WHERE id > ? ORDER BY id ASC LIMIT 1').get(currentId) as { id: number; title: string } | undefined;
    return { prev, next };
  },
  getCategoryCounts: (): Record<string, number> => {
    const rows = db.prepare('SELECT category, COUNT(*) as count FROM duas WHERE category IS NOT NULL GROUP BY category').all() as { category: string; count: number }[];
    const counts: Record<string, number> = {};
    rows.forEach(r => {
      counts[r.category] = r.count;
    });
    return counts;
   }
};
