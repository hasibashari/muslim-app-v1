"use client";

import { useEffect } from "react";
import { useSession } from "@/src/features/auth/hooks";
import { doc, setDoc } from "firebase/firestore";
import { db, isConfigured } from "@/src/lib/firebase";

interface LastReadTrackerProps {
  surahId: number;
  surahName: string;
}

export function LastReadTracker({ surahId, surahName }: LastReadTrackerProps) {
  const { data: session, status } = useSession();

  useEffect(() => {
    // 1. Save last read surah to localStorage
    const lastReadData = { id: surahId, name: surahName };
    localStorage.setItem("noor_last_read_quran", JSON.stringify(lastReadData));

    // 2. Save to recent surahs list (limit to 3 unique items)
    const recentRaw = localStorage.getItem("noor_recent_surahs");
    let recentIds: number[] = [];
    if (recentRaw) {
      try {
        recentIds = JSON.parse(recentRaw);
      } catch (e) {}
    }
    // Filter out current id, insert at front, slice to max 3
    recentIds = [surahId, ...recentIds.filter((id) => id !== surahId)].slice(0, 3);
    localStorage.setItem("noor_recent_surahs", JSON.stringify(recentIds));

    // 3. Save to Firestore if authenticated
    if (status === "authenticated" && session?.user?.id && isConfigured) {
      const uid = session.user.id;
      // Save last read
      const lastReadRef = doc(db, "users", uid, "readHistory", "quran");
      setDoc(lastReadRef, {
        id: surahId,
        name: surahName,
        timestamp: new Date().toISOString()
      }, { merge: true }).catch((err) =>
        console.error("Error saving last read to Firestore:", err)
      );

      // Save recent surahs
      const recentRef = doc(db, "users", uid, "readHistory", "recent");
      setDoc(recentRef, {
        ids: recentIds,
        timestamp: new Date().toISOString()
      }, { merge: true }).catch((err) =>
        console.error("Error saving recent surahs to Firestore:", err)
      );
    }
  }, [surahId, surahName, status, session?.user?.id]);

  return null;
}
