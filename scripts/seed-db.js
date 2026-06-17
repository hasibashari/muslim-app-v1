const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'muslim_app.db');
const db = new Database(dbPath);

console.log('Recreating tables...');
db.exec(`
  DROP TABLE IF EXISTS verses;
  DROP TABLE IF EXISTS surahs;
  DROP TABLE IF EXISTS hadiths;
  DROP TABLE IF EXISTS hadith_collections;
  DROP TABLE IF EXISTS dhikrs;
  DROP TABLE IF EXISTS duas;

  CREATE TABLE surahs (
    id INTEGER PRIMARY KEY,
    name_simple TEXT NOT NULL,
    name_arabic TEXT NOT NULL,
    translated_name TEXT NOT NULL,
    verses_count INTEGER NOT NULL,
    revelation_place TEXT NOT NULL
  );

  CREATE TABLE verses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    surah_id INTEGER NOT NULL,
    verse_number INTEGER NOT NULL,
    text_arabic TEXT NOT NULL,
    text_translation TEXT NOT NULL,
    FOREIGN KEY(surah_id) REFERENCES surahs(id)
  );

  CREATE TABLE hadith_collections (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    total_hadith INTEGER NOT NULL
  );

  CREATE TABLE hadiths (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    collection_id TEXT NOT NULL,
    hadith_number TEXT NOT NULL,
    text_arab TEXT NOT NULL,
    text_en TEXT NOT NULL,
    FOREIGN KEY(collection_id) REFERENCES hadith_collections(id)
  );

  CREATE TABLE duas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category TEXT NOT NULL,
    title TEXT NOT NULL,
    text_arabic TEXT NOT NULL,
    text_translation TEXT NOT NULL,
    reference TEXT
  );

  CREATE TABLE dhikrs (
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
`);

// 1. Surahs & Verses
const surahListPath = path.join(__dirname, '..', 'public', 'surah', 'surah-list.json');
const surahsData = JSON.parse(fs.readFileSync(surahListPath, 'utf8'));

console.log(`Inserting ${surahsData.length} surahs...`);

const insertSurah = db.prepare(`
  INSERT INTO surahs (id, name_simple, name_arabic, translated_name, verses_count, revelation_place)
  VALUES (?, ?, ?, ?, ?, ?)
`);

const insertVerse = db.prepare(`
  INSERT INTO verses (surah_id, verse_number, text_arabic, text_translation)
  VALUES (?, ?, ?, ?)
`);

db.transaction(() => {
  for (const surah of surahsData) {
    const revPlace = surah.location.toLowerCase().includes('mak') ? 'makkah' : 'madinah';
    insertSurah.run(
      surah.id,
      surah.transliteration,
      surah.arabic.trim(),
      surah.translation,
      surah.num_ayah,
      revPlace
    );

    const versesFilePath = path.join(__dirname, '..', 'public', 'surah', `${surah.id}.json`);
    if (fs.existsSync(versesFilePath)) {
      const versesData = JSON.parse(fs.readFileSync(versesFilePath, 'utf8'));
      for (const verse of versesData) {
        insertVerse.run(
          surah.id,
          verse.ayah,
          verse.arabic,
          verse.translation
        );
      }
    } else {
      console.warn(`Verses file not found for surah ${surah.id}`);
    }
  }
})();
console.log('Surahs and verses inserted successfully.');

// 2. Hadith Collections & Hadiths
console.log('Inserting Hadith collections and hadiths...');

const collectionsMap = {
  'abu-daud': 'Sunan Abu Dawud',
  'ahmad': 'Musnad Ahmad',
  'bukhari': 'Sahih al-Bukhari',
  'darimi': 'Sunan al-Darimi',
  'ibnu-majah': 'Sunan Ibn Majah',
  'malik': 'Muwatta Malik',
  'muslim': 'Sahih Muslim',
  'nasai': 'Sunan al-Nasa\'i',
  'tirmidzi': 'Jami\' al-Tirmidhi'
};

const insertCollection = db.prepare(`
  INSERT INTO hadith_collections (id, name, total_hadith)
  VALUES (?, ?, ?)
`);

const insertHadith = db.prepare(`
  INSERT INTO hadiths (collection_id, hadith_number, text_arab, text_en)
  VALUES (?, ?, ?, ?)
`);

