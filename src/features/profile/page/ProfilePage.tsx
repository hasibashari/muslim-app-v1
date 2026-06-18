"use client";

import { useSession, signIn, signOut } from "@/src/features/auth/hooks";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { FaGoogle } from "react-icons/fa";
import {
  User,
  Mail,
  LogOut,
  BookOpen,
  Sparkles,
  RefreshCw,
  ScrollText,
  Database,
  CheckCircle2,
  Trash2,
  Loader2,
  AlertCircle,
  ArrowLeft
} from "lucide-react";
import { collection, getDocs, deleteDoc, doc, writeBatch, query, orderBy } from "firebase/firestore";
import { db, isConfigured } from "@/src/lib/firebase";

interface Bookmark {
  id?: string;
  item_type: "quran" | "hadith" | "dua" | "dhikr";
  item_id: string;
  title: string;
  subtitle: string;
  category?: string;
  created_at?: string;
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [localBookmarks, setLocalBookmarks] = useState<Bookmark[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "quran" | "hadith" | "dua" | "dhikr">("all");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const uid = session?.user?.id;

  // 1. Fetch bookmarks from Firestore if logged in, otherwise from LocalStorage
  const fetchBookmarks = useCallback(async () => {
    if (status === "authenticated" && uid && isConfigured) {
      try {
        setIsLoading(true);
        const bookmarksRef = collection(db, "users", uid, "bookmarks");
        const q = query(bookmarksRef, orderBy("created_at", "desc"));
        const querySnapshot = await getDocs(q);
        const fetchedBookmarks: Bookmark[] = [];
        querySnapshot.forEach((docSnap) => {
          fetchedBookmarks.push({
            id: docSnap.id,
            ...docSnap.data() as Bookmark,
          });
        });
        setBookmarks(fetchedBookmarks);
      } catch (err) {
        console.error("Failed to fetch bookmarks from Firestore:", err);
      } finally {
        setIsLoading(false);
      }
    } else {
      // Fetch from local storage
      try {
        const localData = localStorage.getItem("noor_bookmarks");
        if (localData) {
          const parsed = JSON.parse(localData) as Bookmark[];
          setLocalBookmarks(parsed);
        }
      } catch (err) {
        console.error("Failed to read local bookmarks:", err);
      }
      setIsLoading(false);
    }
  }, [status, uid]);

  useEffect(() => {
    if (status !== "loading") {
      const timer = setTimeout(() => {
        fetchBookmarks();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [status, fetchBookmarks]);

  // 2. Sync Local Storage bookmarks to Firestore on login
  const handleSync = useCallback(async () => {
    if (status !== "authenticated" || !uid || !isConfigured) return;

    const localData = localStorage.getItem("noor_bookmarks");
    if (!localData) return;

    try {
      setIsSyncing(true);
      const parsed = JSON.parse(localData) as Bookmark[];
      if (parsed.length === 0) return;

      const batch = writeBatch(db);

      parsed.forEach((bookmark) => {
        const docId = `${bookmark.item_type}_${bookmark.item_id}`;
        const docRef = doc(db, "users", uid, "bookmarks", docId);
        batch.set(docRef, {
          item_type: bookmark.item_type,
          item_id: bookmark.item_id,
          title: bookmark.title,
          subtitle: bookmark.subtitle,
          category: bookmark.category || "",
          created_at: bookmark.created_at || new Date().toISOString()
        }, { merge: true });
      });

      await batch.commit();

      // Clear local storage after successful sync
      localStorage.removeItem("noor_bookmarks");
      setLocalBookmarks([]);
      // Re-fetch database bookmarks
      await fetchBookmarks();
      setMessage({ type: "success", text: "Successfully synced all local bookmarks to your account!" });
    } catch (err) {
      console.error("Sync error:", err);
      setMessage({ type: "error", text: "An error occurred during synchronization." });
    } finally {
      setIsSyncing(false);
      setTimeout(() => setMessage(null), 5000);
    }
  }, [status, uid, fetchBookmarks]);

  // Auto-sync on load if logged in and local bookmarks exist
  useEffect(() => {
    if (status === "authenticated" && localBookmarks.length > 0) {
      const timer = setTimeout(() => {
        handleSync();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [status, localBookmarks.length, handleSync]);

  // 3. Delete bookmark
  const handleDeleteBookmark = async (item_type: string, item_id: string) => {
    if (status === "authenticated" && uid && isConfigured) {
      try {
        const docId = `${item_type}_${item_id}`;
        const docRef = doc(db, "users", uid, "bookmarks", docId);
        await deleteDoc(docRef);
        setBookmarks(prev => prev.filter(b => !(b.item_type === item_type && b.item_id === item_id)));
      } catch (err) {
        console.error("Failed to delete bookmark from Firestore:", err);
      }
    } else {
      // Remove from local storage
      const updated = localBookmarks.filter(b => !(b.item_type === item_type && b.item_id === item_id));
      localStorage.setItem("noor_bookmarks", JSON.stringify(updated));
      setLocalBookmarks(updated);
    }
  };

  const getTabIcon = (type: string) => {
    switch (type) {
      case "quran": return <BookOpen size={16} />;
      case "hadith": return <ScrollText size={16} />;
      case "dua": return <Sparkles size={16} />;
      case "dhikr": return <RefreshCw size={16} />;
      default: return null;
    }
  };

  const getBookmarkLink = (bookmark: Bookmark) => {
    switch (bookmark.item_type) {
      case "quran":
        if (bookmark.item_id.includes(":")) {
          const [surahId, verseNum] = bookmark.item_id.split(":");
          return `/quran/${surahId}#verse-${verseNum}`;
        }
        return `/quran/${bookmark.item_id}`;
      case "hadith":
        if (bookmark.item_id.includes(":")) {
          const [collectionId, pageNum, hadithNum] = bookmark.item_id.split(":");
          return `/hadith/${collectionId}?page=${pageNum}#hadith-${hadithNum}`;
        }
        return `/hadith/${bookmark.item_id}`;
      case "dua": return `/dua/detail/${bookmark.item_id}`;
      case "dhikr": return `/dhikr/${bookmark.category?.toLowerCase() || ""}`;
      default: return "#";
    }
  };

  const displayList = status === "authenticated" ? bookmarks : localBookmarks;
  const filteredBookmarks = activeTab === "all"
    ? displayList
    : displayList.filter(b => b.item_type === activeTab);

  if (status === "loading") {
    return (
      <div className="flex h-[80vh] items-center justify-center bg-[#FDFCF8]">
        <div className="text-center">
          <Loader2 className="mx-auto h-10 w-10 animate-spin text-[#2D5A43]" />
          <p className="mt-4 text-sm font-medium text-slate-500">Loading profile data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 w-full max-w-4xl mx-auto">
      <Link
        href="/"
        className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-[#2D5A43] transition-colors w-fit mb-6"
      >
        <ArrowLeft size={16} />
        Back to Dashboard
      </Link>

      {/* Page Title */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-[#1A3A2A]">Profile & Settings</h1>
        <p className="text-sm text-slate-500 mt-1">Manage your account connection, preferences, and synchronized bookmarks.</p>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 border ${message.type === "success"
            ? "bg-emerald-50 border-emerald-200 text-emerald-800"
            : "bg-rose-50 border-rose-200 text-rose-800"
          }`}>
          {message.type === "success" ? <CheckCircle2 size={20} className="text-emerald-600" /> : <AlertCircle size={20} className="text-rose-600" />}
          <p className="text-sm font-medium">{message.text}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Profile, Settings & Sync Cards */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white border border-[#E9E3D8] rounded-2xl p-6 shadow-sm overflow-hidden relative">
            <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-r from-[#2D5A43]/10 to-[#E9E3D8]/40 -z-0"></div>

            <div className="relative z-10 flex flex-col items-center text-center mt-6">
              {/* Profile Pic */}
              <div className="w-24 h-24 rounded-full border-4 border-white bg-[#E9E3D8] overflow-hidden shadow-md shrink-0 flex items-center justify-center">
                {session?.user?.image ? (
                  <Image
                    src={session.user.image}
                    alt={session.user.name || "User"}
                    className="w-full h-full object-cover"
                    width={96}
                    height={96}
                    unoptimized
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <User size={40} className="text-slate-400" />
                )}
              </div>

              {session?.user ? (
                <>
                  <h3 className="text-lg font-bold text-[#1A3A2A] mt-4">{session.user.name}</h3>
                  <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-1 justify-center">
                    <Mail size={12} />
                    {session.user.email}
                  </p>

                  <button
                    onClick={() => signOut()}
                    className="mt-6 w-full flex items-center justify-center gap-2 bg-rose-50 hover:bg-rose-100 text-rose-700 py-2.5 px-4 rounded-xl text-sm font-semibold transition-colors border border-rose-200 cursor-pointer"
                  >
                    <LogOut size={16} />
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <h3 className="text-lg font-bold text-[#1A3A2A] mt-4">Guest Mode</h3>
                  <p className="text-xs text-slate-400 mt-1">Connect your account to save bookmarks permanently.</p>

                  <button
                    onClick={() => signIn("google")}
                    className="mt-6 w-full flex items-center justify-center gap-2.5 bg-[#2D5A43] hover:bg-[#1A3A2A] text-white py-2.5 px-4 rounded-xl text-sm font-semibold shadow-md shadow-[#2D5A43]/10 hover:shadow-lg transition-all cursor-pointer"
                  >
                    <FaGoogle size={16} />
                    Connect Google
                  </button>
                </>
              )}
            </div>
          </div>



          {/* Sync Card */}
          <div className="bg-[#F5F1EA] border border-[#E9E3D8] rounded-2xl p-5">
            <div className="flex items-start gap-3">
              <Database className="text-[#2D5A43] shrink-0 mt-0.5" size={20} />
              <div>
                <h4 className="text-sm font-bold text-[#1A3A2A]">Data Synchronization</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  {status === "authenticated" ? (
                    "Your bookmarks and settings are securely backed up in the cloud database. You can access them on any device."
                  ) : (
                    "You are in offline mode. Bookmarks are stored in this browser only and will be lost if you clear your browser history."
                  )}
                </p>
                {status === "unauthenticated" && localBookmarks.length > 0 && (
                  <button
                    onClick={() => signIn("google")}
                    className="mt-3 text-xs font-bold text-[#2D5A43] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    Login to sync {localBookmarks.length} bookmark(s) &rarr;
                  </button>
                )}
                {status === "authenticated" && localBookmarks.length > 0 && (
                  <button
                    onClick={handleSync}
                    disabled={isSyncing}
                    className="mt-3 w-full bg-[#2D5A43] text-white text-xs font-bold py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 hover:bg-[#1A3A2A] cursor-pointer"
                  >
                    {isSyncing ? <Loader2 size={12} className="animate-spin" /> : null}
                    Sync Local Data ({localBookmarks.length})
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Bookmarks List */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white border border-[#E9E3D8] rounded-2xl p-6 shadow-sm min-h-[400px] flex flex-col">
            <div className="flex items-center justify-between border-b border-[#E9E3D8] pb-4 mb-6">
              <h3 className="font-bold text-[#1A3A2A] text-lg">My Favorites</h3>
              <span className="text-xs font-semibold px-2.5 py-1 bg-[#F5F1EA] rounded-full text-slate-600">
                {displayList.length} Items
              </span>
            </div>

            {/* Tabs */}
            <div className="flex gap-1.5 overflow-x-auto pb-3 mb-6 scrollbar-hide border-b border-slate-100">
              {(["all", "quran", "hadith", "dua", "dhikr"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all uppercase tracking-wider shrink-0 cursor-pointer ${activeTab === tab
                      ? "bg-[#2D5A43] text-white"
                      : "bg-[#F5F1EA]/60 hover:bg-[#F5F1EA] text-slate-500"
                    }`}
                >
                  {getTabIcon(tab)}
                  {tab}
                </button>
              ))}
            </div>

            {/* Bookmarks List */}
            {isLoading ? (
              <div className="flex-1 flex items-center justify-center py-20">
                <Loader2 className="animate-spin text-[#2D5A43]" size={32} />
              </div>
            ) : filteredBookmarks.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center py-16 border-2 border-dashed border-[#E9E3D8] rounded-2xl bg-[#FDFCF8]/50">
                <div className="w-12 h-12 rounded-full bg-[#E9E3D8]/50 flex items-center justify-center text-slate-400 mb-3">
                  {getTabIcon(activeTab) || <BookOpen size={20} />}
                </div>
                <h4 className="font-bold text-[#1A3A2A]">No Favorites Found</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-xs">
                  {activeTab === "all"
                    ? "Start bookmarking your favorite Quran verses, Duas, Hadiths, or Dhikr to see them here!"
                    : `You haven't bookmarked any items in ${activeTab} yet.`}
                </p>
              </div>
            ) : (
              <div className="space-y-3 flex-1 overflow-y-auto max-h-[500px] pr-1">
                {filteredBookmarks.map((bookmark) => (
                  <div
                    key={`${bookmark.item_type}-${bookmark.item_id}`}
                    className="flex items-center justify-between p-4 bg-white border border-[#E9E3D8] hover:border-[#2D5A43]/40 rounded-2xl transition-all shadow-sm group"
                  >
                    <Link
                      href={getBookmarkLink(bookmark)}
                      className="flex items-center gap-3.5 flex-1 min-w-0"
                    >
                      <div className="w-10 h-10 rounded-xl bg-[#F0F4F2] flex items-center justify-center text-[#2D5A43] shrink-0">
                        {getTabIcon(bookmark.item_type)}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-[#1A3A2A] text-sm truncate group-hover:text-[#2D5A43] transition-colors">
                          {bookmark.title}
                        </h4>
                        <p className="text-xs text-slate-400 truncate mt-0.5">
                          {bookmark.subtitle}
                        </p>
                      </div>
                    </Link>

                    <button
                      onClick={() => handleDeleteBookmark(bookmark.item_type, bookmark.item_id)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all ml-4 shrink-0 cursor-pointer"
                      title="Remove Bookmark"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
