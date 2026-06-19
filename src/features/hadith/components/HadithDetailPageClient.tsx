"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ChevronLeft, ChevronRight, Bookmark, BookmarkCheck, Search, X } from "lucide-react";
import { getPageNumbers } from "@/src/shared/utils/pagination";
import { useBookmarkList } from "@/src/shared/hooks/useBookmark";

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
  originalTotalHadith: number;
  page: number;
  totalPages: number;
  startItem: number;
  endItem: number;
  initialQuery?: string;
}

export function HadithDetailPageClient({
  hadiths,
  collection: hadithCollection,
  originalTotalHadith,
  page,
  totalPages,
  startItem,
  endItem,
  initialQuery = "",
}: HadithDetailPageClientProps) {
  const collectionId = hadithCollection.id;
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState(initialQuery);

  const { bookmarkedMap: bookmarkedHadiths, toggleBookmark } = useBookmarkList({
    itemType: "hadith",
    docPrefix: "hadith",
    itemIdPrefix: `${collectionId}:`,
  });

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = searchQuery.trim();
    if (trimmed) {
      router.push(`/hadith/${collectionId}?page=1&q=${encodeURIComponent(trimmed)}`);
    } else {
      router.push(`/hadith/${collectionId}?page=1`);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    router.push(`/hadith/${collectionId}?page=1`);
  };

  const getPageUrl = (p: number) => {
    return `/hadith/${collectionId}?page=${p}${initialQuery ? `&q=${encodeURIComponent(initialQuery)}` : ""}`;
  };

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

  // Toggle Hadith bookmark
  const handleToggleBookmark = async (hadith: Hadith) => {
    const itemId = `${collectionId}:${page}:${hadith.hadith_number}`;
    await toggleBookmark({
      itemId,
      title: `${hadithCollection.name} • Hadith #${hadith.hadith_number}`,
      subtitle: hadith.text_en.length > 60 ? `${hadith.text_en.substring(0, 60)}...` : hadith.text_en,
    });
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
          {initialQuery ? (
            <p className="text-slate-400 font-semibold uppercase tracking-widest text-xs">
              Found {hadithCollection.total_hadith} matching Hadiths (out of {originalTotalHadith})
            </p>
          ) : (
            <p className="text-slate-400 font-semibold uppercase tracking-widest text-xs">
              Total {hadithCollection.total_hadith} Hadiths
            </p>
          )}
        </div>
        {hadithCollection.total_hadith > 0 && (
          <p className="text-xs font-semibold text-slate-500 bg-[#F5F1EA] px-3.5 py-1.5 rounded-full border border-[#E9E3D8]">
            Showing {startItem} - {endItem} of {hadithCollection.total_hadith}
          </p>
        )}
      </div>

      {/* Search Input Bar */}
      <form onSubmit={handleSearchSubmit} className="relative w-full max-w-xl group">
        <div className="relative flex items-center bg-white rounded-2xl border border-[#E9E3D8] hover:border-[#2D5A43]/50 focus-within:border-[#2D5A43] focus-within:shadow-md transition-all duration-300">
          <div className="pl-4 pr-2 text-slate-400 group-focus-within:text-[#2D5A43] transition-colors shrink-0">
            <Search size={18} />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nomor hadits atau kata kunci..."
            className="w-full py-3.5 pr-10 text-sm text-slate-800 placeholder:text-slate-400 bg-transparent outline-none font-medium"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="absolute right-3 p-1 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all cursor-pointer"
              title="Bersihkan Pencarian"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </form>

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
              href={getPageUrl(page - 1)}
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
                href={getPageUrl(Number(p))}
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
              href={getPageUrl(page + 1)}
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
