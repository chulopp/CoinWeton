import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

const googleClientId =
  process.env.AUTH_GOOGLE_ID ||
  process.env.GOOGLE_CLIENT_ID ||
  process.env.CLIENT_ID;

const googleClientSecret =
  process.env.AUTH_GOOGLE_SECRET ||
  process.env.GOOGLE_CLIENT_SECRET ||
  process.env.CLIENT_SECRET;

const authSecret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;

export const { handlers, signIn, signOut, auth } = NextAuth({
  secret: authSecret,
  trustHost: true,
  providers: [
    Google({
      clientId: googleClientId,
      clientSecret: googleClientSecret,
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (!user?.email) return false;

      const userId =
        user.id ||
        (profile as { sub?: string })?.sub ||
        account?.providerAccountId;

      if (userId) {
        try {
          const existing = await db
            .select()
            .from(users)
            .where(eq(users.id, userId))
            .limit(1);

          if (existing.length === 0) {
            await db.insert(users).values({
              id: userId,
              email: user.email,
              name: user.name ?? null,
              image: user.image ?? null,
            });
          }
        } catch (err) {
          console.error("Error syncing user to database:", err);
        }
      }

      return true;
    },
    async jwt({ token, user, account, profile }) {
      const userId =
        user?.id ||
        (profile as { sub?: string })?.sub ||
        account?.providerAccountId;

      if (userId) {
        token.id = userId;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token.id as string) || token.sub || session.user.id;
      }
      return session;
    },
  },
});
