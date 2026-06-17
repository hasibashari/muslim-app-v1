import { duaService } from "@/src/features/dua/service/dua.service";
import { notFound } from "next/navigation";
import { DuaDetailPageClient } from "../components/DuaDetailPageClient";

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

  const { prev, next } = duaService.getAdjacentDuas(duaId);

  return <DuaDetailPageClient dua={dua} prev={prev} next={next} />;
}
