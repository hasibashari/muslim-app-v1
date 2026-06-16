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
  }
};
