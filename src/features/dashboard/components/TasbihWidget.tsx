"use client";

import { useState, useEffect } from "react";
import { RotateCcw, Volume2, VolumeX, Settings, Sparkles } from "lucide-react";

interface DhikrPreset {
  id: string;
  indonesian: string;
  arabic: string;
  meaning: string;
}

const PRESETS: DhikrPreset[] = [
  { id: "subhanallah", indonesian: "Subhanallah", arabic: "سُبْحَانَ ٱللَّٰهِ", meaning: "Maha Suci Allah" },
  { id: "alhamdulillah", indonesian: "Alhamdulillah", arabic: "ٱلْحَمْدُ لِلَّٰهِ", meaning: "Segala Puji Bagi Allah" },
  { id: "allahuakbar", indonesian: "Allahu Akbar", arabic: "ٱللَّٰهُ أَكْبَرُ", meaning: "Allah Maha Besar" },
  { id: "astaghfirullah", indonesian: "Astaghfirullah", arabic: "أَسْتَغْفِرُ ٱللَّٰهَ", meaning: "Aku Memohon Ampun Kepada Allah" },
  { id: "lailahaillallah", indonesian: "La ilaha illallah", arabic: "لَا إِلَٰهَ إِلَّا ٱللَّٰهُ", meaning: "Tiada Tuhan Selain Allah" },
];

