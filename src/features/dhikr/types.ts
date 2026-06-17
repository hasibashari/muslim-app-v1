export interface Dhikr {
  id: number;
  category: string;
  title: string;
  text_arabic: string;
  text_translation: string;
  reference: string | null;
  latin: string | null;
  read: string | null;
  benefit: string | null;
}
