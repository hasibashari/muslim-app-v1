"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Surah } from "@/src/features/quran/types";

interface RecentSurahsListProps {
  allSurahs: Surah[];
}

export function RecentSurahsList({ allSurahs }: RecentSurahsListProps) {
  const [recentSurahs, setRecentSurahs] = useState<Surah[]>([]);

  useEffect(() => {
    const raw = localStorage.getItem("noor_recent_surahs");
    let recentIds: number[] = [];
    if (raw) {
      try {
        recentIds = JSON.parse(raw);
      } catch (e) {}
    }

    if (recentIds.length > 0) {
      // Find matching surahs and order them according to recentIds list
      const matches = recentIds
        .map((id) => allSurahs.find((s) => s.id === id))
        .filter((s): s is Surah => !!s);
      
      // If we don't have 3 recent surahs yet, fill with first ones in the list
      if (matches.length < 3) {
        const remaining = allSurahs.filter((s) => !recentIds.includes(s.id));
        matches.push(...remaining.slice(0, 3 - matches.length));
      }
      setRecentSurahs(matches.slice(0, 3));
    } else {
      // Fallback to first 3 surahs
      setRecentSurahs(allSurahs.slice(0, 3));
    }
  }, [allSurahs]);

  return (
    <div className="bg-white rounded-3xl border border-[#E9E3D8] p-2">
      {recentSurahs.map((s) => (
        <Link 
          href={`/quran/${s.id}`} 
          key={s.id} 
          className="flex items-center gap-4 p-3 border-b border-slate-50 last:border-none hover:bg-[#FBF9F4] rounded-2xl transition-colors cursor-pointer"
        >
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
  );
}
