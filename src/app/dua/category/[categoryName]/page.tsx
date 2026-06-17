import { redirect } from "next/navigation";

export const dynamic = 'force-dynamic';

export default async function Page({ params }: { params: Promise<{ categoryName: string }> }) {
  const resolvedParams = await params;
  redirect(`/dua?category=${encodeURIComponent(resolvedParams.categoryName)}`);
}
