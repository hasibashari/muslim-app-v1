"use client";

import { useState, useEffect } from "react";
import { Clock, Calendar } from "lucide-react";
import { calculatePrayerTimes } from "@/src/lib/prayerTimes";

// Helper for manual tabular Hijri calculation (fallback)
function getFallbackHijri(date: Date) {
  const time = date.getTime();
  const jd = time / 86400000 + 2440587.5;

  const l = Math.floor(jd) - 1948440 + 10632;
  const n = Math.floor((l - 1) / 10631);
  const remainingL = l - 10631 * n + 354;

  const j = Math.floor((10985 - remainingL) / 5316) * Math.floor((50 * remainingL) / 17719) +
    Math.floor(remainingL / 5658) * Math.floor((51 * remainingL) / 32516);

  const finalL = remainingL - Math.floor((30 - j) / 15) * Math.floor((17719 * j) / 50) -
    Math.floor(j / 16) * Math.floor((32516 * j) / 51) + 29;

  const month = Math.floor((24 * finalL) / 709);
  const day = finalL - Math.floor((709 * month) / 24);
  const year = 30 * n + j - 30;

  return { day, month, year };
}

const HIJRI_MONTHS = [
  "Muharram", "Safar", "Rabi'ul Awal", "Rabi'ul Akhir",
  "Jumadil Awal", "Jumadil Akhir", "Rajab", "Sya'ban",
  "Ramadan", "Syawal", "Dzulqa'dah", "Dzulhijjah"
];

