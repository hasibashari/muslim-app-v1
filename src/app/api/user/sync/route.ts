import { NextResponse } from "next/server";
import { auth } from "@/src/features/auth/auth";
import { db } from "@/src/database/db";

export async function POST(request: Request) {
  const session = await auth();
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as any).id;
  if (!userId) {
    return NextResponse.json({ error: "User ID not found in session" }, { status: 400 });
  }

  try {
    const body = await request.json();
    const bookmarks = body.bookmarks || [];

    if (!Array.isArray(bookmarks)) {
      return NextResponse.json({ error: "Invalid bookmarks format" }, { status: 400 });
    }

    // Insert bookmarks using a transaction
    const insertBookmark = db.prepare(`
      INSERT OR IGNORE INTO user_bookmarks (user_id, item_type, item_id)
      VALUES (?, ?, ?)
    `);

    const transaction = db.transaction((items) => {
      for (const item of items) {
        if (item.item_type && item.item_id) {
          insertBookmark.run(userId, item.item_type, String(item.item_id));
        }
      }
    });

    transaction(bookmarks);

    return NextResponse.json({ success: true, count: bookmarks.length });
  } catch (error: any) {
    console.error("Sync error:", error);
    return NextResponse.json({ error: error.message || "Failed to sync bookmarks" }, { status: 500 });
  }
}
