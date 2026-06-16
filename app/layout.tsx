import type {Metadata} from 'next';
import { Inter, Amiri } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });
const amiri = Amiri({ subsets: ['arabic', 'latin'], weight: ['400', '700'], variable: '--font-serif' });

export const metadata: Metadata = {
  title: 'Noor - Modern Muslim App',
  description: 'A feature-based Next.js application containing Quran, Hadith, Dua, and Dhikr reading experiences.',
};

export const dynamic = 'force-dynamic';

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className={`${inter.variable} ${amiri.variable}`}>
      <body className="antialiased bg-[#FDFCF8] font-sans overflow-hidden" suppressHydrationWarning>{children}</body>
    </html>
  );
}

