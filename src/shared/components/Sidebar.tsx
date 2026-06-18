"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { navItems, isNavActive } from "@/src/shared/constants/nav";

const VERSES = [
  { text: "So remember Me; I will remember you.", reference: "Al-Baqarah 152" },
  { text: "For indeed, with hardship [will be] ease.", reference: "Al-Sharh 5" },
  { text: "Indeed, I am near. I respond to the invocation of the supplicant when he calls upon Me.", reference: "Al-Baqarah 186" },
  { text: "And Allah is the best of planners.", reference: "Al-Anfal 30" },
  { text: "So do not weaken and do not grieve, and you will be superior if you are [true] believers.", reference: "Al-Imran 139" },
  { text: "Indeed, Allah loves those who rely [upon Him].", reference: "Al-Imran 159" },
  { text: "If you are grateful, I will surely increase you [in favor].", reference: "Ibrahim 7" }
];

export function Sidebar() {
  const pathname = usePathname();
  const [dailyVerse, setDailyVerse] = useState(VERSES[0]);

  useEffect(() => {
    const day = new Date().getDate();
    setDailyVerse(VERSES[day % VERSES.length]);
  }, []);

  return (
    <aside className="hidden md:flex w-64 bg-white border-r border-[#E9E3D8] flex-col h-full z-10 shrink-0 overflow-y-auto scrollbar-hide">
      <div className="p-8">
        <Link href="/" className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 bg-[#2D5A43] rounded-xl flex items-center justify-center overflow-hidden">
            <Image src="/icons/icon-96x96.png" alt="Noor" width={40} height={40} className="object-contain" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-[#1A3A2A]">Noor</h1>
        </Link>
        
        <nav className="space-y-1" aria-label="Main Navigation">
          {navItems.map(({ href, icon: Icon, label, exact }) => {
            const active = isNavActive(pathname, href, exact);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className="flex items-center gap-3 px-4 py-3 rounded-xl font-semibold relative transition-colors duration-150 group cursor-pointer"
              >
                {active && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                    className="absolute inset-0 bg-[#2D5A43] rounded-xl shadow-md shadow-[#2D5A43]/20"
                  />
                )}
                <Icon size={20} className={`relative z-10 ${active ? "text-white" : "text-slate-500 group-hover:text-[#2D5A43] transition-colors"}`} />
                <span className={`relative z-10 ${active ? "text-white" : "text-slate-500 group-hover:text-[#2D5A43] transition-colors"}`}>
                  {label}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>
      
      <div className="mt-auto p-6">
        <div className="bg-[#F5F1EA] rounded-2xl p-5 border border-[#E9E3D8]">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2">Daily Verse</p>
          <p className="text-sm italic leading-relaxed text-slate-700">&quot;{dailyVerse.text}&quot;</p>
          <p className="text-[10px] mt-2 font-medium text-[#2D5A43]">{dailyVerse.reference}</p>
        </div>
      </div>
    </aside>
  );
}
