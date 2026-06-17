import { quranService } from "@/src/features/quran/service/quran.service";
import { QuranPageClient } from "@/src/features/quran/components/QuranPageClient";

export default function QuranPage() {
  const surahs = quranService.getAllSurahs();

  return <QuranPageClient surahs={surahs} />;
}
