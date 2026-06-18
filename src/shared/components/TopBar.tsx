"use client";

import { useState } from "react";
import { Search, User, Settings, LogOut } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { FaGoogle } from "react-icons/fa";
import { useSession, signIn, signOut } from "@/src/features/auth/hooks";
import { SearchModal } from "@/src/shared/components/SearchModal";

export function TopBar() {
  const { data: session } = useSession();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <>
      <header className="h-16 px-4 md:px-8 flex items-center justify-between border-b border-[#E9E3D8] bg-white sticky top-0 z-20 shrink-0">
        {/* Backdrop overlay for closing dropdown */}
        {isDropdownOpen && (
          <div
            className="fixed inset-0 z-30 bg-transparent cursor-default"
            onClick={() => setIsDropdownOpen(false)}
          />
        )}

        {/* Search trigger button */}
        <button
          id="topbar-search-btn"
          onClick={() => setIsSearchOpen(true)}
          className="flex items-center gap-2.5 bg-[#F5F1EA] hover:bg-[#EDE9E0] transition-colors rounded-full py-2.5 pl-4 pr-6 text-sm text-slate-400 w-full max-w-xs sm:max-w-md md:w-96 text-left relative z-10"
          aria-label="Open search"
        >
          <Search size={16} className="shrink-0 text-slate-400" />
          <span>Search Surah, Dua, Hadith...</span>
        </button>

        {/* Right side: greeting + avatar */}
        <div className="flex items-center gap-4 ml-4 shrink-0 relative">
          <div className="hidden sm:block text-right select-none">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-tight">
              {session?.user ? "Assalamu alaikum" : "Welcome"}
            </p>
            <p className="text-sm font-bold text-[#1A3A2A]">
              {session?.user?.name || "Peace & Blessings"}
            </p>
          </div>
          <button
            id="topbar-avatar-btn"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-9 h-9 rounded-full bg-[#E9E3D8] border-2 border-white overflow-hidden shadow-sm shrink-0 flex items-center justify-center hover:scale-105 active:scale-95 transition-all cursor-pointer relative z-40 focus:outline-none"
            aria-expanded={isDropdownOpen}
            aria-haspopup="true"
            aria-label="Toggle user menu"
          >
            {session?.user?.image ? (
              <Image
                src={session.user.image}
                alt={session.user.name || "Avatar"}
                width={36}
                height={36}
                className="w-full h-full object-cover"
                unoptimized
                referrerPolicy="no-referrer"
              />
            ) : (
              <User size={18} className="text-slate-500" />
            )}
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute right-0 top-12 w-64 bg-white border border-[#E9E3D8] rounded-2xl shadow-xl shadow-black/10 z-40 p-4 animate-in fade-in slide-in-from-top-2 duration-150 flex flex-col gap-3">
              {/* User info */}
              <div className="flex items-center gap-3 pb-3 border-b border-[#F0EDE6]">
                <div className="w-10 h-10 rounded-full bg-[#E9E3D8] overflow-hidden flex items-center justify-center shrink-0">
                  {session?.user?.image ? (
                    <Image
                      src={session.user.image}
                      alt={session.user.name || "Avatar"}
                      width={40}
                      height={40}
                      className="w-full h-full object-cover"
                      unoptimized
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <User size={20} className="text-slate-500" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-[#1A3A2A] truncate">
                    {session?.user?.name || "Guest User"}
                  </p>
                  <p className="text-[10px] text-slate-400 truncate mt-0.5">
                    {session?.user?.email || "Offline mode"}
                  </p>
                </div>
              </div>

              {/* Menu Items */}
              <div className="flex flex-col gap-1">
                <Link
                  href="/profile"
                  onClick={() => setIsDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-[#F5F1EA] text-slate-700 hover:text-[#2D5A43] text-sm font-semibold transition-colors"
                >
                  <User size={16} className="text-slate-500" />
                  <span>Profile</span>
                </Link>
                <Link
                  href="/settings"
                  onClick={() => setIsDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-[#F5F1EA] text-slate-700 hover:text-[#2D5A43] text-sm font-semibold transition-colors"
                >
                  <Settings size={16} className="text-slate-500" />
                  <span>Settings</span>
                </Link>
              </div>

              {/* Divider / Action */}
              <div className="border-t border-[#F0EDE6] pt-3">
                {session?.user ? (
                  <button
                    onClick={() => {
                      setIsDropdownOpen(false);
                      signOut();
                    }}
                    className="w-full flex items-center justify-center gap-2 bg-rose-50 hover:bg-rose-100 text-rose-700 py-2.5 px-4 rounded-xl text-sm font-semibold transition-colors border border-rose-200 cursor-pointer"
                  >
                    <LogOut size={16} />
                    Sign Out
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setIsDropdownOpen(false);
                      signIn("google");
                    }}
                    className="w-full flex items-center justify-center gap-2.5 bg-[#2D5A43] hover:bg-[#1A3A2A] text-white py-2.5 px-4 rounded-xl text-sm font-semibold shadow-md shadow-[#2D5A43]/10 hover:shadow-lg transition-all cursor-pointer"
                  >
                    <FaGoogle size={14} />
                    Connect Google
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Search Modal */}
      <SearchModal open={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}
