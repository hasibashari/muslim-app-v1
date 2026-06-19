"use client";

import { useState, useEffect } from "react";
import { Clock, Calendar, MapPin, Navigation, X } from "lucide-react";
import { calculatePrayerTimes } from "@/src/lib/prayerTimes";
import { useSettings } from "@/src/features/settings/hooks";

// Helper for manual tabular Hijri calculation (fallback)
function getFallbackHijri(date: Date) {
  const time = date.getTime();
  // Add +1 day offset to align with local moon sighting / Kemenag standard
  const jd = time / 86400000 + 2440587.5 + 1;

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

const INDONESIAN_CITIES = [
  { name: "Jakarta", latitude: -6.2088, longitude: 106.8456 },
  { name: "Bandung", latitude: -6.9175, longitude: 107.6191 },
  { name: "Surabaya", latitude: -7.2575, longitude: 112.7521 },
  { name: "Yogyakarta", latitude: -7.7956, longitude: 110.3695 },
  { name: "Medan", latitude: 3.5952, longitude: 98.6722 },
  { name: "Makassar", latitude: -5.1476, longitude: 119.4327 },
  { name: "Semarang", latitude: -6.9667, longitude: 110.4167 },
  { name: "Balikpapan", latitude: -1.2654, longitude: 116.8312 },
  { name: "Denpasar", latitude: -8.6500, longitude: 115.2167 },
  { name: "Palembang", latitude: -2.9909, longitude: 104.7566 },
];

export function PrayerAndCalendarWidgets() {
  const { settings } = useSettings();
  const [isMounted, setIsMounted] = useState(false);
  const [currentTime, setCurrentTime] = useState("");
  const [hijriDate, setHijriDate] = useState("Memuat...");
  const [hijriYear, setHijriYear] = useState("");

  // Default coordinates: Jakarta
  const [coords, setCoords] = useState({ latitude: -6.2088, longitude: 106.8456 });
  const [locationName, setLocationName] = useState("Jakarta");

  // Location selector modal state
  const [showSelector, setShowSelector] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectionError, setDetectionError] = useState("");

  // Set mounted state
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true);
  }, []);

  // 1. Load saved location from LocalStorage on mount (NO automatic GPS prompt here)
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
            setLocationName(savedLocationName || "Lokasi Anda");
          }
        } catch (e) {
          console.error("Failed to parse saved coordinates:", e);
        }
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
      const timeStr = `${hh}:${mm}`;
      setCurrentTime(timeStr);

      // Adjust date to the next Hijri day if it is after Maghrib (sunset)
      const displayDate = new Date(now);

      // Apply offset from user settings (Option B)
      const offsetDays = settings?.hijriOffset || 0;
      displayDate.setDate(displayDate.getDate() + offsetDays);

      try {
        const timezoneOffset = -now.getTimezoneOffset() / 60;
        const pt = calculatePrayerTimes(now, coords.latitude, coords.longitude, timezoneOffset);
        if (pt && pt.Maghrib && timeStr >= pt.Maghrib) {
          displayDate.setDate(displayDate.getDate() + 1);
        }
      } catch (e) {
        console.error("Failed to check Maghrib offset for Hijri date:", e);
      }

      // Always use manual calculation (Option A) for perfect consistency across all devices
      const hijri = getFallbackHijri(displayDate);
      setHijriDate(`${hijri.day} ${HIJRI_MONTHS[hijri.month - 1]}`);
      setHijriYear(`${hijri.year} H`);
    };

    updateTimeAndDate();
    const interval = setInterval(updateTimeAndDate, 30000); // update every 30s
    return () => clearInterval(interval);
  }, [coords, settings?.hijriOffset]);

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
    // If after Isya, next is Subuh tomorrow
    return { name: "Subuh", time: list[0].time };
  };

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setDetectionError("Geolokasi tidak didukung oleh browser Anda.");
      return;
    }

    setIsDetecting(true);
    setDetectionError("");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newCoords = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        setCoords(newCoords);
        setLocationName("Lokasi Anda");
        localStorage.setItem("noor_user_coords", JSON.stringify(newCoords));
        localStorage.setItem("noor_location_name", "Lokasi Anda");
        setIsDetecting(false);
        setShowSelector(false);
      },
      (error) => {
        console.error("Gagal mendeteksi lokasi:", error);
        setDetectionError("Gagal mendeteksi lokasi. Pastikan izin lokasi aktif.");
        setIsDetecting(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const handleSelectCity = (city: typeof INDONESIAN_CITIES[0]) => {
    setCoords({ latitude: city.latitude, longitude: city.longitude });
    setLocationName(city.name);
    localStorage.setItem("noor_user_coords", JSON.stringify({ latitude: city.latitude, longitude: city.longitude }));
    localStorage.setItem("noor_location_name", city.name);
    setShowSelector(false);
  };

  const nextPrayer = getNextPrayer();

  // Render Skeleton when loading to prevent Layout Shift
  if (!isMounted) {
    return (
      <>
        {/* Skeleton for Prayer Widget */}
        <div className="bg-white border border-[#E9E3D8] p-5 rounded-2xl flex flex-col items-center justify-center text-center shadow-sm animate-pulse min-h-[178px]">
          <div className="w-10 h-10 rounded-full bg-[#F5F1EA] mb-3"></div>
          <div className="h-3.5 w-24 bg-slate-100 rounded mb-2"></div>
          <div className="h-6 w-16 bg-slate-200 rounded mb-2"></div>
          <div className="h-5 w-14 bg-slate-200 rounded-full mt-1"></div>
          <div className="h-3 w-20 bg-slate-100 rounded mt-3"></div>
        </div>

        {/* Skeleton for Hijri Widget */}
        <div className="bg-white border border-[#E9E3D8] p-5 rounded-2xl flex flex-col items-center justify-center text-center shadow-sm animate-pulse min-h-[178px]">
          <div className="w-10 h-10 rounded-full bg-[#F5F1EA] mb-3"></div>
          <div className="h-3.5 w-12 bg-slate-100 rounded mb-2"></div>
          <div className="h-6 w-32 bg-slate-200 rounded mb-2"></div>
          <div className="h-3 w-16 bg-slate-100 rounded mt-1.5"></div>
        </div>
      </>
    );
  }

  return (
    <>
      {/* Prayer Time Widget */}
      <div
        className="bg-white border border-[#E9E3D8] p-5 rounded-2xl flex flex-col items-center justify-center text-center shadow-sm hover:shadow-md hover:border-[#2D5A43]/30 transition-all select-none"
        title={`Jadwal sholat hari ini untuk ${locationName}`}
      >
        <div className="w-10 h-10 rounded-full bg-[#F5F1EA] flex items-center justify-center text-[#2D5A43] mb-2">
          <Clock size={20} />
        </div>
        <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Jadwal Sholat</p>
        <p className="font-bold text-[#1A3A2A] text-lg mt-0.5">{nextPrayer.name}</p>
        <p className="text-xs font-bold text-[#2D5A43] bg-[#F0F4F2] px-3 py-1 rounded-full mt-2 transition-all">
          {nextPrayer.time}
        </p>

        {/* Location Switcher Trigger Button */}
        <button
          onClick={() => setShowSelector(true)}
          className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-[#2D5A43] mt-3 transition-colors cursor-pointer bg-transparent border-none outline-none group"
        >
          <MapPin size={12} className="text-[#2D5A43] group-hover:scale-110 transition-transform" />
          <span className="underline decoration-dotted underline-offset-2">{locationName}</span>
        </button>
      </div>

      {/* Hijri Calendar Widget */}
      <div
        className="bg-white border border-[#E9E3D8] p-5 rounded-2xl flex flex-col items-center justify-center text-center shadow-sm hover:shadow-md hover:border-[#2D5A43]/30 transition-all select-none"
        title="Tanggal Hijriah hari ini"
      >
        <div className="w-10 h-10 rounded-full bg-[#F5F1EA] flex items-center justify-center text-[#2D5A43] mb-2">
          <Calendar size={20} />
        </div>
        <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Hijriah</p>
        <p className="font-bold text-[#1A3A2A] text-sm mt-1 truncate max-w-full px-1">{hijriDate}</p>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1.5">{hijriYear}</p>
      </div>

      {/* Location Selector Modal Backdrop & Dialog */}
      {showSelector && (
        <div
          onClick={(e) => e.target === e.currentTarget && setShowSelector(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade-in"
        >
          <div className="bg-[#FAF8F5] border border-[#E9E3D8] w-full max-w-sm rounded-2xl p-5 shadow-xl transition-all scale-100 flex flex-col">
            {/* Modal Header */}
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-[#E9E3D8]">
              <h4 className="font-bold text-[#1A3A2A] text-sm">Pilih Lokasi Jadwal Sholat</h4>
              <button
                onClick={() => setShowSelector(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer p-0.5 rounded-full hover:bg-slate-100 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* GPS Detection Button */}
            <button
              onClick={handleDetectLocation}
              disabled={isDetecting}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-[#2D5A43] hover:bg-[#204231] text-white text-xs font-bold rounded-xl transition-all disabled:opacity-50 cursor-pointer mb-3 shadow-xs"
            >
              {isDetecting ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Mendeteksi lokasi...
                </>
              ) : (
                <>
                  <Navigation size={14} />
                  Gunakan GPS (Lokasi Saat Ini)
                </>
              )}
            </button>

            {/* Error Message */}
            {detectionError && (
              <p className="text-[11px] text-red-500 font-medium mb-3 text-center">
                {detectionError}
              </p>
            )}

            {/* Cities Title */}
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Pilih Kota Indonesia
            </div>

            {/* Cities Grid */}
            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
              {INDONESIAN_CITIES.map((city) => (
                <button
                  key={city.name}
                  onClick={() => handleSelectCity(city)}
                  className={`py-2 px-3 text-left text-xs rounded-xl border font-semibold transition-all cursor-pointer ${
                    locationName === city.name
                      ? "bg-[#2D5A43]/10 border-[#2D5A43] text-[#2D5A43]"
                      : "bg-white border-[#E9E3D8] hover:border-[#2D5A43]/30 text-slate-700 hover:bg-slate-50/50"
                  }`}
                >
                  {city.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

