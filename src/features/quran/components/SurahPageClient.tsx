"use client";

import Link from "next/link";
import { ArrowLeft, Bookmark, BookmarkCheck } from "lucide-react";
import { LastReadTracker } from "@/src/features/quran/components/LastReadTracker";
import { VersesList } from "./VersesList";
import type { Surah, Verse } from "../types";
import { useBookmark } from "@/src/shared/hooks/useBookmark";

interface SurahPageClientProps {
  surah: Surah;
  verses: Verse[];
}

export function SurahPageClient({ surah, verses }: SurahPageClientProps) {
  const { isBookmarked, toggleBookmark } = useBookmark({
    docPrefix: "quran",
    bookmarkData: {
      item_type: "quran",
      item_id: String(surah.id),
      title: surah.name_simple,
      subtitle: `Surah • ${surah.translated_name}`,
    },
  });

  return (
    <div className="p-6 md:p-10 w-full max-w-4xl mx-auto flex flex-col gap-6">
      <LastReadTracker surahId={surah.id} surahName={surah.name_simple} />
      <Link href="/quran" className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-[#2D5A43] transition-colors w-fit">
        <ArrowLeft size={16} />
        Back to Surahs
      </Link>

      {/* Visually hidden h1 for SEO – visual design uses h2/h3 inside the card */}
      <h1 className="sr-only">{surah.name_simple} — {surah.translated_name} ({surah.verses_count} Ayat)</h1>

      {/* Surah Header Card */}
      <section className="bg-gradient-to-br from-[#2D5A43] to-[#1A3A2A] rounded-2xl p-10 text-white relative overflow-hidden flex flex-col items-center justify-center text-center shadow-lg shadow-[#2D5A43]/20 border border-[#2D5A43]">
        {/* Bookmark Button */}
        <button
          onClick={toggleBookmark}
          className={`absolute top-6 right-6 p-3 rounded-2xl transition-all cursor-pointer backdrop-blur-md shadow-sm border ${isBookmarked
              ? "bg-white text-[#2D5A43] border-white"
              : "bg-white/10 text-white hover:bg-white/20 border-white/20"
            }`}
          title={isBookmarked ? "Hapus Bookmark Surah" : "Simpan Bookmark Surah"}
        >
          {isBookmarked ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
        </button>

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
      <VersesList verses={verses} surahId={surah.id} surahName={surah.name_simple} />
    </div>
  );
}
