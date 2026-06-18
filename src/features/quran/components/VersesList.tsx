"use client";

import { useState, useEffect } from "react";
import { Verse } from "../types";
import { Info, X, Bookmark, BookmarkCheck } from "lucide-react";
import { useSettings } from "@/src/features/settings/hooks";
import { useBookmarkList } from "@/src/shared/hooks/useBookmark";

interface VersesListProps {
  verses: Verse[];
  surahId: number;
  surahName: string;
}

export function VersesList({ verses, surahId, surahName }: VersesListProps) {
  const { settings } = useSettings();
  const { bookmarkedMap: bookmarkedVerses, toggleBookmark } = useBookmarkList({
    itemType: "quran",
    docPrefix: "quran",
    itemIdPrefix: `${surahId}:`,
  });

  const [expandedFootnotes, setExpandedFootnotes] = useState<Record<number, boolean>>({});

  // 2. Toggle bookmark for a verse
  const handleToggleBookmark = async (verseNumber: number) => {
    const itemId = `${surahId}:${verseNumber}`;
    await toggleBookmark({
      itemId,
      title: `${surahName} • Ayat ${verseNumber}`,
      subtitle: `Surah ${surahName} • Ayat ${verseNumber}`,
    });
  };

  const toggleFootnote = (verseId: number) => {
    setExpandedFootnotes((prev) => ({
      ...prev,
      [verseId]: !prev[verseId],
    }));
  };

  const renderTranslationWithFootnotes = (verse: Verse) => {
    const translation = verse.text_translation;
    if (!verse.footnotes) {
      return <span>{translation}</span>;
    }

    const parts = translation.split(/(\d+\))/g);
    return (
      <>
        {parts.map((part, index) => {
          const match = part.match(/^(\d+)\)$/);
          if (match) {
            const num = match[1];
            const isActive = expandedFootnotes[verse.id];
            return (
              <button
                key={index}
                onClick={() => toggleFootnote(verse.id)}
                className={`align-super text-[10px] font-bold px-0.5 select-none transition-colors cursor-pointer ${isActive
                  ? "text-[#D97706] hover:text-[#B45309]"
                  : "text-[#2D5A43] hover:text-[#1A3A2A] hover:underline"
                  }`}
                title="Click to view footnote"
              >
                {num}
              </button>
            );
          }
          return part;
        })}
      </>
    );
  };

  // Determine Arabic font size class based on settings
  const getArabicFontSizeClass = () => {
    switch (settings.fontSize) {
      case "small": return "text-2xl md:text-3xl leading-[2.5] py-2";
      case "large": return "text-4xl md:text-5xl leading-[3] py-4";
      case "medium":
      default:
        return "text-3xl md:text-4xl leading-[2.8] py-3";
    }
  };

  return (
    <div className="flex flex-col gap-8 mt-6">
      {verses.map((verse) => {
        const isFootnoteOpen = expandedFootnotes[verse.id] && !!verse.footnotes;
        const itemId = `${surahId}:${verse.verse_number}`;
        const isBookmarked = !!bookmarkedVerses[itemId];

        return (
          <div key={verse.id} id={`verse-${verse.verse_number}`} className="bg-white rounded-2xl p-6 md:p-8 flex flex-col gap-6 relative shadow-sm hover:shadow-md hover:bg-[#FAF9F5]/50 transition-all duration-300">
            <div className="absolute top-8 left-0 w-1 h-12 bg-[#2D5A43] rounded-r-md"></div>

            <div className="flex justify-between items-center border-b border-[#E9E3D8]/50 pb-4">
              <div
                className="w-[34px] h-[40px] flex items-center justify-center font-bold text-xs text-[#2D5A43] shrink-0 bg-contain bg-no-repeat bg-center select-none"
                style={{ backgroundImage: "url('/ic-frame-number.svg')" }}
              >
                {verse.verse_number}
              </div>

              {/* Bookmark Button */}
              <button
                onClick={() => handleToggleBookmark(verse.verse_number)}
                className={`p-2 rounded-xl transition-colors cursor-pointer ${isBookmarked
                  ? "text-[#2D5A43] bg-emerald-50 border border-emerald-100"
                  : "text-slate-400 hover:text-[#2D5A43] hover:bg-slate-50 border border-transparent"
                  }`}
                title={isBookmarked ? "Remove Bookmark" : "Save Bookmark"}
              >
                {isBookmarked ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
              </button>
            </div>

            <div className="flex flex-col gap-8">
              <p className={`${getArabicFontSizeClass()} font-serif text-right text-[#2D5A43]`} dir="rtl">
                {verse.text_arabic}
              </p>
              {settings.showTranslation && (
                <p className="text-base md:text-lg text-slate-600 leading-relaxed">
                  {renderTranslationWithFootnotes(verse)}
                </p>
              )}
            </div>

            {/* Footnote callout box */}
            {isFootnoteOpen && settings.showTranslation && (
              <div className="mt-2 p-5 bg-[#FDFCF9] border border-[#E9E3D8] rounded-2xl text-sm text-slate-600 animate-fadeIn relative flex gap-3 items-start pr-10">
                <Info size={18} className="text-[#2D5A43] shrink-0 mt-0.5" />
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-[#2D5A43] uppercase tracking-wider block">
                    Footnote
                  </span>
                  <p className="leading-relaxed text-xs md:text-sm text-slate-700 whitespace-pre-line">
                    {verse.footnotes}
                  </p>
                </div>
                <button
                  onClick={() => toggleFootnote(verse.id)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 p-1 hover:bg-[#F5F1EA] rounded-full transition-all cursor-pointer"
                  title="Close footnote"
                >
                  <X size={16} />
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
