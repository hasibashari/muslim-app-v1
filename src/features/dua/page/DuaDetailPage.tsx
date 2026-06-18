import { duaService } from "@/src/features/dua/service/dua.service";
import { notFound } from "next/navigation";
import { DuaDetailPageClient } from "../components/DuaDetailPageClient";

interface DetailProps {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ category?: string; page?: string }>;
}

export default async function DuaDetailPage({ params, searchParams }: DetailProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const duaId = parseInt(resolvedParams.id, 10);
  
  if (isNaN(duaId) || duaId <= 0) {
    notFound();
  }

  const dua = duaService.getDuaById(duaId);

  if (!dua) {
    notFound();
  }

  const { prev, next } = duaService.getAdjacentDuas(duaId);

  const category = resolvedSearchParams?.category || "";
  const page = resolvedSearchParams?.page || "";

  return (
    <DuaDetailPageClient
      dua={dua}
      prev={prev}
      next={next}
      backCategory={category}
      backPage={page}
    />
  );
}
