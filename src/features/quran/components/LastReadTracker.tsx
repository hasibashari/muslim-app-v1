"use client";

import { useEffect } from "react";

interface LastReadTrackerProps {
  surahId: number;
  surahName: string;
}

export function LastReadTracker({ surahId, surahName }: LastReadTrackerProps) {
  useEffect(() => {
    // Save last read surah
    localStorage.setItem(
      "noor_last_read_quran",
      JSON.stringify({ id: surahId, name: surahName })
    );

    // Save to recent surahs list (limit to 3 unique items)
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
  }, [surahId, surahName]);

  return null;
}
