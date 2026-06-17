"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut as firebaseSignOut, 
  onAuthStateChanged,
  User as FirebaseUser
} from "firebase/auth";
import { auth, db, isConfigured } from "@/src/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

interface UserSession {
  id: string;
  name: string;
  email: string;
  image: string;
}

interface AuthSession {
  user: UserSession | null;
}

interface AuthContextType {
  session: AuthSession | null;
  status: "loading" | "authenticated" | "unauthenticated";
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  status: "loading",
});

export function FirebaseAuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [status, setStatus] = useState<"loading" | "authenticated" | "unauthenticated">("loading");

  useEffect(() => {
    if (!isConfigured) {
      console.warn("Firebase is not configured. Running in Guest Mode (Offline Bookmarks).");
      const timer = setTimeout(() => {
        setStatus("unauthenticated");
        setSession(null);
      }, 0);
      // Clear session cookie if any
      document.cookie = "noor_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      return () => clearTimeout(timer);
    }

    const unsubscribe = onAuthStateChanged(auth, (user: FirebaseUser | null) => {
      if (user) {
        const userData: UserSession = {
          id: user.uid,
          name: user.displayName || "User",
          email: user.email || "",
          image: user.photoURL || "",
        };
        setSession({ user: userData });
        setStatus("authenticated");
        // Write cookie for server-side greeting (cookie max-age 7 days)
        document.cookie = `noor_session=${encodeURIComponent(JSON.stringify(userData))}; path=/; max-age=604800; SameSite=Lax`;

        // Sync last read Quran Surah from Firestore to LocalStorage
        const readHistoryRef = doc(db, "users", user.uid, "readHistory", "quran");
        getDoc(readHistoryRef)
          .then((docSnap) => {
            if (docSnap.exists()) {
              const data = docSnap.data();
              localStorage.setItem("noor_last_read_quran", JSON.stringify({ id: data.id, name: data.name }));
            }
          })
          .catch((err) => console.error("Error syncing last read on login:", err));

        // Sync recent Surahs from Firestore to LocalStorage
        const recentRef = doc(db, "users", user.uid, "readHistory", "recent");
        getDoc(recentRef)
          .then((docSnap) => {
            if (docSnap.exists()) {
              const data = docSnap.data();
              if (data.ids) {
                localStorage.setItem("noor_recent_surahs", JSON.stringify(data.ids));
              }
            }
          })
          .catch((err) => console.error("Error syncing recent surahs on login:", err));
      } else {
        setSession(null);
        setStatus("unauthenticated");
        // Clear cookie
        document.cookie = "noor_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ session, status }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useSession() {
  const { session, status } = useContext(AuthContext);
  return {
    data: session,
    status,
  };
}

// NextAuth compatibility static functions
export async function signIn(providerName: string) {
  if (!isConfigured) {
    alert("Firebase is not configured yet. Please configure the NEXT_PUBLIC_FIREBASE_* environment variables in your .env file to enable Google Login.");
    return;
  }
  if (providerName === "google") {
    const provider = new GoogleAuthProvider();
    // Force select account to improve UX
    provider.setCustomParameters({
      prompt: "select_account"
    });
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Sign in failed:", error);
    }
  }
}

export async function signOut() {
  if (!isConfigured) return;
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error("Sign out failed:", error);
  }
}
