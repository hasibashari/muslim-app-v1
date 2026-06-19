"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { doc, setDoc, onSnapshot } from "firebase/firestore";
import { db, isConfigured } from "@/src/lib/firebase";
import { useSession } from "@/src/features/auth/hooks";

export interface AppSettings {
  fontSize: "small" | "medium" | "large";
  showTranslation: boolean;
  hijriOffset: number;
}

const defaultSettings: AppSettings = {
  fontSize: "medium",
  showTranslation: true,
  hijriOffset: 0,
};

interface SettingsContextType {
  settings: AppSettings;
  updateSetting: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => Promise<void>;
  isLoading: boolean;
}

const SettingsContext = createContext<SettingsContextType>({
  settings: defaultSettings,
  updateSetting: async () => {},
  isLoading: true,
});

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  
  // 1. Initialize state synchronously on client mount using lazy state initializer
  const [settings, setSettings] = useState<AppSettings>(() => {
    if (typeof window !== "undefined") {
      const local = localStorage.getItem("noor_settings");
      if (local) {
        try {
          return { ...defaultSettings, ...JSON.parse(local) };
        } catch (e) {}
      }
    }
    return defaultSettings;
  });
  
  const [isLoading, setIsLoading] = useState(true);

  // 2. Load and listen from Firestore on authentication
  useEffect(() => {
    if (status === "loading") return;

    if (status !== "authenticated" || !session?.user?.id || !isConfigured) {
      // Defer state update to avoid synchronous setState inside effect body
      const timer = setTimeout(() => setIsLoading(false), 0);
      return () => clearTimeout(timer);
    }

    const timer = setTimeout(() => setIsLoading(true), 0);
    const docRef = doc(db, "users", session.user.id, "settings", "general");

    const unsubscribe = onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const cloudSettings = docSnap.data() as AppSettings;
          setSettings(cloudSettings);
          localStorage.setItem("noor_settings", JSON.stringify(cloudSettings));
        } else {
          // Document does not exist in Cloud, initialize it.
          // We read from localStorage directly to avoid depending on settings state
          const local = localStorage.getItem("noor_settings");
          let initialSettings = defaultSettings;
          if (local) {
            try {
              initialSettings = { ...defaultSettings, ...JSON.parse(local) };
            } catch (e) {}
          }
          setDoc(docRef, initialSettings).catch((err) =>
            console.error("Error setting initial settings:", err)
          );
        }
        setIsLoading(false);
      },
      (error) => {
        console.error("Firestore settings listener error:", error);
        setIsLoading(false);
      }
    );

    return () => {
      clearTimeout(timer);
      unsubscribe();
    };
  }, [status, session?.user?.id]);

  const updateSetting = async <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    const newSettings = {
      ...settings,
      [key]: value,
    };

    setSettings(newSettings);
    localStorage.setItem("noor_settings", JSON.stringify(newSettings));

    if (status === "authenticated" && session?.user?.id && isConfigured) {
      try {
        const docRef = doc(db, "users", session.user.id, "settings", "general");
        await setDoc(docRef, newSettings, { merge: true });
      } catch (err) {
        console.error("Failed to save settings to Firestore:", err);
      }
    }
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSetting, isLoading }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}
