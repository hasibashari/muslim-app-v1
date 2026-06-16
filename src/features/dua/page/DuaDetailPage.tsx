import { duaService } from "@/src/features/dua/service/dua.service";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface DetailProps {
  params: Promise<{ id: string }>;
}

export default async function DuaDetailPage({ params }: DetailProps) {
  const resolvedParams = await params;
  const duaId = parseInt(resolvedParams.id, 10);
  
  if (isNaN(duaId) || duaId <= 0) {
    notFound();
  }

  const dua = duaService.getDuaById(duaId);

  if (!dua) {
    notFound();
  }

  return (
    <div className="p-6 md:p-10 w-full max-w-3xl mx-auto flex flex-col gap-6">
      <Link href="/dua" className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-[#2D5A43] transition-colors w-fit">
        <ArrowLeft size={16} />
        Back to Supplications
      </Link>

      <div className="bg-white rounded-3xl border border-[#E9E3D8] p-8 md:p-10 flex flex-col gap-8 shadow-sm">
        <div className="flex flex-col gap-2 border-b border-[#E9E3D8]/50 pb-4">
          <span className="text-xs font-bold text-[#2D5A43] uppercase tracking-widest">
            {dua.category}
          </span>
          <h1 className="text-3xl font-bold text-[#1A3A2A] font-serif leading-tight">
            {dua.title}
          </h1>
        </div>

        <div className="flex flex-col gap-8 py-4">
          <p className="text-3xl md:text-4xl font-serif text-right leading-loose text-[#2D5A43] mb-4" dir="rtl">
            {dua.text_arabic}
          </p>
          <div className="border-l-4 border-[#2D5A43] pl-5">
            <p className="text-base md:text-lg text-slate-600 leading-relaxed italic">
              &quot;{dua.text_translation}&quot;
            </p>
          </div>
        </div>

        {dua.reference && (
          <div className="pt-4 border-t border-[#E9E3D8]/50 flex justify-end">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Reference: {dua.reference}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
