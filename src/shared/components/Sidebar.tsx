import Link from "next/link";
import { Home, BookOpen, ScrollText, Sparkles, RefreshCw, User } from "lucide-react";

export function Sidebar() {
  return (
    <aside className="hidden md:flex w-64 bg-white border-r border-[#E9E3D8] flex-col h-full z-10 shrink-0">
      <div className="p-8">
        <Link href="/" className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 bg-[#2D5A43] rounded-xl flex items-center justify-center text-white">
            <BookOpen size={20} />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-[#1A3A2A]">Noor</h1>
        </Link>
        
        <nav className="space-y-1">
          <Link href="/" className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-[#F0F4F2] hover:text-[#2D5A43] rounded-lg font-semibold transition-colors">
            <Home size={20} />
            Home
          </Link>
          <Link href="/quran" className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-[#F0F4F2] hover:text-[#2D5A43] rounded-lg font-semibold transition-colors">
            <BookOpen size={20} />
            Quran
          </Link>
          <Link href="/hadith" className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-[#F0F4F2] hover:text-[#2D5A43] rounded-lg font-semibold transition-colors">
            <ScrollText size={20} />
            Hadith
          </Link>
          <Link href="/dua" className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-[#F0F4F2] hover:text-[#2D5A43] rounded-lg font-semibold transition-colors">
            <Sparkles size={20} />
            Dua
          </Link>
          <Link href="/dhikr" className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-[#F0F4F2] hover:text-[#2D5A43] rounded-lg font-semibold transition-colors">
            <RefreshCw size={20} />
            Dhikr
          </Link>
          <Link href="/profile" className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-[#F0F4F2] hover:text-[#2D5A43] rounded-lg font-semibold transition-colors">
            <User size={20} />
            Profile
          </Link>
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