export function PrayerAndCalendarWidgets() {
  const [isMounted, setIsMounted] = useState(false);
  const [currentTime, setCurrentTime] = useState("");
  const [hijriDate, setHijriDate] = useState("Loading...");
  const [hijriYear, setHijriYear] = useState("");

  // Default coordinates: Jakarta
  const [coords, setCoords] = useState({ latitude: -6.2088, longitude: 106.8456 });
  const [locationName, setLocationName] = useState("Jakarta");

  // Set mounted state
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true);
  }, []);

  // 1. Load saved location or request if not present
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedCoords = localStorage.getItem("noor_user_coords");
      const savedLocationName = localStorage.getItem("noor_location_name");

      if (savedCoords) {
        try {
          const parsed = JSON.parse(savedCoords);
          if (parsed && typeof parsed.latitude === "number" && typeof parsed.longitude === "number") {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setCoords(parsed);
            setLocationName(savedLocationName || "Your Location");
            return; // Use saved coordinates, do not trigger prompt!
          }
        } catch (e) {
          console.error("Failed to parse saved coordinates:", e);
        }
      }

      // If no saved coordinates, request once
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const newCoords = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            };
            setCoords(newCoords);
            setLocationName("Your Location");
            localStorage.setItem("noor_user_coords", JSON.stringify(newCoords));
            localStorage.setItem("noor_location_name", "Your Location");
          },
          (error) => {
            console.log("Using default location (Jakarta) due to: ", error.message);
          }
        );
      }
    }
  }, []);

  // 2. Update current clock time and Hijri date
  useEffect(() => {
    const updateTimeAndDate = () => {
      const now = new Date();

      // Time string format "HH:MM"
      const hh = String(now.getHours()).padStart(2, "0");
      const mm = String(now.getMinutes()).padStart(2, "0");
      setCurrentTime(`${hh}:${mm}`);

      // Calculate Hijri Date with native Intl API or fallback
      try {
        const formatterDate = new Intl.DateTimeFormat("id-ID-u-ca-islamic-umalqura", {
          day: "numeric",
          month: "long",
        });
        const formatterYear = new Intl.DateTimeFormat("id-ID-u-ca-islamic-umalqura", {
          year: "numeric",
        });

        const dateStr = formatterDate.format(now);
        const yearStr = formatterYear.format(now);

        // Validation: Safari/some environments might incorrectly format Hijri using Gregorian month names (like January) or BC/AD
        const gregorianMonths = [
          "january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december",
          "januari", "februari", "maret", "mei", "juni", "juli", "agustus", "oktober", "desember"
        ];
        const dateLower = dateStr.toLowerCase();
        const yearLower = yearStr.toLowerCase();

        const hasGregorianMonth = gregorianMonths.some(m => dateLower.includes(m));
        const hasInvalidEra = yearLower.includes("bc") || yearLower.includes("ad") || yearLower.includes("bce") || yearLower.includes("ce") || yearLower.includes("sebelum masehi");

        // Force fallback if Gregorian calendar leaked (e.g. contains 2026) or era bug occurred
        if (hasGregorianMonth || hasInvalidEra || yearLower.includes("2025") || yearLower.includes("2026") || yearLower.includes("2027")) {
          throw new Error("Invalid Hijri format detected");
        }

        setHijriDate(dateStr);
        setHijriYear(yearStr);
      } catch (e) {
        // Fallback: manual calculation
        const hijri = getFallbackHijri(now);
        setHijriDate(`${hijri.day} ${HIJRI_MONTHS[hijri.month - 1]}`);
        setHijriYear(`${hijri.year} H`);
      }
    };

    updateTimeAndDate();
    const interval = setInterval(updateTimeAndDate, 30000); // update every 30s
    return () => clearInterval(interval);
  }, []);

  // 3. Calculate prayer times for the current date & coordinates
  const now = new Date();
  const timezoneOffset = -now.getTimezoneOffset() / 60; // offset in hours (e.g. +7 for WIB)
  const times = calculatePrayerTimes(now, coords.latitude, coords.longitude, timezoneOffset);

  // 4. Find the next prayer time
  const getNextPrayer = () => {
    if (!isMounted || !currentTime) {
      return { name: "--", time: "--:--" };
    }
    const list = [
      { name: "Fajr", time: times.Fajr },
      { name: "Dhuhr", time: times.Dhuhr },
      { name: "Asr", time: times.Asr },
      { name: "Maghrib", time: times.Maghrib },
      { name: "Isha", time: times.Isha },
    ];

    for (const p of list) {
      if (p.time > currentTime) {
        return p;
      }
    }
    // If after Isya, next is Fajr tomorrow
    return { name: "Subuh", time: list[0].time };
  };

  const nextPrayer = getNextPrayer();

  return (
    <>
      {/* Prayer Time Widget */}
      <div
        className="bg-white border border-[#E9E3D8] p-5 rounded-2xl flex flex-col items-center justify-center text-center shadow-sm hover:shadow-md hover:border-[#2D5A43]/30 transition-all select-none"
        title={`Today's prayer times for ${locationName}`}
      >
        <div className="w-10 h-10 rounded-full bg-[#F5F1EA] flex items-center justify-center text-[#2D5A43] mb-2">
          <Clock size={20} />
        </div>
        <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Prayer Schedule</p>
        <p className="font-bold text-[#1A3A2A] text-lg mt-0.5">{nextPrayer.name}</p>
        <p className="text-xs font-bold text-[#2D5A43] bg-[#F0F4F2] px-3 py-1 rounded-full mt-2 transition-all">
          {nextPrayer.time}
        </p>
      </div>

      {/* Hijri Calendar Widget */}
      <div
        className="bg-white border border-[#E9E3D8] p-5 rounded-2xl flex flex-col items-center justify-center text-center shadow-sm hover:shadow-md hover:border-[#2D5A43]/30 transition-all select-none"
        title="Today's Hijri date"
      >
        <div className="w-10 h-10 rounded-full bg-[#F5F1EA] flex items-center justify-center text-[#2D5A43] mb-2">
          <Calendar size={20} />
        </div>
        <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Hijri</p>
        <p className="font-bold text-[#1A3A2A] text-sm mt-1 truncate max-w-full px-1">{hijriDate}</p>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1.5">{hijriYear}</p>
      </div>
    </>
  );
}
