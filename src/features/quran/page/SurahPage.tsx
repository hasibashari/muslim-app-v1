import { quranService } from "@/src/features/quran/service/quran.service";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { LastReadTracker } from "@/src/features/quran/components/LastReadTracker";

export default async function SurahPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const surahId = parseInt(resolvedParams.id, 10);
  const surah = quranService.getSurahById(surahId);
  const verses = quranService.getVersesBySurahId(surahId);

  if (!surah) {
    notFound();
  }

  return (
    <div className="p-6 md:p-10 w-full max-w-4xl mx-auto flex flex-col gap-6">
      <LastReadTracker surahId={surahId} surahName={surah.name_simple} />
      <Link href="/quran" className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-[#2D5A43] transition-colors w-fit">
        <ArrowLeft size={16} />
        Back to Surahs
      </Link>

      {/* Surah Header Card */}
      <section className="bg-gradient-to-br from-[#2D5A43] to-[#1A3A2A] rounded-[2.5rem] p-10 text-white relative overflow-hidden flex flex-col items-center justify-center text-center shadow-lg shadow-[#2D5A43]/20 border border-[#2D5A43]">
        <div className="relative z-10 flex flex-col items-center">
          <h2 className="text-4xl font-serif font-bold mb-2">{surah.name_arabic}</h2>
          <h3 className="text-xl font-bold mb-4">{surah.name_simple}</h3>
          <div className="flex items-center gap-3 text-sm font-semibold text-emerald-100/90 uppercase tracking-widest pt-4 border-t border-white/20 w-full justify-center">
            <span>{surah.revelation_place}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400/50"></span>
            <span>{surah.verses_count} Verses</span>
          </div>
        </div>
        {/* Abstract Islamic Geometry Pattern */}
        <div className="absolute left-[-20px] top-[-20px] opacity-10">
          <svg width="200" height="200" viewBox="0 0 100 100" fill="currentColor">
            <path d="M50 0 L60 40 L100 50 L60 60 L50 100 L40 60 L0 50 L40 40 Z" />
          </svg>
        </div>
      </section>

      {/* Verses List */}
      <div className="flex flex-col gap-8 mt-6">
        {verses.map((verse) => (
          <div key={verse.id} className="bg-white rounded-3xl border border-[#E9E3D8] p-6 md:p-8 flex flex-col gap-6 relative shadow-sm">
            <div className="absolute top-8 left-0 w-1 h-12 bg-[#2D5A43] rounded-r-md"></div>

            <div className="flex justify-between items-center border-b border-[#E9E3D8]/50 pb-4">
              <div 
                className="w-[34px] h-[40px] flex items-center justify-center font-bold text-xs text-[#2D5A43] shrink-0 bg-contain bg-no-repeat bg-center select-none"
                style={{ backgroundImage: "url('/ic-frame-number.svg')" }}
              >
                {verse.verse_number}
              </div>
            </div>

            <div className="flex flex-col gap-8">
              <p className="text-3xl md:text-4xl font-serif text-right leading-loose text-[#1A3A2A]" dir="rtl">
                {verse.text_arabic}
              </p>
              <p className="text-base md:text-lg text-slate-600 leading-relaxed">
                {verse.text_translation}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
