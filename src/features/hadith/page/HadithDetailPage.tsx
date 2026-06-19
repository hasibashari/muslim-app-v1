import { hadithService } from "@/src/features/hadith/service/hadith.service";
import { notFound } from "next/navigation";
import { HadithDetailPageClient } from "../components/HadithDetailPageClient";

export default async function HadithDetailPage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ page?: string; q?: string }>;
}) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const collectionId = resolvedParams.id;
  
  const page = parseInt(resolvedSearchParams.page || '1', 10) || 1;
  const q = resolvedSearchParams.q || '';
  const limit = 10;

  const collections = hadithService.getCollections();
  const collection = collections.find(c => c.id === collectionId);

  if (!collection) {
    notFound();
  }

  const hadiths = q
    ? hadithService.getHadithsByCollectionSearchPaginated(collectionId, q, page, limit)
    : hadithService.getHadithsByCollectionPaginated(collectionId, page, limit);

  const totalItems = q
    ? hadithService.getHadithsByCollectionSearchCount(collectionId, q)
    : collection.total_hadith;

  const totalPages = Math.ceil(totalItems / limit);
  const startItem = totalItems > 0 ? (page - 1) * limit + 1 : 0;
  const endItem = Math.min(page * limit, totalItems);

  return (
    <HadithDetailPageClient
      hadiths={hadiths}
      collection={{
        ...collection,
        total_hadith: totalItems, // Show total matching items when searching
      }}
      originalTotalHadith={collection.total_hadith}
      page={page}
      totalPages={totalPages}
      startItem={startItem}
      endItem={endItem}
      initialQuery={q}
    />
  );
}
