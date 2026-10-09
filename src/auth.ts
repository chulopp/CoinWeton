import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async signIn({ user }) {
      if (!user.email || !user.id) return false;
      try {
        const existing = await db
          .select()
          .from(users)
          .where(eq(users.id, user.id))
          .limit(1);
        if (existing.length === 0) {
          await db.insert(users).values({
            id: user.id,
            email: user.email,
            name: user.name ?? null,
            image: user.image ?? null,
          });
        }
      } catch (err) {
        console.error("Error syncing user:", err);
      }
      return true;
    },
    async session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
});
