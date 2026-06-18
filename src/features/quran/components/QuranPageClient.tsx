"use client";

import { useRouter } from "next/navigation";
import type { Surah } from "@/src/features/quran/types";

interface QuranPageClientProps {
  surahs: Surah[];
}

export function QuranPageClient({ surahs }: QuranPageClientProps) {
  const router = useRouter();

  return (
    <div className="p-6 md:p-10 w-full max-w-4xl mx-auto flex flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <h1 className="text-3xl font-bold text-[#1A3A2A]">Quran</h1>
        <p className="text-slate-500 text-sm">Read and study the Holy Quran.</p>
      </div>

      <div className="bg-white rounded-2xl border border-[#E9E3D8] p-2 space-y-1">
        {surahs.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-slate-400 font-semibold">Surah not found</p>
          </div>
        ) : (
          surahs.map((surah) => (
            <button
              key={surah.id}
              onClick={() => router.push(`/quran/${surah.id}`)}
              className="w-full flex items-center gap-3 sm:gap-4 p-3 sm:p-4 hover:bg-[#F4FAF7] rounded-xl transition-[background-color,transform,color] duration-200 cursor-pointer text-left hover:translate-x-0.5 active:scale-[0.99] group"
            >
              <div
                className="w-[34px] h-[40px] flex items-center justify-center font-bold text-xs text-[#2D5A43] shrink-0 bg-contain bg-no-repeat bg-center select-none group-hover:scale-105 transition-transform duration-200"
                style={{ backgroundImage: "url('/ic-frame-number.svg')" }}
              >
                {surah.id}
              </div>
              <div className="flex-1 min-w-0 flex flex-col justify-center">
                <p className="font-bold text-base sm:text-lg text-[#1A3A2A] truncate group-hover:text-[#2D5A43] transition-colors duration-200">{surah.name_simple}</p>
                <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  <span>{surah.revelation_place}</span>
                  <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-slate-300 shrink-0" />
                  <span>{surah.verses_count} Verses</span>
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="text-xl sm:text-2xl font-serif text-[#2D5A43] group-hover:text-[#1A3A2A] transition-colors duration-200">{surah.name_arabic}</p>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
