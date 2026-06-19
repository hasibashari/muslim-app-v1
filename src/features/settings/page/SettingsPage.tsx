"use client";

import Link from "next/link";
import { ArrowLeft, Settings } from "lucide-react";
import { useSettings } from "@/src/features/settings/hooks";

export default function SettingsPage() {
  const { settings, updateSetting } = useSettings();

  return (
    <div className="p-6 md:p-10 w-full max-w-xl mx-auto flex flex-col gap-6">
      {/* Back to Dashboard Button */}
      <Link
        href="/"
        className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-[#2D5A43] transition-colors w-fit mb-2"
      >
        <ArrowLeft size={16} />
        Back to Dashboard
      </Link>

      {/* Page Title */}
      <div>
        <h1 className="text-3xl font-extrabold text-[#1A3A2A]">Settings & Preferences</h1>
        <p className="text-sm text-slate-500 mt-1">Configure your reading preferences and layout parameters.</p>
      </div>

      {/* App Preferences Card */}
      <div className="bg-white border border-[#E9E3D8] rounded-2xl p-6 space-y-5 shadow-sm mt-2">
        <div className="flex items-center gap-2 border-b border-[#E9E3D8]/50 pb-3 text-[#1A3A2A]">
          <Settings size={18} />
          <h4 className="text-sm font-bold">App Preferences</h4>
        </div>

        {/* Font Size Setting */}
        <div className="space-y-2.5">
          <label className="text-xs font-semibold text-slate-500 block">Arabic Font Size</label>
          <div className="grid grid-cols-3 gap-1.5 bg-[#F5F1EA]/60 p-1 rounded-xl">
            {(["small", "medium", "large"] as const).map((size) => (
              <button
                key={size}
                onClick={() => updateSetting("fontSize", size)}
                className={`py-2 rounded-lg text-xs font-bold capitalize transition-all cursor-pointer ${settings.fontSize === size
                    ? "bg-[#2D5A43] text-white shadow-sm"
                    : "text-slate-500 hover:text-slate-900"
                  }`}
              >
                {size === "small" ? "Kecil" : size === "medium" ? "Sedang" : "Besar"}
              </button>
            ))}
          </div>
        </div>

        {/* Show Translation Setting */}
        <div className="flex items-center justify-between pt-3 border-t border-[#E9E3D8]/35">
          <div>
            <label className="text-xs font-bold text-slate-700 block">Show Translations</label>
            <span className="text-[10px] text-slate-400 block leading-tight mt-0.5">Show translated text for verses and details</span>
          </div>
          <button
            onClick={() => updateSetting("showTranslation", !settings.showTranslation)}
            className={`w-11 h-6 rounded-full transition-colors relative outline-none shrink-0 cursor-pointer ${settings.showTranslation ? "bg-[#2D5A43]" : "bg-slate-200"
              }`}
          >
            <span className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all shadow-sm ${settings.showTranslation ? "left-6" : "left-1"
              }`} />
          </button>
        </div>

        {/* Hijri Calendar Adjustment Setting */}
        <div className="space-y-2.5 pt-3 border-t border-[#E9E3D8]/35">
          <div>
            <label className="text-xs font-bold text-slate-700 block">Koreksi Kalender Hijriah</label>
            <span className="text-[10px] text-slate-400 block leading-tight mt-0.5">Sesuaikan penanggalan Hijriah (misal +/- 1 hari)</span>
          </div>
          <div className="grid grid-cols-5 gap-1 bg-[#F5F1EA]/60 p-1 rounded-xl">
            {[-2, -1, 0, 1, 2].map((offset) => (
              <button
                key={offset}
                onClick={() => updateSetting("hijriOffset", offset)}
                className={`py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${settings.hijriOffset === offset
                    ? "bg-[#2D5A43] text-white shadow-sm"
                    : "text-slate-500 hover:text-slate-900"
                  }`}
              >
                {offset === 0 ? "Normal" : offset > 0 ? `+${offset}` : `${offset}`}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
