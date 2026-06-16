import { duaService } from "@/src/features/dua/service/dua.service";
import { Search, Sparkles } from "lucide-react";
import Link from "next/link";

interface PageProps {
  searchParams?: Promise<{ q?: string }>;
}

export default async function DuaPage({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;
  const query = resolvedSearchParams?.q || "";

  const allDuas = duaService.getAllDuas();
  const filteredDuas = query
    ? allDuas.filter(
        (dua) =>
          dua.title.toLowerCase().includes(query.toLowerCase()) ||
          dua.category.toLowerCase().includes(query.toLowerCase()) ||
          dua.text_translation.toLowerCase().includes(query.toLowerCase())
      )
    : allDuas;

  return (
    <div className="p-6 md:p-10 w-full max-w-4xl mx-auto flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-[#1A3A2A]">Supplications (Dua)</h1>
        <p className="text-slate-500">Explore and read authentic supplications from Quran and Sunnah.</p>
      </div>

      {/* Server-side Search Form */}
      <form method="GET" action="/dua" className="relative w-full mb-2">
        <input
          type="text"
          name="q"
          defaultValue={query}
          placeholder="Search Duas..."
          className="w-full bg-white border border-[#E9E3D8] rounded-full py-4 pl-14 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D5A43] shadow-sm"
        />
        <button type="submit" className="absolute left-5 top-4 text-slate-400">
          <Search size={20} />
        </button>
      </form>

      {/* Grid List of Duas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {filteredDuas.map((dua) => (
          <Link
            href={`/dua/detail/${dua.id}`}
            key={dua.id}
            className="bg-white rounded-3xl border border-[#E9E3D8] p-6 flex flex-col gap-4 hover:shadow-md transition-shadow group relative overflow-hidden cursor-pointer"
          >
            <div className="w-12 h-12 rounded-xl bg-[#F0F4F2] flex items-center justify-center text-[#2D5A43] group-hover:scale-110 transition-transform">
              <Sparkles size={24} />
            </div>
            <div className="mt-2 text-[#1A3A2A]">
              <h2 className="text-xl font-bold line-clamp-1">{dua.title}</h2>
              <p className="text-xs font-semibold text-[#2D5A43] tracking-wide uppercase mt-1">
                {dua.category}
              </p>
              <p className="text-sm text-slate-500 line-clamp-2 mt-2 leading-relaxed">
                {dua.text_translation}
              </p>
            </div>
          </Link>
        ))}
        {filteredDuas.length === 0 && (
          <div className="col-span-full p-10 text-center text-slate-500 bg-white rounded-3xl border border-[#E9E3D8]">
            No Duas found matching your search.
          </div>
        )}
      </div>
    </div>
  );
}
