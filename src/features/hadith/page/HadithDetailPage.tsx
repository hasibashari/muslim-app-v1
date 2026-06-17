import { hadithService } from "@/src/features/hadith/service/hadith.service";
import { notFound } from "next/navigation";
import { HadithDetailPageClient } from "../components/HadithDetailPageClient";

export default async function HadithDetailPage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const collectionId = resolvedParams.id;
  
  const page = parseInt(resolvedSearchParams.page || '1', 10) || 1;
  const limit = 50;

  const collections = hadithService.getCollections();
  const collection = collections.find(c => c.id === collectionId);

  if (!collection) {
    notFound();
  }

  const hadiths = hadithService.getHadithsByCollectionPaginated(collectionId, page, limit);
  const totalPages = Math.ceil(collection.total_hadith / limit);
  const startItem = (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, collection.total_hadith);

  return (
    <HadithDetailPageClient
      hadiths={hadiths}
      collection={collection}
      page={page}
      totalPages={totalPages}
      startItem={startItem}
      endItem={endItem}
    />
  );
}
