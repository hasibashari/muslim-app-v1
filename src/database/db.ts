import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// Since we are in AI Studio, we'll store the DB in /tmp or workspace root
const dbPath = path.join(process.cwd(), 'muslim_app.db');

export const db = new Database(dbPath);

// Create tables if they don't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS surahs (
    id INTEGER PRIMARY KEY,
    name_simple TEXT NOT NULL,
    name_arabic TEXT NOT NULL,
    translated_name TEXT NOT NULL,
    verses_count INTEGER NOT NULL,
    revelation_place TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS verses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    surah_id INTEGER NOT NULL,
    verse_number INTEGER NOT NULL,
    text_arabic TEXT NOT NULL,
    text_translation TEXT NOT NULL,
    FOREIGN KEY(surah_id) REFERENCES surahs(id)
  );

  CREATE TABLE IF NOT EXISTS hadith_collections (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    total_hadith INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS hadiths (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    collection_id TEXT NOT NULL,
    hadith_number TEXT NOT NULL,
    text_arab TEXT NOT NULL,
    text_en TEXT NOT NULL,
    FOREIGN KEY(collection_id) REFERENCES hadith_collections(id)
  );

  CREATE TABLE IF NOT EXISTS duas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    text_arabic TEXT NOT NULL,
    text_translation TEXT NOT NULL,
    reference TEXT
  );

  CREATE TABLE IF NOT EXISTS dhikrs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    text_arabic TEXT NOT NULL,
    text_translation TEXT NOT NULL,
    count INTEGER NOT NULL
  );
`);

// Seed initial data if empty
const surahCount = db.prepare('SELECT COUNT(*) as count FROM surahs').get() as { count: number };
if (surahCount.count === 0) {
  // Seed Surahs
  const insertSurah = db.prepare('INSERT INTO surahs (id, name_simple, name_arabic, translated_name, verses_count, revelation_place) VALUES (?, ?, ?, ?, ?, ?)');
  insertSurah.run(1, 'Al-Fatihah', 'الفاتحة', 'The Opening', 7, 'makkah');
  insertSurah.run(2, 'Al-Baqarah', 'البقرة', 'The Cow', 286, 'madinah');
  insertSurah.run(18, 'Al-Kahf', 'الكهف', 'The Cave', 110, 'makkah');

  // Seed Verses
  const insertVerse = db.prepare('INSERT INTO verses (surah_id, verse_number, text_arabic, text_translation) VALUES (?, ?, ?, ?)');
  insertVerse.run(1, 1, 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ', 'In the name of Allah, the Entirely Merciful, the Especially Merciful.');
  insertVerse.run(1, 2, 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ', '[All] praise is [due] to Allah, Lord of the worlds -');
  insertVerse.run(1, 3, 'الرَّحْمَٰنِ الرَّحِيمِ', 'The Entirely Merciful, the Especially Merciful,');
  insertVerse.run(1, 4, 'مَالِكِ يَوْمِ الدِّينِ', 'Sovereign of the Day of Recompense.');
  insertVerse.run(1, 5, 'إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ', 'It is You we worship and You we ask for help.');
  insertVerse.run(1, 6, 'اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ', 'Guide us to the straight path -');
  insertVerse.run(1, 7, 'صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ', 'The path of those upon whom You have bestowed favor, not of those who have evoked [Your] anger or of those who are astray.');

  // Seed Hadith Collections
  const insertCollection = db.prepare('INSERT INTO hadith_collections (id, name, total_hadith) VALUES (?, ?, ?)');
  insertCollection.run('bukhari', 'Sahih al-Bukhari', 7563);
  insertCollection.run('muslim', 'Sahih Muslim', 3033);

  // Seed Hadiths
  const insertHadith = db.prepare('INSERT INTO hadiths (collection_id, hadith_number, text_arab, text_en) VALUES (?, ?, ?, ?)');
  insertHadith.run('bukhari', '1', 'إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ', 'The reward of deeds depends upon the intentions...');
  
  // Seed Duas
  const insertDua = db.prepare('INSERT INTO duas (title, text_arabic, text_translation, reference) VALUES (?, ?, ?, ?)');
  insertDua.run('Before Sleeping', 'بِاسْمِكَ رَبِّـي وَضَعْـتُ جَنْـبي، وَبِكَ أَرْفَعُـه', 'In Your name, my Lord, I lay my side down, and by You I raise it up...', 'Al-Bukhari 11/126');
  insertDua.run('Waking Up', 'الْحَمْدُ للهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ', 'All praise is to Allah Who gave us life after He had caused us to die, and unto Him is the resurrection.', 'Al-Bukhari 11/113');

  // Seed Dhikrs
  const insertDhikr = db.prepare('INSERT INTO dhikrs (title, text_arabic, text_translation, count) VALUES (?, ?, ?, ?)');
  insertDhikr.run('SubhanAllah', 'سُبْحَانَ اللَّهِ', 'Glory be to Allah', 33);
  insertDhikr.run('Alhamdulillah', 'الْحَمْدُ لِلَّهِ', 'All praise is due to Allah', 33);
  insertDhikr.run('Allahu Akbar', 'اللَّهُ أَكْبَرُ', 'Allah is the Greatest', 34);
}
