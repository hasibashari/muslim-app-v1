"use client";

import React from "react";
import { FirebaseAuthProvider } from "@/src/features/auth/hooks";
import { SettingsProvider } from "@/src/features/settings/hooks";

export function SessionProviderWrapper({ children }: { children: React.ReactNode }) {
  return (
    <FirebaseAuthProvider>
      <SettingsProvider>{children}</SettingsProvider>
    </FirebaseAuthProvider>
  );
}

