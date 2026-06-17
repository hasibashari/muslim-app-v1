"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, ChevronLeft, ChevronRight, Bookmark, BookmarkCheck } from "lucide-react";
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
  const [isBookmarked, setIsBookmarked] = useState(() => {
    if (typeof window !== "undefined") {
      const itemId = String(dua.id);
      const localData = localStorage.getItem("noor_bookmarks");
      if (localData) {
        try {
          const parsed = JSON.parse(localData) as any[];
          return parsed.some((b) => b.item_type === "dua" && b.item_id === itemId);
        } catch (e) {}
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

  return (
    <div className="p-6 md:p-10 w-full max-w-3xl mx-auto flex flex-col gap-6">
      <Link href="/dua" className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-[#2D5A43] transition-colors w-fit">
        <ArrowLeft size={16} />
        Back to Supplications
      </Link>

      <div className="bg-white rounded-3xl border border-[#E9E3D8] p-8 md:p-10 flex flex-col gap-8 shadow-sm relative">
        {/* Bookmark Button */}
        <button
          onClick={toggleBookmark}
          className={`absolute top-8 right-8 p-2 rounded-xl transition-colors cursor-pointer border ${
            isBookmarked 
              ? "text-[#2D5A43] bg-emerald-50 border-emerald-100" 
              : "text-slate-400 hover:text-[#2D5A43] hover:bg-slate-50 border-transparent"
          }`}
          title={isBookmarked ? "Hapus Bookmark Doa" : "Simpan Bookmark Doa"}
        >
          {isBookmarked ? <BookmarkCheck size={20} /> : <Bookmark size={20} />}
        </button>

        <div className="flex flex-col gap-2 border-b border-[#E9E3D8]/50 pb-4 pr-12">
          {dua.category && (
            <Link
              href={`/dua?category=${encodeURIComponent(dua.category)}`}
              className="text-xs font-bold text-[#2D5A43] hover:underline uppercase tracking-widest w-fit"
            >
              {dua.category}
            </Link>
          )}
          <h1 className="text-3xl font-bold text-[#1A3A2A] font-serif leading-tight">
            {dua.title}
          </h1>
        </div>

        <div className="flex flex-col gap-8 py-4">
          <p className="text-3xl md:text-4xl font-serif text-right leading-loose text-[#2D5A43] mb-4" dir="rtl">
            {dua.text_arabic}
          </p>
          {dua.latin && (
            <p className="text-sm italic text-slate-500 leading-relaxed font-serif bg-[#FDFCF9] border-l-2 border-[#E9E3D8] pl-3 py-1">
              {dua.latin}
            </p>
          )}
          <div className="border-l-4 border-[#2D5A43] pl-5">
            <p className="text-base md:text-lg text-slate-600 leading-relaxed italic">
              &quot;{dua.text_translation}&quot;
            </p>
          </div>
        </div>

        {dua.reference && (
          <div className="pt-4 border-t border-[#E9E3D8]/50 flex justify-end">
            <span className="text-xs font-semibold text-slate-400">
              Reference: {dua.reference}
            </span>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center gap-4 mt-2">
        {prev ? (
          <Link
            href={`/dua/detail/${prev.id}`}
            className="flex-1 max-w-[240px] bg-white rounded-2xl border border-[#E9E3D8] p-4 flex items-center gap-3 hover:bg-[#FBF9F4] transition-colors group shadow-sm"
          >
            <ChevronLeft size={20} className="text-[#2D5A43] group-hover:-translate-x-1 transition-transform shrink-0" />
            <div className="flex flex-col text-left overflow-hidden">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sebelumnya</span>
              <span className="text-sm font-bold text-[#1A3A2A] truncate">{prev.title}</span>
            </div>
          </Link>
        ) : (
          <div className="flex-1 max-w-[240px]" />
        )}

        {next ? (
          <Link
            href={`/dua/detail/${next.id}`}
            className="flex-1 max-w-[240px] bg-white rounded-2xl border border-[#E9E3D8] p-4 flex items-center justify-between gap-3 hover:bg-[#FBF9F4] transition-colors group shadow-sm text-right"
          >
            <div className="flex flex-col text-right overflow-hidden ml-auto">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Selanjutnya</span>
              <span className="text-sm font-bold text-[#1A3A2A] truncate">{next.title}</span>
            </div>
            <ChevronRight size={20} className="text-[#2D5A43] group-hover:translate-x-1 transition-transform shrink-0" />
          </Link>
        ) : (
          <div className="flex-1 max-w-[240px]" />
        )}
      </div>
    </div>
  );
}
