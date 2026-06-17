import { dhikrService } from "@/src/features/dhikr/service/dhikr.service";
import { notFound } from "next/navigation";
import { DhikrDetailPageClient } from "../components/DhikrDetailPageClient";

export default async function DhikrDetailPage({ params }: { params: Promise<{ category: string }> }) {
  const resolvedParams = await params;

  // Need to get exactly the right category name based on lowercased match.
  const categories = dhikrService.getCategories();
  const matchedCategory = categories.find(c => c.toLowerCase() === decodeURIComponent(resolvedParams.category).toLowerCase());

  if (!matchedCategory) {
    notFound();
  }

  const dhikrs = dhikrService.getDhikrsByCategory(matchedCategory);

  return <DhikrDetailPageClient dhikrs={dhikrs} category={matchedCategory} />;
}
