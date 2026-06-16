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
