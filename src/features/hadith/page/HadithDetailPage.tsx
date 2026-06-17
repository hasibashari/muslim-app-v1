import { hadithService } from "@/src/features/hadith/service/hadith.service";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";

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

export default async function HadithDetailPage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const collectionId = resolvedParams.id;
  
  const page = parseInt(resolvedSearchParams.page || '1', 10) || 1;
  const limit = 50;

  const collections = hadithService.getCollections();
  const collection = collections.find(c => c.id === collectionId);

  if (!collection) {
    notFound();
  }

  const hadiths = hadithService.getHadithsByCollectionPaginated(collectionId, page, limit);
  const totalPages = Math.ceil(collection.total_hadith / limit);
  const startItem = (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, collection.total_hadith);

  return (
    <div className="p-6 md:p-10 w-full max-w-4xl mx-auto flex flex-col gap-6">
      <Link href="/hadith" className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-[#2D5A43] transition-colors w-fit">
        <ArrowLeft size={16} />
        Back to Collections
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pb-4 border-b border-[#E9E3D8]/50">
        <div className="flex flex-col gap-1">
          <h1 className="text-4xl font-bold text-[#1A3A2A] font-serif">{collection.name}</h1>
          <p className="text-slate-400 font-semibold uppercase tracking-widest text-xs">
            Total {collection.total_hadith} Hadits
          </p>
        </div>
        <p className="text-xs font-semibold text-slate-500 bg-[#F5F1EA] px-3.5 py-1.5 rounded-full border border-[#E9E3D8]">
          Menampilkan {startItem} - {endItem} dari {collection.total_hadith}
        </p>
      </div>

      {/* Hadith List */}
      <div className="flex flex-col gap-8 mt-2">
        {hadiths.map((hadith) => (
          <div key={hadith.id} className="bg-white rounded-3xl border border-[#E9E3D8] p-6 md:p-8 flex flex-col gap-6 relative shadow-sm">
            <div className="absolute top-8 left-0 w-1 h-12 bg-[#2D5A43] rounded-r-md"></div>

            <div className="flex justify-between items-center border-b border-[#E9E3D8]/50 pb-4">
              <div className="px-4 py-1.5 rounded-full bg-[#F5F1EA] flex items-center justify-center font-bold text-[#2D5A43] text-sm tracking-wider">
                Hadith {hadith.hadith_number}
              </div>
            </div>

            <div className="flex flex-col gap-8">
              <p className="text-2xl md:text-3xl font-serif text-right leading-loose text-[#1A3A2A]" dir="rtl">
                {hadith.text_arab}
              </p>
              <div className="h-px w-full bg-slate-100"></div>
              <p className="text-base md:text-lg text-slate-600 leading-relaxed">
                {hadith.text_en}
              </p>
            </div>
          </div>
        ))}
        {hadiths.length === 0 && (
          <div className="p-10 text-center text-slate-500 bg-white rounded-3xl border border-[#E9E3D8]">No Hadiths found.</div>
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <nav className="flex items-center justify-center gap-2 mt-8 py-6 border-t border-[#E9E3D8]/50" aria-label="Pagination">
          {/* Previous Button */}
          {page > 1 ? (
            <Link
              href={`/hadith/${collectionId}?page=${page - 1}`}
              className="w-10 h-10 rounded-full bg-white text-slate-600 border border-[#E9E3D8] flex items-center justify-center hover:bg-[#FBF9F4] hover:text-[#2D5A43] hover:border-[#2D5A43]/30 transition-colors shadow-sm"
              title="Halaman Sebelumnya"
            >
              <ChevronLeft size={18} />
            </Link>
          ) : (
            <span className="w-10 h-10 rounded-full bg-slate-50 text-slate-300 border border-slate-100 flex items-center justify-center cursor-not-allowed shadow-none">
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
                href={`/hadith/${collectionId}?page=${p}`}
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-colors shadow-sm ${
                  isCurrent
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
              href={`/hadith/${collectionId}?page=${page + 1}`}
              className="w-10 h-10 rounded-full bg-white text-slate-600 border border-[#E9E3D8] flex items-center justify-center hover:bg-[#FBF9F4] hover:text-[#2D5A43] hover:border-[#2D5A43]/30 transition-colors shadow-sm"
              title="Halaman Selanjutnya"
            >
              <ChevronRight size={18} />
            </Link>
          ) : (
            <span className="w-10 h-10 rounded-full bg-slate-50 text-slate-300 border border-slate-100 flex items-center justify-center cursor-not-allowed shadow-none">
              <ChevronRight size={18} />
            </span>
          )}
        </nav>
      )}
    </div>
  );
}
