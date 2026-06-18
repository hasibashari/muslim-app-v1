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
import { doc, getDoc, setDoc, deleteDoc, collection, getDocs } from "firebase/firestore";
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

interface UseBookmarkListOptions {
  itemType: BookmarkData["item_type"];
  docPrefix: string;
  itemIdPrefix?: string;
  category?: string;
}

/**
 * Hook untuk mengelola state bookmark BANYAK item sekaligus (e.g., semua ayat di satu surah, atau hadits).
 * Mendukung Firestore (auth) dan localStorage (guest/offline) secara transparan.
 */
export function useBookmarkList(options: UseBookmarkListOptions) {
  const { itemType, docPrefix, itemIdPrefix, category } = options;
  const { data: session, status } = useSession();
  const [bookmarkedMap, setBookmarkedMap] = useState<Record<string, boolean>>(() => {
    if (typeof window === "undefined") return {};
    const allBookmarks = readLocalBookmarks();
    const initialMap: Record<string, boolean> = {};
    allBookmarks.forEach((b) => {
      if (b.item_type === itemType) {
        if (itemIdPrefix && !b.item_id.startsWith(itemIdPrefix)) return;
        if (category && b.category !== category) return;
        initialMap[b.item_id] = true;
      }
    });
    return initialMap;
  });

  // 1. Sync from localStorage if parameters change
  useEffect(() => {
    const allBookmarks = readLocalBookmarks();
    const initialMap: Record<string, boolean> = {};
    allBookmarks.forEach((b) => {
      if (b.item_type === itemType) {
        if (itemIdPrefix && !b.item_id.startsWith(itemIdPrefix)) return;
        if (category && b.category !== category) return;
        initialMap[b.item_id] = true;
      }
    });
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setBookmarkedMap(initialMap);
  }, [itemType, itemIdPrefix, category]);

  // 2. Load from Firestore if authenticated
  useEffect(() => {
    if (status !== "authenticated" || !session?.user?.id || !isConfigured) return;

    const bookmarksRef = collection(db, "users", session.user.id, "bookmarks");
    getDocs(bookmarksRef)
      .then((snap) => {
        const fbMap: Record<string, boolean> = {};
        snap.forEach((docSnap) => {
          const data = docSnap.data();
          if (data.item_type === itemType) {
            if (itemIdPrefix && !data.item_id.startsWith(itemIdPrefix)) return;
            if (category && data.category !== category) return;
            fbMap[data.item_id] = true;
          }
        });
        setBookmarkedMap(fbMap);
      })
      .catch((err) => console.error(`Error fetching ${itemType} bookmarks:`, err));
  }, [status, session?.user?.id, itemType, itemIdPrefix, category]);

  /** Toggle bookmark for a specific item in the list */
  const toggleBookmark = async (params: {
    itemId: string;
    title: string;
    subtitle: string;
    category?: string;
  }) => {
    const { itemId, title, subtitle, category: itemCategory } = params;
    const isCurrentlyBookmarked = !!bookmarkedMap[itemId];

    // Optimistic Update
    setBookmarkedMap((prev) => ({
      ...prev,
      [itemId]: !isCurrentlyBookmarked,
    }));

    const bookmarkData: BookmarkData = {
      item_type: itemType,
      item_id: itemId,
      title,
      subtitle,
      category: itemCategory,
      created_at: new Date().toISOString(),
    };

    if (status === "authenticated" && session?.user?.id && isConfigured) {
      try {
        const docId = `${docPrefix}_${itemId.replace(/:/g, "_")}`;
        const docRef = doc(db, "users", session.user.id, "bookmarks", docId);
        
        if (isCurrentlyBookmarked) {
          await deleteDoc(docRef);
        } else {
          await setDoc(docRef, bookmarkData);
        }
      } catch (err) {
        console.error(`Failed to toggle ${itemType} bookmark in Firestore:`, err);
        // Revert optimistic update
        setBookmarkedMap((prev) => ({ ...prev, [itemId]: isCurrentlyBookmarked }));
      }
    } else {
      try {
        let bookmarks = readLocalBookmarks();
        if (isCurrentlyBookmarked) {
          bookmarks = bookmarks.filter((b) => !(b.item_type === itemType && b.item_id === itemId));
        } else {
          bookmarks.push(bookmarkData);
        }
        writeLocalBookmarks(bookmarks);
      } catch (e) {
        console.error(`Failed to toggle local ${itemType} bookmark:`, e);
        // Revert optimistic update
        setBookmarkedMap((prev) => ({ ...prev, [itemId]: isCurrentlyBookmarked }));
      }
    }
  };

  return { bookmarkedMap, toggleBookmark, status, session };
}
