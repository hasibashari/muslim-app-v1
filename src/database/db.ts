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
      footnotes TEXT,
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
      id INTEGER PRIMARY KEY,
      category TEXT,
      title TEXT NOT NULL,
      text_arabic TEXT NOT NULL,
      text_translation TEXT NOT NULL,
      reference TEXT,
      latin TEXT
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
    const insertVerse = db.prepare('INSERT INTO verses (surah_id, verse_number, text_arabic, text_translation, footnotes) VALUES (?, ?, ?, ?, ?)');
    insertVerse.run(1, 1, 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ', 'In the name of Allah, the Entirely Merciful, the Especially Merciful.', null);
    insertVerse.run(1, 2, 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ', '[All] praise is [due] to Allah, Lord of the worlds -', null);
    insertVerse.run(1, 3, 'الرَّحْمَٰنِ الرَّحِيمِ', 'The Entirely Merciful, the Especially Merciful,', null);
    insertVerse.run(1, 4, 'مَالِكِ يَوْمِ الدِّينِ', 'Sovereign of the Day of Recompense.', null);
    insertVerse.run(1, 5, 'إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ', 'It is You we worship and You we ask for help.', null);
    insertVerse.run(1, 6, 'اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ', 'Guide us to the straight path -', null);
    insertVerse.run(1, 7, 'صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ', 'The path of those upon whom You have bestowed favor, not of those who have evoked [Your] anger or of those who are astray.', null);

    // Seed Hadith Collections
    const insertCollection = db.prepare('INSERT INTO hadith_collections (id, name, total_hadith) VALUES (?, ?, ?)');
    insertCollection.run('bukhari', 'Sahih al-Bukhari', 7563);
    insertCollection.run('muslim', 'Sahih Muslim', 3033);

    // Seed Hadiths
    const insertHadith = db.prepare('INSERT INTO hadiths (collection_id, hadith_number, text_arab, text_en) VALUES (?, ?, ?, ?)');
    insertHadith.run('bukhari', '1', 'إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ', 'The reward of deeds depends upon the intentions...');
    
    // Seed Duas from public/doa.json if it exists
    const doaJsonPath = path.join(process.cwd(), 'public', 'doa.json');
    if (fs.existsSync(doaJsonPath)) {
      const duasData = JSON.parse(fs.readFileSync(doaJsonPath, 'utf8'));
      const insertDua = db.prepare('INSERT INTO duas (id, category, title, text_arabic, text_translation, reference, latin) VALUES (?, ?, ?, ?, ?, ?, ?)');
      
      const getDuaCategory = (title: string): string => {
        const t = title.toLowerCase();
        if (t.includes('tidur') || t.includes('bangun')) return 'Tidur & Bangun';
        if (t.includes('wudhu') || t.includes('mandi') || t.includes('masjid') || t.includes('shalat') || t.includes('adzan')) return 'Bersuci & Shalat';
        if (t.includes('makan') || t.includes('minum') || t.includes('kenyang') || t.includes('lapar')) return 'Makan & Minum';
        if (t.includes('sakit') || t.includes('kematian') || t.includes('mati') || t.includes('jenazah') || t.includes('kubur')) return 'Kesehatan & Kematian';
        if (t.includes('hujan') || t.includes('petir') || t.includes('angin') || t.includes('awan')) return 'Alam & Hujan';
        if (t.includes('nikah') || t.includes('pengantin') || t.includes('jima') || t.includes('istri') || t.includes('suami')) return 'Pernikahan';
        if (t.includes('keluar') || t.includes('masuk') || t.includes('jalan') || t.includes('kendaraan') || t.includes('safar') || t.includes('musafir')) return 'Perjalanan & Safar';
        return 'Pilihan';
      };

      const transaction = db.transaction(() => {
        for (const d of duasData) {
          insertDua.run(
            d.id,
            getDuaCategory(d.title),
            d.title,
            d.arabic || '',
            d.translation || '',
            d.tentang || null,
            d.latin || null
          );
        }
      });
      transaction();
    }

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
