"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import type { Dua } from "../../dua/types";

interface LastReadDuaWidgetProps {
  allDuas: Dua[];
}

export function LastReadDuaWidget({ allDuas }: LastReadDuaWidgetProps) {
  const [lastDua, setLastDua] = useState<Dua | null>(null);

  useEffect(() => {
    let result: Dua | null = null;
    const rawId = localStorage.getItem("noor_last_read_dua_id");
    if (rawId) {
      const match = allDuas.find((d) => String(d.id) === rawId);
      if (match) {
        result = match;
      }
    }
    if (!result) {
      result = allDuas[0] || null;
    }

    const timer = setTimeout(() => {
      setLastDua(result);
    }, 0);
    return () => clearTimeout(timer);
  }, [allDuas]);

  if (!lastDua) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-bold text-[#1A3A2A]">
          {lastDua.title}
        </h3>
        <Link href="/dua" className="text-xs font-bold text-[#2D5A43] hover:underline">
          Explore Library
        </Link>
      </div>
      <Link 
        href={`/dua/detail/${lastDua.id}`}
        className="bg-[#FBF9F4] rounded-3xl p-6 md:p-8 border border-[#E9E3D8] h-auto md:min-h-[220px] flex flex-col justify-between hover:border-[#2D5A43]/30 hover:shadow-md transition-all cursor-pointer text-left block"
      >
        <div className="mb-auto">
          <p className="text-lg md:text-xl font-serif text-right leading-loose text-[#2D5A43] mb-4" dir="rtl">
            {lastDua.text_arabic}
          </p>
          <p className="text-sm text-slate-600 leading-relaxed text-right md:text-left line-clamp-2">
            &quot;{lastDua.text_translation}&quot;
          </p>
        </div>
        <div className="flex items-center gap-3 mt-4 pt-4 border-t border-[#E9E3D8] w-full">
          <div className="w-8 h-8 rounded-full bg-[#2D5A43] flex items-center justify-center text-white shrink-0">
            <svg width="14" height="14" fill="currentColor" className="translate-x-0.5">
              <path d="M4 3l10 5-10 5V3z" />
            </svg>
          </div>
          <span className="text-xs font-semibold text-slate-500 truncate max-w-[200px] sm:max-w-xs">
            {lastDua.reference || "Reference"}
          </span>
        </div>
      </Link>
    </div>
  );
}
