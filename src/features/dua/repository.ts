import { db } from '@/src/database/db';

export interface Dua {
  id: number;
  title: string;
  text_arabic: string;
  text_translation: string;
  reference: string | null;
}

export const duaRepository = {
  getAllDuas: (): Dua[] => {
    return db.prepare('SELECT * FROM duas').all() as Dua[];
  }
};
