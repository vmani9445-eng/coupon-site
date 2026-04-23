import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "@/lib/prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
  ],

  session: {
    strategy: "jwt",
  },

  pages: {
    signIn: "/login",
  },

  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google" && user.email) {
        const email = user.email.toLowerCase();

        const existingUser = await prisma.user.findUnique({
          where: { email },
          include: { wallet: true },
        });

        if (!existingUser) {
          const newUser = await prisma.user.create({
            data: {
              name: user.name || "User",
              email,
              image: user.image || null,
              emailVerifiedAt: new Date(),
              lastSeenAt: new Date(),
            },
          });

          await prisma.wallet.create({
            data: {
              userId: newUser.id,
              pendingBalance: 0,
              confirmedBalance: 0,
              availableBalance: 0,
              lifetimeEarned: 0,
              lifetimeWithdrawn: 0,
              lifetimeRejected: 0,
            },
          });
        } else {
          await prisma.user.update({
            where: { id: existingUser.id },
            data: {
              name: user.name || existingUser.name,
              image: user.image || existingUser.image,
              lastSeenAt: new Date(),
              emailVerifiedAt: existingUser.emailVerifiedAt ?? new Date(),
            },
          });

          if (!existingUser.wallet) {
            await prisma.wallet.create({
              data: {
                userId: existingUser.id,
                pendingBalance: 0,
                confirmedBalance: 0,
                availableBalance: 0,
                lifetimeEarned: 0,
                lifetimeWithdrawn: 0,
                lifetimeRejected: 0,
              },
            });
          }
        }
      }

      return true;
    },

    async jwt({ token }) {
      if (token.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: String(token.email).toLowerCase() },
        });

        if (dbUser) {
          token.userId = dbUser.id;
          token.role = dbUser.role;
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        if (typeof token.userId === "string") {
          (session.user as { id?: string }).id = token.userId;
        }

        if (typeof token.role === "string") {
          (session.user as { role?: string }).role = token.role;
        }
      }

      return session;
    },
  },
});