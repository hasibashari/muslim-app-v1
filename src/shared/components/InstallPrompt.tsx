"use client";

import { useState, useEffect } from "react";
import { Download, X } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function InstallPrompt() {
  const [installPromptEvent, setInstallPromptEvent] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(() => {
    if (typeof window !== "undefined") {
      return !!localStorage.getItem("noor_install_dismissed");
    }
    return false;
  });

  useEffect(() => {
    // Listen for the browser's beforeinstallprompt event
    const handler = (e: Event) => {
      e.preventDefault();
      setInstallPromptEvent(e as BeforeInstallPromptEvent);
      // Show the prompt after a short delay for better UX
      setTimeout(() => setIsVisible(true), 3000);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!installPromptEvent) return;
    await installPromptEvent.prompt();
    const { outcome } = await installPromptEvent.userChoice;
    if (outcome === "accepted") {
      setIsVisible(false);
      setInstallPromptEvent(null);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    setIsDismissed(true);
    localStorage.setItem("noor_install_dismissed", "true");
  };

  if (!isVisible || isDismissed || !installPromptEvent) return null;

  return (
    <div
      role="dialog"
      aria-label="Install Noor App"
      className="fixed bottom-20 left-4 right-4 md:left-auto md:right-6 md:bottom-6 md:max-w-sm z-50 animate-in slide-in-from-bottom-4 duration-300"
    >
      <div className="bg-white rounded-2xl shadow-2xl shadow-[#2D5A43]/15 border border-[#E9E3D8] overflow-hidden">
        {/* Green accent bar */}
        <div className="h-1 w-full bg-gradient-to-r from-[#2D5A43] to-[#4A8B6F]" />

        <div className="p-4 flex items-start gap-3">
          {/* Icon */}
          <div className="w-12 h-12 rounded-xl bg-[#2D5A43] flex items-center justify-center shrink-0 shadow-md shadow-[#2D5A43]/20">
            <img
              src="/icons/icon-96x96.png"
              alt="Noor"
              className="w-8 h-8 object-contain"
            />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <p className="font-bold text-[#1A3A2A] text-sm">Install Noor App</p>
            <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
              Tambahkan ke Home Screen untuk akses cepat & mode offline.
            </p>

            {/* Actions */}
            <div className="flex items-center gap-2 mt-3">
              <button
                id="pwa-install-btn"
                onClick={handleInstall}
                className="flex items-center gap-1.5 bg-[#2D5A43] hover:bg-[#1A3A2A] text-white text-xs font-bold py-2 px-3 rounded-lg transition-colors shadow-sm"
              >
                <Download size={13} />
                Install
              </button>
              <button
                id="pwa-dismiss-btn"
                onClick={handleDismiss}
                className="text-xs text-slate-400 hover:text-slate-600 font-medium py-2 px-2 rounded-lg transition-colors"
              >
                Nanti
              </button>
            </div>
          </div>

          {/* Close button */}
          <button
            id="pwa-close-btn"
            onClick={handleDismiss}
            className="text-slate-300 hover:text-slate-500 transition-colors shrink-0 mt-0.5"
            aria-label="Tutup"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
