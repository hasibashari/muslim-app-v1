import { MetadataRoute } from 'next';
import { quranService } from '@/src/features/quran/service/quran.service';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://muslim-app-v1.vercel.app';

  // Base routes
  const routes = [
    { url: `${baseUrl}`, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 1.0 },
    { url: `${baseUrl}/quran`, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 0.9 },
    { url: `${baseUrl}/hadith`, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 0.8 },
    { url: `${baseUrl}/dua`, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 0.8 },
    { url: `${baseUrl}/dhikr`, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 0.8 },
    { url: `${baseUrl}/profile`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.5 },
  ];

  try {
    // Quran Surah routes
    const surahs = quranService.getAllSurahs();
    const surahRoutes = surahs.map((surah) => ({
      url: `${baseUrl}/quran/${surah.id}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));
    routes.push(...surahRoutes);
  } catch (error) {
    console.error('Failed to generate dynamic Quran sitemap routes:', error);
  }

  // Hadith collections
  const hadithCollections = ['bukhari', 'muslim', 'abu-daud', 'ahmad', 'darimi', 'ibnu-majah', 'malik', 'nasai', 'tirmidzi'];
  const hadithRoutes = hadithCollections.map((col) => ({
    url: `${baseUrl}/hadith/${col}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }));
  routes.push(...hadithRoutes);

  // Dua categories
  const categories = ['Tidur & Bangun', 'Bersuci & Shalat', 'Makan & Minum', 'Kesehatan & Kematian', 'Alam & Hujan', 'Pernikahan', 'Perjalanan & Safar', 'Pilihan'];
  const duaRoutes = categories.map((cat) => ({
    url: `${baseUrl}/dua/category/${encodeURIComponent(cat)}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }));
  routes.push(...duaRoutes);

  return routes;
}
