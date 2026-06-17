import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { db } from "@/src/database/db";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      if (!user.email) return false;
      try {
        // Check if user exists in database
        const existingUser = db.prepare("SELECT * FROM users WHERE email = ?").get(user.email) as any;
        if (!existingUser) {
          // Create new user in sqlite database
          db.prepare("INSERT INTO users (email, name, avatar_url, google_id) VALUES (?, ?, ?, ?)").run(
            user.email,
            user.name || "",
            user.image || "",
            user.id || ""
          );
        } else {
          // Update details if needed
          db.prepare("UPDATE users SET name = ?, avatar_url = ?, google_id = ? WHERE email = ?").run(
            user.name || existingUser.name,
            user.image || existingUser.avatar_url,
            user.id || existingUser.google_id || "",
            user.email
          );
        }
        return true;
      } catch (error) {
        console.error("Error inside signIn callback:", error);
        return false;
      }
    },
    async jwt({ token, user }) {
      if (user && user.email) {
        try {
          const dbUser = db.prepare("SELECT id FROM users WHERE email = ?").get(user.email) as any;
          if (dbUser) {
            token.userId = dbUser.id;
          }
        } catch (error) {
          console.error("Error inside jwt callback:", error);
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.userId) {
        (session.user as any).id = token.userId;
      }
      return session;
    },
  },
  secret: process.env.AUTH_SECRET,
});
