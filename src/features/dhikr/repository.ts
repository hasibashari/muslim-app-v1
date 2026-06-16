import { db } from '@/src/database/db';

export interface Dhikr {
  id: number;
  title: string;
  text_arabic: string;
  text_translation: string;
  count: number;
}

export const dhikrRepository = {
  getAllDhikrs: (): Dhikr[] => {
    return db.prepare('SELECT * FROM dhikrs').all() as Dhikr[];
  }
};
