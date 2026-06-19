"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface HeroSectionProps {
  userName?: string | null;
}

export function HeroSection({ userName }: HeroSectionProps) {
  const [lastRead, setLastRead] = useState<{ id: number; name: string } | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem("noor_last_read_quran");
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        const timer = setTimeout(() => {
          setLastRead(parsed);
        }, 0);
        return () => clearTimeout(timer);
      } catch (e) { }
    }
  }, []);

  const greeting = userName ? `Assalamu Alaikum, ${userName}` : "Assalamu Alaikum";

  return (
    <section className="md:col-span-2 lg:col-span-7 bg-[#2D5A43] rounded-2xl p-8 md:p-10 text-white relative overflow-hidden">
      <div className="relative z-10">
        <h2 className="text-2xl md:text-3xl font-bold mb-2">{greeting}</h2>
        <p className="text-emerald-100/80 mb-8 max-w-md text-sm md:text-base">
          {lastRead
            ? `Continue your journey. You were last reading Surah ${lastRead.name}.`
            : "Welcome to Noor. Start your Quran reading journey today."}
        </p>
        <Link
          href={lastRead ? `/quran/${lastRead.id}` : "/quran/1"}
          className="inline-block bg-white text-[#2D5A43] px-6 py-3 rounded-full font-bold text-sm shadow-xl shadow-black/10 hover:bg-[#F5F1EA] transition-colors"
        >
          {lastRead ? "Continue Reading" : "Start Reading"}
        </Link>
      </div>
      {/* Abstract Islamic Geometry Pattern */}
      <div className="absolute right-[-40px] bottom-[-40px] opacity-10">
        <svg width="300" height="300" viewBox="0 0 100 100" fill="currentColor">
          <path d="M50 0 L60 40 L100 50 L60 60 L50 100 L40 60 L0 50 L40 40 Z" />
        </svg>
      </div>
    </section>
  );
}
