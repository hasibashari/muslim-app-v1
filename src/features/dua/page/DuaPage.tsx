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

      {/* List of Duas */}
      <div className="flex flex-col gap-4">
        {filteredDuas.map((dua) => (
          <Link
            href={`/dua/detail/${dua.id}`}
            key={dua.id}
            className="bg-white rounded-2xl border border-[#E9E3D8] p-5 flex items-center gap-4 hover:bg-[#FBF9F4] transition-colors group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-[#F0F4F2] flex items-center justify-center text-[#2D5A43] group-hover:scale-110 transition-transform shrink-0">
              <Sparkles size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-bold text-[#1A3A2A] truncate group-hover:text-[#2D5A43] transition-colors">{dua.title}</h2>
            </div>
          </Link>
        ))}
        {filteredDuas.length === 0 && (
          <div className="p-10 text-center text-slate-500 bg-white rounded-3xl border border-[#E9E3D8]">
            No Duas found matching your search.
          </div>
        )}
      </div>
    </div>
  );
}
