import { duaService } from "@/src/features/dua/service/dua.service";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function DuaCategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const resolvedParams = await params;

  const categories = duaService.getCategories();
  const matchedCategory = categories.find(c => c.toLowerCase() === decodeURIComponent(resolvedParams.category).toLowerCase());

  if (!matchedCategory) {
    notFound();
  }

  const duas = duaService.getDuasByCategory(matchedCategory);

  return (
    <div className="p-6 md:p-10 w-full max-w-4xl mx-auto flex flex-col gap-6">
      <Link href="/dua" className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-[#2D5A43] transition-colors w-fit">
        <ArrowLeft size={16} />
        Back to Categories
      </Link>

      <div className="flex flex-col gap-2 mb-4">
        <h1 className="text-4xl font-bold text-[#1A3A2A] font-serif">{matchedCategory}</h1>
        <p className="text-slate-500 font-semibold uppercase tracking-widest text-sm">{duas.length} Supplications</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
        {duas.map((dua) => (
          <div key={dua.id} className="bg-white rounded-3xl border border-[#E9E3D8] p-6 lg:p-8 flex flex-col gap-6 shadow-sm">
            <div className="flex justify-between items-center border-b border-[#E9E3D8] pb-4">
              <h2 className="text-lg font-bold text-[#1A3A2A]">{dua.title}</h2>
            </div>

            <div className="flex flex-col gap-6">
              <p className="text-3xl font-serif text-right leading-loose text-[#2D5A43]" dir="rtl">
                {dua.text_arabic}
              </p>
              <p className="text-sm text-slate-600 border-l-2 border-[#2D5A43] pl-4">
                {dua.text_translation}
              </p>
            </div>

            {dua.reference && (
              <div className="mt-auto pt-4 flex items-center justify-end">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{dua.reference}</p>
              </div>
            )}
          </div>
        ))}
        {duas.length === 0 && (
          <div className="col-span-full p-10 text-center text-slate-500 bg-white rounded-3xl border border-[#E9E3D8]">No Duas found in this category.</div>
        )}
      </div>
    </div>
  );
}
