import type { Metadata } from 'next';
import { Inter, Amiri } from 'next/font/google';
import './globals.css';
import { Sidebar } from "@/src/shared/components/Sidebar";
import { TopBar } from "@/src/shared/components/TopBar";
import { BottomNav } from "@/src/shared/components/BottomNav";
import { SessionProviderWrapper } from "@/src/shared/components/SessionProviderWrapper";

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });
const amiri = Amiri({ subsets: ['arabic', 'latin'], weight: ['400', '700'], variable: '--font-serif' });

export const metadata: Metadata = {
  title: 'Noor - Modern Muslim App',
  description: 'A feature-based Next.js application containing Quran, Hadith, Dua, and Dhikr reading experiences.',
};

export const dynamic = 'force-dynamic';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${amiri.variable}`}>
      <body className="antialiased bg-[#FDFCF8] font-sans overflow-hidden" suppressHydrationWarning>
        <SessionProviderWrapper>
          <div className="flex h-screen w-full bg-[#FDFCF8] font-sans text-slate-800 overflow-hidden">
            <Sidebar />
            <div className="flex-1 flex flex-col h-full w-full min-w-0 bg-[#FDFCF8]">
              <TopBar />
              <main className="flex-1 overflow-y-auto scrollbar-hide">
                {children}
                {/* Pad for mobile bottom nav */}
                <div className="h-20 md:hidden w-full"></div>
              </main>
              <BottomNav />
            </div>
          </div>
        </SessionProviderWrapper>
      </body>
    </html>
  );
}
