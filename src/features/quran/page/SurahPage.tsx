import { quranService } from "@/src/features/quran/service/quran.service";
import { notFound } from "next/navigation";
import { SurahPageClient } from "../components/SurahPageClient";

export default async function SurahPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const surahId = parseInt(resolvedParams.id, 10);
  const surah = quranService.getSurahById(surahId);
  const verses = quranService.getVersesBySurahId(surahId);

  if (!surah) {
    notFound();
  }

  return <SurahPageClient surah={surah} verses={verses} />;
}

