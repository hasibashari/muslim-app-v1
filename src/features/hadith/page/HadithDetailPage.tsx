import { hadithService } from "@/src/features/hadith/service/hadith.service";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function HadithDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const collectionId = resolvedParams.id;
  const collections = hadithService.getCollections();
  const collection = collections.find(c => c.id === collectionId);
  const hadiths = hadithService.getHadithsByCollection(collectionId);

  if (!collection) {
    notFound();
  }

  return (
    <div className="p-6 md:p-10 w-full max-w-4xl mx-auto flex flex-col gap-6">
      <Link href="/hadith" className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-[#2D5A43] transition-colors w-fit">
        <ArrowLeft size={16} />
        Back to Collections
      </Link>

      <div className="flex flex-col gap-2 mb-4">
        <h1 className="text-4xl font-bold text-[#1A3A2A] font-serif">{collection.name}</h1>
        <p className="text-slate-500 font-semibold uppercase tracking-widest text-sm">{collection.total_hadith} Hadiths</p>
      </div>

      {/* Hadith List */}
      <div className="flex flex-col gap-8 mt-2">
        {hadiths.map((hadith) => (
          <div key={hadith.id} className="bg-white rounded-3xl border border-[#E9E3D8] p-6 md:p-8 flex flex-col gap-6 relative shadow-sm">
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
    </div>
  );
}
