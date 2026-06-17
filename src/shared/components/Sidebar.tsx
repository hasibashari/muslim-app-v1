"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BookOpen, ScrollText, Sparkles, RefreshCw, User } from "lucide-react";

const navItems = [
  { href: "/", icon: Home, label: "Home", exact: true },
  { href: "/quran", icon: BookOpen, label: "Quran", exact: false },
  { href: "/hadith", icon: ScrollText, label: "Hadith", exact: false },
  { href: "/dua", icon: Sparkles, label: "Dua", exact: false },
  { href: "/dhikr", icon: RefreshCw, label: "Dhikr", exact: false },
  { href: "/profile", icon: User, label: "Profile", exact: false },
];

export function Sidebar() {
  const pathname = usePathname();

  const isActive = (href: string, exact: boolean) => {
    if (exact) return pathname === href;
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <aside className="hidden md:flex w-64 bg-white border-r border-[#E9E3D8] flex-col h-full z-10 shrink-0 overflow-y-auto scrollbar-hide">
      <div className="p-8">
        <Link href="/" className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 bg-[#2D5A43] rounded-xl flex items-center justify-center overflow-hidden">
            <img src="/icons/icon-96x96.png" alt="Noor" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-[#1A3A2A]">Noor</h1>
        </Link>
        
        <nav className="space-y-1" aria-label="Main Navigation">
          {navItems.map(({ href, icon: Icon, label, exact }) => {
            const active = isActive(href, exact);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-150 ${
                  active
                    ? "bg-[#2D5A43] text-white shadow-md shadow-[#2D5A43]/20"
                    : "text-slate-500 hover:bg-[#F0F4F2] hover:text-[#2D5A43]"
                }`}
              >
                <Icon size={20} />
                {label}
              </Link>
            );
          })}
        </nav>
      </div>
      
      <div className="mt-auto p-6">
        <div className="bg-[#F5F1EA] rounded-2xl p-5 border border-[#E9E3D8]">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2">Daily Verse</p>
          <p className="text-sm italic leading-relaxed text-slate-700">&quot;So remember Me; I will remember you.&quot;</p>
          <p className="text-[10px] mt-2 font-medium text-[#2D5A43]">Al-Baqarah 152</p>
        </div>
      </div>
    </aside>
  );
}
