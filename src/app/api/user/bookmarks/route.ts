import { NextResponse } from "next/server";
import { auth } from "@/src/features/auth/auth";
import { db } from "@/src/database/db";

// GET: Fetch all bookmarks for user
export async function GET() {
  const session = await auth();
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as any).id;
  try {
    const rawBookmarks = db.prepare("SELECT * FROM user_bookmarks WHERE user_id = ? ORDER BY created_at DESC").all(userId) as any[];
    
    // Resolve titles and subtitles for each bookmark type
    const bookmarks = rawBookmarks.map((bookmark) => {
      let title = `Bookmark #${bookmark.item_id}`;
      let subtitle = "";
      let bookmarkCategory = "";
      
      try {
        if (bookmark.item_type === "quran") {
          const surah = db.prepare("SELECT name_simple, translated_name FROM surahs WHERE id = ?").get(bookmark.item_id) as any;
          if (surah) {
            title = surah.name_simple;
            subtitle = `Surah • ${surah.translated_name}`;
          }
        } else if (bookmark.item_type === "hadith") {
          const hadith = db.prepare("SELECT collection_id, hadith_number, text_en FROM hadiths WHERE id = ?").get(bookmark.item_id) as any;
          if (hadith) {
            const collectionName = hadith.collection_id.charAt(0).toUpperCase() + hadith.collection_id.slice(1);
            title = `${collectionName} - Hadith #${hadith.hadith_number}`;
            subtitle = hadith.text_en.length > 50 ? `${hadith.text_en.substring(0, 50)}...` : hadith.text_en;
          }
        } else if (bookmark.item_type === "dua") {
          const dua = db.prepare("SELECT title, category FROM duas WHERE id = ?").get(bookmark.item_id) as any;
          if (dua) {
            title = dua.title;
            subtitle = `Dua • ${dua.category}`;
          }
        } else if (bookmark.item_type === "dhikr") {
          const dhikr = db.prepare("SELECT title, category FROM dhikrs WHERE id = ?").get(bookmark.item_id) as any;
          if (dhikr) {
            title = dhikr.title;
            subtitle = `Dhikr • ${dhikr.category}`;
            bookmarkCategory = dhikr.category;
          }
        }
      } catch (err) {
        console.error("Error resolving bookmark info:", err);
      }

      return {
        ...bookmark,
        title,
        subtitle,
        category: bookmarkCategory
      };
    });

    return NextResponse.json({ bookmarks });
  } catch (error: any) {
    console.error("Fetch bookmarks error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch bookmarks" }, { status: 500 });
  }
}

// POST: Add a single bookmark
export async function POST(request: Request) {
  const session = await auth();
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as any).id;
  try {
    const { item_type, item_id } = await request.json();
    if (!item_type || !item_id) {
      return NextResponse.json({ error: "Missing item_type or item_id" }, { status: 400 });
    }

    db.prepare(`
      INSERT OR IGNORE INTO user_bookmarks (user_id, item_type, item_id)
      VALUES (?, ?, ?)
    `).run(userId, item_type, String(item_id));

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Create bookmark error:", error);
    return NextResponse.json({ error: error.message || "Failed to create bookmark" }, { status: 500 });
  }
}

// DELETE: Remove a bookmark
export async function DELETE(request: Request) {
  const session = await auth();
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as any).id;
  try {
    const { searchParams } = new URL(request.url);
    const item_type = searchParams.get("item_type");
    const item_id = searchParams.get("item_id");

    if (!item_type || !item_id) {
      return NextResponse.json({ error: "Missing item_type or item_id" }, { status: 400 });
    }

    db.prepare(`
      DELETE FROM user_bookmarks
      WHERE user_id = ? AND item_type = ? AND item_id = ?
    `).run(userId, item_type, String(item_id));

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Delete bookmark error:", error);
    return NextResponse.json({ error: error.message || "Failed to delete bookmark" }, { status: 500 });
  }
}
