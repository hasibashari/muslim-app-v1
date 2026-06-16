import { AppLayout } from "@/src/shared/components/layout/AppLayout";
import { duaRepository } from "@/src/features/dua/repository";
import { Search } from "lucide-react";

export default function DuaPage() {
  const duas = duaRepository.getAllDuas();

  return (
    <AppLayout>
      <div className="p-6 md:p-10 w-full max-w-4xl mx-auto flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold text-[#1A3A2A]">Dua</h1>
          <p className="text-slate-500">Supplications for various occasions.</p>
        </div>

        <div className="relative w-full">
          <input 
            type="text" 
            placeholder="Search Dua..." 
            className="w-full bg-white border border-[#E9E3D8] rounded-full py-4 pl-14 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D5A43] shadow-sm"
          />
          <Search className="absolute left-5 top-4 text-slate-400" size={20} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          {duas.map((dua) => (
            <div key={dua.id} className="bg-white rounded-3xl border border-[#E9E3D8] p-6 lg:p-8 flex flex-col gap-6 shadow-sm">
              <div className="flex flex-col border-b border-[#E9E3D8] pb-4">
                <h2 className="text-lg font-bold text-[#1A3A2A]">{dua.title}</h2>
              </div>
              
              <div className="flex flex-col gap-6">
                <p className="text-2xl font-serif text-right leading-loose text-[#2D5A43]" dir="rtl">
                  {dua.text_arabic}
                </p>
                <p className="text-sm text-slate-600 leading-relaxed border-l-2 border-[#2D5A43] pl-4">
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
             <div className="col-span-full p-10 text-center text-slate-500 bg-white rounded-3xl border border-[#E9E3D8]">No Duas found.</div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
