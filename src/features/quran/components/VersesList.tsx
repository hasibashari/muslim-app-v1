"use client";

import { useState } from "react";
import { Verse } from "../types";
import { Info, X } from "lucide-react";

interface VersesListProps {
  verses: Verse[];
}

export function VersesList({ verses }: VersesListProps) {
  const [expandedFootnotes, setExpandedFootnotes] = useState<Record<number, boolean>>({});

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

    // Split text by superscript footnote pattern like 1), 2), etc.
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
                className={`align-super text-[10px] font-bold px-0.5 select-none transition-colors cursor-pointer ${
                  isActive 
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

  return (
    <div className="flex flex-col gap-8 mt-6">
      {verses.map((verse) => {
        const isFootnoteOpen = expandedFootnotes[verse.id] && !!verse.footnotes;

        return (
          <div key={verse.id} className="bg-white rounded-3xl border border-[#E9E3D8] p-6 md:p-8 flex flex-col gap-6 relative shadow-sm transition-all duration-300">
            <div className="absolute top-8 left-0 w-1 h-12 bg-[#2D5A43] rounded-r-md"></div>

            <div className="flex justify-between items-center border-b border-[#E9E3D8]/50 pb-4">
              <div 
                className="w-[34px] h-[40px] flex items-center justify-center font-bold text-xs text-[#2D5A43] shrink-0 bg-contain bg-no-repeat bg-center select-none"
                style={{ backgroundImage: "url('/ic-frame-number.svg')" }}
              >
                {verse.verse_number}
              </div>
            </div>

            <div className="flex flex-col gap-8">
              <p className="text-3xl md:text-4xl font-serif text-right leading-loose text-[#1A3A2A]" dir="rtl">
                {verse.text_arabic}
              </p>
              <p className="text-base md:text-lg text-slate-600 leading-relaxed">
                {renderTranslationWithFootnotes(verse)}
              </p>
            </div>

            {/* Footnote callout box */}
            {isFootnoteOpen && (
              <div className="mt-2 p-5 bg-[#FDFCF9] border border-[#E9E3D8] rounded-2xl text-sm text-slate-600 animate-fadeIn relative flex gap-3 items-start pr-10">
                <Info size={18} className="text-[#2D5A43] shrink-0 mt-0.5" />
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-[#2D5A43] uppercase tracking-wider block">
                    Catatan Kaki (Footnote)
                  </span>
                  <p className="leading-relaxed text-xs md:text-sm text-slate-700">
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
