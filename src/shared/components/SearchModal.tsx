"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, X, BookOpen, ScrollText, Sparkles, RefreshCw, Loader2, Hash } from "lucide-react";
import type { SearchResult } from "@/src/app/api/search/route";

const typeConfig: Record<
  SearchResult["type"],
  { label: string; color: string; icon: React.ReactNode }
> = {
  surah: {
    label: "Surah",
    color: "bg-emerald-50 text-emerald-700",
    icon: <BookOpen size={14} />,
  },
  hadith: {
    label: "Hadith",
    color: "bg-amber-50 text-amber-700",
    icon: <ScrollText size={14} />,
  },
  dua: {
    label: "Dua",
    color: "bg-purple-50 text-purple-700",
    icon: <Sparkles size={14} />,
  },
  dhikr: {
    label: "Dhikr",
    color: "bg-blue-50 text-blue-700",
    icon: <RefreshCw size={14} />,
  },
};

interface SearchModalProps {
  open: boolean;
  onClose: () => void;
}

export function SearchModal({ open, onClose }: SearchModalProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const router = useRouter();

  // Focus input and reset search when modal opens
  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
        setQuery("");
        setResults([]);
        setHasSearched(false);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [open]);

  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  // Debounced search
  const performSearch = useCallback(async (q: string) => {
    if (q.length < 2) {
      setResults([]);
      setHasSearched(false);
      return;
    }
    setIsLoading(true);
    setHasSearched(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      if (res.ok) {
        const data = await res.json();
        setResults(data.results || []);
      }
    } catch {
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleQueryChange = (value: string) => {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => performSearch(value), 300);
  };

  const handleResultClick = (href: string) => {
    router.push(href);
    onClose();
  };

  if (!open) return null;

  // Group results by type
  const groupedResults = results.reduce<Record<string, SearchResult[]>>(
    (acc, result) => {
      if (!acc[result.type]) acc[result.type] = [];
      acc[result.type].push(result);
      return acc;
    },
    {}
  );

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 animate-in fade-in duration-150"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Search"
        className="fixed top-[10%] left-1/2 -translate-x-1/2 w-full max-w-xl z-50 px-4 animate-in slide-in-from-top-4 duration-200"
      >
        <div className="bg-white rounded-2xl shadow-2xl shadow-black/20 border border-[#E9E3D8] overflow-hidden">
          {/* Search Input */}
          <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[#F0EDE6]">
            <Search size={18} className="text-slate-400 shrink-0" />
            <input
              id="search-modal-input"
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => handleQueryChange(e.target.value)}
              placeholder="Search Surah, Dua, Hadith, Dhikr..."
              className="flex-1 text-sm text-slate-800 placeholder:text-slate-400 bg-transparent outline-none"
              autoComplete="off"
              spellCheck={false}
            />
            {query && (
              <button
                onClick={() => {
                  setQuery("");
                  setResults([]);
                  setHasSearched(false);
                  inputRef.current?.focus();
                }}
                className="text-slate-400 hover:text-slate-600 transition-colors"
                aria-label="Clear search"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Results Area */}
          <div className="max-h-[60vh] overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="animate-spin text-[#2D5A43]" size={24} />
              </div>
            ) : !hasSearched ? (
              // Empty state - quick links
              <div className="p-4">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 px-2">
                  Quick Access
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { href: "/quran", label: "Al-Quran", icon: <BookOpen size={16} />, color: "text-emerald-600 bg-emerald-50" },
                    { href: "/hadith", label: "Hadith", icon: <ScrollText size={16} />, color: "text-amber-600 bg-amber-50" },
                    { href: "/dua", label: "Dua", icon: <Sparkles size={16} />, color: "text-purple-600 bg-purple-50" },
                    { href: "/dhikr", label: "Dhikr", icon: <RefreshCw size={16} />, color: "text-blue-600 bg-blue-50" },
                  ].map((item) => (
                    <button
                      key={item.href}
                      onClick={() => handleResultClick(item.href)}
                      className="flex items-center gap-2.5 p-3 rounded-xl bg-[#FDFCF8] border border-[#F0EDE6] hover:border-[#2D5A43]/30 hover:bg-[#F5F1EA] transition-all text-sm font-semibold text-slate-700 text-left"
                    >
                      <span className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${item.color}`}>
                        {item.icon}
                      </span>
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            ) : results.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                  <Hash size={20} className="text-slate-400" />
                </div>
                <p className="font-semibold text-slate-700 text-sm">No results found</p>
                <p className="text-xs text-slate-400 mt-1">
                  Try another keyword for &ldquo;{query}&rdquo;
                </p>
              </div>
            ) : (
              <div className="p-2">
                {(Object.entries(groupedResults) as [SearchResult["type"], SearchResult[]][]).map(
                  ([type, items]) => {
                    const config = typeConfig[type];
                    return (
                      <div key={type} className="mb-3 last:mb-0">
                        {/* Group Label */}
                        <div className="flex items-center gap-2 px-2 py-1.5 mb-1">
                          <span className={`flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${config.color}`}>
                            {config.icon}
                            {config.label}
                          </span>
                        </div>
                        {/* Results in group */}
                        {items.map((result) => (
                          <button
                            key={`${result.type}-${result.id}`}
                            onClick={() => handleResultClick(result.href)}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#F5F1EA] transition-colors text-left group"
                          >
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${config.color}`}>
                              {config.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-[#1A3A2A] truncate group-hover:text-[#2D5A43] transition-colors">
                                {result.title}
                              </p>
                              <p className="text-xs text-slate-400 truncate mt-0.5">
                                {result.subtitle}
                              </p>
                            </div>
                            {result.arabic && (
                              <span className="text-base font-serif text-[#2D5A43]/70 shrink-0">
                                {result.arabic}
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    );
                  }
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-[#F0EDE6] px-4 py-2.5 flex items-center justify-between">
            <p className="text-[10px] text-slate-400">
              {hasSearched && !isLoading ? `${results.length} results found` : "Type at least 2 characters"}
            </p>
            <div className="flex items-center gap-1 text-[10px] text-slate-400">
              <kbd className="px-1.5 py-0.5 bg-slate-100 rounded text-[10px] font-mono">ESC</kbd>
              <span>to close</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
