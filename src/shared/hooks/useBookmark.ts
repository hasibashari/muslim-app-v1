"use client";

/**
 * useBookmark — Custom hook untuk mengelola bookmark satu item.
 *
 * Mendukung dua mode penyimpanan:
 * 1. Firestore (saat user login dan Firebase terkonfigurasi)
 * 2. localStorage (saat user guest / offline)
 *
 * Pola ini sebelumnya diduplikasi di:
 * - SurahPageClient.tsx
 * - VersesList.tsx
 * - DhikrDetailPageClient.tsx
 * - HadithDetailPageClient.tsx
 */

import { useState, useEffect } from "react";
import { doc, getDoc, setDoc, deleteDoc } from "firebase/firestore";
import { db, isConfigured } from "@/src/lib/firebase";
import { useSession } from "@/src/features/auth/hooks";

export interface BookmarkData {
  item_type: "quran" | "hadith" | "dua" | "dhikr";
  item_id: string;
  title: string;
  subtitle: string;
  category?: string;
  created_at: string;
}

interface UseBookmarkOptions {
  /** Firestore document prefix, e.g. "quran", "dua", "dhikr" */
  docPrefix: string;
  /** The bookmark payload to save when bookmarking */
  bookmarkData: Omit<BookmarkData, "created_at">;
  /** localStorage key prefix used to filter (e.g. filters by item_type) */
  localStorageKey?: string;
}

/**
 * Read all bookmarks from localStorage
 */
export function readLocalBookmarks(): BookmarkData[] {
  try {
    const raw = localStorage.getItem("noor_bookmarks");
    return raw ? (JSON.parse(raw) as BookmarkData[]) : [];
  } catch {
    return [];
  }
}

/**
 * Write all bookmarks back to localStorage
 */
export function writeLocalBookmarks(bookmarks: BookmarkData[]): void {
  try {
    localStorage.setItem("noor_bookmarks", JSON.stringify(bookmarks));
  } catch (e) {
    console.error("Failed to write local bookmarks:", e);
  }
}

/**
 * Hook untuk mengelola state bookmark satu item.
 *
 * @param options.docPrefix     - Prefix dokumen Firestore, e.g. "quran", "dua"
 * @param options.bookmarkData  - Data yang akan disimpan saat bookmark dibuat
 */
export function useBookmark(options: UseBookmarkOptions) {
  const { docPrefix, bookmarkData } = options;
  const { item_type, item_id } = bookmarkData;

  const { data: session, status } = useSession();

  // Inisialisasi sinkron dari localStorage agar tidak ada flicker
  const [isBookmarked, setIsBookmarked] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    const bookmarks = readLocalBookmarks();
    return bookmarks.some(
      (b) => b.item_type === item_type && b.item_id === item_id
    );
  });

  // Jika user login, sinkronkan state dari Firestore
  useEffect(() => {
    if (status !== "authenticated" || !session?.user?.id || !isConfigured) return;

    const docId = `${docPrefix}_${item_id}`;
    const docRef = doc(db, "users", session.user.id, "bookmarks", docId);

    getDoc(docRef)
      .then((snap) => setIsBookmarked(snap.exists()))
      .catch((err) => console.error(`Error loading ${docPrefix} bookmark:`, err));
  }, [status, session?.user?.id, item_id, docPrefix]);

  /** Toggle bookmark on/off */
  const toggleBookmark = async () => {
    const wasBookmarked = isBookmarked;
    // Optimistic update
    setIsBookmarked(!wasBookmarked);

    const fullData: BookmarkData = {
      ...bookmarkData,
      created_at: new Date().toISOString(),
    };

    if (status === "authenticated" && session?.user?.id && isConfigured) {
      // --- Firestore path ---
      try {
        const docId = `${docPrefix}_${item_id}`;
        const docRef = doc(db, "users", session.user.id, "bookmarks", docId);
        if (wasBookmarked) {
          await deleteDoc(docRef);
        } else {
          await setDoc(docRef, fullData);
        }
      } catch (err) {
        console.error(`Failed to toggle ${docPrefix} bookmark in Firestore:`, err);
        // Revert optimistic update on failure
        setIsBookmarked(wasBookmarked);
      }
    } else {
      // --- localStorage path ---
      try {
        let bookmarks = readLocalBookmarks();
        if (wasBookmarked) {
          bookmarks = bookmarks.filter(
            (b) => !(b.item_type === item_type && b.item_id === item_id)
          );
        } else {
          bookmarks.push(fullData);
        }
        writeLocalBookmarks(bookmarks);
      } catch (e) {
        console.error(`Failed to toggle local ${docPrefix} bookmark:`, e);
        // Revert optimistic update on failure
        setIsBookmarked(wasBookmarked);
      }
    }
  };

  return { isBookmarked, toggleBookmark };
}

/**
 * Hook untuk mengelola state bookmark BANYAK item sekaligus (e.g., semua ayat di satu surah).
 * Berguna untuk VersesList dan HadithDetailPageClient yang render banyak item.
 *
 * @param itemType    - Tipe item ("quran" | "hadith" | "dua" | "dhikr")
 * @param docPrefix   - Prefix dokumen Firestore
 * @param itemPrefix  - Prefix item_id untuk filter (e.g. "2:" untuk Surah Al-Baqarah)
 * @param buildItemId - Fungsi untuk membentuk item_id dari verse/hadith number
 */
export function useBookmarkList(params: {
  itemType: BookmarkData["item_type"];
  docPrefix: string;
  /** Filter hanya bookmark yang item_id-nya dimulai dengan string ini */
  itemIdPrefix: string;
  /** Firebase collection path — array of path segments */
}) {
  const { itemType, docPrefix, itemIdPrefix } = params;
  const { data: session, status } = useSession();

  const [bookmarkedMap, setBookmarkedMap] = useState<Record<string, boolean>>(
    () => {
      if (typeof window === "undefined") return {};
      const bookmarks = readLocalBookmarks();
      const map: Record<string, boolean> = {};
      bookmarks.forEach((b) => {
        if (b.item_type === itemType && b.item_id.startsWith(itemIdPrefix)) {
          map[b.item_id] = true;
        }
      });
      return map;
    }
  );

  return { bookmarkedMap, setBookmarkedMap, status, session };
}
