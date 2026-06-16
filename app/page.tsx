import { AppLayout } from "@/src/shared/components/layout/AppLayout";
import { BookOpen, ScrollText } from "lucide-react";
import Link from "next/link";
import { quranRepository } from "@/src/features/quran/repository";
import { duaRepository } from "@/src/features/dua/repository";
import { dhikrRepository } from "@/src/features/dhikr/repository";

export const dynamic = 'force-dynamic';

export default function Home() {
  const recentSurahs = quranRepository.getAllSurahs().slice(0, 3);
  const morningDua = duaRepository.getAllDuas()[0];
  const currentDhikr = dhikrRepository.getAllDhikrs()[0];

  return (
    <AppLayout>
      <div className="p-6 md:p-10 w-full max-w-6xl mx-auto flex flex-col lg:grid lg:grid-cols-12 gap-8 content-start">
        
        {/* Hero Welcome */}
        <section className="lg:col-span-8 bg-[#2D5A43] rounded-[2.5rem] p-8 md:p-10 text-white relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-2xl md:text-3xl font-bold mb-2">Assalamu Alaikum</h2>
            <p className="text-emerald-100/80 mb-8 max-w-md text-sm md:text-base">
              Continue your journey. You were last reading Surah Al-Kahf.
            </p>
            <Link href="/quran/18" className="inline-block bg-white text-[#2D5A43] px-6 py-3 rounded-full font-bold text-sm shadow-xl shadow-black/10 hover:bg-[#F5F1EA] transition-colors">
              Continue Reading
            </Link>
          </div>
          {/* Abstract Islamic Geometry Pattern */}
          <div className="absolute right-[-40px] bottom-[-40px] opacity-10">
            <svg width="300" height="300" viewBox="0 0 100 100" fill="currentColor">
              <path d="M50 0 L60 40 L100 50 L60 60 L50 100 L40 60 L0 50 L40 40 Z" />
            </svg>
          </div>
        </section>

        {/* Feature Highlights */}
        <div className="lg:col-span-4 grid grid-cols-2 md:grid-cols-2 gap-4 lg:h-full">
          <div className="bg-white border border-[#E9E3D8] p-6 rounded-3xl flex flex-col items-center justify-center text-center shadow-sm">
            <div className="w-12 h-12 rounded-full bg-[#F5F1EA] flex items-center justify-center text-[#2D5A43] mb-3">
              <BookOpen size={24} />
            </div>
            <p className="font-bold text-[#1A3A2A]">99</p>
            <p className="text-[10px] uppercase font-bold text-slate-400">Names</p>
          </div>
          <div className="bg-white border border-[#E9E3D8] p-6 rounded-3xl flex flex-col items-center justify-center text-center shadow-sm">
            <div className="w-12 h-12 rounded-full bg-[#F5F1EA] flex items-center justify-center text-[#2D5A43] mb-3">
              <ScrollText size={24} />
            </div>
            <p className="font-bold text-[#1A3A2A]">40</p>
            <p className="text-[10px] uppercase font-bold text-slate-400">Arba&apos;in</p>
          </div>
          <div className="col-span-2 bg-[#F5F1EA] p-6 rounded-3xl border border-[#E9E3D8] flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-[#2D5A43] uppercase mb-1">Current Dhikr</p>
              <p className="text-lg font-bold text-[#1A3A2A]">{currentDhikr?.title || 'SubhanAllah'}</p>
            </div>
            <div className="h-12 px-4 rounded-full bg-white border-2 border-[#2D5A43] flex items-center justify-center text-[#2D5A43] font-bold shrink-0 text-xs text-center border-dashed">
              {currentDhikr?.category || 'Daily'}
            </div>
          </div>
        </div>

        {/* Feature Lists */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-bold text-[#1A3A2A]">Recent Surahs</h3>
            <Link href="/quran" className="text-xs font-bold text-[#2D5A43] hover:underline">View All</Link>
          </div>
          <div className="bg-white rounded-3xl border border-[#E9E3D8] p-2">
            {recentSurahs.map((s) => (
              <Link href={`/quran/${s.id}`} key={s.id} className="flex items-center gap-4 p-3 border-b border-slate-50 last:border-none hover:bg-[#FBF9F4] rounded-2xl transition-colors cursor-pointer">
                <div className="w-10 h-10 rounded-xl bg-[#FDFCF8] border border-[#E9E3D8] flex items-center justify-center font-bold text-slate-400 text-sm shrink-0">
                  {s.id.toString().padStart(2, '0')}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm text-[#1A3A2A] truncate">{s.translated_name}</p>
                  <p className="text-[10px] text-slate-400 truncate">{s.name_simple} • {s.verses_count} Verses</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-lg font-serif text-[#2D5A43]">{s.name_arabic}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-bold text-[#1A3A2A]">{morningDua?.title || 'Morning Dua'}</h3>
            <Link href="/dua" className="text-xs font-bold text-[#2D5A43] hover:underline">Explore Library</Link>
          </div>
          <div className="bg-[#FBF9F4] rounded-3xl p-6 md:p-8 border border-[#E9E3D8] h-auto md:h-[220px] flex flex-col">
            <div className="mb-auto">
              <p className="text-lg md:text-xl font-serif text-right leading-loose text-[#1A3A2A] mb-4">
                {morningDua?.text_arabic || 'بِاسْمِكَ رَبِّـي وَضَعْـتُ جَنْـبي، وَبِكَ أَرْفَعُـه'}
              </p>
              <p className="text-sm text-slate-600 leading-relaxed text-right md:text-left line-clamp-2">
                &quot;{morningDua?.text_translation || 'In Your name, my Lord, I lay my side down, and by You I raise it up...'}&quot;
              </p>
            </div>
            <div className="flex items-center gap-3 mt-4 pt-4 border-t border-[#E9E3D8]">
                <div className="w-8 h-8 rounded-full bg-[#2D5A43] flex items-center justify-center text-white shrink-0">
                  <svg width="14" height="14" fill="currentColor"><path d="M5 3l14 9-14 9V3z"/></svg>
                </div>
                <span className="text-xs font-bold text-slate-500 uppercase">{morningDua?.reference || 'Dua for Sleeping'}</span>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
