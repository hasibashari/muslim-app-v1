import Link from "next/link";
import { quranService } from "@/src/features/quran/service/quran.service";
import { dhikrService } from "@/src/features/dhikr/service/dhikr.service";
import { cookies } from "next/headers";
import { HeroSection } from "../components/HeroSection";
import { RecentSurahsList } from "../components/RecentSurahsList";
import { PrayerAndCalendarWidgets } from "../components/PrayerAndCalendarWidgets";
import { CurrentDhikrWidget } from "../components/CurrentDhikrWidget";
import { TasbihWidget } from "../components/TasbihWidget";

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("noor_session")?.value;
  let userName: string | undefined = undefined;
  if (sessionCookie) {
    try {
      userName = JSON.parse(decodeURIComponent(sessionCookie))?.name;
    } catch (e) { }
  }

  const allSurahs = quranService.getAllSurahs();
  const allDhikrs = dhikrService.getAllDhikrs();

  return (
    <div className="p-6 md:p-10 w-full max-w-6xl mx-auto flex flex-col md:grid md:grid-cols-2 lg:grid-cols-12 gap-8 content-start">

      {/* Hero Welcome */}
      <HeroSection userName={userName} />

      {/* Feature Highlights */}
      <div className="md:col-span-2 lg:col-span-4 grid grid-cols-2 gap-4 lg:h-full">
        <PrayerAndCalendarWidgets />
        <CurrentDhikrWidget allDhikrs={allDhikrs} />
      </div>

      {/* Feature Lists */}
      <div className="md:col-span-1 lg:col-span-6 space-y-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-bold text-[#1A3A2A]">Recent Surahs</h3>
          <Link href="/quran" className="text-xs font-bold text-[#2D5A43] hover:underline">View All</Link>
        </div>
        <RecentSurahsList allSurahs={allSurahs} />
      </div>

      <div className="md:col-span-1 lg:col-span-6">
        <TasbihWidget />
      </div>
    </div>
  );
}

