"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Bookmark, BookmarkCheck } from "lucide-react";
import { LastReadTracker } from "@/src/features/quran/components/LastReadTracker";
import { VersesList } from "./VersesList";
import type { Surah, Verse } from "../types";
import { useSession } from "@/src/features/auth/hooks";
import { collection, doc, getDoc, setDoc, deleteDoc } from "firebase/firestore";
import { db, isConfigured } from "@/src/lib/firebase";

interface SurahPageClientProps {
  surah: Surah;
  verses: Verse[];
}

export function SurahPageClient({ surah, verses }: SurahPageClientProps) {
  const { data: session, status } = useSession();
  const [isBookmarked, setIsBookmarked] = useState(() => {
    if (typeof window !== "undefined") {
      const itemId = String(surah.id);
      const localData = localStorage.getItem("noor_bookmarks");
      if (localData) {
        try {
          const parsed = JSON.parse(localData) as any[];
          return parsed.some((b) => b.item_type === "quran" && b.item_id === itemId);
        } catch (e) {}
      }
    }
    return false;
  });

  // 1. Check if Surah is bookmarked in Firestore
  useEffect(() => {
    const itemId = String(surah.id);
    if (status === "authenticated" && session?.user?.id && isConfigured) {
      const docId = `quran_${itemId}`;
      const docRef = doc(db, "users", session.user.id, "bookmarks", docId);
      getDoc(docRef).then((snap) => {
        setIsBookmarked(snap.exists());
      }).catch((err) => console.error("Error loading Surah bookmark:", err));
    }
  }, [status, session?.user?.id, surah.id]);

  // 2. Toggle Surah bookmark
  const toggleSurahBookmark = async () => {
    const itemId = String(surah.id);
    const currentlyBookmarked = isBookmarked;
    setIsBookmarked(!currentlyBookmarked);

    const bookmarkData = {
      item_type: "quran" as const,
      item_id: itemId,
      title: surah.name_simple,
      subtitle: `Surah • ${surah.translated_name}`,
      created_at: new Date().toISOString(),
    };

    if (status === "authenticated" && session?.user?.id && isConfigured) {
      try {
        const docId = `quran_${itemId}`;
        const docRef = doc(db, "users", session.user.id, "bookmarks", docId);
        if (currentlyBookmarked) {
          await deleteDoc(docRef);
        } else {
          await setDoc(docRef, bookmarkData);
        }
      } catch (err) {
        console.error("Failed to toggle Surah bookmark in Firestore:", err);
      }
    } else {
      try {
        const localData = localStorage.getItem("noor_bookmarks");
        let bookmarks = localData ? JSON.parse(localData) : [];
        if (currentlyBookmarked) {
          bookmarks = bookmarks.filter((b: any) => !(b.item_type === "quran" && b.item_id === itemId));
        } else {
          bookmarks.push(bookmarkData);
        }
        localStorage.setItem("noor_bookmarks", JSON.stringify(bookmarks));
      } catch (e) {
        console.error("Failed to toggle local Surah bookmark:", e);
      }
    }
  };

  return (
    <div className="p-6 md:p-10 w-full max-w-4xl mx-auto flex flex-col gap-6">
      <LastReadTracker surahId={surah.id} surahName={surah.name_simple} />
      <Link href="/quran" className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-[#2D5A43] transition-colors w-fit">
        <ArrowLeft size={16} />
        Back to Surahs
      </Link>

      {/* Surah Header Card */}
      <section className="bg-gradient-to-br from-[#2D5A43] to-[#1A3A2A] rounded-[2.5rem] p-10 text-white relative overflow-hidden flex flex-col items-center justify-center text-center shadow-lg shadow-[#2D5A43]/20 border border-[#2D5A43]">
        {/* Bookmark Button */}
        <button
          onClick={toggleSurahBookmark}
          className={`absolute top-6 right-6 p-3 rounded-2xl transition-all cursor-pointer backdrop-blur-md shadow-sm border ${
            isBookmarked 
              ? "bg-white text-[#2D5A43] border-white" 
              : "bg-white/10 text-white hover:bg-white/20 border-white/20"
          }`}
          title={isBookmarked ? "Hapus Bookmark Surah" : "Simpan Bookmark Surah"}
        >
          {isBookmarked ? <BookmarkCheck size={20} /> : <Bookmark size={20} />}
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
