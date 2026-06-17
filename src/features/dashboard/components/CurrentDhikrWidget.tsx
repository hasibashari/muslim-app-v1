"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import type { Dhikr } from "../../dhikr/types";

interface CurrentDhikrWidgetProps {
  allDhikrs: Dhikr[];
}

export function CurrentDhikrWidget({ allDhikrs }: CurrentDhikrWidgetProps) {
  const [currentDhikr, setCurrentDhikr] = useState<Dhikr | null>(null);

  useEffect(() => {
    let result: Dhikr | null = null;
    const rawCategory = localStorage.getItem("noor_last_read_dhikr_category");
    if (rawCategory) {
      const match = allDhikrs.find((d) => d.category.toLowerCase() === rawCategory.toLowerCase());
      if (match) {
        result = match;
      }
    }
    if (!result) {
      result = allDhikrs[0] || null;
    }

    const timer = setTimeout(() => {
      setCurrentDhikr(result);
    }, 0);
    return () => clearTimeout(timer);
  }, [allDhikrs]);

  if (!currentDhikr) return null;

  return (
    <Link
      href={`/dhikr/${currentDhikr.category.toLowerCase()}`}
      className="col-span-2 bg-[#F5F1EA] p-6 rounded-2xl border border-[#E9E3D8] flex items-center justify-between hover:bg-[#E9E3D8]/40 hover:border-[#2D5A43]/30 transition-all cursor-pointer block"
    >
      <div>
        <p className="text-xs font-bold text-[#2D5A43] uppercase mb-1">Current Dhikr</p>
        <p className="text-lg font-bold text-[#1A3A2A] truncate max-w-[150px] xs:max-w-[200px] sm:max-w-[250px]">{currentDhikr.title}</p>
      </div>
      <div className="h-12 px-4 rounded-full bg-white border-2 border-[#2D5A43] flex items-center justify-center text-[#2D5A43] font-bold shrink-0 text-xs text-center border-dashed">
        {currentDhikr.category}
      </div>
    </Link>
  );
}
