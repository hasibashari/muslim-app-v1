import { Home, BookOpen, ScrollText, Sparkles, RefreshCw } from "lucide-react";

export const navItems = [
  { href: "/", icon: Home, label: "Home", exact: true },
  { href: "/quran", icon: BookOpen, label: "Quran", exact: false },
  { href: "/hadith", icon: ScrollText, label: "Hadith", exact: false },
  { href: "/dua", icon: Sparkles, label: "Dua", exact: false },
  { href: "/dhikr", icon: RefreshCw, label: "Dhikr", exact: false },
] as const;

/**
 * Returns true if the current pathname matches the given nav href.
 * When `exact` is true, only an exact match returns true.
 * When `exact` is false, any pathname starting with `href + "/"` also matches.
 */
export function isNavActive(pathname: string, href: string, exact: boolean): boolean {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(href + "/");
}
