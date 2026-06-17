import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

let _dbInstance: Database.Database | null = null;

export function getDb(): Database.Database {
  if (_dbInstance) return _dbInstance;

  const dbPath = path.join(process.cwd(), 'muslim_app.db');
  const db = new Database(dbPath);

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
      category TEXT NOT NULL,
      title TEXT NOT NULL,
      text_arabic TEXT NOT NULL,
      text_translation TEXT NOT NULL,
      reference TEXT
    );

    CREATE TABLE IF NOT EXISTS dhikrs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category TEXT NOT NULL,
      title TEXT NOT NULL,
      text_arabic TEXT NOT NULL,
      text_translation TEXT NOT NULL,
      reference TEXT,
      latin TEXT,
      read TEXT,
      benefit TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_verses_surah_id ON verses(surah_id);
    CREATE INDEX IF NOT EXISTS idx_hadiths_collection_id ON hadiths(collection_id);
    CREATE INDEX IF NOT EXISTS idx_dhikrs_category ON dhikrs(category);

    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      name TEXT,
      avatar_url TEXT,
      google_id TEXT UNIQUE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS user_bookmarks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      item_type TEXT NOT NULL,
      item_id TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(user_id, item_type, item_id)
    );

    CREATE INDEX IF NOT EXISTS idx_user_bookmarks_user_id ON user_bookmarks(user_id);
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
    const insertDua = db.prepare('INSERT INTO duas (category, title, text_arabic, text_translation, reference) VALUES (?, ?, ?, ?, ?)');
    insertDua.run('Daily', 'Before Sleeping', 'بِاسْمِكَ رَبِّـي وَضَعْـتُ جَنْـبي، وَبِكَ أَرْفَعُـه', 'In Your name, my Lord, I lay my side down, and by You I raise it up...', 'Al-Bukhari 11/126');
    insertDua.run('Daily', 'Waking Up', 'الْحَمْدُ للهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ', 'All praise is to Allah Who gave us life after He had caused us to die, and unto Him is the resurrection.', 'Al-Bukhari 11/113');
    insertDua.run('Food and Drink', 'Before Eating', 'بِسْمِ اللَّهِ', 'In the name of Allah.', 'Abu Dawud 3/347');
    insertDua.run('Food and Drink', 'After Eating', 'الْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنِي هَذَا وَرَزَقَنِيهِ مِنْ غَيْرِ حَوْلٍ مِنِّي وَلَا قُوَّةٍ', 'All praise is to Allah Who has fed me this and provided it for me without any strength or power on my part.', 'Abu Dawud 4023');
    insertDua.run('Travel', 'Boarding a Vehicle', 'سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ', 'Glory is to Him Who has provided this for us though we could never have had it by our efforts.', 'Abu Dawud 3/34');

    // Seed Dhikrs
    const insertDhikr = db.prepare('INSERT INTO dhikrs (category, title, text_arabic, text_translation, reference) VALUES (?, ?, ?, ?, ?)');
    
    // Morning categories
    insertDhikr.run('Morning', 'Morning Adhkar 1', 'أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ', 'We have reached the morning and at this very time unto Allah belongs all sovereignty...', 'Muslim 4/2088');
    insertDhikr.run('Morning', 'SubhanAllah', 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ', 'Glory is to Allah and praise is to Him.', '100 times - Bukhari 11/168');
    
    // Evening categories
    insertDhikr.run('Evening', 'Evening Adhkar 1', 'أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ', 'We have reached the evening and at this very time unto Allah belongs all sovereignty...', 'Muslim 4/2088');
    
    // After Prayer categories
    insertDhikr.run('After Prayer', 'SubhanAllah', 'سُبْحَانَ اللَّهِ', 'Glory be to Allah', '33 times - Muslim 1/418');
    insertDhikr.run('After Prayer', 'Alhamdulillah', 'الْحَمْدُ لِلَّهِ', 'All praise is due to Allah', '33 times - Muslim 1/418');
    insertDhikr.run('After Prayer', 'Allahu Akbar', 'اللَّهُ أَكْبَرُ', 'Allah is the Greatest', '34 times - Muslim 1/418');
  }

  _dbInstance = db;
  return db;
}

export const db: Database.Database = new Proxy({} as Database.Database, {
  get(target, prop) {
    return (getDb() as any)[prop];
  }
});
