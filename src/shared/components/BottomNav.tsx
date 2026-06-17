"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BookOpen, Sparkles, RefreshCw } from "lucide-react";
import { motion } from "motion/react";

const navItems = [
  { href: "/", icon: Home, label: "Home", exact: true },
  { href: "/quran", icon: BookOpen, label: "Quran", exact: false },
  { href: "/dua", icon: Sparkles, label: "Dua", exact: false },
  { href: "/dhikr", icon: RefreshCw, label: "Dhikr", exact: false },
];

export function BottomNav() {
  const pathname = usePathname();

  const isActive = (href: string, exact: boolean) => {
    if (exact) return pathname === href;
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <nav
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-[#E9E3D8] flex items-center justify-around h-16 px-1 z-30"
    >
      {navItems.map(({ href, icon: Icon, label, exact }) => {
        const active = isActive(href, exact);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`flex flex-col items-center gap-0.5 p-2 min-w-[3rem] rounded-xl transition-all duration-150 ${
              active
                ? "text-[#2D5A43]"
                : "text-slate-400 hover:text-[#2D5A43]"
            }`}
          >
            <div className="w-8 h-8 flex items-center justify-center rounded-xl relative">
              {active && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                  className="absolute inset-0 bg-[#2D5A43]/10 rounded-xl"
                />
              )}
              <Icon
                size={20}
                strokeWidth={active ? 2.5 : 1.8}
                className="relative z-10"
              />
            </div>
            <span
              className={`text-[10px] font-bold tracking-tight ${
                active ? "text-[#2D5A43]" : "text-slate-400"
              }`}
            >
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
