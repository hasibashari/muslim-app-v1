"use client";

import { useState, useEffect } from "react";
import { Clock, Calendar } from "lucide-react";
import { calculatePrayerTimes } from "@/src/lib/prayerTimes";

export function PrayerAndCalendarWidgets() {
  const [currentTime, setCurrentTime] = useState("");
  const [hijriDate, setHijriDate] = useState("Loading...");
  const [hijriYear, setHijriYear] = useState("");

  // Default coordinates: Jakarta
  const [coords, setCoords] = useState({ latitude: -6.2088, longitude: 106.8456 });
  const [locationName, setLocationName] = useState("Jakarta");

  // 1. Get browser geolocation and update coordinates
  useEffect(() => {
    if (typeof window !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCoords({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          setLocationName("Lokasi Anda");
        },
        (error) => {
          console.log("Using default location (Jakarta) due to: ", error.message);
        }
      );
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

      // Calculate Hijri Date using native Intl API
      try {
        const formatterDate = new Intl.DateTimeFormat("id-ID-u-ca-islamic-umalqura", {
          day: "numeric",
          month: "long",
        });
        const formatterYear = new Intl.DateTimeFormat("id-ID-u-ca-islamic-umalqura", {
          year: "numeric",
        });
        setHijriDate(formatterDate.format(now));
        setHijriYear(formatterYear.format(now));
      } catch (e) {
        setHijriDate("25 Dzulhijjah");
        setHijriYear("1447 H");
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
    const list = [
      { name: "Subuh", time: times.Fajr },
      { name: "Dzuhur", time: times.Dhuhr },
      { name: "Ashar", time: times.Asr },
      { name: "Maghrib", time: times.Maghrib },
      { name: "Isya", time: times.Isha },
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
        className="bg-white border border-[#E9E3D8] p-5 rounded-3xl flex flex-col items-center justify-center text-center shadow-sm hover:shadow-md hover:border-[#2D5A43]/30 transition-all select-none"
        title={`Jadwal shalat hari ini untuk ${locationName}`}
      >
        <div className="w-10 h-10 rounded-full bg-[#F5F1EA] flex items-center justify-center text-[#2D5A43] mb-2">
          <Clock size={20} />
        </div>
        <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Jadwal Sholat</p>
        <p className="font-bold text-[#1A3A2A] text-lg mt-0.5">{nextPrayer.name}</p>
        <p className="text-xs font-bold text-[#2D5A43] bg-[#F0F4F2] px-3 py-1 rounded-full mt-2 transition-all">
          {nextPrayer.time}
        </p>
      </div>

      {/* Hijri Calendar Widget */}
      <div
        className="bg-white border border-[#E9E3D8] p-5 rounded-3xl flex flex-col items-center justify-center text-center shadow-sm hover:shadow-md hover:border-[#2D5A43]/30 transition-all select-none"
        title="Tanggal Hijriah hari ini"
      >
        <div className="w-10 h-10 rounded-full bg-[#F5F1EA] flex items-center justify-center text-[#2D5A43] mb-2">
          <Calendar size={20} />
        </div>
        <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Hijriah</p>
        <p className="font-bold text-[#1A3A2A] text-sm mt-1 truncate max-w-full px-1">{hijriDate}</p>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1.5">{hijriYear}</p>
      </div>
    </>
  );
}
