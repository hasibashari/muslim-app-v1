import { BookOpen, ScrollText } from "lucide-react";
import Link from "next/link";
import { quranService } from "@/src/features/quran/service/quran.service";
import { duaService } from "@/src/features/dua/service/dua.service";
import { dhikrService } from "@/src/features/dhikr/service/dhikr.service";
import { auth } from "@/src/features/auth/auth";
import { HeroSection } from "../components/HeroSection";
import { RecentSurahsList } from "../components/RecentSurahsList";

export default async function DashboardPage() {
  const session = await auth();
  const userName = session?.user?.name;

  const allSurahs = quranService.getAllSurahs();
  const morningDua = duaService.getAllDuas()[0];
  const currentDhikr = dhikrService.getAllDhikrs()[0];

  return (
    <div className="p-6 md:p-10 w-full max-w-6xl mx-auto flex flex-col lg:grid lg:grid-cols-12 gap-8 content-start">

      {/* Hero Welcome */}
      <HeroSection userName={userName} />

      {/* Feature Highlights */}
      <div className="lg:col-span-4 grid grid-cols-2 md:grid-cols-2 gap-4 lg:h-full">
        <Link 
          href="/dhikr" 
          className="bg-white border border-[#E9E3D8] p-6 rounded-3xl flex flex-col items-center justify-center text-center shadow-sm hover:shadow-md hover:border-[#2D5A43]/30 transition-all cursor-pointer"
        >
          <div className="w-12 h-12 rounded-full bg-[#F5F1EA] flex items-center justify-center text-[#2D5A43] mb-3">
            <BookOpen size={24} />
          </div>
          <p className="font-bold text-[#1A3A2A]">99</p>
          <p className="text-[10px] uppercase font-bold text-slate-400">Names</p>
        </Link>
        <Link 
          href="/hadith" 
          className="bg-white border border-[#E9E3D8] p-6 rounded-3xl flex flex-col items-center justify-center text-center shadow-sm hover:shadow-md hover:border-[#2D5A43]/30 transition-all cursor-pointer"
        >
          <div className="w-12 h-12 rounded-full bg-[#F5F1EA] flex items-center justify-center text-[#2D5A43] mb-3">
            <ScrollText size={24} />
          </div>
          <p className="font-bold text-[#1A3A2A]">40</p>
          <p className="text-[10px] uppercase font-bold text-slate-400">Arba&apos;in</p>
        </Link>
        <Link 
          href={`/dhikr/${currentDhikr?.category?.toLowerCase() || ""}`}
          className="col-span-2 bg-[#F5F1EA] p-6 rounded-3xl border border-[#E9E3D8] flex items-center justify-between hover:bg-[#E9E3D8]/40 hover:border-[#2D5A43]/30 transition-all cursor-pointer"
        >
          <div>
            <p className="text-xs font-bold text-[#2D5A43] uppercase mb-1">Current Dhikr</p>
            <p className="text-lg font-bold text-[#1A3A2A]">{currentDhikr?.title || 'SubhanAllah'}</p>
          </div>
          <div className="h-12 px-4 rounded-full bg-white border-2 border-[#2D5A43] flex items-center justify-center text-[#2D5A43] font-bold shrink-0 text-xs text-center border-dashed">
            {currentDhikr?.category || 'Daily'}
          </div>
        </Link>
      </div>

      {/* Feature Lists */}
      <div className="lg:col-span-6 space-y-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-bold text-[#1A3A2A]">Recent Surahs</h3>
          <Link href="/quran" className="text-xs font-bold text-[#2D5A43] hover:underline">View All</Link>
        </div>
        <RecentSurahsList allSurahs={allSurahs} />
      </div>

      <div className="lg:col-span-6 space-y-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-bold text-[#1A3A2A]">{morningDua?.title || 'Morning Dua'}</h3>
          <Link href="/dua" className="text-xs font-bold text-[#2D5A43] hover:underline">Explore Library</Link>
        </div>
        <Link 
          href={`/dua/detail/${morningDua?.id || 1}`}
          className="bg-[#FBF9F4] rounded-3xl p-6 md:p-8 border border-[#E9E3D8] h-auto md:min-h-[220px] flex flex-col justify-between hover:border-[#2D5A43]/30 hover:shadow-md transition-all cursor-pointer text-left"
        >
          <div className="mb-auto">
            <p className="text-lg md:text-xl font-serif text-right leading-loose text-[#1A3A2A] mb-4" dir="rtl">
              {morningDua?.text_arabic || 'بِاسْمِكَ رَبِّـي وَضَعْـتُ جَنْـبي، وَبِكَ أَرْفَعُـه'}
            </p>
            <p className="text-sm text-slate-600 leading-relaxed text-right md:text-left line-clamp-2">
              &quot;{morningDua?.text_translation || 'In Your name, my Lord, I lay my side down, and by You I raise it up...'}&quot;
            </p>
          </div>
          <div className="flex items-center gap-3 mt-4 pt-4 border-t border-[#E9E3D8] w-full">
            <div className="w-8 h-8 rounded-full bg-[#2D5A43] flex items-center justify-center text-white shrink-0">
              <svg width="14" height="14" fill="currentColor" className="translate-x-0.5"><path d="M4 3l10 5-10 5V3z" /></svg>
            </div>
            <span className="text-xs font-semibold text-slate-500">{morningDua?.reference || 'Dua for Sleeping'}</span>
          </div>
        </Link>
      </div>
    </div>
  );
}
