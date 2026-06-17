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
  },
  getCategoryCounts: (): Record<string, number> => {
    const rows = db.prepare('SELECT category, COUNT(*) as count FROM dhikrs WHERE category IS NOT NULL GROUP BY category').all() as { category: string; count: number }[];
    const counts: Record<string, number> = {};
    rows.forEach(r => {
      counts[r.category] = r.count;
    });
    return counts;
  }
};
