import type { Metadata, Viewport } from 'next';
import { Inter, Amiri } from 'next/font/google';
import './globals.css';
import { Sidebar } from "@/src/shared/components/Sidebar";
import { TopBar } from "@/src/shared/components/TopBar";
import { BottomNav } from "@/src/shared/components/BottomNav";
import { SessionProviderWrapper } from "@/src/shared/components/SessionProviderWrapper";
import { InstallPrompt } from "@/src/shared/components/InstallPrompt";
import { SpeedInsights } from "@vercel/speed-insights/next";


const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });
const amiri = Amiri({ subsets: ['arabic', 'latin'], weight: ['400', '700'], variable: '--font-serif' });

export const metadata: Metadata = {
  metadataBase: new URL('https://muslim-app-v1.vercel.app'),
  title: 'Noor - Modern Muslim App',
  description: 'Quran, Hadith, Dua, dan Dhikr — semua dalam satu aplikasi yang indah. Baca Al-Quran, pelajari Hadis, dan perkuat ibadah harianmu.',
  manifest: '/manifest.json',
  alternates: {
    canonical: '/',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Noor',
  },
  icons: {
    icon: [
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  openGraph: {
    title: 'Noor - Modern Muslim App',
    description: 'Quran, Hadith, Dua, dan Dhikr — semua dalam satu aplikasi yang indah.',
    url: 'https://muslim-app-v1.vercel.app',
    siteName: 'Noor App',
    images: [
      {
        url: '/homePage.png',
        width: 1200,
        height: 630,
        alt: 'Noor - Modern Muslim App',
      },
    ],
    locale: 'id_ID',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Noor - Modern Muslim App',
    description: 'Quran, Hadith, Dua, dan Dhikr — semua dalam satu aplikasi yang indah.',
    images: ['/homePage.png'],
  },
};

export const viewport: Viewport = {
  themeColor: '#2D5A43',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const dynamic = 'force-dynamic';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={`${inter.variable} ${amiri.variable}`}>
      <head>
        {/* PWA: iOS Safari meta tags */}
        <meta name="mobile-web-app-capable" content="yes" />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
        <link rel="apple-touch-icon" sizes="192x192" href="/icons/icon-192x192.png" />
        <link rel="apple-touch-icon" sizes="512x512" href="/icons/icon-512x512.png" />
      </head>
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
          {/* PWA Install Prompt */}
          <InstallPrompt />
          <SpeedInsights />
        </SessionProviderWrapper>
      </body>
    </html>
  );
}
