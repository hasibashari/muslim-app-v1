import { AppLayout } from "@/src/shared/components/layout/AppLayout";
import { duaRepository } from "@/src/features/dua/repository";
import { Search, FolderOpen } from "lucide-react";
import Link from "next/link";

export const dynamic = 'force-dynamic';

export default function DuaPage() {
  const categories = duaRepository.getCategories();

  return (
    <AppLayout>
      <div className="p-6 md:p-10 w-full max-w-4xl mx-auto flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold text-[#1A3A2A]">Dua Categories</h1>
          <p className="text-slate-500">Select a category to view supplications.</p>
        </div>

        <div className="relative w-full mb-2">
          <input 
            type="text" 
            placeholder="Search Categories..." 
            className="w-full bg-white border border-[#E9E3D8] rounded-full py-4 pl-14 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D5A43] shadow-sm"
          />
          <Search className="absolute left-5 top-4 text-slate-400" size={20} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {categories.map((category) => (
            <Link href={`/dua/${encodeURIComponent(category.toLowerCase())}`} key={category} className="bg-white rounded-3xl border border-[#E9E3D8] p-8 flex flex-col gap-4 hover:shadow-md transition-shadow group relative overflow-hidden cursor-pointer">
              <div className="w-12 h-12 rounded-xl bg-[#F0F4F2] flex items-center justify-center text-[#2D5A43] group-hover:scale-110 transition-transform">
                <FolderOpen size={24} />
              </div>
              <div className="mt-2 text-[#1A3A2A]">
                 <h2 className="text-xl font-bold">{category}</h2>
                 <p className="text-sm font-medium text-[#2D5A43] tracking-wide uppercase mt-1">
                   {duaRepository.getDuasByCategory(category).length} Items
                 </p>
              </div>
               <div className="absolute right-[-20px] bottom-[-20px] opacity-5 text-[#2D5A43]">
                  <FolderOpen size={120} />
               </div>
            </Link>
          ))}
          {categories.length === 0 && (
            <div className="col-span-full p-10 text-center text-slate-500 bg-white rounded-3xl border border-[#E9E3D8]">No Categories found.</div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
