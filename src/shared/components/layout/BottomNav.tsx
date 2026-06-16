import Link from "next/link";
import { Home, BookOpen, ScrollText, Sparkles, RefreshCw } from "lucide-react";

export function BottomNav() {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[#E9E3D8] flex items-center justify-around h-16 px-2 z-30 pb-safe">
      <Link href="/" className="flex flex-col items-center gap-1 p-2 text-slate-500 hover:text-[#2D5A43]">
        <Home size={20} />
        <span className="text-[10px] font-bold">Home</span>
      </Link>
      <Link href="/quran" className="flex flex-col items-center gap-1 p-2 text-slate-500 hover:text-[#2D5A43]">
        <BookOpen size={20} />
        <span className="text-[10px] font-bold">Quran</span>
      </Link>
      <Link href="/hadith" className="flex flex-col items-center gap-1 p-2 text-slate-500 hover:text-[#2D5A43]">
        <ScrollText size={20} />
        <span className="text-[10px] font-bold">Hadith</span>
      </Link>
      <Link href="/dua" className="flex flex-col items-center gap-1 p-2 text-slate-500 hover:text-[#2D5A43]">
        <Sparkles size={20} />
        <span className="text-[10px] font-bold">Dua</span>
      </Link>
      <Link href="/dhikr" className="flex flex-col items-center gap-1 p-2 text-slate-500 hover:text-[#2D5A43]">
        <RefreshCw size={20} />
        <span className="text-[10px] font-bold">Dhikr</span>
      </Link>
    </nav>
  );
}