export function TasbihWidget() {
  const [selectedPresetId, setSelectedPresetId] = useState<string>("subhanallah");
  const [count, setCount] = useState<number>(0);
  const [target, setTarget] = useState<number | "infinity">(33);
  const [hapticEnabled, setHapticEnabled] = useState<boolean>(true);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);

  // Load state from localStorage on mount
  useEffect(() => {
    try {
      const storedPreset = localStorage.getItem("noor_tasbih_preset");
      const storedCount = localStorage.getItem("noor_tasbih_count");
      const storedTarget = localStorage.getItem("noor_tasbih_target");
      const storedHaptic = localStorage.getItem("noor_tasbih_haptic");

      const timer = setTimeout(() => {
        if (storedPreset) setSelectedPresetId(storedPreset);
        if (storedCount) setCount(parseInt(storedCount, 10) || 0);
        if (storedTarget) {
          setTarget(storedTarget === "infinity" ? "infinity" : parseInt(storedTarget, 10) || 33);
        }
        if (storedHaptic) setHapticEnabled(storedHaptic === "true");
      }, 0);
      return () => clearTimeout(timer);
    } catch (e) {
      console.error("Failed to load Tasbih state from localStorage:", e);
    }
  }, []);

  // Sync state to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem("noor_tasbih_preset", selectedPresetId);
    } catch (e) {}
  }, [selectedPresetId]);

  useEffect(() => {
    try {
      localStorage.setItem("noor_tasbih_count", count.toString());
    } catch (e) {}
  }, [count]);

  useEffect(() => {
    try {
      localStorage.setItem("noor_tasbih_target", target.toString());
    } catch (e) {}
  }, [target]);

  useEffect(() => {
    try {
      localStorage.setItem("noor_tasbih_haptic", hapticEnabled.toString());
    } catch (e) {}
  }, [hapticEnabled]);

  const currentPreset = PRESETS.find((p) => p.id === selectedPresetId) || PRESETS[0];

  const handleIncrement = () => {
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 80);

    // Trigger haptic vibration on mobile
    if (hapticEnabled && typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate(45);
    }

    setCount((prev) => {
      const nextCount = prev + 1;
      if (target !== "infinity" && nextCount >= target) {
        // Trigger longer vibration on target completion
        if (hapticEnabled && typeof navigator !== "undefined" && navigator.vibrate) {
          navigator.vibrate([100, 50, 100]);
        }
      }
      return nextCount;
    });
  };

  const handleReset = () => {
    if (hapticEnabled && typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate(60);
    }
    setCount(0);
  };

  const cyclePreset = () => {
    const currentIndex = PRESETS.findIndex((p) => p.id === selectedPresetId);
    const nextIndex = (currentIndex + 1) % PRESETS.length;
    setSelectedPresetId(PRESETS[nextIndex].id);
    setCount(0);
  };

  // SVG Progress calculation
  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  const isTargetMet = target !== "infinity" && count >= target;
  
  const progressRatio = target === "infinity" 
    ? 0.5 
    : Math.min(count, target) / target;
    
  const strokeDashoffset = target === "infinity"
    ? circumference * 0.2 // static ring decoration for infinity mode
    : circumference - progressRatio * circumference;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Sparkles className="text-[#2D5A43] w-5 h-5" />
          <h3 className="text-lg font-bold text-[#1A3A2A]">Tasbih Digital</h3>
        </div>
        <div className="flex items-center gap-1.5">
          {/* Haptic Toggle Button */}
          <button
            onClick={() => setHapticEnabled(!hapticEnabled)}
            className={`p-2 rounded-xl transition-all border ${
              hapticEnabled 
                ? "bg-emerald-50 border-emerald-200 text-[#2D5A43] hover:bg-emerald-100" 
                : "bg-slate-50 border-slate-200 text-slate-400 hover:bg-slate-100"
            }`}
            title={hapticEnabled ? "Haptic Getaran Aktif" : "Haptic Getaran Nonaktif"}
          >
            {hapticEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>
          
          {/* Settings Toggle Button */}
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`p-2 rounded-xl transition-all border ${
              showSettings 
                ? "bg-[#2D5A43] border-[#2D5A43] text-white" 
                : "bg-white border-[#E9E3D8] text-slate-500 hover:bg-[#F5F1EA]"
            }`}
            title="Pengaturan Tasbih"
          >
            <Settings size={16} />
          </button>
        </div>
      </div>

      <div className="bg-white border border-[#E9E3D8] rounded-2xl p-6 md:p-8 shadow-sm flex flex-col items-center relative min-h-[300px] justify-between">
        
        {/* Toggleable Settings Panel */}
        {showSettings ? (
          <div className="w-full space-y-4 animate-in fade-in duration-200">
            <h4 className="text-sm font-bold text-[#1A3A2A] border-b border-[#E9E3D8]/50 pb-2">Pengaturan Tasbih</h4>
            
            {/* Target Select */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 block">Target Hitungan</label>
              <div className="grid grid-cols-4 gap-1.5 bg-[#F5F1EA]/60 p-1 rounded-xl">
                {([33, 99, 100, "infinity"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => {
                      setTarget(t);
                      setShowSettings(false);
                    }}
                    className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                      target === t 
                        ? "bg-[#2D5A43] text-white shadow-sm" 
                        : "text-slate-500 hover:text-slate-900"
                    }`}
                  >
                    {t === "infinity" ? "∞" : t}
                  </button>
                ))}
              </div>
            </div>

            {/* Presets List */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 block">Pilih Dzikir</label>
              <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
                {PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => {
                      setSelectedPresetId(preset.id);
                      setCount(0);
                      setShowSettings(false);
                    }}
                    className={`w-full text-left p-2 rounded-xl text-xs font-semibold flex justify-between items-center transition-all ${
                      selectedPresetId === preset.id
                        ? "bg-emerald-50 border border-emerald-100 text-[#2D5A43]"
                        : "bg-slate-50 border border-transparent hover:bg-slate-100 text-slate-600"
                    }`}
                  >
                    <span>{preset.indonesian}</span>
                    <span className="font-serif text-right text-[#2D5A43]/80">{preset.arabic}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Main Interactive View */
          <>
            {/* Upper: Selected Dhikr Info */}
            <div className="text-center w-full cursor-pointer select-none" onClick={cyclePreset} title="Klik untuk ganti dzikir">
              <div className="text-xs font-bold text-[#2D5A43] bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-full w-fit mx-auto mb-2 tracking-wide uppercase">
                {currentPreset.indonesian}
              </div>
              <p className="text-[10px] text-slate-400 font-medium">{currentPreset.meaning}</p>
            </div>

            {/* Middle: Big Counter Area */}
            <div className="relative my-4 flex items-center justify-center select-none">
              {/* Circular Progress Path */}
              <svg width="160" height="160" className="transform -rotate-90">
                <circle
                  cx="80"
                  cy="80"
                  r={radius}
                  className="stroke-[#F5F1EA]"
                  strokeWidth="8"
                  fill="transparent"
                />
                <circle
                  cx="80"
                  cy="80"
                  r={radius}
                  className={`transition-all duration-300 ${
                    isTargetMet ? "stroke-amber-500" : "stroke-[#2D5A43]"
                  }`}
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                />
              </svg>

              {/* Tap Button Inside */}
              <button
                onClick={handleIncrement}
                className={`absolute w-32 h-32 rounded-full bg-white hover:bg-[#FDFCF8] border border-[#E9E3D8]/50 shadow-lg hover:shadow-xl flex flex-col items-center justify-center transition-all focus:outline-none cursor-pointer ${
                  isAnimating ? "scale-[0.93] shadow-md border-emerald-100" : "active:scale-[0.95]"
                }`}
              >
                {/* Arabic Preset Text */}
                <p className="text-sm font-serif text-[#2D5A43]/80 max-w-[100px] truncate leading-tight select-none mb-1 mt-2">
                  {currentPreset.arabic}
                </p>
                {/* Big Count Number */}
                <span className={`text-4xl font-extrabold tracking-tight transition-colors select-none ${
                  isTargetMet ? "text-amber-600" : "text-[#1A3A2A]"
                }`}>
                  {count}
                </span>
                {/* Target status */}
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1 select-none">
                  {target === "infinity" ? "NO TARGET" : `TARGET: ${target}`}
                </span>
              </button>
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-between w-full pt-4 border-t border-[#E9E3D8]/45">
              <button
                onClick={handleReset}
                className="flex items-center gap-1.5 text-[#2D5A43] hover:text-rose-700 bg-[#F5F1EA] hover:bg-rose-50 hover:border-rose-100 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border border-transparent cursor-pointer"
                title="Reset Hitungan"
              >
                <RotateCcw size={12} />
                Reset
              </button>
              
              {/* Target Complete Text Alert */}
              {isTargetMet && (
                <span className="text-[10px] font-extrabold text-amber-600 bg-amber-50 border border-amber-100 px-2.5 py-1 rounded-lg animate-bounce select-none">
                  Target Tercapai! 🎉
                </span>
              )}

              <span className="text-[10px] font-bold text-slate-400 uppercase select-none">
                Tap Circle to Pray
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
