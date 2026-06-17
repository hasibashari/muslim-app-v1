"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, ChevronLeft, ChevronRight, Bookmark, BookmarkCheck, BookOpen, ExternalLink, ChevronDown, ChevronUp } from "lucide-react";
import { useSession } from "@/src/features/auth/hooks";
import { collection, doc, getDoc, setDoc, deleteDoc } from "firebase/firestore";
import { db, isConfigured } from "@/src/lib/firebase";

import type { Dua } from "../types";

interface AdjacentDua {
  id: number;
  title: string;
}

interface DuaDetailPageClientProps {
  dua: Dua;
  prev: AdjacentDua | null | undefined;
  next: AdjacentDua | null | undefined;
}

export function DuaDetailPageClient({ dua, prev, next }: DuaDetailPageClientProps) {
  const { data: session, status } = useSession();
  const [isRefExpanded, setIsRefExpanded] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(() => {
    if (typeof window !== "undefined") {
      const itemId = String(dua.id);
      const localData = localStorage.getItem("noor_bookmarks");
      if (localData) {
        try {
          const parsed = JSON.parse(localData) as any[];
          return parsed.some((b) => b.item_type === "dua" && b.item_id === itemId);
        } catch (e) { }
      }
    }
    return false;
  });

  // 1. Check if Dua is bookmarked in Firestore
  useEffect(() => {
    const itemId = String(dua.id);
    if (status === "authenticated" && session?.user?.id && isConfigured) {
      const docId = `dua_${itemId}`;
      const docRef = doc(db, "users", session.user.id, "bookmarks", docId);
      getDoc(docRef).then((snap) => {
        setIsBookmarked(snap.exists());
      }).catch((err) => console.error("Error loading Dua bookmark:", err));
    }
  }, [status, session?.user?.id, dua.id]);

  // Track last read Dua ID
  useEffect(() => {
    if (dua.id) {
      localStorage.setItem("noor_last_read_dua_id", String(dua.id));
    }
  }, [dua.id]);

  // 2. Toggle bookmark
  const toggleBookmark = async () => {
    const itemId = String(dua.id);
    const currentlyBookmarked = isBookmarked;
    setIsBookmarked(!currentlyBookmarked);

    const bookmarkData = {
      item_type: "dua" as const,
      item_id: itemId,
      title: dua.title,
      subtitle: `Dua • ${dua.category || "Supplication"}`,
      created_at: new Date().toISOString(),
    };

    if (status === "authenticated" && session?.user?.id && isConfigured) {
      try {
        const docId = `dua_${itemId}`;
        const docRef = doc(db, "users", session.user.id, "bookmarks", docId);
        if (currentlyBookmarked) {
          await deleteDoc(docRef);
        } else {
          await setDoc(docRef, bookmarkData);
        }
      } catch (err) {
        console.error("Failed to toggle Dua bookmark in Firestore:", err);
      }
    } else {
      try {
        const localData = localStorage.getItem("noor_bookmarks");
        let bookmarks = localData ? JSON.parse(localData) : [];
        if (currentlyBookmarked) {
          bookmarks = bookmarks.filter((b: any) => !(b.item_type === "dua" && b.item_id === itemId));
        } else {
          bookmarks.push(bookmarkData);
        }
        localStorage.setItem("noor_bookmarks", JSON.stringify(bookmarks));
      } catch (e) {
        console.error("Failed to toggle local Dua bookmark:", e);
      }
    }
  };

  const renderReference = (refText: string) => {
    // 1. Separate Source
    const sourceRegex = /(Sumber:\s*.*)$/i;
    const sourceMatch = refText.match(sourceRegex);
    let mainText = refText;
    let sourceText = "";

    if (sourceMatch) {
      sourceText = sourceMatch[1];
      mainText = refText.replace(sourceRegex, "").trim();
    }

    // Format Source with Link if present
    let formattedSource: React.ReactNode = null;
    if (sourceText) {
      const urlRegex = /(https?:\/\/[^\s]+)/g;
      const urlMatch = sourceText.match(urlRegex);
      if (urlMatch) {
        const url = urlMatch[0];
        const textBeforeUrl = sourceText.split(urlRegex)[0];
        const cleanUrl = url.replace(/[).,]+$/, "");
        const trailingText = url.substring(cleanUrl.length);

        formattedSource = (
          <span className="text-[10px] sm:text-xs text-slate-400 flex items-center gap-1 flex-wrap break-all w-full justify-end">
            <span>{textBeforeUrl}</span>
            <a
              href={cleanUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#2D5A43] hover:underline font-medium inline-flex items-center gap-0.5 break-all"
            >
              {cleanUrl}
              <ExternalLink size={10} className="shrink-0" />
            </a>
            {trailingText && <span>{trailingText}</span>}
          </span>
        );
      } else {
        formattedSource = (
          <span className="text-[10px] sm:text-xs text-slate-400 break-words">
            {sourceText}
          </span>
        );
      }
    }

    return (
      <div className="mt-4 sm:mt-6 bg-[#FBF9F4]/70 border border-[#E9E3D8]/60 rounded-2xl overflow-hidden transition-all duration-300">
        {/* Accordion Toggle Header */}
        <button
          onClick={() => setIsRefExpanded(!isRefExpanded)}
          className="w-full flex items-center justify-between p-4 sm:p-5 hover:bg-[#F5F2E9]/30 transition-colors text-left focus:outline-none cursor-pointer"
        >
          <div className="flex items-center gap-2 text-[#2D5A43] min-w-0">
            <BookOpen size={16} className="shrink-0" />
            <span className="text-[11px] sm:text-xs font-bold tracking-wider uppercase truncate">Referensi & Penjelasan</span>
          </div>
          {isRefExpanded ? (
            <ChevronUp size={16} className="text-slate-400 shrink-0" />
          ) : (
            <ChevronDown size={16} className="text-slate-400 shrink-0" />
          )}
        </button>

        {/* Collapsible Content */}
        {isRefExpanded && (
          <div className="px-4 pb-4 sm:px-5 sm:pb-5 border-t border-[#E9E3D8]/40 pt-4 flex flex-col gap-4 bg-[#FDFCF9]/50 transition-all min-w-0">
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-sans break-words whitespace-pre-line">
              {mainText}
            </p>

            {formattedSource && (
              <div className="border-t border-[#E9E3D8]/30 pt-3 flex justify-end w-full min-w-0">
                {formattedSource}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-4 sm:p-6 md:p-10 w-full max-w-3xl mx-auto flex flex-col gap-6">
      <Link href="/dua" className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-[#2D5A43] transition-colors w-fit">
        <ArrowLeft size={16} />
        Back to Supplications
      </Link>

      <div className="bg-white rounded-2xl border border-[#E9E3D8] p-5 sm:p-8 md:p-10 flex flex-col gap-8 shadow-sm relative">
        {/* Bookmark Button */}
        <button
          onClick={toggleBookmark}
          className={`absolute top-5 right-5 sm:top-8 sm:right-8 p-2 rounded-xl transition-colors cursor-pointer border ${isBookmarked
              ? "text-[#2D5A43] bg-emerald-50 border-emerald-100"
              : "text-slate-400 hover:text-[#2D5A43] hover:bg-slate-50 border-transparent"
            }`}
          title={isBookmarked ? "Hapus Bookmark Doa" : "Simpan Bookmark Doa"}
        >
          {isBookmarked ? <BookmarkCheck size={20} /> : <Bookmark size={20} />}
        </button>

        <div className="flex flex-col gap-2 border-b border-[#E9E3D8]/50 pb-4 pr-10 sm:pr-12">
          {dua.category && (
            <Link
              href={`/dua?category=${encodeURIComponent(dua.category)}`}
              className="text-xs font-bold text-[#2D5A43] hover:underline uppercase tracking-widest w-fit"
            >
              {dua.category}
            </Link>
          )}
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#1A3A2A] font-serif leading-tight">
            {dua.title}
          </h1>
        </div>

        <div className="flex flex-col gap-6 sm:gap-8 py-2 sm:py-4">
          <p className="text-2xl sm:text-3xl md:text-4xl font-serif text-right leading-loose text-[#2D5A43] mb-2 sm:mb-4" dir="rtl">
            {dua.text_arabic}
          </p>
          {dua.latin && (
            <p className="text-xs sm:text-sm italic text-slate-500 leading-relaxed font-serif bg-[#FDFCF9] border-l-2 border-[#E9E3D8] pl-2 sm:pl-3 py-1">
              {dua.latin}
            </p>
          )}
          <div className="border-l-4 border-[#2D5A43] pl-3 sm:pl-5">
            <p className="text-sm sm:text-base md:text-lg text-slate-600 leading-relaxed italic">
              &quot;{dua.text_translation}&quot;
            </p>
          </div>
        </div>

        {dua.reference && renderReference(dua.reference)}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center gap-3 sm:gap-4 mt-2">
        {prev ? (
          <Link
            href={`/dua/detail/${prev.id}`}
            className="flex-1 max-w-[240px] bg-white rounded-2xl border border-[#E9E3D8] p-2.5 sm:p-3 md:p-4 flex items-center gap-1.5 sm:gap-2 md:gap-3 hover:bg-[#FBF9F4] transition-colors group shadow-sm"
          >
            <ChevronLeft size={18} className="text-[#2D5A43] group-hover:-translate-x-1 transition-transform shrink-0" />
            <div className="flex flex-col text-left overflow-hidden">
              <span className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sebelumnya</span>
              <span className="text-xs md:text-sm font-bold text-[#1A3A2A] truncate hidden sm:block">{prev.title}</span>
            </div>
          </Link>
        ) : (
          <div className="flex-1 max-w-[240px]" />
        )}

        {next ? (
          <Link
            href={`/dua/detail/${next.id}`}
            className="flex-1 max-w-[240px] bg-white rounded-2xl border border-[#E9E3D8] p-2.5 sm:p-3 md:p-4 flex items-center justify-between gap-1.5 sm:gap-2 md:gap-3 hover:bg-[#FBF9F4] transition-colors group shadow-sm text-right"
          >
            <div className="flex flex-col text-right overflow-hidden ml-auto">
              <span className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest">Selanjutnya</span>
              <span className="text-xs md:text-sm font-bold text-[#1A3A2A] truncate hidden sm:block">{next.title}</span>
            </div>
            <ChevronRight size={18} className="text-[#2D5A43] group-hover:translate-x-1 transition-transform shrink-0" />
          </Link>
        ) : (
          <div className="flex-1 max-w-[240px]" />
        )}
      </div>
    </div>
  );
}

