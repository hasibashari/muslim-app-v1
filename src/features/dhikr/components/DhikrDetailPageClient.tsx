"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Bookmark, BookmarkCheck, Info } from "lucide-react";
import { useBookmarkList } from "@/src/shared/hooks/useBookmark";

interface Dhikr {
  id: number;
  category: string;
  title: string;
  text_arabic: string;
  text_translation: string;
  reference: string | null;
  latin: string | null;
  read: string | null;
  benefit: string | null;
}

interface DhikrDetailPageClientProps {
  dhikrs: Dhikr[];
  category: string;
}

export function DhikrDetailPageClient({ dhikrs, category }: DhikrDetailPageClientProps) {
  const { bookmarkedMap: bookmarkedDhikrs, toggleBookmark } = useBookmarkList({
    itemType: "dhikr",
    docPrefix: "dhikr",
    category,
  });
  const [expandedBenefits, setExpandedBenefits] = useState<Record<number, boolean>>({});

  const toggleBenefit = (id: number) => {
    setExpandedBenefits((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Track last read Dhikr Category
  useEffect(() => {
    if (category) {
      localStorage.setItem("noor_last_read_dhikr_category", category);
    }
  }, [category]);

  // Toggle Dhikr bookmark
  const handleToggleBookmark = async (dhikr: Dhikr) => {
    await toggleBookmark({
      itemId: String(dhikr.id),
      title: dhikr.title,
      subtitle: `Dhikr • ${category}`,
      category: category,
    });
  };

  return (
    <div className="p-6 md:p-10 w-full max-w-4xl mx-auto flex flex-col gap-6">
      <Link href="/dhikr" className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-[#2D5A43] transition-colors w-fit">
        <ArrowLeft size={16} />
        Back to Categories
      </Link>

      <div className="flex flex-col gap-2 mb-4">
        <h1 className="text-4xl font-bold text-[#1A3A2A] font-serif">{category}</h1>
        <p className="text-slate-500 font-semibold uppercase tracking-widest text-sm">{dhikrs.length} Remembrances</p>
      </div>

      <div className="flex flex-col gap-6 mt-2">
        {dhikrs.map((dhikr, index) => {
          const itemId = String(dhikr.id);
          const isBookmarked = !!bookmarkedDhikrs[itemId];

          return (
            <div key={dhikr.id} className="bg-white rounded-2xl border border-[#E9E3D8] p-6 lg:p-8 flex flex-col gap-6 shadow-sm h-full justify-between relative overflow-hidden">
              {/* Left accent bar – visual consistency with Quran & Hadith cards */}
              <div className="absolute top-8 left-0 w-1 h-12 bg-[#2D5A43] rounded-r-md" />
              <div className="flex flex-col gap-6">
                <div className="flex justify-between items-center border-b border-[#E9E3D8]/50 pb-4 gap-4 pr-12">
                  <div
                    className="w-[34px] h-[40px] flex items-center justify-center font-bold text-xs text-[#2D5A43] shrink-0 bg-contain bg-no-repeat bg-center select-none"
                    style={{ backgroundImage: "url('/ic-frame-number.svg')" }}
                  >
                    {index + 1}
                  </div>
                  {dhikr.read && (
                    <span className="text-[10px] font-bold px-2.5 py-1 bg-[#F5F1EA] text-[#2D5A43] border border-[#E9E3D8] rounded-2xl uppercase tracking-wider text-right max-w-[70%] sm:max-w-[80%] break-words">
                      {dhikr.read}
                    </span>
                  )}
                </div>

                {/* Bookmark Button */}
                <button
                  onClick={() => handleToggleBookmark(dhikr)}
                  className={`absolute top-6 right-6 p-2 rounded-xl transition-colors cursor-pointer border ${isBookmarked
                    ? "text-[#2D5A43] bg-emerald-50 border-emerald-100"
                    : "text-slate-400 hover:text-[#2D5A43] hover:bg-slate-50 border-transparent"
                    }`}
                  title={isBookmarked ? "Remove Dhikr Bookmark" : "Save Dhikr Bookmark"}
                >
                  {isBookmarked ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
                </button>

                <div className="flex flex-col gap-6">
                  <p className="text-3xl font-serif text-right leading-loose text-[#2D5A43]" dir="rtl">
                    {dhikr.text_arabic}
                  </p>
                  {dhikr.latin && (
                    <p className="text-sm italic text-slate-500 leading-relaxed font-serif bg-[#FDFCF9] border-l-2 border-[#E9E3D8] pl-3 py-1">
                      {dhikr.latin}
                    </p>
                  )}
                  <p className="text-sm text-slate-600 border-l-2 border-[#2D5A43] pl-4">
                    {dhikr.text_translation}
                  </p>
                </div>


              </div>

              {(dhikr.benefit || dhikr.reference) && (
                <div className="pt-4 flex flex-col gap-4 border-t border-[#E9E3D8]/30">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      {dhikr.benefit && (
                        <button
                          onClick={() => toggleBenefit(dhikr.id)}
                          className={`p-2 rounded-xl transition-colors cursor-pointer border shrink-0 ${expandedBenefits[dhikr.id]
                            ? "text-white bg-[#2D5A43] border-[#2D5A43]"
                            : "text-slate-400 hover:text-[#2D5A43] hover:bg-slate-50 border-[#E9E3D8]"
                            }`}
                          title={expandedBenefits[dhikr.id] ? "Hide Virtue" : "View Virtue"}
                        >
                          <Info size={16} />
                        </button>
                      )}
                    </div>
                    {dhikr.reference && (
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">{dhikr.reference}</p>
                    )}
                  </div>

                  {dhikr.benefit && expandedBenefits[dhikr.id] && (
                    <div className="text-xs text-[#2D5A43] bg-[#F4F9F6] border border-emerald-100/50 rounded-2xl p-4 leading-relaxed mt-2 animate-fadeIn">
                      <span className="font-bold block mb-1 text-[#1A3A2A] uppercase tracking-wider text-[10px]">Virtue:</span>
                      {dhikr.benefit}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
        {dhikrs.length === 0 && (
          <div className="col-span-full p-10 text-center text-slate-500 bg-white rounded-2xl border border-[#E9E3D8]">No Dhikrs found in this category.</div>
        )}
      </div>
    </div>
  );
}
