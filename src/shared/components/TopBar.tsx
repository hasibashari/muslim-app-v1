"use client";

import { Search, User } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";

export function TopBar() {
  const { data: session } = useSession();

  return (
    <header className="h-20 px-6 md:px-10 flex items-center justify-between border-b border-[#E9E3D8] bg-white sticky top-0 z-20 shrink-0">
      <div className="relative w-full max-w-xs sm:max-w-md md:w-96">
        <input 
          type="text" 
          placeholder="Search..." 
          className="w-full bg-[#F5F1EA] border-none rounded-full py-2.5 pl-11 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D5A43]"
        />
        <Search className="absolute left-4 top-3 text-slate-400" size={18} />
      </div>
      <div className="flex items-center gap-6 ml-4">
        <div className="hidden sm:block text-right">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-tight">
            {session?.user ? "Assalamu alaikum" : "Welcome"}
          </p>
          <p className="text-sm font-bold text-[#1A3A2A]">
            {session?.user?.name || "Peace & Blessings"}
          </p>
        </div>
        <Link 
          href="/profile" 
          className="w-10 h-10 rounded-full bg-[#E9E3D8] border-2 border-white overflow-hidden shadow-sm shrink-0 flex items-center justify-center hover:opacity-80 transition-opacity"
        >
          {session?.user?.image ? (
            <img 
              src={session.user.image} 
              alt={session.user.name || "Avatar"} 
              width={40} 
              height={40}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <User size={20} className="text-slate-500" />
          )}
        </Link>
      </div>
    </header>
  );
}
