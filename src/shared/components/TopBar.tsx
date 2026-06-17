"use client";

import { useState } from "react";
import { Search, User } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { SearchModal } from "@/src/shared/components/SearchModal";

export function TopBar() {
  const { data: session } = useSession();
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <>
      <header className="h-16 px-4 md:px-8 flex items-center justify-between border-b border-[#E9E3D8] bg-white sticky top-0 z-20 shrink-0">
        {/* Search trigger button */}
        <button
          id="topbar-search-btn"
          onClick={() => setIsSearchOpen(true)}
          className="flex items-center gap-2.5 bg-[#F5F1EA] hover:bg-[#EDE9E0] transition-colors rounded-full py-2.5 pl-4 pr-6 text-sm text-slate-400 w-full max-w-xs sm:max-w-md md:w-96 text-left"
          aria-label="Open search"
        >
          <Search size={16} className="shrink-0 text-slate-400" />
          <span>Cari Surah, Doa, Hadith...</span>
        </button>

        {/* Right side: greeting + avatar */}
        <div className="flex items-center gap-4 ml-4 shrink-0">
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
            className="w-9 h-9 rounded-full bg-[#E9E3D8] border-2 border-white overflow-hidden shadow-sm shrink-0 flex items-center justify-center hover:opacity-80 transition-opacity"
            aria-label="Profile"
          >
            {session?.user?.image ? (
              <img
                src={session.user.image}
                alt={session.user.name || "Avatar"}
                width={36}
                height={36}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <User size={18} className="text-slate-500" />
            )}
          </Link>
        </div>
      </header>

      {/* Search Modal */}
      <SearchModal open={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}
