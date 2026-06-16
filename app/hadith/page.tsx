import { AppLayout } from "@/src/shared/components/layout/AppLayout";
import { hadithRepository } from "@/src/features/hadith/repository";
import Link from "next/link";
import { Search, BookOpen } from "lucide-react";

export default function HadithPage() {
  const collections = hadithRepository.getCollections();

  return (
    <AppLayout>
      <div className="p-6 md:p-10 w-full max-w-4xl mx-auto flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold text-[#1A3A2A]">Hadith</h1>
          <p className="text-slate-500">Explore authentic Hadith collections.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          {collections.map((collection) => (
            <Link href={`/hadith/${collection.id}`} key={collection.id} className="bg-white rounded-3xl border border-[#E9E3D8] p-8 flex flex-col gap-4 hover:shadow-md transition-shadow group cursor-pointer relative overflow-hidden">
               <div className="w-12 h-12 rounded-xl bg-[#F0F4F2] flex items-center justify-center text-[#2D5A43] group-hover:scale-110 transition-transform">
                 <BookOpen size={24} />
               </div>
               <div>
                 <h2 className="text-xl font-bold text-[#1A3A2A] mb-1">{collection.name}</h2>
                 <p className="text-sm text-slate-500 font-semibold">{collection.total_hadith} Hadiths</p>
               </div>
               <div className="absolute right-[-20px] bottom-[-20px] opacity-5 text-[#2D5A43]">
                  <BookOpen size={120} />
               </div>
            </Link>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
