import { duaService } from "@/src/features/dua/service/dua.service";
import { Sparkles, ChevronLeft, ChevronRight, FolderOpen, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface PageProps {
  searchParams?: Promise<{ q?: string; page?: string; category?: string }>;
}

const getPageNumbers = (current: number, total: number) => {
  const pages: (number | string)[] = [];
  const delta = 2; // How many pages before and after current page

  for (let i = 1; i <= total; i++) {
    if (
      i === 1 ||
      i === total ||
      (i >= current - delta && i <= current + delta)
    ) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== '...') {
      pages.push('...');
    }
  }
  return pages;
};

export default async function DuaPage({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;
  const query = resolvedSearchParams?.q || "";
  const page = parseInt(resolvedSearchParams?.page || "1", 10) || 1;
  const category = resolvedSearchParams?.category || "";
  const limit = 10; // 10 supplications per page

  const categories = duaService.getCategories();
  const categoryCounts = (!category && !query) ? duaService.getCategoryCounts() : {};

  // State A: Initial landing page with no category and no active search query
  if (!category && !query) {
    return (
      <div className="p-6 md:p-10 w-full max-w-4xl mx-auto flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold text-[#1A3A2A]">Supplications (Dua)</h1>
          <p className="text-slate-500">Select a category to view authentic supplications from Quran and Sunnah.</p>
        </div>


        {/* 2-Column Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-4">
          {categories.map((cat) => {
            const count = categoryCounts[cat] || 0;
            return (
              <Link
                href={`/dua?category=${encodeURIComponent(cat)}`}
                key={cat}
                className="bg-white rounded-2xl border border-[#E9E3D8] p-8 flex flex-col gap-4 hover:shadow-md transition-shadow group relative overflow-hidden cursor-pointer text-left"
              >
                <div className="w-12 h-12 rounded-xl bg-[#F0F4F2] flex items-center justify-center text-[#2D5A43] group-hover:scale-110 transition-transform">
                  <FolderOpen size={24} />
                </div>
                <div className="mt-2 text-[#1A3A2A]">
                  <h2 className="text-xl font-bold">{cat}</h2>
                  <p className="text-sm font-semibold text-[#2D5A43] tracking-wide uppercase mt-1">
                    {count} Items
                  </p>
                </div>
                <div className="absolute right-[-20px] bottom-[-20px] opacity-5 text-[#2D5A43]">
                  <FolderOpen size={120} />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    );
  }

  // State B & C: Duas listing for a specific category or global search results
  const { duas, total } = duaService.getDuasPaginated(page, limit, query, category);
  const totalPages = Math.ceil(total / limit);

  return (
    <div className="p-6 md:p-10 w-full max-w-4xl mx-auto flex flex-col gap-6">
      {/* Back to Categories Button */}
      <Link
        href="/dua"
        className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-[#2D5A43] transition-colors w-fit"
      >
        <ArrowLeft size={16} />
        Back to Categories
      </Link>

      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-[#1A3A2A]">
          {category ? category : `Search Results for "${query}"`}
        </h1>
        <p className="text-slate-500">
          {category
            ? `Explore authentic supplications in ${category}.`
            : `Found ${total} supplications matching your search.`}
        </p>
      </div>


      {/* List of Duas */}
      <div className="flex flex-col gap-4">
        {duas.map((dua) => (
          <Link
            href={`/dua/detail/${dua.id}`}
            key={dua.id}
            className="bg-white rounded-2xl border border-[#E9E3D8] p-5 flex items-center gap-4 hover:bg-[#FBF9F4] transition-colors group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-[#F0F4F2] flex items-center justify-center text-[#2D5A43] group-hover:scale-110 transition-transform shrink-0">
              <Sparkles size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[10px] font-bold text-[#2D5A43] uppercase tracking-wider block mb-1">
                {dua.category}
              </span>
              <h2 className="text-lg font-bold text-[#1A3A2A] truncate group-hover:text-[#2D5A43] transition-colors">
                {dua.title}
              </h2>
            </div>
          </Link>
        ))}
        {duas.length === 0 && (
          <div className="p-10 text-center text-slate-500 bg-white rounded-2xl border border-[#E9E3D8]">
            No Duas found.
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8 py-4 border-t border-[#E9E3D8]/50">
          {/* Previous Button */}
          {page > 1 ? (
            <Link
              href={`/dua?q=${encodeURIComponent(query)}&category=${encodeURIComponent(category)}&page=${page - 1}`}
              className="w-10 h-10 rounded-xl bg-white text-slate-600 border border-[#E9E3D8] flex items-center justify-center hover:bg-[#FBF9F4] hover:text-[#2D5A43] hover:border-[#2D5A43]/30 transition-colors shadow-sm"
              title="Halaman Sebelumnya"
            >
              <ChevronLeft size={18} />
            </Link>
          ) : (
            <span className="w-10 h-10 rounded-xl bg-slate-50 text-slate-300 border border-slate-100 flex items-center justify-center cursor-not-allowed shadow-none">
              <ChevronLeft size={18} />
            </span>
          )}

          {/* Page numbers */}
          {getPageNumbers(page, totalPages).map((p, idx) => {
            if (p === '...') {
              return (
                <span key={`ellips-${idx}`} className="w-10 h-10 flex items-center justify-center text-slate-400 text-sm font-bold">
                  ...
                </span>
              );
            }
            const isCurrent = p === page;
            return (
              <Link
                key={`page-${p}`}
                href={`/dua?q=${encodeURIComponent(query)}&category=${encodeURIComponent(category)}&page=${p}`}
                className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold transition-all shadow-sm ${isCurrent
                    ? 'bg-[#2D5A43] text-white border border-[#2D5A43]'
                    : 'bg-white text-slate-600 border border-[#E9E3D8] hover:bg-[#FBF9F4] hover:text-[#2D5A43] hover:border-[#2D5A43]/30'
                  }`}
                aria-current={isCurrent ? 'page' : undefined}
              >
                {p}
              </Link>
            );
          })}

          {/* Next Button */}
          {page < totalPages ? (
            <Link
              href={`/dua?q=${encodeURIComponent(query)}&category=${encodeURIComponent(category)}&page=${page + 1}`}
              className="w-10 h-10 rounded-xl bg-white text-slate-600 border border-[#E9E3D8] flex items-center justify-center hover:bg-[#FBF9F4] hover:text-[#2D5A43] hover:border-[#2D5A43]/30 transition-colors shadow-sm"
              title="Halaman Selanjutnya"
            >
              <ChevronRight size={18} />
            </Link>
          ) : (
            <span className="w-10 h-10 rounded-xl bg-slate-50 text-slate-300 border border-slate-100 flex items-center justify-center cursor-not-allowed shadow-none">
              <ChevronRight size={18} />
            </span>
          )}
        </div>
      )}
    </div>
  );
}
