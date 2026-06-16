export interface Surah {
  id: number;
  name_simple: string;
  name_arabic: string;
  translated_name: string;
  verses_count: number;
  revelation_place: string;
}

export interface Verse {
  id: number;
  surah_id: number;
  verse_number: number;
  text_arabic: string;
  text_translation: string;
}
