import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { BottomNav } from "./BottomNav";

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
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
  );
}
