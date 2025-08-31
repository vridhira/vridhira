
import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { findUserByEmail } from '@/lib/user-actions';
import bcrypt from 'bcrypt';
import type { User } from '@/lib/types';
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

          if (user && user.password) {
            const passwordMatch = await bcrypt.compare(password, user.password);
            if (passwordMatch) {
                // Return a user object that is serializable
                const { password, ...userWithoutPassword } = user;
                return userWithoutPassword;
            }
          }
        }
        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.name = `${user.firstName} ${user.lastName}`;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id as string;
        session.user.name = token.name;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
