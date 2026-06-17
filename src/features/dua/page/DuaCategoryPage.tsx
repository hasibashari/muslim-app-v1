import { duaService } from "@/src/features/dua/service/dua.service";
import Link from "next/link";
import { ArrowLeft, FolderOpen } from "lucide-react";

export default async function DuaCategoryPage() {
  const categories = duaService.getCategories();

  return (
    <div className="p-6 md:p-10 w-full max-w-4xl mx-auto flex flex-col gap-6">
      <Link href="/dua" className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-[#2D5A43] transition-colors w-fit">
        <ArrowLeft size={16} />
        Back to Supplications
      </Link>

      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-[#1A3A2A]">Dua Categories</h1>
        <p className="text-slate-500">Select a category to view specific supplications.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-4">
        {categories.map((category) => {
          const count = duaService.getDuasByCategory(category).length;
          return (
            <Link
              href={`/dua?category=${encodeURIComponent(category)}`}
              key={category}
              className="bg-white rounded-3xl border border-[#E9E3D8] p-8 flex flex-col gap-4 hover:shadow-md transition-shadow group relative overflow-hidden cursor-pointer text-left"
            >
              <div className="w-12 h-12 rounded-xl bg-[#F0F4F2] flex items-center justify-center text-[#2D5A43] group-hover:scale-110 transition-transform w-fit">
                <FolderOpen size={24} />
              </div>
              <div className="mt-2 text-[#1A3A2A]">
                <h2 className="text-xl font-bold">{category}</h2>
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
        {categories.length === 0 && (
          <div className="col-span-full p-10 text-center text-slate-500 bg-white rounded-3xl border border-[#E9E3D8]">
            No categories found.
          </div>
        )}
      </div>
    </div>
  );
}
