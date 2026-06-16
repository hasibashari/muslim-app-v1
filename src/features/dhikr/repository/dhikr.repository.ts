import { db } from '@/src/database/db';
import { Dhikr } from '../types';

export const dhikrRepository = {
  getAllDhikrs: (): Dhikr[] => {
    return db.prepare('SELECT * FROM dhikrs').all() as Dhikr[];
  },
  getCategories: (): string[] => {
    const rows = db.prepare('SELECT DISTINCT category FROM dhikrs').all() as { category: string }[];
    return rows.map(r => r.category);
  },
  getDhikrsByCategory: (category: string): Dhikr[] => {
    return db.prepare('SELECT * FROM dhikrs WHERE category = ?').all(category) as Dhikr[];
  }
};
