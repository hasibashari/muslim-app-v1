import { dhikrService } from "@/src/features/dhikr/service/dhikr.service";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function DhikrCategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const resolvedParams = await params;

  // Need to get exactly the right category name based on lowercased match.
  const categories = dhikrService.getCategories();
  const matchedCategory = categories.find(c => c.toLowerCase() === decodeURIComponent(resolvedParams.category).toLowerCase());

  if (!matchedCategory) {
    notFound();
  }

  const dhikrs = dhikrService.getDhikrsByCategory(matchedCategory);

  return (
    <div className="p-6 md:p-10 w-full max-w-4xl mx-auto flex flex-col gap-6">
      <Link href="/dhikr" className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-[#2D5A43] transition-colors w-fit">
        <ArrowLeft size={16} />
        Back to Categories
      </Link>

      <div className="flex flex-col gap-2 mb-4">
        <h1 className="text-4xl font-bold text-[#1A3A2A] font-serif">{matchedCategory}</h1>
        <p className="text-slate-500 font-semibold uppercase tracking-widest text-sm">{dhikrs.length} Remembrances</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
        {dhikrs.map((dhikr) => (
          <div key={dhikr.id} className="bg-white rounded-3xl border border-[#E9E3D8] p-6 lg:p-8 flex flex-col gap-6 shadow-sm h-full justify-between">
            <div className="flex flex-col gap-6">
              <div className="flex justify-between items-start border-b border-[#E9E3D8]/50 pb-4 gap-4">
                <h2 className="text-lg font-bold text-[#1A3A2A]">{dhikr.title}</h2>
                {dhikr.read && (
                  <span className="shrink-0 text-[10px] font-bold px-2.5 py-1 bg-[#F5F1EA] text-[#2D5A43] border border-[#E9E3D8] rounded-full uppercase tracking-wider">
                    {dhikr.read}
                  </span>
                )}
              </div>

              <div className="flex flex-col gap-6">
                <p className="text-3xl font-serif text-right leading-loose text-[#2D5A43]" dir="rtl">
                  {dhikr.text_arabic}
                </p>
                {dhikr.latin && (
                  <p className="text-sm italic text-slate-500 leading-relaxed font-serif bg-[#FDFCF9] border-l-2 border-[#E9E3D8] pl-3 py-1">
                    {dhikr.latin}
                  </p>
                )}
                <p className="text-sm text-slate-600 border-l-2 border-[#2D5A43] pl-4">
                  {dhikr.text_translation}
                </p>
              </div>

              {dhikr.benefit && (
                <div className="text-xs text-[#2D5A43] bg-[#F4F9F6] border border-emerald-100/50 rounded-2xl p-4 leading-relaxed mt-2">
                  <span className="font-bold block mb-1 text-[#1A3A2A] uppercase tracking-wider text-[10px]">Fadhilah:</span>
                  {dhikr.benefit}
                </div>
              )}
            </div>

            {dhikr.reference && (
              <div className="pt-4 flex items-center justify-end border-t border-[#E9E3D8]/30">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{dhikr.reference}</p>
              </div>
            )}
          </div>
        ))}
        {dhikrs.length === 0 && (
          <div className="col-span-full p-10 text-center text-slate-500 bg-white rounded-3xl border border-[#E9E3D8]">No Dhikrs found in this category.</div>
        )}
      </div>
    </div>
  );
}
