"use client";

import { AppLayout } from "@/src/shared/components/layout/AppLayout";
import { useEffect, useState } from "react";
import { Search } from "lucide-react";

interface Dhikr {
  id: number;
  title: string;
  text_arabic: string;
  text_translation: string;
  count: number;
}

// Since we need interactivity for Dhikr (counter), we need to fetch from an API or just use a mock client side for now.
// To keep it simple and consistent with the repository, we'll create a simple API route or just hydrate the initial state from a server component if possible... 
// Wait! Next.js 15 Server Components can't pass functions, but we can fetch the initial data in a server component and pass it to a client component.
// Let's just create the Dhikr page as a wrapper.

export default function DhikrPage() {
  const [dhikrs, setDhikrs] = useState<Dhikr[]>([]);
  const [counts, setCounts] = useState<Record<number, number>>({});

  // In a real app we would use server components + client islands. For simplicity in this demo we fetch via a quick API route or just hardcode the known values.
  // Since we are mocking SQLite locally, we'll just mock the Dhikrs here for the client component since `better-sqlite3` runs on Node and cannot be bundled in the browser.
  useEffect(() => {
    // Fetch from our local server route or just mock
    fetch('/api/dhikr')
      .then(res => res.json())
      .then((data) => {
         setDhikrs(data);
         const initialCounts: Record<number, number> = {};
         data.forEach((d: Dhikr) => {
            initialCounts[d.id] = 0;
         });
         setCounts(initialCounts);
      })
      .catch((err) => console.error(err));
  }, []);

  const handleIncrement = (id: number) => {
    setCounts(prev => ({
      ...prev,
      [id]: Math.min(prev[id] + 1, dhikrs.find(d => d.id === id)?.count || 999)
    }));
  };

  const handleReset = (id: number) => {
    setCounts(prev => ({
      ...prev,
      [id]: 0
    }));
  };

  return (
    <AppLayout>
      <div className="p-6 md:p-10 w-full max-w-4xl mx-auto flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold text-[#1A3A2A]">Dhikr</h1>
          <p className="text-slate-500">Daily remembrances and glorifications.</p>
        </div>

        <div className="relative w-full">
          <input 
            type="text" 
            placeholder="Search Dhikr..." 
            className="w-full bg-white border border-[#E9E3D8] rounded-full py-4 pl-14 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D5A43] shadow-sm"
          />
          <Search className="absolute left-5 top-4 text-slate-400" size={20} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          {dhikrs.map((dhikr) => (
            <div key={dhikr.id} className="bg-white rounded-3xl border border-[#E9E3D8] p-6 lg:p-8 flex flex-col gap-6 shadow-sm">
              <div className="flex justify-between items-center border-b border-[#E9E3D8] pb-4">
                <h2 className="text-lg font-bold text-[#1A3A2A]">{dhikr.title}</h2>
                <span className="px-3 py-1 bg-[#F5F1EA] text-[#2D5A43] rounded-full text-xs font-bold tracking-wider">
                  Target: {dhikr.count}
                </span>
              </div>
              
              <div className="flex flex-col gap-6">
                <p className="text-3xl font-serif text-center leading-loose text-[#2D5A43]" dir="rtl">
                  {dhikr.text_arabic}
                </p>
                <p className="text-sm text-center text-slate-600">
                  {dhikr.text_translation}
                </p>
              </div>

              <div className="flex items-center justify-between mt-auto pt-6 border-t border-slate-50">
                 <button onClick={() => handleReset(dhikr.id)} className="text-xs font-bold text-slate-400 hover:text-red-500 transition-colors uppercase tracking-widest">
                   Reset
                 </button>

                 <button 
                  onClick={() => handleIncrement(dhikr.id)}
                  disabled={counts[dhikr.id] >= dhikr.count}
                  className="w-20 h-20 rounded-full bg-[#2D5A43] flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-[#2D5A43]/30 active:scale-95 transition-all disabled:opacity-50 disabled:active:scale-100"
                 >
                   {counts[dhikr.id]}
                 </button>
                 <div className="w-10"></div> {/* Spacer for balance */}
              </div>
            </div>
          ))}
          {dhikrs.length === 0 && (
             <div className="col-span-full p-10 text-center text-slate-500 bg-white rounded-3xl border border-[#E9E3D8]">Loading Dhikrs...</div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