for (const [id, name] of Object.entries(collectionsMap)) {
  const filePath = path.join(__dirname, '..', 'public', 'hadits', `${id}.json`);
  if (fs.existsSync(filePath)) {
    console.log(`Loading hadith data for ${id}...`);
    const hadithsData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const totalHadith = hadithsData.length;

    insertCollection.run(id, name, totalHadith);
    console.log(`Inserting ${totalHadith} hadiths for ${name}...`);

    db.transaction(() => {
      for (const item of hadithsData) {
        insertHadith.run(
          id,
          String(item.number),
          item.arab || '',
          item.id || ''
        );
      }
    })();
    console.log(`Hadiths for ${name} inserted.`);
  } else {
    console.warn(`Hadith file not found for ${id} at ${filePath}`);
  }
}

// 3. Dhikrs
console.log('Inserting Dhikrs...');

const insertDhikr = db.prepare(`
  INSERT INTO dhikrs (category, title, text_arabic, text_translation, reference, latin, read, benefit)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`);

// Dzikir Pagi
const pagiPath = path.join(__dirname, '..', 'public', 'dzikir', 'dzikir-pagi.json');
if (fs.existsSync(pagiPath)) {
  const pagiData = JSON.parse(fs.readFileSync(pagiPath, 'utf8'));
  const category = 'Dzikir Pagi';
  console.log(`Inserting ${pagiData.dzikir.length} items for Dzikir Pagi...`);
  db.transaction(() => {
    pagiData.dzikir.forEach((item, index) => {
      const title = `Dzikir Pagi ${index + 1}`;
      insertDhikr.run(
        category,
        title,
        item.arabic || '',
        item.translation || '',
        item.source || null,
        item.latin || null,
        item.read || null,
        item.benefit || null
      );
    });
  })();
}

// Dzikir Sore
const sorePath = path.join(__dirname, '..', 'public', 'dzikir', 'dzikir-sore.json');
if (fs.existsSync(sorePath)) {
  const soreData = JSON.parse(fs.readFileSync(sorePath, 'utf8'));
  const category = 'Dzikir Sore';
  console.log(`Inserting ${soreData.dzikir.length} items for Dzikir Sore...`);
  db.transaction(() => {
    soreData.dzikir.forEach((item, index) => {
      const title = `Dzikir Sore ${index + 1}`;
      insertDhikr.run(
        category,
        title,
        item.arabic || '',
        item.translation || '',
        item.source || null,
        item.latin || null,
        item.read || null,
        item.benefit || null
      );
    });
  })();
}

// After Prayer
console.log('Inserting After Prayer Dhikrs...');
db.transaction(() => {
  insertDhikr.run('After Prayer', 'SubhanAllah', 'سُبْحَانَ اللَّهِ', 'Glory be to Allah', '33 times - Muslim 1/418', null, 'Dibaca 33x', null);
  insertDhikr.run('After Prayer', 'Alhamdulillah', 'الْحَمْدُ لِلَّهِ', 'All praise is due to Allah', '33 times - Muslim 1/418', null, 'Dibaca 33x', null);
  insertDhikr.run('After Prayer', 'Allahu Akbar', 'اللَّهُ أَكْبَرُ', 'Allah is the Greatest', '34 times - Muslim 1/418', null, 'Dibaca 34x', null);
})();

// 4. Duas
console.log('Inserting Duas...');
const insertDua = db.prepare(`
  INSERT INTO duas (category, title, text_arabic, text_translation, reference)
  VALUES (?, ?, ?, ?, ?)
`);

db.transaction(() => {
  insertDua.run('Daily', 'Before Sleeping', 'بِاسْمِكَ رَبِّـي وَضَعْـتُ جَنْـبي، وَبِكَ أَرْفَعُـه', 'In Your name, my Lord, I lay my side down, and by You I raise it up...', 'Al-Bukhari 11/126');
  insertDua.run('Daily', 'Waking Up', 'الْحَمْدُ للهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ', 'All praise is to Allah Who gave us life after He had caused us to die, and unto Him is the resurrection.', 'Al-Bukhari 11/113');
  insertDua.run('Food and Drink', 'Before Eating', 'بِسْمِ اللَّهِ', 'In the name of Allah.', 'Abu Dawud 3/347');
  insertDua.run('Food and Drink', 'After Eating', 'الْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنِي هَذَا وَرَزَقَنِيهِ مِنْ غَيْرِ حَوْلٍ مِنِّي وَلَا قُوَّةٍ', 'All praise is to Allah Who has fed me this and provided it for me without any strength or power on my part.', 'Abu Dawud 4023');
  insertDua.run('Travel', 'Boarding a Vehicle', 'سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ', 'Glory is to Him Who has provided this for us though we could never have had it by our efforts.', 'Abu Dawud 3/34');
})();

console.log('Database seeding completed successfully!');
db.close();
