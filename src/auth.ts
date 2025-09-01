
import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { findUserByEmail } from '@/lib/user-actions';
import bcrypt from 'bcrypt';
import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  pages: {
    signIn: '/login',
  },
  providers: [
    Credentials({
      async authorize(credentials) {
        if (credentials.email && credentials.password) {
          const email = credentials.email as string;
          const password = credentials.password as string;
          const user = await findUserByEmail(email);

          if (!user) {
            throw new Error("No user found with this email.");
          }

          if (user && user.password) {
            const passwordMatch = await bcrypt.compare(password, user.password);
            if (passwordMatch) {
                const { password, ...userWithoutPassword } = user;
                return userWithoutPassword;
            } else {
                 throw new Error("Incorrect password.");
            }
          }
        }
        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (account && user) {
        token.id = user.id;
        token.name = user.name;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id as string;
        session.user.name = token.name as string;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
