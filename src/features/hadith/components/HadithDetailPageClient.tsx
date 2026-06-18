"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, ChevronLeft, ChevronRight, Bookmark, BookmarkCheck } from "lucide-react";
import { useSession } from "@/src/features/auth/hooks";
import { collection, doc, getDocs, setDoc, deleteDoc } from "firebase/firestore";
import { db, isConfigured } from "@/src/lib/firebase";
import { getPageNumbers } from "@/src/shared/utils/pagination";
import { readLocalBookmarks, writeLocalBookmarks } from "@/src/shared/hooks/useBookmark";

interface Hadith {
  id: number;
  collection_id: string;
  hadith_number: string;
  text_arab: string;
  text_en: string;
}

interface Collection {
  id: string;
  name: string;
  total_hadith: number;
}

interface HadithDetailPageClientProps {
  hadiths: Hadith[];
  collection: Collection;
  page: number;
  totalPages: number;
  startItem: number;
  endItem: number;
}

export function HadithDetailPageClient({
  hadiths,
  collection: hadithCollection,
  page,
  totalPages,
  startItem,
  endItem,
}: HadithDetailPageClientProps) {
  const { data: session, status } = useSession();
  const collectionId = hadithCollection.id;
  const [bookmarkedHadiths, setBookmarkedHadiths] = useState<Record<string, boolean>>(
    () => {
      if (typeof window === "undefined") return {};
      const allBookmarks = readLocalBookmarks();
      const bookmarked: Record<string, boolean> = {};
      allBookmarks.forEach((b) => {
        if (b.item_type === "hadith" && b.item_id.startsWith(`${collectionId}:`)) {
          bookmarked[b.item_id] = true;
        }
      });
      return bookmarked;
    }
  );

  // 1. Fetch bookmarked Hadiths for this collection in Firestore
  useEffect(() => {
    if (status === "authenticated" && session?.user?.id && isConfigured) {
      const bookmarksRef = collection(db, "users", session.user.id, "bookmarks");
      getDocs(bookmarksRef).then((snap) => {
        const bookmarked: Record<string, boolean> = {};
        snap.forEach((docSnap) => {
          const data = docSnap.data();
          if (data.item_type === "hadith" && data.item_id.startsWith(`${collectionId}:`)) {
            bookmarked[data.item_id] = true;
          }
        });
        setBookmarkedHadiths(bookmarked);
      }).catch((err) => console.error("Error fetching hadith bookmarks:", err));
    }
  }, [status, session?.user?.id, collectionId]);

  // Scroll to hash element if present (e.g. #hadith-300)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const hash = window.location.hash;
      if (hash) {
        const id = hash.substring(1);
        const element = document.getElementById(id);
        if (element) {
          const timer = setTimeout(() => {
            element.scrollIntoView({ behavior: "smooth", block: "center" });
          }, 200);
          return () => clearTimeout(timer);
        }
      }
    }
  }, [hadiths]);

  // 2. Toggle Hadith bookmark
  const handleToggleBookmark = async (hadith: Hadith) => {
    const itemId = `${collectionId}:${page}:${hadith.hadith_number}`;
    const isCurrentlyBookmarked = !!bookmarkedHadiths[itemId];

    // Optimistic Update
    setBookmarkedHadiths((prev) => ({
      ...prev,
      [itemId]: !isCurrentlyBookmarked,
    }));

    const bookmarkData = {
      item_type: "hadith" as const,
      item_id: itemId,
      title: `${hadithCollection.name} • Hadith #${hadith.hadith_number}`,
      subtitle: hadith.text_en.length > 60 ? `${hadith.text_en.substring(0, 60)}...` : hadith.text_en,
      created_at: new Date().toISOString(),
    };

    if (status === "authenticated" && session?.user?.id && isConfigured) {
      try {
        const docId = `hadith_${itemId.replace(/:/g, "_")}`;
        const docRef = doc(db, "users", session.user.id, "bookmarks", docId);
        if (isCurrentlyBookmarked) {
          await deleteDoc(docRef);
        } else {
          await setDoc(docRef, bookmarkData);
        }
      } catch (err) {
        console.error("Failed to toggle hadith bookmark in Firestore:", err);
        // Revert optimistic update
        setBookmarkedHadiths((prev) => ({ ...prev, [itemId]: isCurrentlyBookmarked }));
      }
    } else {
      try {
        let bookmarks = readLocalBookmarks();
        if (isCurrentlyBookmarked) {
          bookmarks = bookmarks.filter((b) => !(b.item_type === "hadith" && b.item_id === itemId));
        } else {
          bookmarks.push(bookmarkData);
        }
        writeLocalBookmarks(bookmarks);
      } catch (e) {
        console.error("Failed to toggle local hadith bookmark:", e);
        // Revert optimistic update
        setBookmarkedHadiths((prev) => ({ ...prev, [itemId]: isCurrentlyBookmarked }));
      }
    }
  };

  return (
    <div className="p-6 md:p-10 w-full max-w-4xl mx-auto flex flex-col gap-6">
      <Link href="/hadith" className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-[#2D5A43] transition-colors w-fit">
        <ArrowLeft size={16} />
        Back to Collections
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pb-4 border-b border-[#E9E3D8]/50">
        <div className="flex flex-col gap-1">
          <h1 className="text-4xl font-bold text-[#1A3A2A] font-serif">{hadithCollection.name}</h1>
          <p className="text-slate-400 font-semibold uppercase tracking-widest text-xs">
            Total {hadithCollection.total_hadith} Hadiths
          </p>
        </div>
        <p className="text-xs font-semibold text-slate-500 bg-[#F5F1EA] px-3.5 py-1.5 rounded-full border border-[#E9E3D8]">
          Showing {startItem} - {endItem} of {hadithCollection.total_hadith}
        </p>
      </div>

      {/* Hadith List */}
      <div className="flex flex-col gap-8 mt-2">
        {hadiths.map((hadith) => {
          const itemId = `${collectionId}:${page}:${hadith.hadith_number}`;
          const isBookmarked = !!bookmarkedHadiths[itemId];

          return (
            <div key={hadith.id} id={`hadith-${hadith.hadith_number}`} className="bg-white rounded-2xl border border-[#E9E3D8] p-6 md:p-8 flex flex-col gap-6 relative shadow-sm">
              <div className="absolute top-8 left-0 w-1 h-12 bg-[#2D5A43] rounded-r-md"></div>

              <div className="flex justify-between items-center border-b border-[#E9E3D8]/50 pb-4">
                <div className="px-4 py-1.5 rounded-full bg-[#F5F1EA] flex items-center justify-center font-bold text-[#2D5A43] text-sm tracking-wider">
                  Hadith {hadith.hadith_number}
                </div>

                {/* Bookmark Button */}
                <button
                  onClick={() => handleToggleBookmark(hadith)}
                  className={`p-2 rounded-xl transition-colors cursor-pointer ${isBookmarked
                    ? "text-[#2D5A43] bg-emerald-50 border border-emerald-100"
                    : "text-slate-400 hover:text-[#2D5A43] hover:bg-slate-50 border border-transparent"
                    }`}
                  title={isBookmarked ? "Remove Hadith Bookmark" : "Save Hadith Bookmark"}
                >
                  {isBookmarked ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
                </button>
              </div>

              <div className="flex flex-col gap-8">
                <p className="text-2xl md:text-3xl font-serif text-right leading-loose text-[#2D5A43]" dir="rtl">
                  {hadith.text_arab}
                </p>
                <div className="h-px w-full bg-slate-100"></div>
                <p className="text-base md:text-lg text-slate-600 leading-relaxed">
                  {hadith.text_en}
                </p>
              </div>
            </div>
          );
        })}
        {hadiths.length === 0 && (
          <div className="p-10 text-center text-slate-500 bg-white rounded-2xl border border-[#E9E3D8]">No Hadiths found.</div>
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <nav className="flex items-center justify-center gap-1.5 sm:gap-2 mt-8 py-6 border-t border-[#E9E3D8]/50" aria-label="Pagination">
          {page > 1 ? (
            <Link
              href={`/hadith/${collectionId}?page=${page - 1}`}
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white text-slate-600 border border-[#E9E3D8] flex items-center justify-center hover:bg-[#FBF9F4] hover:text-[#2D5A43] hover:border-[#2D5A43]/30 transition-colors shadow-sm shrink-0"
              title="Previous Page"
            >
              <ChevronLeft size={16} />
            </Link>
          ) : (
            <span className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-slate-50 text-slate-300 border border-slate-100 flex items-center justify-center cursor-not-allowed shadow-none shrink-0">
              <ChevronLeft size={16} />
            </span>
          )}

          {getPageNumbers(page, totalPages).map((p, idx) => {
            if (p === '...') {
              return (
                <span key={`ellips-${idx}`} className="w-8 h-8 sm:w-10 sm:h-10 hidden sm:flex items-center justify-center text-slate-400 text-xs sm:text-sm font-bold shrink-0">
                  ...
                </span>
              );
            }
            const isCurrent = p === page;
            const isNear = p === page || p === page - 1 || p === page + 1;
            return (
              <Link
                key={`page-${p}`}
                href={`/hadith/${collectionId}?page=${p}`}
                className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full items-center justify-center text-xs sm:text-sm font-bold transition-colors shadow-sm shrink-0 ${isNear ? 'flex' : 'hidden sm:flex'
                  } ${isCurrent
                    ? 'bg-[#2D5A43] text-white border border-[#2D5A43]'
                    : 'bg-white text-slate-600 border border-[#E9E3D8] hover:bg-[#FBF9F4] hover:text-[#2D5A43] hover:border-[#2D5A43]/30'
                  }`}
                aria-current={isCurrent ? 'page' : undefined}
              >
                {p}
              </Link>
            );
          })}

          {page < totalPages ? (
            <Link
              href={`/hadith/${collectionId}?page=${page + 1}`}
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white text-slate-600 border border-[#E9E3D8] flex items-center justify-center hover:bg-[#FBF9F4] hover:text-[#2D5A43] hover:border-[#2D5A43]/30 transition-colors shadow-sm shrink-0"
              title="Next Page"
            >
              <ChevronRight size={16} />
            </Link>
          ) : (
            <span className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-slate-50 text-slate-300 border border-slate-100 flex items-center justify-center cursor-not-allowed shadow-none shrink-0">
              <ChevronRight size={16} />
            </span>
          )}
        </nav>
      )}
    </div>
  );
}
