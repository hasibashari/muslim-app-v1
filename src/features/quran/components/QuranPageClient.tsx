"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import type { Surah } from "@/src/features/quran/types";

interface QuranPageClientProps {
  surahs: Surah[];
}

export function QuranPageClient({ surahs }: QuranPageClientProps) {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const filtered = useMemo(() => {
    if (!query.trim()) return surahs;
    const q = query.toLowerCase();
    return surahs.filter(
      (s) =>
        s.name_simple.toLowerCase().includes(q) ||
        s.name_arabic.includes(q) ||
        s.translated_name.toLowerCase().includes(q) ||
        String(s.id).includes(q)
    );
  }, [surahs, query]);

  return (
    <div className="p-6 md:p-10 w-full max-w-4xl mx-auto flex flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <h1 className="text-3xl font-bold text-[#1A3A2A]">Al-Quran</h1>
        <p className="text-slate-500 text-sm">Baca dan pelajari Al-Quran Al-Karim.</p>
      </div>

      {/* Local Surah Search */}
      <div className="relative w-full">
        <input
          id="quran-search-input"
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Cari Surah (nama, nomor, atau arti)..."
          className="w-full bg-white border border-[#E9E3D8] rounded-full py-3.5 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D5A43] shadow-sm transition-shadow"
          autoComplete="off"
        />
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        {query && (
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-medium">
            {filtered.length} hasil
          </span>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-[#E9E3D8] p-2 space-y-0.5">
        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-slate-400 font-semibold">Surah tidak ditemukan</p>
            <p className="text-sm text-slate-400 mt-1">
              Coba cari dengan nama atau nomor surah lain.
            </p>
          </div>
        ) : (
          filtered.map((surah) => (
            <button
              key={surah.id}
              onClick={() => router.push(`/quran/${surah.id}`)}
              className="w-full flex items-center gap-4 p-4 hover:bg-[#FBF9F4] rounded-2xl transition-colors cursor-pointer border border-transparent hover:border-[#E9E3D8] text-left"
            >
              <div
                className="w-[34px] h-[40px] flex items-center justify-center font-bold text-xs text-[#2D5A43] shrink-0 bg-contain bg-no-repeat bg-center select-none"
                style={{ backgroundImage: "url('/ic-frame-number.svg')" }}
              >
                {surah.id}
              </div>
              <div className="flex-1 min-w-0 flex flex-col justify-center">
                <p className="font-bold text-lg text-[#1A3A2A] truncate">{surah.name_simple}</p>
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  <span>{surah.revelation_place}</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                  <span>{surah.verses_count} Ayat</span>
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="text-2xl font-serif text-[#2D5A43]">{surah.name_arabic}</p>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
