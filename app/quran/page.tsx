import { AppLayout } from "@/src/shared/components/layout/AppLayout";
import { quranRepository } from "@/src/features/quran/repository";
import Link from "next/link";
import { Search } from "lucide-react";

export const dynamic = 'force-dynamic';

export default function QuranPage() {
  const surahs = quranRepository.getAllSurahs();

  return (
    <AppLayout>
      <div className="p-6 md:p-10 w-full max-w-4xl mx-auto flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold text-[#1A3A2A]">Quran</h1>
          <p className="text-slate-500">Read and study the Holy Quran.</p>
        </div>

        {/* Global sticky search overrides this somewhat, but here is a local specific search */}
        <div className="relative w-full">
          <input 
            type="text" 
            placeholder="Search Surah..." 
            className="w-full bg-white border border-[#E9E3D8] rounded-full py-4 pl-14 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D5A43] shadow-sm"
          />
          <Search className="absolute left-5 top-4 text-slate-400" size={20} />
        </div>

        <div className="bg-white rounded-3xl border border-[#E9E3D8] p-2 mt-4 space-y-1">
          {surahs.map((surah) => (
            <Link href={`/quran/${surah.id}`} key={surah.id} className="flex items-center gap-4 p-4 hover:bg-[#FBF9F4] rounded-2xl transition-colors cursor-pointer border-b border-transparent hover:border-[#E9E3D8]">
              <div className="w-12 h-12 rounded-xl bg-[#FDFCF8] border border-[#E9E3D8] flex items-center justify-center font-bold text-slate-500 shrink-0">
                {surah.id.toString().padStart(2, '0')}
              </div>
              <div className="flex-1 min-w-0 flex flex-col justify-center">
                <p className="font-bold text-lg text-[#1A3A2A] truncate">{surah.name_simple}</p>
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  <span>{surah.revelation_place}</span>
                  <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                  <span>{surah.verses_count} Verses</span>
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="text-2xl font-serif text-[#2D5A43]">{surah.name_arabic}</p>
              </div>
            </Link>
          ))}
          {surahs.length === 0 && (
             <div className="p-10 text-center text-slate-500">No Surahs found.</div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
